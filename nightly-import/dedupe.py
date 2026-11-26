#!/usr/bin/env python3
"""Smart Finds nightly: mark re-posted items so they don't become duplicates.

usage: python3 dedupe.py [new-posts-<date>.json] [--no-overrides] [--recheck] [--sha <commit>]
  (no file = the newest ../new-posts-*.json)

For every post with a product link it compares against the site's current
lib/data/products.ts on GitHub (suri8361/smart-finds, branch data — since Nov 2026) and
writes into the same JSON, per post:
  already_on_site     true / false
  existing_slug       slug of the product already on the site (when true)
  existing_name, existing_url, existing_hidden
  repeat_match        "exact_url" | "same_link" | "same_product" | "similar_title"
  repeat_confidence   "sure" (url / link / product id) | "check" (title only)
  product_key         e.g. amazon:B0CPP9TZ4T, shein:543416318, temu:601102...
  repeat_update       {"says": [...], "new_price": .., "site_price": ..} when her new
                      post looks like news about the same item (back in stock, new price)
  repeat_in_batch_of  message_id of an earlier post in the SAME file with the same product
and a top-level "repeat_check" summary. Nothing is removed from the JSON.

Sure repeats (and in-batch repeats) also get {"skip": true, ...} in the
importer's new-posts-<date>.overrides.json so `npm run import:posts` skips them
(skipped by overrides). Title-only matches are NOT auto-skipped: look first.

Posts matching an item in exclusions.json (things Sara removed on purpose) get
"excluded": true + "excluded_note" and are always skipped in the overrides file.

Short links are followed once (HTTP only, no search credits) and cached in
resolve-cache.json; verdicts are kept per message_id in repeat-checks.json so a
later re-read (nightly.sh --commit rewrites the JSON) keeps the first verdict.
"""
import json, os, re, sys, time, pickle, difflib, html
from urllib.parse import urlparse, parse_qs, unquote, urljoin
import requests

HERE = os.path.dirname(os.path.abspath(__file__))
IMPORT_DIR = os.path.dirname(HERE)
CACHE_FILE = os.path.join(HERE, "resolve-cache.json")
EXCLUSIONS_FILE = os.path.join(HERE, "exclusions.json")  # items Sara removed on purpose: never re-add
RECORD_FILE = os.environ.get("SF_REPEAT_RECORD") or os.path.join(HERE, "repeat-checks.json")
SEED_PKL = os.path.join(IMPORT_DIR, "resolve_cache.pkl")  # bulk importer's resolutions
REPO, BRANCH = "suri8361/smart-finds", "data"  # Nov 2026: live data lives on the `data` branch (README "Data without redeploy")
UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
URL_RE = re.compile(r"https?://[^\s<>\"`]+[^\s<>\"`.,;:!?)\]]")

# ---------------------------------------------------------------- product identity (same rules as scripts/import/shared.mjs productKey)
SHORT_HOST = re.compile(r"(^|\.)(amzn\.to|amzn\.eu|a\.co|link\.amazon|temu\.to|ali\.ski|sheinlink\.com|onelink\.shein\.com|spl\.it|share-w\.in|ebay\.us|amzlinks\.in)$")

def is_short(url):
    try: u = urlparse(url)
    except Exception: return False
    h = (u.hostname or "").lower()
    if SHORT_HOST.search(h): return True
    if re.match(r"^(s\.click|a|star)\.aliexpress\.", h): return True
    if h.endswith("temu.com") and re.match(r"^/(k|s)/", u.path): return True
    if re.search(r"(^|\.)shein\.", h) and re.match(r"^/(s|share)/", u.path, re.I): return True
    return False

