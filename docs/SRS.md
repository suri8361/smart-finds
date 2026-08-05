# Smart Finds — Software Requirements Specification (SRS)

**Status:** Draft v1.1 — awaiting stakeholder approval. No application code has been written against this spec.
**Owner:** Architecture
**Last updated:** 2026-08-05 (v1.1: revised curation model, recommendation labels, and trust language — see §1.1/§1.2)

---

## 0. How to read this document

This is the architecture and requirements baseline for Smart Finds. It covers product scope, information architecture, data model, and technical strategy. Sections are written to be independently referenceable (e.g., "see §11 Database Design") as the team builds. Anything marked **[Phase 2]** or **[Phase 3 / Future]** is explicitly out of scope for the MVP build.

---

## 1. Project Vision

**Smart Finds** is a professional, editorially-curated product discovery platform. It is not a store — Smart Finds never lists inventory it owns, never processes payment, and never ships anything. Every "buy" action hands the visitor off to a retailer (Amazon, SHEIN, AliExpress, Temu, eBay, Walmart, and future partners) through a tracked affiliate link.

**The core bet:** the market is saturated with infinite, unfiltered product listings (retailer search) and with low-trust content (SEO-farmed "best of" blogs, deal-spam social accounts). The gap is a source that feels like a knowledgeable friend — narrow, opinionated, current, and honest about how it makes money.

**Positioning:** "Honest, clearly-labeled curation for the fast-moving, cross-retailer marketplace (including newer high-volume platforms like SHEIN/Temu/AliExpress) that traditional review sites ignore or treat with suspicion." Unlike a traditional "we tested everything" review site, Smart Finds is explicit that products are selected for different reasons — style, price, ratings, audience demand, trend fit, or genuine hands-on use — and labels every product with the specific reason it was chosen (§1.2), rather than implying uniform testing across the catalog.

**Non-goals (explicit):**
- Not a marketplace or storefront — no cart, no checkout, no payment processing, no inventory.
- Not a price-comparison engine that mirrors every SKU — curation over completeness.
- Not a pure content/blog site — every article exists to support product discovery, not the reverse.
- Not a "we personally tested everything" review site — firsthand-testing claims are limited strictly to items labeled **Personally Tried** (§1.2); every other item is selected and labeled for what it actually is (style, price, ratings, demand, or trend fit), never blurred into an implied testing or quality claim.

**Success looks like:** visitors trust a Smart Finds pick enough to click through and buy without comparison-shopping elsewhere first; retailers see above-average conversion rate from Smart Finds traffic because the audience arrives pre-sold.

### 1.1 Editorial Philosophy

Smart Finds curates through several distinct, legitimate selection paths — not exclusively hands-on testing. An item may be featured because:

- the owner/editor likes its style or appearance,
- it fits the demonstrated interests of the audience,
- members have requested that type of product,
- its price appears attractive relative to comparable items,
- its reviews or ratings on the retailer appear promising,
- it seems useful, clever, or unique, or
- it matches a current trend, season, occasion, or specific need.

A smaller subset of products are personally purchased and tried by the owner/editorial team. This is the only category of item that carries any claim of firsthand experience, and it is always labeled separately and distinctly from every other selection path (§1.2). No other selection path is ever phrased, worded, or badged in a way that implies personal testing, verified quality, fit, or performance — a style pick is disclosed as a style pick, a price pick as a price observation, a ratings-based pick as a read of retailer review data, and so on.

This honesty is the trust mechanism, not a limitation of it: readers are told *why* an item is here and can weigh that reason themselves, rather than being asked to take an unverifiable "we tested this" claim on faith.

### 1.2 Recommendation Labels

Every published product carries one or more labels from a controlled vocabulary, chosen to match the actual reason it was selected. Labels are not decorative — each has defined, enforced criteria (see §11.1 `ProductSelectionReason`, §25 workflow), and any other copy on the page (summary, pros/cons, CTA) must not exceed the claim the label supports.

| Label | What it means | What it requires to apply | What it must NOT imply |
|---|---|---|---|
| **Personally Tried** | The owner/editor purchased and actually used the item. | A first-person `tried_notes` field, written by the editor who used it. | — this is the only label permitted to imply firsthand experience. |
| **Chosen for the Look** | Selected primarily for style/aesthetic appeal. | A short style rationale recorded by the editor. | Must not imply tested quality, durability, fit, or performance. |
| **Popular Pick** | Retailer signals indicate strong sales/popularity (e.g., bestseller badge, sales rank). | The specific retailer signal and as-of date are recorded. | Must not imply editorial testing or a quality endorsement. |
| **Highly Rated** | Retailer review aggregate meets a defined threshold. | The actual rating value, review count, source, and as-of date are recorded and shown alongside the label. | Must not imply the editor personally verified or agrees with those reviews. |
| **Community Requested** | Sourced from an actual member/audience request. | Linked to a real request record — a member submission, poll response, or a clear pattern in search-query logs (§11.1) — not a guess at demand. | Must not imply editorial vetting beyond the request itself. |
| **Great Price** | Price appears attractive relative to comparable items in-category. | A comparison basis is recorded (e.g., category median at time of review). | Must not imply a live/lowest-price guarantee — Smart Finds does not track real-time pricing (§6). |
| **Trending Find** | Matches a current trend, season, occasion, or timely need. | A short trend rationale recorded by the editor. | Must not imply quality endorsement. |

**Rules:**

