#!/usr/bin/env python3
"""Smart Finds nightly dead-link check (read only: never edits the site).

usage: python3 deadlinks.py [--all | --sample N] [--sha COMMIT] [--date YYYY-MM-DD]
                            [--browser | --no-browser] [--browser-cap N] [--state FILE] [--out DIR]
                            [--include-hidden] [--slugs a,b,c]

What it does each night (see README "Dead links"):
  1. reads lib/data/products.ts from GitHub suri8361/smart-finds branch `data` (since Nov 2026; the branch head
     sha is read fresh, then the file is fetched at that sha, so no stale cache);
  2. picks tonight's share: every public item sits in one of 7 rotation buckets (by its link),
     tonight's bucket is checked, plus every item flagged dead/unknown before (re-check);
  3. checks each link with plain HTTP (follows redirects; Amazon short links reuse
     resolve-cache.json from dedupe.py so the redirect hop is skipped), and classifies:
        ok       the product page is there
        dead     clear signal: 404/410, "page not found", Amazon home page / "Looking for
                 something?" / "currently unavailable, we don't know when or if", AliExpress
                 "page can not be found", eBay "listing ended", store page redirected to home
        blocked  robot check / captcha / 403 / 429 / 503 / store refuses automated reads
                 (NEVER counts as dead)
        unknown  anything else (network error, page we can't read)
  4. optional browser pass (--browser, on in nightly.sh) for stores that block plain HTTP but
     render in a real browser (AliExpress): up to --browser-cap links (default 30) in one short
     session (browsercheck.mjs, no saved profile);
  5. an item becomes confirmed_dead only after it is dead on 2 separate nights (dates) with no
     "ok" in between; blocked/unknown neither count nor reset; an "ok" clears it.
Writes deadlinks-state.json (per link history) and ../dead-<date>.json (tonight's list:
confirmed_dead = remove these; dead_once = watch), and prints one JSON summary line.
No search credits, nothing posted anywhere.
"""
import json, os, re, sys, time, hashlib, html, subprocess, datetime, threading
from urllib.parse import urlparse, unquote, urljoin
from concurrent.futures import ThreadPoolExecutor
import requests

HERE = os.path.dirname(os.path.abspath(__file__))
IMPORT_DIR = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import dedupe  # fetch_products, product_key, resolve cache helpers (same folder)

STATE_FILE = os.path.join(HERE, "deadlinks-state.json")
CACHE_FILE = dedupe.CACHE_FILE
BUCKETS = 7
UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
HEADERS = {"user-agent": UA, "accept": "text/html,application/xhtml+xml,*/*;q=0.8", "accept-language": "en-US,en;q=0.9"}
BROWSER_STORES = {"AliExpress"}   # plain HTTP is always a captcha there; a real browser shows "can not be found"
REQS = {"n": 0}; _lock = threading.Lock()
_host_sems = {}

def host_sem(url):
    h = (urlparse(url).hostname or "").lower()
    with _lock:
        return _host_sems.setdefault(h, threading.Semaphore(2))

def get(url, session):
    with host_sem(url):
        with _lock: REQS["n"] += 1
        r = session.get(url, timeout=15, allow_redirects=True, headers=HEADERS)
        time.sleep(0.3)
        return r

def title_of(body):
    m = re.search(r"<title[^>]*>(.*?)</title>", body or "", re.S | re.I)
    return html.unescape(m.group(1)).strip()[:160] if m else ""

CAPTCHA = re.compile(r"captcha|robot check|are you a robot|verify (that )?you are (a )?human|risk/challenge|/punish\?|x5secdata|px-captcha|"
                     r"cf-chl|challenge-platform|access denied|request blocked|automated access|unusual traffic|pardon our interruption", re.I)
GENERIC_DEAD_TITLE = re.compile(r"page not found|404|not found|no longer available|item unavailable|product unavailable|page (does not|doesn't) exist|error 410", re.I)

def is_home(url):
    p = urlparse(url)
    path = (p.path or "/").rstrip("/")
    return path in ("", "/ref=nav_logo", "/us", "/en-us", "/en") or re.fullmatch(r"/(?:ref=[^/]*|index\.html?|home)", path or "/") is not None

