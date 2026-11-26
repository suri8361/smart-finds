# Smart Finds — Owner Handoff & Manual Import Guide

Everything that powers **smartfindsus.com** lives in accounts **you own** (your GitHub repo `suri8361/smart-finds`, your Netlify account, your IONOS domain, and your Google account). Your website does **not** depend on Tab's servers to stay online.

This folder (`nightly-import/`) gives you the standalone import toolkit and full written documentation so you can run, customize, or migrate everything yourself at any time.

---

## 1. Where the Nightly Import Lives & When It Runs

- **When automated through Tab:** A recurring schedule set for **2:00 AM Eastern Time** every night (currently **paused** until you ask to turn it back on).
- **What it runs:**
  1. Reads new posts from your Google Chat space ("Smart Finds", `https://chat.google.com/room/AAQAnYvfwq8`) newer than the last saved timestamp (`state.json` -> `lastCutoff`).
  2. Runs `dedupe.py` against `lib/data/products.ts` on the `data` branch to flag repeats and items in `exclusions.json`.
  3. Runs `deadlinks.py` on 1/7th of the catalog each night (removes an item only after it tests dead on **2 separate runs**; SHEIN, eBay, and Temu are never auto-removed).
  4. Runs `npm run import:posts` (already in your repo at `scripts/import/add-chat-posts.mjs`) to prepend new items to `lib/data/products.ts` and copy photos into `public/finds/`.
  5. Runs `node scripts/data/build-catalog.mjs` to validate the data and build `catalog.json`.
  6. Pushes **only** to the `data` branch (`[skip netlify]`, **0 Netlify credits**), waits for GitHub Pages (`https://suri8361.github.io/smart-finds/catalog.json`), and calls `POST /api/refresh` so the live site updates right away.
- **Included in this folder (all standalone, zero secrets):**
  - `chat-reader-local.mjs` — local Playwright Google Chat reader (read-only)
  - `dedupe.py` — duplicate & exclusion checker
  - `deadlinks.py` — dead-link rotation checker
  - `sfdata-local.py` — pull / build / push to `data` branch / refresh tool (uses standard `git`)
  - `exclusions.json` — products you explicitly asked never to re-add

---

## 2. How Google Chat Is Read & How to Turn Access Off

- **Method:** Read-only automated Chromium browser session opening `https://chat.google.com/room/AAQAnYvfwq8`. It never types, posts, or reacts in your chat.
- **Account used:** Your Google account (`suri8361@gmail.com`), signed in once with SMS 2FA. (Google Workspace OAuth is **not** connected.)
- **Permissions:** Because it uses a regular signed-in browser session for `suri8361@gmail.com`, that session technically holds standard browser access for that Google account, though the reader only visits your Smart Finds chat space read-only.
- **How to turn Tab's Google Chat access off completely:**
  1. Go to **https://myaccount.google.com/device-activity** (*Security → Your devices → Manage all devices*).
  2. Sign out of any unrecognized Linux/cloud Chrome session — that immediately ends the saved browser session.
  3. Change your Google password (and/or tell Tab to delete your saved Google login from its vault) so it cannot sign back in.

---

## 3. The `/api/refresh` Key — Where It Lives & How to Take Ownership

- **How it works:** After `catalog.json` is pushed to the `data` branch, `POST https://smartfindsus.com/api/refresh` with header `x-refresh-key: <your-key>` forces Next.js to reload the catalog immediately.
- **Where it is stored:**
  - The **secret key itself** is NOT in GitHub and NOT in Netlify environment variables — it currently lives only on Tab's side.
  - Your GitHub repo (`lib/config/data-source.ts`) stores **only its one-way SHA-256 hash** (`REFRESH_KEY_SHA256`), which `app/api/refresh/route.ts` checks against incoming requests.
