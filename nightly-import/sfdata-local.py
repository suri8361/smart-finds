#!/usr/bin/env python3
"""Smart Finds standalone data-branch tool (runs on your own computer with standard git).

The live site reads its product catalog, hero sets, and photos from the `data` branch of
suri8361/smart-finds (published by GitHub Pages at https://suri8361.github.io/smart-finds/).
Updating the `data` branch never triggers a Netlify deploy (0 credits).

Requirements: git (logged into your GitHub account), Node.js, Python 3 + `requests`.

Usage:
  python3 sfdata-local.py pull   WORKDIR          # copy data branch files into your repo clone
  python3 sfdata-local.py build  WORKDIR          # validate & generate WORKDIR/catalog.json
  python3 sfdata-local.py push   WORKDIR -m MSG   # commit & push changed files to `data` branch,
                                                  # wait for GitHub Pages, optionally call /api/refresh
  python3 sfdata-local.py refresh                 # call POST /api/refresh (needs REFRESH_KEY)
  python3 sfdata-local.py status                  # show data branch head, Pages catalog, live site

Environment / secrets (never commit these):
  SF_SITE_URL       Default: https://smartfindsus.com (or your Netlify/Cloudflare URL)
  SF_REFRESH_KEY    Your own /api/refresh secret (or put it in an untracked ./refresh-key.txt)
  SF_DEPLOY_HOOK    Optional Cloudflare Pages deploy hook URL (POSTed after push if set)
"""
import json, os, re, shutil, subprocess, sys, tempfile, time
import requests

REPO_URL = "https://github.com/suri8361/smart-finds.git"
BRANCH = "data"
PAGES = "https://suri8361.github.io/smart-finds"
SITE = os.environ.get("SF_SITE_URL", "https://smartfindsus.com").rstrip("/")
HERE = os.path.dirname(os.path.abspath(__file__))
KEY_FILE = os.path.join(HERE, "refresh-key.txt")
CARRIED = ["lib/data/products.ts", "hero.json", "catalog.json"]
PHOTO_DIR = "public/finds"
UA = {"user-agent": "smart-finds-data-tool", "cache-control": "no-cache"}


def sh(cmd, cwd=None, check=True):
    r = subprocess.run(cmd, cwd=cwd, shell=isinstance(cmd, str), capture_output=True, text=True, timeout=300)
    if check and r.returncode != 0:
        raise SystemExit(f"Command failed: {cmd}\n{r.stdout[-2000:]}\n{r.stderr[-2000:]}")
    return r


def get(url, **kw):
    sep = "&" if "?" in url else "?"
    return requests.get(f"{url}{sep}_={int(time.time()*1000)}", headers=UA, timeout=kw.pop("timeout", 30), **kw)


def read_refresh_key():
    if os.environ.get("SF_REFRESH_KEY"):
        return os.environ["SF_REFRESH_KEY"].strip()
    if os.path.exists(KEY_FILE):
        return open(KEY_FILE).read().strip()
    return None


def cmd_pull(workdir):
    """Fetch `data` branch and copy products.ts, hero.json, catalog.json, and public/finds/* into workdir."""
    sh(["git", "fetch", "-q", REPO_URL, BRANCH], cwd=workdir)
    tmp = tempfile.mkdtemp(prefix="sf-data-pull-")
    try:
        sh(["git", "clone", "-q", "--depth", "1", "--branch", BRANCH, REPO_URL, tmp])
        for rel in CARRIED:
            src = os.path.join(tmp, rel)
            dst = os.path.join(workdir, rel)
            if os.path.exists(src):
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copy2(src, dst)
        src_ph = os.path.join(tmp, PHOTO_DIR)
        dst_ph = os.path.join(workdir, PHOTO_DIR)
        if os.path.isdir(src_ph):
            os.makedirs(dst_ph, exist_ok=True)
            for fn in os.listdir(src_ph):
                s = os.path.join(src_ph, fn)
                d = os.path.join(dst_ph, fn)
                if os.path.isfile(s) and not os.path.exists(d):
                    shutil.copy2(s, d)
        head = sh(["git", "rev-parse", "HEAD"], cwd=tmp).stdout.strip()
        print(json.dumps({"pulled": BRANCH, "head": head}))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def cmd_build(workdir):
    """Run scripts/data/build-catalog.mjs to validate products.ts + hero.json and emit catalog.json."""
    r = sh(["node", "scripts/data/build-catalog.mjs"], cwd=workdir)
    print(r.stdout.strip())
    cat = json.load(open(os.path.join(workdir, "catalog.json")))
    return cat["version"]