def product_key(url):
    try: u = urlparse(url)
    except Exception: return url
    h = (u.hostname or "").lower(); p = unquote(u.path or ""); q = parse_qs(u.query)
    if "amazon." in h:
        m = re.search(r"/(?:dp|gp/product|gp/aw/d|d|clp)/([A-Z0-9]{10})", p, re.I)
        if m: return "amazon:" + m.group(1).upper()
    if "aliexpress." in h:
        m = re.search(r"/item/(?:[^/]*?)(\d{6,})\.html", p)
        if m: return "aliexpress:" + m.group(1)
    if "shein." in h:
        m = re.search(r"-p-(\d+)(?:-cat-\d+)?\.html", p)
        if m: return "shein:" + m.group(1)
        if q.get("goods_id"): return "shein:" + q["goods_id"][0]
    if "temu." in h:
        if q.get("goods_id"): return "temu:" + q["goods_id"][0]
        m = re.search(r"-g-(\d{6,})\.html", p)
        if m: return "temu:" + m.group(1)
    if "ebay." in h:
        m = re.search(r"/itm/(?:[^/]*/)?(\d{9,})", p)
        if m: return "ebay:" + m.group(1)
    # a login/cookie hop that carries the real product URL inside its query (AliExpress xman_goto=...)
    inner = unquote(u.query or "")
    m = re.search(r"https?://[^\s&]*aliexpress\.[a-z.]+/item/(?:[^/]*?)(\d{6,})\.html", inner)
    if m: return "aliexpress:" + m.group(1)
    return (h.removeprefix("www.") + p).rstrip("/")

def is_id_key(k):
    return bool(k) and bool(re.match(r"^(amazon|shein|temu|aliexpress|ebay):", k))

def is_comparable(k):
    """An id key, or a final store URL (not a short-link path that never resolved)."""
    if is_id_key(k): return True
    host, _, path = (k or "").partition("/")
    if not path.strip("/") or re.fullmatch(r"(?:[a-z]{2}(?:-[a-z]{2})?)?/?(?:prime|ark/default|primebigdealdays.*|deals?|s|home|index\.html?)?", path.strip("/").lower()):
        return False  # a store's home/landing page is not a product
    return bool(host) and not SHORT_HOST.search(host) and "." in host

def link_key(url):
    """The posted link without its tracking query (onelink.shein.com/58/abc?ismg_ol=X == ...?ismg_ol=Y)."""
    try: u = urlparse(url.strip())
    except Exception: return url
    return ((u.hostname or "").lower().removeprefix("www.") + u.path).rstrip("/")

def sniff_body(final_url, body):
    """Store pages that land on an interstitial (amzlinks.in, SHEIN onelink page) name the product in their HTML."""
    if not body: return None
    b = html.unescape(body)
    host = (urlparse(final_url).hostname or "")
    if "amzlinks" in host or "amazon" in host or "link.amazon" in final_url:
        m = re.search(r"amazon\.[a-z.]+/(?:[^\s\"'<>]*?/)?(?:dp|gp/product)/([A-Z0-9]{10})", b)
        if m: return "amazon:" + m.group(1)
    if "shein" in host:
        m = re.search(r"[?&]goods_id=(\d+)", b) or re.search(r"-p-(\d+)(?:-cat-\d+)?\.html", b)
        if m: return "shein:" + m.group(1)
    if "temu" in host:
        m = re.search(r"[?&]goods_id=(\d{6,})", b)
        if m: return "temu:" + m.group(1)
    if "aliexpress" in host:
        m = re.search(r"aliexpress\.[a-z.]+/item/(\d{6,})\.html", b)
        if m: return "aliexpress:" + m.group(1)
    if "spl.it" in host:  # Split share pages name the store page in their HTML
        for u in re.findall(r"https?://[^\s\"'<>{}]+", b):
            uh = (urlparse(u).hostname or "")
            if not re.search(r"split\.co|spl\.it|tiktok|viglink|instagram|facebook|google|apple\.com|w3\.org", uh):
                return product_key(u)
    return None

def follow(url, max_hops=8):
    cur = url; hops = []
    for _ in range(max_hops):
        try:
            r = requests.get(cur, allow_redirects=False, timeout=12,
                             headers={"user-agent": UA, "accept": "text/html,*/*"})
        except Exception as e:
            return {"final": cur, "err": str(e)[:120], "hops": hops}
        hops.append(r.status_code)
        loc = r.headers.get("location")
        if 300 <= r.status_code < 400 and loc:
            cur = urljoin(cur, loc); continue
        return {"final": cur, "status": r.status_code, "hops": hops, "body": r.text[:400000]}
    return {"final": cur, "err": "too many redirects", "hops": hops}

