# Smart Finds

A curated affiliate shopping guide (Next.js, no database). Products live in `lib/data/products.ts`.

**Data without redeploy (Nov 2026).** Every push to `tab/finish-v1` is a Netlify production deploy
(15 of the 300 free credits a month). So the live product list, the home-page hero sets and new photos
come from the separate **`data` branch** (published by GitHub Pages at https://suri8361.github.io/smart-finds/),
which the site reads while it runs — adding, moving or removing finds there costs nothing.
`lib/data/products.ts` and `lib/data/hero-rotation.ts` here are the fallback copy used if that can't be read.
Details: `lib/config/data-source.ts`, `lib/data/catalog.ts`, and the `data` branch README.
Only code/design changes go to `tab/finish-v1`.

- **Add products from Google Chat:** see [scripts/import/README.md](scripts/import/README.md).
- **Store switches and the Amazon tag:** `lib/config/affiliate.ts` (Amazon is off until the Associates account is confirmed).
- **Contact email shown on the site:** `lib/config/site.ts` (still a TODO placeholder).
- **Favorites** are saved in the shopper's own browser (no login). **Search** runs in the browser over product name, store and category.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