1. A product must carry at least one label and may carry more than one (e.g., "Highly Rated" + "Great Price").
2. "Personally Tried" is the only label that may be paired with first-person testing language ("we found," "in our testing," "held up well after") anywhere on that product's page. No other label may use that language.
3. Every non-"Personally Tried" label must be paired with the specific evidence that justifies it — a rating number, a request record, a trend note — rather than an unsupported editorial adjective. This is both a trust commitment and, per §24, an FTC substantiation requirement for any claim that reads as a rating or endorsement.
4. The public `/how-we-curate` page publishes this exact table, so the label vocabulary is never a claim a reader can't verify the meaning of.

---

## 2. User Types

| User type | Description | Auth required |
|---|---|---|
| **Anonymous visitor** | Browses, searches, filters, clicks out to retailers. The majority of traffic, especially at launch. | No |
| **Registered member** | Saves favorites/collections, gets price-drop or restock alerts, follows categories, receives curated newsletters. | Yes |
| **Editor / Curator** | Internal staff (or vetted contractors) who source, evaluate, label (§1.2), and publish products, guides, and collections. | Yes (staff role) |
| **Admin** | Manages catalog structure, retailers, users, editorial workflow, and site configuration. | Yes (admin role) |
| **Super Admin** | System owner(s) — manages API keys/integrations, feature flags, billing, and admin accounts themselves. | Yes (super admin role) |
| **[Phase 3] Retailer/Brand partner** | Self-serve portal for a brand to submit products for editorial consideration (does **not** bypass curation — submissions still go through the same review queue). | Yes (partner role) |

Roles are additive and enforced via RBAC (§16, §11).

---

## 3. Features

### 3.1 MVP (Phase 1)
- Curated product catalog with recommendation labels (§1.2) and a per-item "why we picked it" note phrased to match the actual selection reason, plus pros/cons
- Category & subcategory browsing with hand-picked "top picks" per category
- Collections / "Best of" guides (e.g., "Best Budget Wireless Earbuds — August 2026")
- Search with typo tolerance and autocomplete
- Faceted filtering (price band, retailer, category attributes, recommendation label — §1.2)
- Product detail pages with multi-retailer links where the same item is available on more than one platform
- Cloaked, tracked outbound affiliate links (`/go/[id]`) with FTC-compliant disclosure
- Lightweight favorites using local storage for anonymous users (no login required for MVP)
- Newsletter signup (email capture)
- Admin CMS: product/category/collection CRUD, editorial workflow, link-health monitoring
- Fully responsive, SEO-optimized, accessible baseline

### 3.2 Phase 2
- Full user accounts (replacing local-storage favorites), saved searches, price-drop/back-in-stock alerts
- Editorial blog/guides as first-class content type, deeply cross-linked to products
- Side-by-side comparison tool (2–4 products)
- Aggregated review signals pulled from retailer APIs where licensing allows, blended with editorial review
- Personalization: recently viewed, "more like this," category affinity
- Retailer performance dashboard for admins (clicks, EPC estimates, link health by retailer)
- Cookie-consent-gated analytics, A/B testing on CTA placement/copy

### 3.3 Phase 3 / Future (AI & beyond)
See §17.

---

## 4. Site Map / Pages

```
/                                Home
/category/[slug]                 Category listing
/category/[slug]/[subslug]       Subcategory listing
/collections/[slug]              Curated "best of" guide (editorial + product grid)
/products/[slug]                 Product detail page
/search?q=...                    Search results
/retailers/[slug]                Retailer hub ("Best Amazon Finds", trust info about that retailer)
/guides/[slug]                   [Phase 2] Long-form editorial content
/go/[linkId]                     Affiliate redirect handler (not a page — see §16.4)
/about                           Brand story
/how-we-curate                   Editorial standards & scoring rubric (trust page)
/how-we-make-money                Affiliate disclosure explainer (trust page, FTC)
/contact
/legal/privacy
/legal/terms
/legal/affiliate-disclosure
/legal/cookies
/account/*                       [Phase 2] login, register, favorites, alerts, settings
/admin/*                         Staff-only CMS (see §10)
/sitemap.xml, /robots.txt        Auto-generated
/404, /500
```

Every indexable page must have a real, crawlable URL — filter/sort state lives in query params and is handled per §12.4 to avoid duplicate-content issues.

---

## 5. Navigation

**Header (desktop):** logo · mega-menu (categories, opens on hover/click) · search bar (persistent, not just an icon) · favorites icon · account icon **[Phase 2]**.

**Header (mobile):** logo · hamburger (categories) · search icon → expands to full-width bar. A persistent bottom tab bar gives the app feel the audience expects: **Home · Search · Categories · Favorites · Account**.

**Footer:** full category list, retailer index (`/retailers/*`), trust links (How We Curate, How We Make Money), legal, newsletter signup, social links.

**Breadcrumbs:** on every category, subcategory, collection, and product page — doubles as SEO structured data (`BreadcrumbList`).

**In-page navigation:** category pages surface related collections; product pages surface "similar products" and "part of these collections."

---

## 6. Product Pages

**Anatomy of `/products/[slug]`:**

