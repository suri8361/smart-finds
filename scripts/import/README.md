# Importing links from Google Chat

Two small scripts (plain Node, nothing to install) turn the links you posted in
Google Chat into Smart Finds products. Nothing goes on the site until you
approve it.

## 1. Get your Google Chat export

1. Go to https://takeout.google.com
2. Click **Deselect all**, then tick only **Google Chat**
3. Export. Google emails you a zip (`takeout-....zip`)

A plain `.txt` file with messages copied and pasted from the chat also works.

## 2. Make the review sheet

```
npm run import:links -- "C:\Users\you\Downloads\takeout-....zip"
```

(You can also point it at the unzipped `Takeout` folder, a single `messages.json`, or a `.txt` file.)

It finds every Amazon, amzn.to, Temu, SHEIN and AliExpress link, removes
duplicates (the same product posted twice is one row), follows short links
to the real product page, fills in the title and photo from Google Chat's link
preview (or the product page, when the store allows it), guesses a category,
and writes `smartfinds-import-review.csv`.

Options: `--out other-name.csv`, `--no-fetch` (don't contact any website),
`--no-pages` (follow short links but don't read product pages).

## 3. Review it

Open the CSV in Excel or Google Sheets. For each product you want on the site:

| column | what to put |
| --- | --- |
| approve | `yes` |
| title | fix it if it's wrong or empty |
| category | one of the 26: dresses, skirts, tops, sweaters, cardigans, sets, jumpsuits, pajamas, coats-jackets, shoes, boots, sandals, sneakers, bags, accessories, beauty, home, kitchen, organization, toys, baby-gear, school, electronics, outdoor, camping, other |
| price | required, except Amazon (the site shows "Check price on Amazon") |
| original_price | optional, only for a real discount |
| image | photo link; empty = neutral placeholder |
| audience / occasion | optional, clothing only (e.g. `women` + `shabbos`) |
| featured | `yes` to show it in Top Picks |
| label | optional, default `chosen_for_look` |
| description | optional one-liner, default "Found on <store>." |

The `notes` column says what's missing. `affiliate_url` is exactly the link you
posted and is used as is.

Save as CSV.

## 4. Add them to the site

```
npm run import:generate -- smartfinds-import-review.csv --write
npm run build
```

`--write` adds the approved products to the top of `lib/data/products.ts`.
Without it, the script writes `imported-products.txt` for you to paste in by
hand. Rows missing a title, price or valid category are listed and skipped,
and links already on the site are never added twice.

## Amazon

Amazon is switched off for now (`AMAZON_ENABLED` in `lib/config/affiliate.ts`).
While it's off, Amazon products are kept in the list but hidden on the site.
When it's on, `tag=smartfind0a21-20` is added to amazon.com links that don't
already have a tag; amzn.to short links are used as posted.