def unwrap(final, body):
    """Interstitial pages that name the real store page in their HTML (amzlinks.in, Split, SHEIN onelink)."""
    h = (urlparse(final).hostname or "").lower(); b = html.unescape(body or "")
    if "amzlinks" in h or h == "link.amazon":
        m = re.search(r"https://www\.amazon\.[a-z.]+/[^\s\"'<>]*?/(?:dp|gp/product)/[A-Z0-9]{10}[^\s\"'<>]*", b)
        return m.group(0) if m else None
    if h == "spl.it" or h.endswith("split.co"):
        for u in re.findall(r"https?://[^\s\"'<>{}\\]+", b):
            uh = (urlparse(u).hostname or "")
            if uh and not re.search(r"split\.co|spl\.it|tiktok|viglink|instagram|facebook|google|apple\.com|w3\.org|cloudfront|jsdelivr|unpkg|sentry|gstatic|schema\.org|twitter|x\.com|cdn|\.(png|jpe?g|js|css|svg|webp)$", uh + urlparse(u).path, re.I):
                return u
        return None
    if "onelink.shein" in h:
        m = re.search(r'id="url" value="([^"]+)"', b)
        return m.group(1) if m else None
    return None

def classify_page(url_in, r, store):
    """-> (status, reason, final_url)"""
    final = r.url; code = r.status_code; body = r.text[:600000] if r.text else ""
    t = title_of(body); fh = (urlparse(final).hostname or "").lower()
    if "amazon." in fh and (code in (404, 410) or "Page Not Found" in t or ("Looking for something?" in body and "not a functioning page" in body)):
        return "dead", "Amazon: page not found", final
    # robot checks first: never dead
    if code in (401, 403, 405, 429, 503, 999) or code >= 520:
        if code == 503 and "amazon" in fh and "Page Not Found" in t:
            return "dead", "Amazon page not found", final
        return "blocked", f"store refused automated read (HTTP {code})", final
    if CAPTCHA.search(final) or CAPTCHA.search(t) or (len(body) < 5000 and CAPTCHA.search(body)):
        return "blocked", "robot check", final
    if "amazon." in fh:
        if code in (404, 410) or "Page Not Found" in t or ("Looking for something?" in body and "not a functioning page" in body):
            return "dead", "Amazon: page not found", final
        if "Enter the characters you see below" in body or "api-services-support@amazon.com" in body:
            return "blocked", "Amazon robot check", final
        if is_home(final) or not re.search(r"/(dp|gp/product|gp/aw/d|d)/[A-Z0-9]{10}", final):
            return "dead", "Amazon sent the link to its home page", final
        avt = " ".join(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", m.group(0))) for m in re.finditer(r'id="availability"[\s\S]{0,1200}', body))
        if re.search(r"we don.t know when or if this item will be back", avt, re.I) or 'id="outOfStock"' in body:
            return "dead", "Amazon: currently unavailable (we don't know when or if it will be back)", final
        return "ok", "product page", final
    if "aliexpress." in fh:
        if re.search(r"can ?not be found|page not found", body[:20000], re.I) and "punish" not in body:
            return "dead", "AliExpress: page not found", final
        return "blocked", "AliExpress robot check (needs browser)", final
    if "ebay." in fh:
        if re.search(r"this listing (was|has) ended|no longer available|listing has been removed", body, re.I):
            return "dead", "eBay: listing ended", final
        if "Error Page" in t:
            return "blocked", "eBay error page (eBay shows it to automated reads, even for live listings)", final
        return ("ok", "listing page", final) if code == 200 else ("unknown", f"HTTP {code}", final)
    if "shein." in fh:
        return "blocked", "SHEIN robot check / app landing page (SHEIN refuses automated reads)", final
    if "temu." in fh:
        return "unknown", "Temu landing page (cannot verify without a browser)", final
    if code in (404, 410):
        return "dead", f"HTTP {code}", final
    if GENERIC_DEAD_TITLE.search(t):
        return "dead", f'page says "{t[:60]}"', final
    path_in = urlparse(url_in).path.rstrip("/")
    if code == 200 and is_home(final) and path_in not in ("", "/"):
        return "dead", "store sent the product link to its home page", final
    if code == 200:
        return "ok", "page loads", final
    return "unknown", f"HTTP {code}", final

def shopify_gone(url, session):
    """Shopify stores (/products/<handle>) answer /products/<handle>.json with 404 when the product is gone."""
    p = urlparse(url)
    m = re.match(r"(/(?:[a-z]{2}(?:-[a-z]{2})?/)?products/[^/?#]+)", p.path or "")
    if not m: return None
    try:
        r = get(f"{p.scheme}://{p.netloc}{m.group(1)}.json", session)
        return r.status_code
    except Exception:
        return None

def check_http(item, cache):
    url = item["url"]; store = item.get("store") or dedupe.store_of(url)
    s = requests.Session()
    try:
        target = url
        hit = cache.get(url) or {}
        # Amazon short links: the cached final store page skips the redirect hop
        if re.search(r"(amzn\.to|link\.amazon|a\.co)/", url) and re.search(r"amazon\.[a-z.]+/.*?/?dp/[A-Z0-9]{10}", hit.get("final", "")):
            target = hit["final"]  # the exact store page (same variant/size) the short link opens
        r = get(target, s)
        inner = unwrap(r.url, r.text) if r.status_code == 200 else None
        if inner:
            r = get(inner, s); target = inner
        status, reason, final = classify_page(target, r, store)
        if status == "ok" and "/products/" in final:
            js = shopify_gone(final, s)
            if js == 404:
                status, reason = "dead", "store says this product no longer exists"
        if status == "ok" and inner and (urlparse(url).hostname or "") in ("spl.it",):
            # Split page pointed at a store page; a redirect of that page to the store's home means gone
            pass
        if url not in cache and dedupe.is_short(url) and final:
            cache[url] = {"final": final, "key": dedupe.product_key(final), "status": r.status_code, "err": "", "at": int(time.time()), "source": "deadlinks"}
        return {"status": status, "reason": reason, "final": final[:300], "http": r.status_code}
    except Exception as e:
        return {"status": "unknown", "reason": f"network error: {str(e)[:100]}", "final": "", "http": None}

def classify_browser(r):
    text = r.get("text") or ""; title = r.get("title") or ""; final = r.get("final") or ""
    if r.get("err") and not text: return "unknown", "browser: " + r["err"][:80]
    if re.search(r"can ?not be found|page not found|no longer available|this listing (was|has) ended", text, re.I):
        return "dead", "page not found (browser)"
    if CAPTCHA.search(final) or CAPTCHA.search(title) or re.search(r"slide to verify|network error, click to reload", text, re.I):
        return "blocked", "robot check (browser)"
    if len(text) > 2500 and re.search(r"\$\s?\d|sold|add to cart|buy now|reviews", text, re.I):
        return "ok", "product page (browser)"
    return "unknown", "browser page did not show the product or a not-found message"

def run_browser(urls):
    if not urls: return {}
    stamp = int(time.time()); inp = f"/tmp/deadlinks-bc-{stamp}.json"; outp = f"/tmp/deadlinks-bc-{stamp}-out.json"
    json.dump(urls, open(inp, "w"))
    timeout = 60 + 25 * len(urls)
    try:
        with open(f"/tmp/deadlinks-bc-{stamp}.log", "w") as log:
            subprocess.run(["timeout", "-k", "5", str(timeout), "/usr/bin/node", os.path.join(HERE, "browsercheck.mjs"), inp, outp],
                           cwd=HERE, stdout=log, stderr=subprocess.STDOUT, timeout=timeout + 15)
    except Exception as e:
        print("browser pass failed:", e, file=sys.stderr)
    try: return json.load(open(outp))
    except Exception: return {}

def bucket(url):
    return int(hashlib.sha1(url.encode()).hexdigest(), 16) % BUCKETS

def et_today():
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo("America/New_York")).date()
    except Exception:
        return datetime.date.today()