- **How to replace it with your own key (takes ~2 minutes):**
  1. Generate a new random secret on your computer (save it only in your password manager or a local untracked `refresh-key.txt` — **never commit it**):
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
  2. Hash your new secret:
     ```bash
     node -e "console.log(require('crypto').createHash('sha256').update('PASTE_YOUR_NEW_KEY_HERE').digest('hex'))"
     ```
  3. Replace `REFRESH_KEY_SHA256` in `lib/config/data-source.ts` with that new hash (or update `app/api/refresh/route.ts` to read `process.env.REFRESH_KEY` from your host's Environment Variables) and deploy once.
  4. Immediately after deploy, Tab's old key stops working (`403 Forbidden`), and only your new key works.
  - *Note:* Even if `/api/refresh` is never called, the site still refreshes `catalog.json` automatically in the background (homepage revalidates every 10 minutes / layout every 24 hours).

---

## 4. Every Account, Token, or Key Used for Your Site (By Name Only)

| Credential / Connection (by name) | Belongs To | Used For | How You Revoke / Replace |
|---|---|---|---|
| **GitHub OAuth connection** (`suri8361`) | Your GitHub account | Pushing `data` branch updates via GitHub API | GitHub → Settings → Applications → Authorized OAuth/GitHub Apps → Revoke |
| **Google login + saved browser session** (`suri8361@gmail.com`) | Your Google account | Read-only read of Smart Finds Google Chat | `myaccount.google.com` → Security → Your devices (Sign out) + change password / ask Tab to delete vault entry |
| **Smart Finds Refresh Key** (`REFRESH_KEY_SHA256`) | Created for your site (`lib/config/data-source.ts`) | Calling `POST /api/refresh` after a `data` push | Replace hash in `lib/config/data-source.ts` (or switch to `REFRESH_KEY` env var) + deploy |
| **Amazon Associates Tag** (`stylebudget05-20`) | Your Amazon Associates account | Affiliate URLs on Amazon finds | Managed directly in your Amazon Associates dashboard |
| **Netlify GitHub link** (site `vocal-froyo-8dd5b3`) | Your Netlify account | Deploying code pushes on `tab/finish-v1` (Tab has **no** Netlify token or deploy hook) | Managed directly in Netlify → Site configuration |
| **IONOS domain** (`smartfindsus.com`) | Your IONOS account | DNS (Tab has **no** login or token) | Managed directly in IONOS |
| *(Separate project)* **Vercel OAuth connection** | Your Vercel account | Used only for **Stylisse** (`stylisse.vercel.app`), not Smart Finds | Vercel → Account Settings → Integrations / Tokens |

---

## 5. Step-by-Step Guide to Run the Import Yourself (By Hand)

### Option A — Using Google Takeout (no browser automation needed, always works if chat read fails)

1. Go to **https://takeout.google.com** → **Deselect all** → select only **Google Chat** → export & download the `.zip`.
2. In VS Code / terminal inside a local clone of `suri8361/smart-finds` (on branch `tab/finish-v1`):
   ```bash
   python3 nightly-import/sfdata-local.py pull .
   npm run import:links -- "C:\Users\you\Downloads\takeout-....zip" --author suri8361@gmail.com
   ```
   *(A plain `.txt` file of pasted chat messages also works!)*
3. Open `smartfinds-import-review.csv` in Excel or Google Sheets:
   - Check titles, categories, prices (leave Amazon prices blank), and images.
   - Put `yes` in the `approve` column for every item you want to add, then save.
4. Generate the new products into `lib/data/products.ts`:
   ```bash
   npm run import:generate -- smartfinds-import-review.csv --write
   ```
5. Validate & push to the `data` branch (0 Netlify credits):
   ```bash
   npx next typegen && npx tsc --noEmit
   python3 nightly-import/sfdata-local.py push . -m "Add new finds"
   ```
   *(Set `SF_REFRESH_KEY` in your terminal or place your key in an untracked `nightly-import/refresh-key.txt` to trigger `/api/refresh` automatically, or run `sfdata-local.py refresh` afterwards.)*

### Option B — Using the Local Playwright Chat Reader

1. One-time setup in `nightly-import/`:
   ```bash
   npm install playwright
   npx playwright install chromium
   pip install requests
   ```
2. First run (sign into Google in the Chrome window that opens):
   ```bash
   node nightly-import/chat-reader-local.mjs --headed
   ```
3. Run dedupe + dry-run import + review:
   ```bash
   python3 nightly-import/dedupe.py new-posts-YYYY-MM-DD.json
   python3 nightly-import/sfdata-local.py pull .
   npm run import:posts -- new-posts-YYYY-MM-DD.json            # dry run
   ```
   *(Edit `new-posts-YYYY-MM-DD.overrides.json` to fix any title/category or skip an item.)*
4. Write, type-check, push to `data`, and advance the cutoff:
   ```bash
   npm run import:posts -- new-posts-YYYY-MM-DD.json --write
   npx next typegen && npx tsc --noEmit
   python3 nightly-import/sfdata-local.py push . -m "Add new finds"
   node nightly-import/chat-reader-local.mjs --commit
   ```

### What to Do When the Automated Chat Read Fails

- **`signed_out` error:** Google expired the browser session. Re-run `node nightly-import/chat-reader-local.mjs --headed` and sign in again (or use **Option A: Google Takeout** above).
- **0 photos saved / blank images:** Google Chat occasionally changes image CDN/CORS rules. `chat-reader-local.mjs` captures images directly via Chrome's network layer (`Network.getResponseBody`). If Google changes its DOM attributes (`[data-id]`, `[jsname="bgckF"]`), inspect a message element in Chrome DevTools or fall back to **Option A: Google Takeout** (which exports attachments directly in the zip).
- **Store link check blocked:** `dedupe.py` and `deadlinks.py` never delete an item when a store blocks automated checks; they mark it `blocked`/`unknown`.

---

## 6. How Photos Are Saved, Named, and Sourced

- **Storage & delivery:** All local product photos live in `public/finds/` on the **`data`** branch of `suri8361/smart-finds`. The live site (`lib/photos.ts`) rewrites every `/finds/<filename>` path to `https://suri8361.github.io/smart-finds/public/finds/<filename>` (GitHub Pages CDN — free, zero Netlify bandwidth).
- **Naming rule:** `public/finds/<product-slug>-<index>.jpg` (e.g., `plaster-donut-painting-craft-kit-0.jpg`, or with a date suffix when refreshing a photo so browsers don't serve a stale cached image). **Never delete existing photos** from `public/finds/` on the `data` branch, because older cached pages or fallbacks may still reference them.
- **Where photos come from by store:**
  - **Primary source (all stores — Amazon, Temu, SHEIN, AliExpress, Macy's, etc.):** The real product photo(s) you attach in your Google Chat post, downloaded into `public/finds/<slug>-<n>.jpg`.
  - **Amazon:** Extra screenshots showing prices/grids are skipped; only clean product photos are kept (and Amazon items show no price on the site). If a post has no chat photo, the product page image is saved locally.
  - **Temu / SHEIN / AliExpress / Macy's / others:** Chat attachment photos are saved locally into `public/finds/`. If a chat post has no image, direct store CDN image URLs (`https://...`) may be used as a fallback (kept verbatim by `lib/photos.ts`), or the item is hidden until a photo is added.

---

## 7. Billing, Cancellation & What Happens If You Stop Paying

- **Current billing:** You are on a **free 7-day trial** (through Dec 2, 2026) with **no card on file** — **$0 charged**, and nothing is ever charged without your explicit yes. Paid plans start at **$50/mo** (weekly usage reset), with optional auto top-up or upgrades anytime.
- **If you stop paying or cancel:**
  - **Your website (`smartfindsus.com`), GitHub repo (`suri8361/smart-finds`), `data` branch, photos, Netlify/Cloudflare hosting, and domain all stay 100% online and untouched.**
  - Only Tab's automated work stops (Tab pauses new work/schedules; nothing in your accounts is deleted).
- **How to cancel or export everything:**
  - Cancel any paid plan anytime at **https://tab.bot/account/plan** (or tell Tab "cancel my plan") — it simply stops renewing at the end of your paid month.
  - Your entire site code, catalog (`catalog.json`, `lib/data/products.ts`, `hero.json`), photos (`public/finds/*`), and this import toolkit are already in your GitHub repo (`suri8361/smart-finds`), so `git clone` exports everything immediately.

---

## 8. Ownership Confirmation

Confirmed:
- **Code & Data:** 100% in your GitHub repository (`https://github.com/suri8361/smart-finds`, branches `main`, `tab/finish-v1`, `data`, and `handoff/nightly-import`).
- **Photos & Live Catalog JSON:** Served from your repo's GitHub Pages (`https://suri8361.github.io/smart-finds/`).
- **Hosting:** Currently your Netlify account (`vocal-froyo-8dd5b3`); moving to your Cloudflare account whenever you choose.
- **Domain:** Your IONOS account (`smartfindsus.com`).
- **Chat source:** Your Google account (`suri8361@gmail.com`).
- **Zero dependency on Tab's servers:** If Tab goes offline or you close your Tab account, `smartfindsus.com` stays live with all products, photos, and affiliate links working normally.

---

## 9. Moving `smartfindsus.com` from Netlify to Cloudflare — What Changes

Nothing about hosting has been changed. When you move from Netlify to Cloudflare Pages, here is **everything** that needs to change:

1. **Refresh / Rebuild trigger (`sfdata.py` / `POST /api/refresh`):**
   - **If you deploy as a Next.js app on Cloudflare (via OpenNext / `@opennextjs/cloudflare`):** `/api/refresh` can keep working — we just update the target URL in `sfdata.py` from `https://vocal-froyo-8dd5b3.netlify.app` to `https://smartfindsus.com` (and set your `REFRESH_KEY` in Cloudflare).
   - **If you deploy as a static export on Cloudflare Pages (`output: "export"`):** Static sites don't have a server `/api/refresh` route. Instead, create a **Cloudflare Pages Deploy Hook** URL (in Cloudflare Pages → Settings → Builds & deployments → Deploy hooks), and `sfdata.py` / `sfdata-local.py` calls that Deploy Hook (`SF_DEPLOY_HOOK`) after pushing to `data` so Cloudflare rebuilds with the new catalog (Cloudflare Pages includes 500 free builds/month).
2. **Netlify Forms ("Join the chat" email box):**
   - On Netlify, the signup form uses Netlify Forms. On Cloudflare Pages, that form needs a small replacement endpoint (e.g., a Cloudflare Pages Function, Formspree, or Tally) so signups keep working.
3. **Git branch & auto-deploys:**
   - Connect Cloudflare Pages to `suri8361/smart-finds` branch `tab/finish-v1` (or `main` once merged). Keep the `data` branch excluded from automatic builds if using `/api/refresh`, or let the Deploy Hook trigger builds cleanly.
4. **DNS at IONOS:**
   - Point `smartfindsus.com` / `www.smartfindsus.com` DNS records from Netlify to your new Cloudflare Pages project (or move DNS nameservers to Cloudflare).
5. **Tab Schedules:**
   - The nightly Smart Finds schedule (currently **paused**) only needs its post-push URL updated (from the Netlify URL to `https://smartfindsus.com` or your Cloudflare Deploy Hook) once the move is complete.