1. Image gallery (multiple images required at ingestion; alt text mandatory field, enforced in admin — see §14).
2. Recommendation label(s) from the controlled vocabulary (§1.2) — e.g., "Highly Rated," "Chosen for the Look" — displayed prominently near the title, each linking to its definition on `/how-we-curate`. "Personally Tried" (when present) is visually distinct from research-based labels (see §21), since it is the only one carrying a firsthand-experience claim.
3. Title + one-line "why we picked this" note, phrased to match the actual label(s) applied (a style note for "Chosen for the Look," a rating callout for "Highly Rated," a firsthand note for "Personally Tried") — never generic praise language that reads as a testing or quality claim it isn't (§1.2 rule 3).
4. Retailer CTA block:
   - If available on one retailer: single primary CTA ("View on Amazon →").
   - If available on multiple retailers: CTA per retailer, sorted by our recommended default (editorial choice, not necessarily lowest price), each showing retailer logo and last-checked price band.
   - Inline disclosure directly under the CTA block (not just linked — actually present): *"Smart Finds may earn a commission if you buy through this link."*
   - CTA links to `/go/[linkId]`, never directly to the retailer (see §16.4).
5. Pros / cons list — for "Personally Tried" items these may reflect firsthand experience ("we found…"); for every other item they must be drawn from retailer specs/reviews and phrased accordingly ("Reviewers note…," "Listed spec:…"), never worded as a firsthand finding.
6. Specs table (structured attributes, category-dependent — see §7.2).
7. "Alternatives to consider" — 3–4 related products, editorially chosen, not just algorithmic.
8. Tags & category breadcrumb.
9. "Last verified" timestamp + freshness note (see §11.1, price-volatility handling — we do **not** claim to show live/exact pricing since we don't process transactions).
10. Structured data: `Product`, `Offer` (marked `availability`/`priceValidUntil` conservatively), `BreadcrumbList`.
11. Share buttons (Phase 2 nice-to-have, not core).

**Price display policy:** Because Smart Finds has no live retailer price feed guarantee at MVP, prices are shown as a **band with a "last checked" date** ("$25–$30 as of Aug 3"), not as an authoritative real-time price, with the CTA copy set to "Check current price" rather than a hard dollar amount. This avoids both a trust failure (stale price shown as current) and most retailer-program compliance issues (e.g., Amazon Associates restricts cached price display).

---

## 7. Categories

### 7.1 Structure
Two-level hierarchy for MVP (Category → Subcategory), modeled as a self-referencing tree in the DB so a third level is possible later without a schema change (see §11.2).

Example: `Home & Kitchen → Small Appliances`, `Tech → Wearables`, `Fashion → Activewear`, `Outdoor → Camping Gear`.

### 7.2 Category-driven attributes
Each category owns a schema of relevant filterable attributes (e.g., Tech/Wearables → "battery life," "water resistance"; Fashion → "material," "size range"). Stored as flexible key/value attributes on the product (see §11.2 `ProductAttribute`) so new categories don't require schema migrations.

### 7.3 Category page anatomy
Short editorial intro → hand-picked "top picks" strip → full filterable/sortable grid → related collections/guides.

---

## 8. Search

- **MVP:** PostgreSQL full-text search (`tsvector`) + `pg_trgm` for fuzzy/typo-tolerant matching across title, description, tags, category, and brand. Weighted ranking (title > tags > description).
- **Autocomplete:** debounced client query against a lightweight suggestion endpoint (top matching titles/categories), not a full search round-trip.
- **Search analytics:** every query (and whether it produced zero results) is logged (`SearchQuery` entity) — this is a primary signal for what to curate next, not just a UX feature.
- **Scale path:** once catalog size or query volume outgrows Postgres FTS (rough guideline: >50k products or search latency SLO breached), migrate to Meilisearch or Typesense, self-hosted or managed, without changing the public search API contract (see §23).

---

## 9. Filters & Sorting

- Filters are category-aware and generated from `ProductAttribute` + universal facets (price band, retailer, recommendation label — §1.2 — and retailer rating where "Highly Rated" evidence is present).
- Filter state lives in the URL (`?retailer=amazon&price=25-50`) — shareable and back-button-safe.
- Default sort is **"Editor's Pick"** (curated manual order), not algorithmic — this is a deliberate trust decision. Additional sorts: Price (low–high, high–low), Newest, Most Clicked.
- Facet counts shown next to each filter option (computed server-side, cached).

---

## 10. Admin Dashboard

Route group: `/admin/*`, gated by session + role check at the layout level (defense in depth with middleware — see §16).

**Modules:**
1. **Products** — CRUD, multi-retailer link attachment, image upload, attribute editor, recommendation label selection with required supporting evidence per label (§1.2, §11.1 `ProductSelectionReason`), pros/cons, "why we picked it" copy constrained to match the applied label(s), draft → in review → published workflow.
2. **Categories** — tree management, attribute-schema editor per category.
3. **Collections/Guides** — drag-and-drop product ordering, cover image, editorial copy (rich text/MDX).
4. **Retailers** — retailer registry (name, logo, base affiliate program config, domain allow-list for redirect validation — see §16.4).
5. **Link Health** — scheduled job surfaces dead/broken/redirect-looping affiliate links and stale prices for re-review.
6. **Analytics** — clicks by product/category/retailer, zero-result search terms, top-performing collections.
7. **Users & Roles** — staff account management, RBAC assignment, audit log viewer.
8. **Site Config / Feature Flags** — homepage featured collections, banner messages, kill-switches for a misbehaving retailer integration.
9. **SEO Tools** — meta title/description preview, sitemap status, structured-data validator hook.

Editorial workflow states: `draft → in_review → published → needs_recheck (auto, via link health) → archived`.

---

## 11. Database Design

**Engine:** PostgreSQL. **Access layer:** Prisma (or equivalent typed ORM) — schema below is expressed logically, not as literal code, since no code is being written yet.

### 11.1 Core entities

- **User** — id, email, password_hash/oauth_id, display_name, role_id, created_at. (Anonymous favorites bypass this table entirely in MVP; see §3.1.)
- **Role** — id, name (`member`, `editor`, `admin`, `super_admin`), permissions (JSON or normalized `Permission` join table).
- **Retailer** — id, name, slug, logo_url, base_domain(s) (for redirect allow-listing), affiliate_program_type (e.g., `amazon_associates`, `impact`, `cj`, `awin`, `manual`), disclosure_text override, active (bool).
- **Product** — id, slug, title, short_summary, description, pros (array/JSON), cons (array/JSON), curation_priority (internal-only integer used solely to order the "Editor's Pick" default sort — §9 — never surfaced to users as a quality score), status (`draft/in_review/published/needs_recheck/archived`), category_id (FK), created_by, published_at, last_verified_at.
- **ProductSelectionReason** — id, product_id (FK), reason_type (enum: `personally_tried, chosen_for_look, popular_pick, highly_rated, community_requested, great_price, trending_find`), evidence (JSON, shape depends on `reason_type` — e.g. `{rating: 4.6, count: 1200, source: "amazon", as_of: "2026-07-20"}` for `highly_rated`, or a linked request record id for `community_requested`), note (short editor-written rationale, surfaced as the product page's "why we picked this" copy — §6), created_by, created_at. One row per label applied to a product (§1.2); a product has **one or more** of these. The admin form and API validation both reject a `reason_type` saved without its required `evidence`/`note` shape.
- **ProductImage** — id, product_id (FK), url, alt_text (required, not-null constraint), sort_order.
- **ProductAttribute** — id, product_id (FK), key, value, unit (nullable) — flexible spec/filter data (§7.2).
- **ProductRetailerLink** — id, product_id (FK), retailer_id (FK), destination_url (raw retailer URL, never exposed to client directly), affiliate_tag/params, price_band_low, price_band_high, currency, last_checked_at, link_status (`ok/broken/redirect_loop/unknown`).
- **Category** — id, slug, name, parent_id (self-FK, nullable — enables N-level tree), description, attribute_schema (JSON schema describing filterable attributes for this category).
- **Collection** — id, slug, title, cover_image, editorial_body (MDX/rich text), status.
- **CollectionItem** — id, collection_id (FK), product_id (FK), sort_order, editorial_note (optional per-item blurb).
- **Tag** — id, name; **ProductTag** join table.
- **Favorite** — id, user_id (FK, nullable pre-Phase-2), anonymous_session_id (nullable, for local-storage-synced favorites), product_id (FK), created_at.
- **Click** — id, product_retailer_link_id (FK), session_id, referrer_page, user_agent_hash, ip_hash (privacy-preserving, not raw IP), created_at. *(High-volume append-only table — see §23 for scaling strategy.)*
- **SearchQuery** — id, query_text, result_count, session_id, created_at.
- **Guide** *(Phase 2)* — id, slug, title, body (MDX), related_product_ids, status.
- **AuditLog** — id, actor_user_id, action, entity_type, entity_id, diff (JSON), created_at.

### 11.2 Key relationships
- `Category` is a self-referencing tree (`parent_id`), supporting arbitrary depth even though MVP UI only surfaces two levels.
- A `Product` has **many** `ProductRetailerLink` rows — this is the model that supports "same product, five retailers."
- A `Product` has **many** `ProductSelectionReason` rows (§1.2) — modeling labels as their own evidence-bearing rows, rather than a flag/enum column on `Product`, is what makes "every label ships with its required evidence" enforceable at the schema/validation level instead of relying on editor discipline alone.
- `ProductAttribute` is EAV-style (entity-attribute-value) rather than fixed columns, so new categories with new spec types don't require migrations — traded off deliberately against query simplicity; category pages read `Category.attribute_schema` to know which attribute keys are filterable and render facets accordingly.
- `Click` is intentionally decoupled from `User` (nullable actor) since most traffic is anonymous — attribution is session-based, not identity-based, at MVP.

### 11.3 Indexing priorities
- `Product.slug`, `Category.slug`, `Collection.slug` — unique indexes (primary lookup path for SSR/ISR pages).
- `Product` full-text (`tsvector`) generated column + GIN index; `pg_trgm` GIN index for fuzzy fallback.
- `Click.product_retailer_link_id + created_at`, `Click.created_at` — for analytics aggregation without full scans.
- `ProductAttribute (product_id, key)` composite index for facet filtering.
- `ProductSelectionReason (product_id, reason_type)` composite index — used both to render labels on product/category pages and to power the label facet (§9).

---

## 12. SEO Strategy

1. **Rendering:** Server-rendered/statically-generated pages via Next.js App Router (RSC), with Incremental Static Regeneration on category, collection, and product pages — the content that matters for SEO is never client-only.
2. **URLs:** human-readable, stable slugs (`/products/sony-wh-1000xm5-headphones`, not IDs). Slug changes preserve a redirect record.
3. **Structured data:** `Product`, `Offer`, `BreadcrumbList`, `ItemList` (category/collection pages), `Organization` (site-wide), `FAQPage` where guides warrant it.
4. **Canonicalization:** filtered/sorted category URLs (`?retailer=amazon`) always carry a `<link rel="canonical">` back to the unfiltered category URL to avoid duplicate-content dilution; heavily-filtered combinations are `noindex,follow`.
5. **Sitemaps:** segmented (`/sitemap-products.xml`, `/sitemap-categories.xml`, `/sitemap-collections.xml`, `/sitemap-guides.xml`), regenerated on publish, indexed from a root `sitemap.xml` index.
6. **Outbound link hygiene:** every affiliate redirect (`/go/[id]`) is `rel="sponsored nofollow noopener"`, per Google's affiliate-link guidelines — protects the site's own link-equity profile and keeps it compliant, not just the retailer relationship.
7. **Content strategy:** editorial guides/collections target long-tail, high-intent queries ("best budget espresso machine under $150") and internally link into the product catalog — content exists to feed discovery, not as a separate blog vertical.
8. **Freshness signals:** `last_verified_at` surfaced on-page and in structured data (`priceValidUntil`) — stale content is a ranking and trust risk, so link-health/re-verification (§10.5) is an SEO function as much as an editorial one.
9. **Core Web Vitals** are a ranking factor and a UX requirement — see §15.

---

## 13. Mobile Experience

- Mobile-first Tailwind breakpoints; the majority of affiliate-discovery traffic is expected to be mobile.
- Bottom tab bar (Home/Search/Categories/Favorites/Account) for an app-like feel (§5).
- Sticky, thumb-reachable primary CTA on product pages.
- Image-heavy pages optimized aggressively (§15) since mobile networks are the bottleneck.
- **[Phase 3]** Progressive Web App: installable, offline shell, push notifications for price-drop alerts — a deliberate stepping stone toward native (§18).

---

## 14. Accessibility

- Target: **WCAG 2.1 AA**.
- Semantic HTML and landmark regions (`<nav>`, `<main>`, `<header>`, `<footer>`) throughout; skip-to-content link.
- All interactive components (mega-menu, filters, modals, comparison tool) fully keyboard-operable; built on accessible primitives (Radix UI) rather than hand-rolled widgets, specifically to get this for free.
- Image `alt` text is a **required, enforced field** at ingestion/admin time — not an afterthought (§11.1 `ProductImage.alt_text` not-null).
- Color contrast checked against the design system's token palette (§21), not spot-checked per page.
- Visible focus states on every interactive element.
- Critical flows (search, filter, outbound CTA) manually screen-reader-tested before each major release, not just automated-audit-passed.

---

## 15. Performance

- **Rendering:** RSC + streaming; ISR for product/category/collection pages (revalidate on admin publish action, plus a time-based fallback — e.g., 1h — for price-band freshness).
- **Images:** `next/image` with CDN-backed optimization/responsive sizing; admin-side image pipeline normalizes/compresses on upload rather than at request time only.
- **Caching:** edge caching for static/ISR pages; server-side facet-count caching for filter UI (avoid recomputation per request).
- **Database:** indexed lookups (§11.3), no N+1 query patterns in list views, pagination/cursor-based for large grids.
- **Budgets (targets, not aspirations):** LCP < 2.5s, INP < 200ms, CLS < 0.1 on a mid-tier mobile device over 4G.
- **Bundle discipline:** admin dashboard code-split entirely away from the public site bundle; heavy interactive widgets (comparison tool, rich-text editor) lazy-loaded.

---

## 16. Security

Payment processing is explicitly out of scope, which removes PCI-DSS obligations — but the affiliate-link and admin-CMS surface area still carries real risk.

1. **Transport:** HTTPS-only, HSTS.
2. **Auth:** hashed credentials (or passwordless/magic-link) via a vetted library (Auth.js/Clerk, not hand-rolled); httpOnly, secure, SameSite cookies for session; rate-limited login/reset endpoints.
3. **Admin RBAC:** role checks enforced at both the route-handler/middleware layer *and* the query layer (never trust a hidden UI element as the only gate); every admin mutation is written to `AuditLog` (§11.1).
4. **Affiliate redirect safety (`/go/[linkId]`):** the redirect handler resolves `linkId` → a `ProductRetailerLink` row server-side and redirects only to a URL whose domain is on that retailer's pre-approved allow-list (`Retailer.base_domain`). It **never** accepts or reflects an arbitrary destination URL from the request — this specifically closes off open-redirect abuse, a common issue in naive affiliate-cloaking implementations.
5. **Input handling:** ORM-parameterized queries (no raw SQL string concatenation), server-side validation on every admin form (schema-validated, e.g., Zod), output-encoded rendering (React default-escapes, but rich-text/MDX editorial content is sanitized before storage and again before render).
6. **CSRF:** protected admin mutation endpoints (framework-provided CSRF token or same-site cookie + origin check).
7. **Abuse/fraud protection:** rate limiting and bot detection on `/go/[linkId]` and search endpoints — affiliate programs can and do claw back commissions or terminate accounts for click fraud, so this is a business-continuity control, not just a security nicety.
8. **Headers:** CSP, `X-Content-Type-Options`, `Referrer-Policy` tuned to avoid leaking internal query params to retailers unnecessarily.
9. **Secrets:** environment-managed, never committed; least-privilege API keys per integration (retailer affiliate APIs, email provider, analytics).
10. **Dependency hygiene:** automated vulnerability scanning in CI (e.g., `npm audit`/Dependabot) before merge.
11. **Privacy/compliance:** GDPR/CCPA-aware data handling for any account/analytics data; cookie-consent gate before non-essential tracking cookies fire; `ip_hash` not raw IP in `Click` (§11.1).

---

## 17. Future AI Features [Phase 3]

Ordered roughly by expected ROI vs. build cost, not commitment order:

1. **AI-assisted curation (internal, editor-facing first):** draft product summaries/pros-cons and suggest candidate recommendation labels (§1.2) with their supporting evidence from spec sheets and existing reviews, for an editor to verify and approve/edit — speeds catalog growth without diluting the "human-vetted" trust promise or the label-accuracy requirement (§25), since a human still signs off before publish. AI suggestions are never auto-published, and an AI suggestion of "Personally Tried" is rejected outright — that label can only be set by an editor who actually used the item.
2. **Conversational discovery assistant:** RAG over the curated catalog only (not the open web) — "I need running shoes for flat feet under $100" → grounded answers citing real catalog entries, never hallucinated products.
3. **Personalized recommendations:** embedding-based similarity ("more like this") plus behavioral signals (clicks, favorites) once enough first-party data exists (Phase 2 accounts are the prerequisite).
4. **Deal/price-drop detection:** anomaly detection over `ProductRetailerLink.price_band` history to power alerts.
5. **Visual search:** upload/screenshot a product → find curated equivalents.
6. **Trend detection for editors:** surface emerging demand from `SearchQuery` zero-result logs and external signal feeds to prioritize what to curate next.

Design constraint carried from day one: AI-generated content is always editor-reviewed before publish, and AI-personalized results are always drawn from the curated catalog, never from an un-vetted external inventory — this is the line that keeps "AI features" from eroding the trust positioning in §1.

---

## 18. Future Mobile App Compatibility [Phase 3]

Decisions made now to avoid a costly rework later:

- **API-first internal boundary:** even though MVP ships as a single Next.js app, all data access goes through a clean `lib/` service layer with typed contracts — so a future React Native/Expo client can consume the same route handlers (or a thin API layer extracted from them) without a backend rewrite.
- **Auth portability:** token-based auth (JWT) available alongside the cookie session from the point real accounts ship (Phase 2), so a native app isn't blocked on a second auth system.
- **Design tokens shared, not duplicated:** the design system (§21) is defined as portable tokens (color, spacing, type scale) so a native app can consume the same source of truth via a shared package rather than re-deriving values by eye.
- **Deep linking scheme reserved early:** `smartfinds://product/[slug]`, `smartfinds://category/[slug]` — planned in the URL/slug design now so it costs nothing later.
- **PWA as the bridge:** §13's installable PWA is the low-cost intermediate step before a native app is justified by traffic.

---

## 19. Recommended Folder Structure

Builds on the existing Next.js App Router scaffold already in the repo (`next@16`, `react@19`, Tailwind v4, TypeScript).

```
smart-finds/
  app/
    (marketing)/
      page.tsx                    # Home
      about/page.tsx
      how-we-curate/page.tsx
      how-we-make-money/page.tsx
      guides/[slug]/page.tsx       # Phase 2
    (shop)/
      category/[slug]/page.tsx
      category/[slug]/[subslug]/page.tsx
      collections/[slug]/page.tsx
      products/[slug]/page.tsx
      search/page.tsx
      retailers/[slug]/page.tsx
    (account)/                    # Phase 2
      login/page.tsx
      register/page.tsx
      favorites/page.tsx
      settings/page.tsx
    (admin)/
      admin/
        layout.tsx                # RBAC gate lives here
        products/...
        categories/...
        collections/...
        retailers/...
        analytics/...
        users/...
    go/[linkId]/route.ts          # affiliate redirect handler (§16.4)
    api/                          # any additional route handlers
    sitemap.ts
    robots.ts
    layout.tsx
    globals.css
  components/
    ui/                           # design-system primitives (Button, Card, Badge, Input...)
    product/                      # ProductCard, PriceBand, RetailerCTA, SpecsTable
    layout/                       # Header, MegaMenu, Footer, BottomTabBar
    filters/                      # FilterSidebar, FacetGroup, SortSelect
    admin/                        # admin-only components, code-split from public bundle
  lib/
    db/                           # Prisma client + typed query modules
    auth/
    search/
    seo/                          # structured-data builders, sitemap helpers
    affiliate/                    # link resolution, redirect allow-list logic
    analytics/
    utils/
  prisma/
    schema.prisma
  content/                        # MDX guides, optional
  public/
  types/
  docs/
    SRS.md                        # this document
```

Route groups (`(marketing)`, `(shop)`, `(account)`, `(admin)`) keep URL structure clean while letting each area have its own layout, and let the admin bundle be fully code-split from the public site.

---

## 20. UI Component Strategy

- **Primitives once, compose everywhere:** a small `components/ui` library (Button, Input, Select, Badge, Card, Modal, Tabs, Combobox) built on accessible headless primitives (Radix UI), styled with Tailwind, variants managed with `class-variance-authority` — built once, reused across marketing/shop/account/admin rather than re-implemented per area.
- **Domain components compose primitives:** `ProductCard`, `RetailerCTA`, `FilterSidebar`, `MegaMenu`, `CollectionGrid` are built from `ui/` primitives, not from raw HTML — keeps visual consistency enforced structurally rather than by convention alone.
- **Icons:** a single icon set (`lucide-react`) — no mixing icon libraries.
- **Documentation:** a lightweight internal style-guide route (or Storybook if the team's tooling budget allows) so "what does our Badge component support" is answerable without reading source.
- **Admin isolation:** admin-only components live in their own directory and are never imported into public-site bundles (enforced by the route-group split in §19, verified by bundle-analysis in CI).

---

## 21. Design System

**Brand feel:** trustworthy and editorial first, commerce second — closer to a review publication than a storefront. Clean, confident, low-clutter; product photography and editorial voice carry the design, not busy chrome.

- **Typography:** one display/heading typeface + one body typeface (system-ui fallback stack for performance), single consistent type scale (e.g., a 1.25 modular scale) defined as Tailwind theme tokens — not ad hoc per-component sizing.
- **Color:** neutral base palette (grays) + one brand accent color + semantic colors (success/warning/error) + a distinct badge treatment reserved only for recommendation labels (§1.2) so it stays meaningful and isn't diluted by decorative reuse. "Personally Tried" uses a visually distinct treatment (not just different text — e.g., a different icon/fill, not just a color swap) from the research-based labels, since it's the only one carrying a firsthand-experience claim; the distinction must be legible even to a skimming reader, not just discoverable via tooltip copy.
- **Spacing/radius:** 4px base spacing scale; consistent corner-radius tokens (sm/md/lg) applied uniformly across cards, buttons, inputs.
- **Dark mode:** supported via `prefers-color-scheme`, tokens defined for both from the start rather than retrofitted.
- **Tokens as source of truth:** all of the above defined in the Tailwind theme config (`tailwind.config`/CSS `@theme` for v4) — components consume tokens, never hardcoded hex/px values, which is also what makes §18's "share tokens with a future native app" viable.
- **States:** hover/focus/active/disabled defined once per primitive and inherited everywhere, so a filter button and a CTA button behave consistently.

---

## 22. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 16 (App Router, RSC)** — already scaffolded | SSR/ISR needed for SEO (§12) and performance (§15); already the repo's starting point |
| UI | **React 19 + TypeScript + Tailwind CSS v4** — already scaffolded | Matches existing scaffold; type safety across a data-heavy domain model |
| Component primitives | **Radix UI** + `class-variance-authority` + `lucide-react` | Accessibility (§14) largely solved by construction |
| Database | **PostgreSQL** (managed — Neon or Supabase) | Relational fit for catalog/category/retailer relationships; native full-text search covers MVP search (§8) |
| ORM | **Prisma** | Type-safe queries matching the TypeScript stack; migrations discipline |
| Auth | **Auth.js (NextAuth)** or **Clerk** | Session cookies + future token support for native app (§18); avoid hand-rolled auth (§16) |
| Search (scale path) | **Meilisearch / Typesense** | Drop-in upgrade once Postgres FTS hits its ceiling (§8, §23) |
| Image/CDN | **next/image** + Vercel Image Optimization (or Cloudinary if admin-side transforms are needed) | Performance budget (§15) |
| Hosting | **Vercel** | Native fit for Next.js ISR/edge caching; simplest path to the ISR/ SEO strategy above |
| Email | **Resend** or **Postmark** (transactional) + a newsletter provider for campaigns | Deliverability for account/alert emails distinct from marketing sends |
| Analytics | **Plausible or PostHog** (privacy-respecting) + first-party `Click`/`SearchQuery` tables (§11) | Business-critical affiliate analytics must be first-party, not dependent on a third-party tool's retention window |
| Error monitoring | **Sentry** | Standard, integrates cleanly with Next.js |
| Background jobs | **Vercel Cron** (MVP) → dedicated worker/queue at scale | Link-health checks, feed ingestion, price-band refresh |
| CI/CD | **GitHub Actions → Vercel** | Preview deploys per PR, automated lint/typecheck/test gate |
| Testing | **Vitest** (unit) + **Playwright** (e2e, esp. the `/go/` redirect and admin RBAC paths) | Redirect-safety and RBAC are the highest-consequence code paths — covered by e2e, not just unit tests |

---

## 23. Scalability Plan

- **Application tier:** stateless by design (Next.js on Vercel) — scales horizontally without operational effort at MVP traffic levels.
- **Database:** start on a single managed Postgres instance; add read replicas once read load (category/product page traffic) outgrows a single writer; use connection pooling (PgBouncer or the managed provider's pooler / Prisma Accelerate) before it becomes a bottleneck, not after an incident.
- **Search:** Postgres FTS is the MVP default; migrate to Meilisearch/Typesense behind the same internal search interface once catalog size (~50k+ products) or query latency crosses a defined SLO — the public search API contract doesn't change, only the implementation behind `lib/search`.
- **High-volume writes (`Click`, `SearchQuery`):** append-only, no foreign-key-heavy joins on the write path; if write volume becomes a contention risk, move to a queued ingestion pattern (e.g., Upstash QStash/Kafka) that batches into the DB rather than writing synchronously on every click — decided by measured load, not pre-built speculatively.
- **Caching:** ISR handles page-level caching; introduce Redis (e.g., Upstash) for hot, cross-request data (trending products, facet counts, search suggestions) once traffic makes per-request computation costly.
- **Content delivery:** all static assets and images served via CDN from day one (not a later migration).
- **Feed ingestion / link-health jobs:** run as scheduled background jobs decoupled from the request path from the start, so catalog-growth operations never compete with user-facing latency.
- **Architectural posture:** ship as a modular monolith with clean internal boundaries (`lib/search`, `lib/affiliate`, `lib/db`) specifically so that search, feed-ingestion, or the admin CMS could be extracted into standalone services later *if* traffic justifies it — without a rewrite, because the seams already exist.

---

## 24. Legal, Trust & Compliance Considerations

Because the entire business model is affiliate commission, trust and compliance are not side concerns — they are the product.

- **FTC disclosure:** a clear, inline disclosure adjacent to every affiliate CTA (§6, item 4) plus a dedicated `/how-we-make-money` page — not disclosure buried only in a footer link.
- **Truthful, substantiated claims (FTC endorsement guides):** beyond compensation disclosure, the FTC's endorsement guidelines require that any claim implying testing, quality, or personal endorsement be truthful and substantiated. Smart Finds enforces this structurally rather than relying on editor judgment alone: "Personally Tried" is the only label permitted to use firsthand-experience language (§1.2), and every other label must ship with the specific recorded evidence that justifies it (a rating figure, a linked request record, a trend note — §11.1 `ProductSelectionReason`). This is checked at editorial review (§25), not assumed.
- **Per-retailer program compliance:** each affiliate program has its own rules (e.g., Amazon Associates restricts cached/stale price display and has strict linking requirements); `Retailer` entity (§11.1) carries a `disclosure_text override` and program type specifically so compliance rules can differ per retailer without special-casing code.
- **Data sourcing legality:** product data should come from official affiliate network APIs/feeds (Amazon PA-API, Impact, CJ, Awin, or each retailer's own affiliate feed) rather than scraping, both for reliability and to avoid ToS/legal exposure — this is a sourcing decision to confirm per retailer before catalog ingestion begins (flagged as an open question in §27).
- **Privacy:** Privacy Policy, Cookie Policy, and a consent gate before non-essential tracking cookies fire (GDPR/CCPA posture) — required regardless of initial launch geography if any EU/CA traffic is expected.
- **Accessibility statement:** publishes the WCAG target (§14) and a contact path for accessibility issues.

---

## 25. Editorial / Curation Workflow

Curation is the differentiator (§1), so it needs a real workflow, not just a publish button:

1. **Sourcing:** editor identifies a candidate product (manually, or from AI-assisted suggestions in Phase 3).
2. **Draft:** editor fills out product record — summary, pros/cons, attributes, retailer link(s), images with required alt text, and at least one recommendation label with its required supporting evidence (§1.2, §11.1 `ProductSelectionReason`).
3. **Review:** a second editor/admin reviews against the published curation rubric (`/how-we-curate` is the public version of this rubric — it should be true, not aspirational), specifically checking that (a) every applied label is backed by its required evidence, (b) on-page copy doesn't exceed what the label(s) support, and (c) "Personally Tried" is used only when genuine firsthand-use notes exist.
4. **Publish:** status → `published`, `last_verified_at` stamped, page enters ISR/sitemap.
5. **Ongoing verification:** scheduled link-health job (§10, §16) periodically checks each `ProductRetailerLink`; on failure or staleness threshold, status flips to `needs_recheck` and the item surfaces in the admin review queue — a published item is never allowed to silently rot into a broken or stale trust signal.

---

## 26. Analytics & Business Metrics

First-party tables (`Click`, `SearchQuery` — §11.1) exist specifically because affiliate-network dashboards alone are insufficient for curation decisions:

- **Outbound CTR** per product, category, and collection.
- **EPC (earnings-per-click) estimates** per retailer/category, once affiliate network postback/reporting integration exists (Phase 2) — until then, click volume is the leading proxy metric.
- **Zero-result search terms** — direct signal for "what to curate next" (§25).
- **Collection performance** — which curated guides actually drive clicks, to prioritize editorial time.
- **Link health trend** — rate of links entering `needs_recheck`, by retailer, as an early warning if a retailer's program/feed is degrading.

---

## 27. Open Questions & Risks (to resolve before/at MVP kickoff)

1. **Retailer data sourcing per platform:** Amazon (PA-API), eBay, and Walmart have mature affiliate APIs; SHEIN, AliExpress, and Temu affiliate tooling is less mature and may require manual curation or third-party affiliate networks (e.g., Awin, CJ, Impact carry some of these programs) — needs confirmation per retailer before ingestion tooling is built.
2. **MVP account requirement:** current recommendation is *no* login requirement at MVP (local-storage favorites, §3.1) to minimize signup friction while trust is being established — confirm this is acceptable given Phase 2 personalization plans depend on real accounts eventually existing.
3. **Legal entity & affiliate program applications:** several affiliate programs require an approved business/tax entity and a live site with content before approval — sequencing this (apply early with a content-only site vs. wait for full launch) affects the MVP timeline.
4. **Price display legal risk:** confirm the "price band, last-checked" approach (§6) satisfies each retailer program's terms — this varies by program and should be checked per retailer, not assumed uniformly safe.
5. **Content moderation for [Phase 3] partner submissions:** if/when a brand-submission portal ships, the editorial workflow (§25) must apply identically to partner-submitted items — no fast lane that dilutes trust.
6. **Evidence sourcing for labels:** "Highly Rated" and "Popular Pick" require pulling actual rating/sales-rank data per retailer (some affiliate APIs, e.g., Amazon PA-API, expose review stats and bestseller data directly; others don't) — confirm per-retailer data availability before committing to enforcing evidence capture at full catalog scale, and decide the fallback (manual entry vs. withholding the label) where a retailer doesn't expose the signal.

---

## 28. Roadmap Summary

| Phase | Scope |
|---|---|
| **Phase 1 (MVP)** | Public catalog, categories, search, filters, product pages, cloaked affiliate links, collections, admin CMS with editorial workflow, no-login favorites, SEO/performance/accessibility baseline. |
| **Phase 2** | Real accounts, alerts, comparison tool, guides as first-class content, personalization, retailer analytics dashboard, aggregated reviews. |
| **Phase 3** | AI-assisted curation, conversational discovery, embedding-based personalization, deal detection, visual search, PWA → native mobile app. |

---

**Next step:** review and sign off on this SRS (or flag sections for revision) before any implementation begins, per the standing instruction not to write application code until this document is approved.