def main(argv):
    def opt(name, default=None):
        return argv[argv.index(name) + 1] if name in argv else default
    flags = set(a for a in argv if a.startswith("--"))
    date = datetime.date.fromisoformat(opt("--date")) if opt("--date") else et_today()
    state_file = opt("--state", STATE_FILE); out_dir = opt("--out", IMPORT_DIR)
    use_browser = "--browser" in flags and "--no-browser" not in flags
    browser_cap = int(opt("--browser-cap", "30"))
    t0 = time.time()
    sha, products = dedupe.fetch_products(opt("--sha"))
    state = json.load(open(state_file)) if os.path.exists(state_file) else {"items": {}, "runs": []}
    items = state.setdefault("items", {})
    site = {}
    for p in products:
        if not p.get("affiliateUrl"): continue
        if p.get("hidden") and "--include-hidden" not in flags: continue
        site[p["affiliateUrl"]] = {"url": p["affiliateUrl"], "slug": p.get("slug"), "name": p.get("name"), "store": p.get("store"), "hidden": bool(p.get("hidden"))}
    # links no longer on the site: drop from state (keep a short log)
    gone = [u for u in items if u not in site]
    if "--keep-gone" not in flags:
        for u in gone:
            state.setdefault("removed_log", []).append({"url": u, "slug": items[u].get("slug"), "date": str(date), "last_status": items[u].get("last_status")})
            del items[u]
        state["removed_log"] = state.get("removed_log", [])[-200:]
    # tonight's share
    tb = date.toordinal() % BUCKETS
    extra = [u for u, it in site.items() if it["slug"] in set((opt("--slugs") or "").split(","))]
    if opt("--slugs") and not opt("--sample"):
        todo = extra
    elif "--all" in flags:
        todo = list(site)
    elif opt("--sample"):
        n = int(opt("--sample")); todo = sorted(site, key=lambda u: hashlib.sha1((u + str(date)).encode()).hexdigest())[:n]
        todo += [u for u in extra if u not in todo]
    else:
        todo = [u for u in site if bucket(u) == tb]
        flagged = [u for u in site if u not in todo and items.get(u, {}).get("last_status") in ("dead", "unknown")]
        todo += flagged
    cache = json.load(open(CACHE_FILE)) if os.path.exists(CACHE_FILE) else {}
    n_cache = len(cache)
    results = {}
    with ThreadPoolExecutor(8) as ex:
        for u, res in zip(todo, ex.map(lambda u: check_http(site[u], cache), todo)):
            results[u] = res
    # browser pass for stores that block plain HTTP
    browser_info = {"used": False}
    if use_browser:
        want = [u for u in todo if results[u]["status"] == "blocked" and (site[u]["store"] in BROWSER_STORES)]
        # previously dead ones first (they decide removals), then the rest
        want.sort(key=lambda u: 0 if items.get(u, {}).get("last_status") == "dead" else 1)
        want = want[:browser_cap]
        if want:
            tb0 = time.time(); br = run_browser(want)
            for u in want:
                if u in br:
                    st, why = classify_browser(br[u])
                    results[u] = {"status": st, "reason": why, "final": (br[u].get("final") or "")[:300], "http": br[u].get("status"), "via": "browser"}
            browser_info = {"used": True, "links": len(want), "answered": len(br), "seconds": round(time.time() - tb0)}
    # update state
    ds = str(date)
    for u, res in results.items():
        it = items.setdefault(u, {})
        it.update({k: site[u][k] for k in ("slug", "name", "store")})
        it["last_checked"] = ds; it["last_status"] = res["status"]; it["last_reason"] = res["reason"]
        hist = it.setdefault("history", [])
        hist = [h for h in hist if h["date"] != ds] + [{"date": ds, "status": res["status"], "reason": res["reason"]}]
        it["history"] = hist[-8:]
        if res["status"] == "ok":
            it["dead_dates"] = []; it["confirmed_dead"] = False
        elif res["status"] == "dead":
            dd = sorted(set(it.get("dead_dates", []) + [ds]))
            it["dead_dates"] = dd[-4:]
            if len(dd) >= 2: it["confirmed_dead"] = True
    if len(cache) != n_cache:
        tmp = CACHE_FILE + ".tmp"; json.dump(cache, open(tmp, "w"), indent=0); os.replace(tmp, CACHE_FILE)
    counts = {k: sum(1 for r in results.values() if r["status"] == k) for k in ("ok", "dead", "blocked", "unknown")}
    def row(u):
        it = items[u]
        return {"slug": it["slug"], "name": it["name"], "store": it["store"], "url": u, "reason": it.get("last_reason"),
                "dead_dates": it.get("dead_dates", []), "last_checked": it.get("last_checked")}
    confirmed = [row(u) for u in site if items.get(u, {}).get("confirmed_dead")]
    dead_once = [row(u) for u in site if items.get(u, {}).get("last_status") == "dead" and not items[u].get("confirmed_dead")]
    report = {
        "date": ds, "site_sha": sha, "bucket": f"{tb + 1} of {BUCKETS}", "public_items": len(site), "checked": len(results),
        "counts": counts, "requests": REQS["n"], "seconds": round(time.time() - t0), "browser": browser_info,
        "confirmed_dead": confirmed, "dead_once": dead_once,
        "blocked": [{"slug": site[u]["slug"], "store": site[u]["store"], "reason": results[u]["reason"]} for u in results if results[u]["status"] == "blocked"],
        "unknown": [{"slug": site[u]["slug"], "store": site[u]["store"], "reason": results[u]["reason"]} for u in results if results[u]["status"] == "unknown"],
        "results": {site[u]["slug"]: {"store": site[u]["store"], **results[u]} for u in results},
        "rule": "Remove ONLY confirmed_dead (dead on 2 separate nights, no ok between). Never remove blocked or unknown.",
    }
    state.setdefault("runs", []).append({k: report[k] for k in ("date", "site_sha", "checked", "counts", "requests", "seconds")} | {"confirmed_dead": len(confirmed)})
    state["runs"] = state["runs"][-60:]
    tmp = state_file + ".tmp"; json.dump(state, open(tmp, "w"), indent=1); os.replace(tmp, state_file)
    out = os.path.join(out_dir, f"dead-{ds}.json")
    json.dump(report, open(out, "w"), indent=1)
    print(json.dumps({"deadlinks": {"file": out, "checked": len(results), **counts, "confirmed_dead": len(confirmed),
                                    "dead_once": len(dead_once), "requests": REQS["n"], "seconds": report["seconds"], "browser": browser_info}}))

if __name__ == "__main__":
    main(sys.argv[1:])