class Resolver:
    def __init__(self):
        self.cache = json.load(open(CACHE_FILE)) if os.path.exists(CACHE_FILE) else {}
        if not self.cache and os.path.exists(SEED_PKL):  # first run: take the bulk importer's 1,086 resolutions
            try:
                for k, v in pickle.load(open(SEED_PKL, "rb")).items():
                    if v.get("final"):
                        self.cache[k] = {"final": v["final"], "key": product_key(v["final"]), "status": v.get("status"),
                                         "title": v.get("title", ""), "source": "bulk import cache"}
            except Exception as e:
                print("seed cache unreadable:", e)
        self.fetched = 0; self.dirty = bool(self.cache) and not os.path.exists(CACHE_FILE)

    def key(self, url):
        url = url.strip()
        direct = product_key(url)
        if not is_short(url): return direct, url
        hit = self.cache.get(url)
        failed = hit is not None and not is_id_key(hit.get("key")) and (hit.get("err") or (hit.get("status") or 0) >= 400 or is_short(hit.get("final", "")))
        if hit is None or (failed and time.time() - hit.get("at", 0) > 86400):  # a failed lookup is retried after a day
            r = follow(url); self.fetched += 1
            k = product_key(r["final"])
            if not is_id_key(k):
                k = sniff_body(r["final"], r.get("body")) or k
            hit = {"final": r["final"], "key": k, "status": r.get("status"), "err": r.get("err", ""), "at": int(time.time())}
            self.cache[url] = hit; self.dirty = True
        k = hit.get("key") if hit.get("key") and (is_id_key(hit.get("key")) or hit.get("at")) else product_key(hit["final"])
        if not is_id_key(k): k = product_key(hit["final"]) if not is_short(hit["final"]) else (hit.get("key") if hit.get("at") else direct)
        return k or direct, hit["final"]

    def save(self):
        if self.dirty:
            tmp = CACHE_FILE + ".tmp"; json.dump(self.cache, open(tmp, "w"), indent=0); os.replace(tmp, CACHE_FILE)

# ---------------------------------------------------------------- titles
PRICE = re.compile(r"\$\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\$|\b\d{1,4}\.\d{2}\b")
FILLER = set("""a an the and or with for of in on to from by is it this that these my our your
super so very really cute pretty beautiful gorgeous adorable stunning lovely great good best amazing
love obsessed must have musthave tried true deal sale only now new price off limited time today
link here buy get grab shop""".split())

def norm_title(s):
    s = URL_RE.sub(" ", s or ""); s = PRICE.sub(" ", s.lower())
    words = re.findall(r"[a-z0-9]+", s)
    return [w for w in words if w not in FILLER]

def post_title(text):
    for line in (text or "").splitlines():
        line = URL_RE.sub("", line).strip()
        if len(re.findall(r"[A-Za-z]", line)) >= 3: return line
    return ""

def title_sim(a, b):
    if not a or not b: return 0.0
    sa, sb = set(a), set(b)
    jac = len(sa & sb) / len(sa | sb)
    seq = difflib.SequenceMatcher(None, " ".join(a), " ".join(b)).ratio()
    return min(jac, seq) if min(len(sa), len(sb)) >= 2 else 0.0

UPDATE_WORDS = re.compile(r"back in stock|restock|in stock again|available again|price (?:drop|dropped|went down)|lower price|new price|now only|on sale|sale price|coupon|cheaper|reposting|re-?posting|re-?posted", re.I)

def store_of(url):
    h = (urlparse(url).hostname or "").lower()
    for pat, name in [(r"amazon|amzn|a\.co$|amzlinks", "Amazon"), (r"temu", "Temu"), (r"shein", "SHEIN"), (r"aliexpress|ali\.ski", "AliExpress"), (r"ebay", "eBay")]:
        if re.search(pat, h): return name
    return h.removeprefix("www.")

# ---------------------------------------------------------------- site products
def fetch_products(sha=None):
    if not sha:
        r = requests.get(f"https://api.github.com/repos/{REPO}/branches/{BRANCH}", params={"cb": time.time()}, timeout=20)
        r.raise_for_status(); sha = r.json()["commit"]["sha"]
    ts = requests.get(f"https://raw.githubusercontent.com/{REPO}/{sha}/lib/data/products.ts", timeout=30)
    ts.raise_for_status()
    body = ts.text[ts.text.index("export const products"):]
    out = []
    for b in re.split(r"\n  \{\n", body)[1:]:
        b = b.split("\n  },")[0]
        def f(k):
            m = re.search(r"^\s{4}" + k + r':\s*("(?:[^"\\]|\\.)*"|true|false|[\d.]+)', b, re.M)
            if not m: return None
            v = m.group(1); return json.loads(v) if v[0] == '"' else (v == "true" if v in ("true", "false") else float(v))
        out.append({k: f(k) for k in ["slug", "name", "affiliateUrl", "store", "hidden", "currentPrice"]})
    return sha, out

