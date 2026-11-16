# Shelley's — Skin & Body Studio

A complete, dynamic marketing and commerce site for Shelley's studio, plus a management dashboard for the content the studio updates day to day.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4 and React 19.

## Quick start

```bash
npm install
npm run dev
```

Content lives in **Cloud Firestore** and the dashboard is protected by **Firebase Authentication**, so you need a Firebase project before the site can load content. Copy `.env.example` to `.env.local`, fill in the values, and run `npm run seed:firestore` — see [Authentication](#authentication) and [Data & storage](#data--storage). Without credentials, content pages return a “Firebase is not configured” error and `/dashboard` stays locked. There is no local database fallback.

Open **http://localhost:3000**.

> If port 3000 is already in use, Next.js picks the next free port automatically, or pass one explicitly: `npm run dev -- -p 3001`.

Production build:

```bash
npm run build
npm start
```

> **Note on this machine:** the native SWC binary is unavailable, so the scripts use `next dev --webpack` and `next build --webpack`. Turbopack is not used. Keep the `--webpack` flag if you re-create the project here.

Tailwind CSS v4 is compiled through PostCSS (`postcss.config.mjs` → `@tailwindcss/postcss`). This works with the webpack pipeline used above. Without that config the page renders with theme colours but no utility classes.

## Pages

| Public | URL |
| --- | --- |
| Home | `/` |
| Treatments & Services | `/treatments` (+ `/treatments/[slug]`) |
| Store | `/store` (+ `/store/[slug]`) |
| Journal / Blog | `/blogs` (+ `/blogs/[slug]`) |
| Our Approach | `/approach` |
| Workshops & Events | `/workshops` |
| Transformation Stories | `/stories` |
| Reach Us / Contact | `/contact` |
| Checkout | `/checkout` |

| Dashboard | URL |
| --- | --- |
| Overview (stats, weekly enquiries, attention lists) | `/dashboard` |
| Journal articles | `/dashboard/blogs` |
| Products | `/dashboard/products` |
| Treatments & services | `/dashboard/services` |
| Workshops & events | `/dashboard/events` |
| Transformation stories | `/dashboard/stories` |
| Enquiries | `/dashboard/inquiries` |
| Orders & refunds (products + services) | `/dashboard/orders` |
| Settings / integration status | `/dashboard/settings` |

SEO/GEO extras: per-page metadata, `sitemap.xml`, `robots.txt` (including AI crawler rules), semantic headings and local-business structured data on the home page.

## What is interactive

- **Cart** — add to bag, quantity changes, remove, clear, `localStorage` persistence, slide-out drawer.
- **Store** — category filters, search, sorting by featured / newest / price.
- **Checkout** — Stripe-hosted payment for the bag (card, Apple Pay and Google Pay where supported), free shipping over $120 and a confirmation page that clears the bag. Orders are read from Stripe in the dashboard.
- **Treatments** — each treatment detail page has a **Reserve & pay** flow that collects a preferred time and charges the treatment through Stripe.
- **Workshops** — capacity bars, booking modal, seat counter, booking request written to enquiries.
- **Contact** — validated enquiry form writing to the dashboard.
- **Journal** — category filtering and reading time.
- **Stories** — auto-rotating testimonial carousel with manual controls.
- **Dashboard** — full create / edit / delete for every resource, search and status filters, enquiry status workflow (new → read → replied → archived) with notes, stat cards, and an Orders tab for paid product sales and treatment bookings with full or partial Stripe refunds.

## Architecture

Three data paths, each with a clear job:

- **Public pages are server-rendered.** `/`, `/treatments`, `/store`, `/blogs`, `/stories`, `/workshops`, `/contact` and `sitemap.xml` read Firestore on the Next.js server through the **Firebase Web SDK**. The security rules allow anonymous reads of the content collections, so no service-account key is needed for page rendering.
- **The dashboard runs entirely in the browser.** `/login` and `/dashboard/**` use the **Firebase Web SDK** — Auth for sign-in, Firestore for every content read and write — authorised by your Firestore security rules.
- **Stripe is the only server-side payment integration.** `/api/stripe/checkout` validates catalogue prices against Firestore and creates a Checkout Session; `/api/stripe/orders` lists paid sessions; `/api/stripe/refund` issues refunds. The dashboard sends its Firebase ID token to those routes, and the server verifies it with the Identity Toolkit REST endpoint. No `firebase-admin` and no service-account key are used by the web app.

There is no session cookie and no proxy guard. The browser SDK restores the session, and Firestore rules remain the authoritative check for content.

## Authentication

Sign-in is **Firebase Authentication only** — no preview mode, shared password or local bypass.

- `/login` calls `signInWithEmailAndPassword` from the Firebase Web SDK. The SDK persists the session (IndexedDB, falling back to `localStorage`), so a signed-in user stays signed in across reloads.
- `AuthProvider` (`src/components/dashboard/AuthProvider.tsx`) subscribes to `onAuthStateChanged` and is the single source of truth for the session.
- `DashboardShell` redirects anonymous visitors to `/login?next=…` once the SDK has resolved the session, and shows a neutral holding screen while it does.
- **No custom claim is required.** Any authenticated user of this Firebase project can open the dashboard. That is deliberate — keep the project's user list limited to studio staff, because the public web API key lets anyone *sign up* if self-service sign-up is enabled. Disable “Enable create (sign-up)” under **Authentication → Settings → User actions** or delete unexpected users.
- **Optional order allowlist.** Set `DASHBOARD_ALLOWED_EMAILS` (comma-separated) to restrict the Stripe order and refund APIs to named accounts. It does not change Firestore rules, so mirror the same list in your rules if you want to lock the whole dashboard.
- Firestore rules require `request.auth != null` for all content reads and writes, so the dashboard cannot read data without a signed-in session, even if the UI is bypassed.

Trade-off versus the previous httpOnly cookie design: the refresh token is stored by the SDK and is readable by page JavaScript. Mitigate with a strict Content-Security-Policy, no third-party scripts on `/dashboard`, and a restricted API key.

### Firebase setup

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method** → enable **Email/Password**, then add the studio user under **Users**.
3. **Project settings → General** → add a **Web app** and copy the API key and project ID.
4. **Project settings → Service accounts** → **Generate new private key** (only the seed script uses this; the running site does not).
5. Copy the environment template and fill it in:
   ```bash
   cp .env.example .env.local
   ```
6. Create a **Firestore** database in production mode and publish your security rules (signed-in writes for the dashboard, anonymous reads for public content, and a constrained create rule for inquiries and workshop bookings).
7. Restart the dev server.
8. Load the studio content into Firestore:
   ```bash
   npm run seed:firestore
   ```
   This reads [`seed/firestore-seed.json`](seed/firestore-seed.json) and replaces the documents in each collection.
9. Open `/login` and sign in with the Firebase user.
10. Add your Stripe secret key (see [Payments](#payments)) and restart once more.

| Variable | Where to find it | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Project settings → General → Web app | Browser sign-in, Firestore, and server-side ID-token verification |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same | Optional; derived from the project ID if omitted |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same | Project identifier |
| `FIREBASE_PROJECT_ID` | Service account JSON | `npm run seed:firestore` only |
| `FIREBASE_CLIENT_EMAIL` | Service account JSON | `npm run seed:firestore` only |
| `FIREBASE_PRIVATE_KEY` | Service account JSON | `npm run seed:firestore` only (`\n` newlines are normalised automatically) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys | Server-side Checkout Sessions, order listing and refunds |
| `NEXT_PUBLIC_SITE_URL` | Your live domain | Optional Stripe success/cancel redirect base; defaults to the request origin |

Never commit `.env.local` or the service-account JSON. Only the `NEXT_PUBLIC_*` values reach the browser; the private key and Stripe secret key are server-only.

### Publishing the security rules

The dashboard will show *“Firestore refused the read”* until the rules are published. Publish them in **Firebase console → Firestore Database → Rules**, or with the Firebase CLI (`firebase deploy --only firestore:rules` with a `firebase.json` that points at your rules file).

The rules need to:

- allow anonymous reads of the public content collections (`services`, `products`, `blogs`, `events`, `stories`);
- allow anonymous creation of an inquiry with a constrained set of fields, and the workshop booking counter update;
- allow signed-in studio users to create, update and delete content and inquiries.

Keep the rules in your Firebase project (or add a rules file to this repository before deploying) — the running app does not ship one, because the dashboard talks to Firestore directly.

## Data & storage

Content lives **only** in **Cloud Firestore**. Collections mirror the app types:

```
services   products   blogs   events   stories   inquiries
```

Each document uses the item's `id` as its document ID.

- `src/lib/firebase/client.ts` — lazy Firebase app, Auth and Firestore singletons used by both the browser and server-rendered pages.
- `src/lib/firebase/data.ts` — collection reads, dashboard CRUD, and public inquiry / workshop booking writes through the Web SDK.
- `src/lib/stripe/catalog.ts` — server-side price lookup so the amount charged is never trusted from the browser.

[`seed/firestore-seed.json`](seed/firestore-seed.json) holds the studio's starting content (the original demo catalogue, journal, workshops, stories and sample inquiries). `npm run seed:firestore` loads it with a full replace of each collection.

Firestore rejects `undefined`, so optional fields are stripped before every browser write. There is no JSON database, no in-memory fallback and no local preview data.

> `npm run seed:firestore` deletes and replaces the documents in each collection. Back up live data before running it against a production project.

## Payments & orders

Payments are real once `STRIPE_SECRET_KEY` is present. Nothing is charged while the key is absent; the checkout pages explain that online payment is unavailable.

1. **Product checkout** — the bag posts to `POST /api/stripe/checkout`. The server reloads each product from Firestore, checks it is active and in stock, recalculates every price, adds shipping ($9.50 below $120, free at $120 and above), then creates a Stripe Checkout Session. The browser is redirected to Stripe's hosted page; card details never touch this site.
2. **Treatment bookings** — `/treatments/[slug]` links to `/checkout/service/[slug]`, which collects a preferred date and time plus notes. The same route creates a single-line Checkout Session for the treatment price.
3. **Confirmation** — Stripe returns to `/checkout/success?session_id=…`. The server retrieves the session, shows the paid items, receipt email and shipping address, and clears the bag only after a product payment succeeds.
4. **Orders & refunds** — `/dashboard/orders` reads paid Checkout Sessions live from Stripe, with tabs for all orders, products and services. A refund opens a dialog for a full or partial amount and a reason; the server verifies the dashboard user's Firebase ID token, then calls `stripe.refunds.create` against the original PaymentIntent. Refunds appear on the original card, usually within 5–10 business days.

All Stripe calls happen in Next.js route handlers or server components. `STRIPE_SECRET_KEY` never reaches the browser, and no `firebase-admin` key is involved. Stripe is the source of truth for orders and refunds; they are not duplicated into Firestore. Stock is checked before payment but is not decremented automatically — update inventory in the dashboard when an order is fulfilled.

Use a `sk_test_…` key first, then replace it with `sk_live_…` for launch. Apple Pay and Google Pay appear automatically on Stripe Checkout when the device and Stripe account support them. No webhook is required for this flow; the dashboard reads the authoritative session state from Stripe.

## Before launch

- Publish your Firestore security rules (see above), confirm the production Firebase project is in the environment, and check the Firebase Authentication user list contains only studio staff.
- Add **Firebase App Check** (reCAPTCHA Enterprise for the web) so the public inquiry and booking writes cannot be scripted. The rules already validate payload shape; App Check adds bot protection.
- Restrict the web API key under **Google Cloud console → APIs & Services → Credentials** (HTTP referrers) and set up a Content-Security-Policy for `/dashboard`.
- Update `https://shelleys.studio` in `src/app/sitemap.ts` and the metadata base in `src/app/layout.tsx` to the real domain.
- Replace the interim Pexels stock photography in `public/images/` with real studio photography. These images are illustrative only — they are not Shelley, her studio, products or clients. See [`public/images/CREDITS.md`](public/images/CREDITS.md) for sources, licences and replacement sizes. The logo is `public/logo.jpg`.
- Update contact details, address and opening hours in the seed data and contact page.
- Connect the newsletter and enquiry forms to a real inbox or CRM if email notifications are required (currently they are stored in Firestore and shown in the dashboard).

## Project structure

```
src/
  app/
    (site)/          public pages (server-rendered)
    api/stripe/      checkout, order listing and refund route handlers
    login/           Firebase Web SDK sign-in
    dashboard/       management dashboard (client data, server metadata)
    sitemap.ts       server-rendered sitemap (Firebase Web SDK reads)
  components/
    site/            public UI (cards, grids, forms, carousel…)
    dashboard/       dashboard shell, tables, sidebar, inquiry and order managers
    cart/            cart context + drawer
  lib/
    firebase/        client.ts (browser/server Web SDK singletons),
                     data.ts (content CRUD and public writes)
    stripe/          server.ts (client, auth, error handling),
                     catalog.ts (server-side price lookup), types.ts
    resource-config.ts  field definitions for each dashboard resource
    types.ts         domain types
    utils.ts         formatting, slugify, safeImage
public/images/       interim stock photography (see CREDITS.md)
scripts/
  seed-firestore.mjs loads seed/firestore-seed.json into Cloud Firestore (Admin SDK)
seed/
  firestore-seed.json starting content for the studio
.env.example         Firebase and Stripe environment template
```
