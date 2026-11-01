# Smart Finds data (branch `data`)

**This branch is the site's live product list.** The website (Netlify, branch `tab/finish-v1`) reads it
while it runs, so changing it needs **no Netlify deploy and costs no Netlify credits**.
(Every push to `tab/finish-v1` is a production deploy = 15 of the 300 free credits a month.)

GitHub Pages publishes this branch at https://suri8361.github.io/smart-finds/ — the site reads
`catalog.json` from there (backup: raw.githubusercontent.com), and new photos load from `public/finds/` there.

| File | What it is | Who edits it |
| --- | --- | --- |
| `lib/data/products.ts` | the product list, newest first (same format as the copy on `tab/finish-v1`) | the importer (`npm run import:posts`) or by hand |
| `hero.json` | home-page hero photo sets per season (winter/spring/summer/fall; every set needs a Tried & True find) | by hand |
| `catalog.json` | what the site actually reads: products + hero, checked and stamped with a version | **generated** — never edit by hand |
| `public/finds/` | photos (new ones and copies of the deployed ones) | the importer; never delete photos |

## How to change it
Use the tool on Tab's box: `nightly/sfdata.py` (see nightly/README.md "Data without redeploy").
1. Clone `tab/finish-v1` (code + importer), then `python3 sfdata.py pull <clone>` copies this branch's data in.
2. Make the change (importer, or edit products.ts / hero.json).
3. `python3 sfdata.py push <clone> -m "what changed"` — checks everything, builds `catalog.json`,
   commits here with `[skip netlify]`, waits for GitHub Pages, tells the live site to re-read, and checks it.

Rules: never merge this branch into `tab/finish-v1` (or the other way); never force-push; never delete photos;
the code branch keeps a fallback copy of products.ts / hero-rotation.ts that is refreshed whenever code is deployed anyway.