def wait_for_pages(version, timeout_s=240):
    t0 = time.time()
    while time.time() - t0 < timeout_s:
        try:
            r = get(f"{PAGES}/catalog.json", timeout=15)
            if r.ok and r.json().get("version") == version:
                return True
        except Exception:
            pass
        time.sleep(8)
    return False


def cmd_refresh():
    key = read_refresh_key()
    if not key:
        print(json.dumps({"ok": False, "note": "No SF_REFRESH_KEY or refresh-key.txt found; site will still auto-refresh on its own schedule."}))
        return False
    r = requests.post(f"{SITE}/api/refresh", headers={"x-refresh-key": key, **UA}, timeout=30)
    print(json.dumps({"status": r.status_code, "body": r.text[:500]}))
    return r.ok


def cmd_push(workdir, message, refresh=True):
    version = cmd_build(workdir)
    tmp = tempfile.mkdtemp(prefix="sf-data-push-")
    try:
        sh(["git", "clone", "-q", "--depth", "1", "--branch", BRANCH, REPO_URL, tmp])
        for rel in CARRIED:
            src = os.path.join(workdir, rel)
            dst = os.path.join(tmp, rel)
            if os.path.exists(src):
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copy2(src, dst)
        # Copy new photos only (never delete existing photos on `data`)
        src_ph = os.path.join(workdir, PHOTO_DIR)
        dst_ph = os.path.join(tmp, PHOTO_DIR)
        if os.path.isdir(src_ph):
            os.makedirs(dst_ph, exist_ok=True)
            for fn in os.listdir(src_ph):
                s = os.path.join(src_ph, fn)
                d = os.path.join(dst_ph, fn)
                if os.path.isfile(s):
                    shutil.copy2(s, d)
        status = sh(["git", "status", "--porcelain"], cwd=tmp).stdout.strip()
        if not status:
            print(json.dumps({"ok": True, "note": "Nothing changed on data branch."}))
            return
        sh(["git", "add", "lib/data/products.ts", "hero.json", "catalog.json", PHOTO_DIR], cwd=tmp)
        msg = message if "[skip netlify]" in message else f"[skip netlify] {message}"
        sh(["git", "commit", "-m", msg], cwd=tmp)
        sh(["git", "push", "origin", BRANCH], cwd=tmp)
        head = sh(["git", "rev-parse", "HEAD"], cwd=tmp).stdout.strip()
        print(json.dumps({"pushed": head, "version": version}))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    print("Waiting for GitHub Pages to publish new catalog.json...")
    if not wait_for_pages(version):
        print("Warning: GitHub Pages has not served the new version yet; re-run `refresh` in a minute.")
        return
    hook = os.environ.get("SF_DEPLOY_HOOK")
    if hook:
        hr = requests.post(hook, timeout=30)
        print(json.dumps({"deploy_hook_status": hr.status_code}))
    elif refresh:
        time.sleep(90)
        cmd_refresh()


def cmd_status():
    head = sh(["git", "ls-remote", REPO_URL, f"refs/heads/{BRANCH}"]).stdout.split()[0]
    pv = get(f"{PAGES}/catalog.json").json()
    home = get(f"{SITE}/").text
    m = re.search(r'<meta[^>]+name="sf-catalog"[^>]+content="([^"]+)"', home)
    print(json.dumps({
        "data_head": head,
        "pages_version": pv.get("version"),
        "pages_products": pv.get("productCount"),
        "live_site_meta": m.group(1) if m else None,
    }, indent=2))


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        sys.exit(0)
    if a[0] == "pull":
        cmd_pull(os.path.abspath(a[1]))
    elif a[0] == "build":
        cmd_build(os.path.abspath(a[1]))
    elif a[0] == "push":
        if "-m" not in a:
            raise SystemExit("push requires -m MESSAGE")
        cmd_push(os.path.abspath(a[1]), a[a.index("-m") + 1], refresh="--no-refresh" not in a)
    elif a[0] == "refresh":
        cmd_refresh()
    elif a[0] == "status":
        cmd_status()
    else:
        print(__doc__)
        sys.exit(2)