# ---------------------------------------------------------------- main
def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    flags = set(a for a in argv if a.startswith("--"))
    sha_arg = argv[argv.index("--sha") + 1] if "--sha" in argv else None
    if sha_arg in args: args.remove(sha_arg)
    if args: path = os.path.abspath(args[0])
    else:
        files = [os.path.join(IMPORT_DIR, f) for f in os.listdir(IMPORT_DIR) if re.match(r"new-posts-\d{4}-\d\d-\d\d\.json$", f)]
        path = max(files, key=os.path.getmtime)
    data = json.load(open(path)); posts = data.get("posts", [])
    if not posts:
        print(json.dumps({"checked": 0, "note": "no posts in " + os.path.basename(path)})); return
    record = json.load(open(RECORD_FILE)) if os.path.exists(RECORD_FILE) else {}
    sha, prods = fetch_products(sha_arg)
    res = Resolver()
    excl_items = json.load(open(EXCLUSIONS_FILE)).get("items", []) if os.path.exists(EXCLUSIONS_FILE) else []
    excl_url, excl_link, excl_key = {}, {}, {}
    for e in excl_items:
        for u in e.get("urls", []): excl_url[u.strip()] = e; excl_link[link_key(u)] = e
        for k in e.get("product_keys", []): excl_key[k] = e

    by_url, by_link, by_key, titled = {}, {}, {}, []
    for p in prods:
        u = (p["affiliateUrl"] or "").strip()
        if not u: continue
        k, _ = res.key(u); p["_key"] = k
        by_url.setdefault(u, p); by_link.setdefault(link_key(u), p)
        if is_comparable(k): by_key.setdefault(k, p)
        titled.append((norm_title(p["name"]), p))

    seen_in_batch = {}
    counts = {"checked": 0, "already_on_site": 0, "sure": 0, "title_only": 0, "new": 0, "no_link": 0, "in_batch_repeat": 0, "reused_earlier_verdict": 0, "excluded": 0}
    for post in posts:
        mid = post.get("message_id") or post.get("topic_id")
        link = (post.get("links") or [None])[0] or (URL_RE.findall(post.get("text") or "") or [None])[0]
        for k in [k for k in post if k.startswith(("already_on_site", "existing_", "repeat_", "product_key", "resolved_url"))]:
            del post[k]
        if not link:
            post["already_on_site"] = False; post["repeat_match"] = None; post["repeat_note"] = "no product link in this post"
            counts["no_link"] += 1; continue
        counts["checked"] += 1
        if mid in record and "--recheck" not in flags:
            v = record[mid]; post.update(v["marks"]); counts["reused_earlier_verdict"] += 1
        else:
            link = link.strip()
            if is_short(link): link = re.sub(r"[-–]+$", "", link)  # "amzn.to/abc- more colors": the dash isn't part of the link
            key, final = res.key(link)
            marks = {"product_key": key}
            if final != link: marks["resolved_url"] = final
            hit, how = None, None
            if link in by_url: hit, how = by_url[link], "exact_url"
            elif link_key(link) in by_link and is_short(link): hit, how = by_link[link_key(link)], "same_link"
            elif is_comparable(key) and key in by_key: hit, how = by_key[key], "same_product"
            else:
                nt, store = norm_title(post_title(post.get("text"))), store_of(final or link)
                best = (0, None)
                for t, p in titled:
                    if (p["store"] or "") != store: continue
                    if is_comparable(key) and is_comparable(p.get("_key")) and key != p["_key"]: continue  # both known, different products
                    s = title_sim(nt, t)
                    if s > best[0]: best = (s, p)
                if best[0] >= 0.85: hit, how = best[1], "similar_title"; marks["title_similarity"] = round(best[0], 2)
            marks["already_on_site"] = bool(hit)
            marks["repeat_match"] = how
            if hit:
                marks.update({"repeat_confidence": "check" if how == "similar_title" else "sure",
                              "existing_slug": hit["slug"], "existing_name": hit["name"], "existing_url": hit["affiliateUrl"]})
                if hit.get("hidden"): marks["existing_hidden"] = True
                upd = {}
                says = sorted(set(m.group(0).lower() for m in UPDATE_WORDS.finditer(post.get("text") or "")))
                if says: upd["says"] = says
                prices = [float(x.replace("$", "").replace(",", "")) for x in re.findall(r"\$\s?(\d[\d,]*(?:\.\d+)?)", post.get("text") or "")]
                if prices and (hit["store"] or "") != "Amazon" and hit.get("currentPrice") is not None and abs(hit["currentPrice"] - prices[0]) >= 0.01:
                    upd["new_price"] = prices[0]; upd["site_price"] = hit.get("currentPrice")
                if upd: marks["repeat_update"] = upd
            post.update(marks)
            record[mid] = {"file": os.path.basename(path), "checked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "against_sha": sha, "marks": marks}
        ex = excl_url.get(link.strip()) or excl_link.get(link_key(link)) or excl_key.get(post.get("product_key") or "") \
             or (excl_key.get(res.key(link)[0]) if is_short(link) else None)
        if ex:
            post["excluded"] = True
            post["excluded_note"] = f"Sara removed {ex['name']} ({ex['slug']}) on {ex.get('removed_on')}; never re-add"
            counts["excluded"] += 1
        else:
            post.pop("excluded", None); post.pop("excluded_note", None)
        key = post.get("product_key")
        bk = key if is_comparable(key) else link_key(link)
        if not post["already_on_site"] and bk in seen_in_batch:
            post["repeat_in_batch_of"] = seen_in_batch[bk]; counts["in_batch_repeat"] += 1
        seen_in_batch.setdefault(bk, mid)
        if post["already_on_site"]:
            counts["already_on_site"] += 1
            counts["sure" if post.get("repeat_confidence") == "sure" else "title_only"] += 1
        elif not post.get("repeat_in_batch_of") and not post.get("excluded"): counts["new"] += 1

    data["repeat_check"] = {"checked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "against": f"{REPO}@{BRANCH} {sha[:7]} lib/data/products.ts ({len(prods)} products)", "short_links_fetched": res.fetched, **counts}
    tmp = path + ".tmp"; json.dump(data, open(tmp, "w"), indent=2, ensure_ascii=False); os.replace(tmp, path)
    res.save()
    tmp = RECORD_FILE + ".tmp"; json.dump(record, open(tmp, "w"), indent=1); os.replace(tmp, RECORD_FILE)

    if "--no-overrides" not in flags:
        ofile = path[:-5] + ".overrides.json"
        ov = json.load(open(ofile)) if os.path.exists(ofile) else {}
        changed = False
        for post in posts:
            mid = post.get("message_id")
            if post.get("excluded"):
                why = post["excluded_note"]
            elif post.get("already_on_site") and post.get("repeat_confidence") == "sure":
                why = f"already on the site as {post['existing_slug']} ({post['repeat_match']})"
            elif post.get("repeat_in_batch_of"):
                why = f"same product as post {post['repeat_in_batch_of']} in this file"
            else: continue
            e = ov.setdefault(mid, {})
            if not e.get("skip"): e.update({"skip": True, "skip_reason": why}); changed = True
        if changed: json.dump(ov, open(ofile, "w"), indent=2, ensure_ascii=False)

    print(json.dumps(data["repeat_check"]))
    for post in posts:
        if post.get("excluded"):
            print(f"  EXCLUDED (removed by Sara, do not add): {post_title(post.get('text'))[:50]!r} -> {post['excluded_note']}")
        elif post.get("already_on_site") or post.get("repeat_in_batch_of"):
            print(f"  repeat: {post_title(post.get('text'))[:50]!r} -> {post.get('existing_slug') or 'batch ' + post['repeat_in_batch_of']} [{post.get('repeat_match')}]" + (f" update={post['repeat_update']}" if post.get('repeat_update') else ""))

if __name__ == "__main__":
    main(sys.argv[1:])
