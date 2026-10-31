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

> This workspace was developed with port 3000 already in use, so the running demo is on **http://localhost:3001**. Next.js will pick the next free port automatically, or pass one explicitly: `npm run dev -- -p 3001`.

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
| Enquiries & orders | `/dashboard/inquiries` |
| Settings / reset demo data | `/dashboard/settings` |

SEO/GEO extras: per-page metadata, `sitemap.xml`, `robots.txt` (including AI crawler rules), semantic headings and local-business structured data on the home page.

## What is interactive

- **Cart** — add to bag, quantity changes, remove, clear, `localStorage` persistence, slide-out drawer.
- **Store** — category filters, search, sorting by featured / newest / price.
- **Checkout** — order form with card / Apple Pay options, free shipping over $120, order confirmation reference. Orders are written to the dashboard as enquiries.
- **Workshops** — capacity bars, booking modal, seat counter, booking request written to enquiries.
- **Contact** — validated enquiry form writing to the dashboard.
- **Journal** — category filtering and reading time.
- **Stories** — auto-rotating testimonial carousel with manual controls.
- **Dashboard** — full create / edit / delete for every resource, search and status filters, enquiry status workflow (new → read → replied → archived) with notes, and stat cards.

## Architecture

Two different data paths, on purpose:

- **Public pages are server-rendered.** `/`, `/treatments`, `/store`, `/blogs`, `/stories`, `/workshops`, `/contact` and `sitemap.xml` read Firestore on the Next.js server through the **Firebase Admin SDK**. This keeps SEO, page metadata and first paint intact; the Admin SDK bypasses `firestore.rules`.
- **The dashboard runs entirely in the browser.** `/login` and `/dashboard/**` use the **Firebase Web SDK** — Auth for sign-in, Firestore for every read and write — authorised by [`firestore.rules`](firestore.rules).
- **There are no `/api` routes.** Public forms write straight to Firestore as anonymous visitors under strict rules. There is no session cookie, no proxy guard and no server session to verify.

This is the hybrid you asked for: the browser uses the Firebase client SDK where it belongs (the dashboard and public form writes), while Next.js still server-renders the marketing site.

## Authentication

Sign-in is **Firebase Authentication only** — no preview mode, shared password or local bypass.

- `/login` calls `signInWithEmailAndPassword` from the Firebase Web SDK. The SDK persists the session (IndexedDB, falling back to `localStorage`), so a signed-in user stays signed in across reloads.
- `AuthProvider` (`src/components/dashboard/AuthProvider.tsx`) subscribes to `onAuthStateChanged` and is the single source of truth for the session.
- `DashboardShell` redirects anonymous visitors to `/login?next=…` once the SDK has resolved the session, and shows a neutral holding screen while it does.
- There is **no email allowlist and no custom claim**. Any authenticated user of this Firebase project can open the dashboard. That is deliberate — keep the project's user list limited to studio staff, because the public web API key lets anyone *sign up* if self-service sign-up is enabled. Disable “Enable create (sign-up)” under **Authentication → Settings → User actions** or delete unexpected users.
- Firestore rules require `request.auth != null` for all content reads and writes, so the dashboard cannot read data without a signed-in session, even if the UI is bypassed.

Trade-off versus the previous httpOnly cookie design: the refresh token is stored by the SDK and is readable by page JavaScript. Mitigate with a strict Content-Security-Policy, no third-party scripts on `/dashboard`, and a restricted API key.

### Firebase setup

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method** → enable **Email/Password**, then add the studio user under **Users**.
3. **Project settings → General** → add a **Web app** and copy the API key and project ID.
4. **Project settings → Service accounts** → **Generate new private key** (used by server rendering and the seed script).
5. Copy the environment template and fill it in:
   ```bash
   cp .env.example .env.local
   ```
6. Create a **Firestore** database in production mode and publish [`firestore.rules`](firestore.rules).
7. Restart the dev server.
8. Load the studio content into Firestore:
   ```bash
   npm run seed:firestore
   ```
   This reads [`seed/firestore-seed.json`](seed/firestore-seed.json) and replaces the documents in each collection.
9. Open `/login` and sign in with the Firebase user.

| Variable | Where to find it | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Project settings → General → Web app | Browser sign-in and Firestore |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same | Optional; derived from the project ID if omitted |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same | Project identifier |
| `FIREBASE_PROJECT_ID` | Service account JSON | Admin SDK (server rendering, sitemap, seeding) |
| `FIREBASE_CLIENT_EMAIL` | Service account JSON | Admin SDK |
| `FIREBASE_PRIVATE_KEY` | Service account JSON | Admin SDK (`\n` newlines are normalised automatically) |

Never commit `.env.local` or the service-account JSON. Only the `NEXT_PUBLIC_*` values reach the browser; the private key is server-only.

### Publishing the security rules

The dashboard will show *“Firestore refused the read”* until the rules are published. Either:

- **Firebase console** → **Firestore Database → Rules** → paste [`firestore.rules`](firestore.rules) → **Publish**, or
- with the Firebase CLI: `firebase deploy --only firestore:rules` (add a `firebase.json` with a `firestore.rules` entry if you use the CLI).

What the rules allow:

| Caller | Read | Write |
| --- | --- | --- |
| Anonymous visitor | nothing | create an inquiry with exactly `name, email, phone, subject, message, status: "new", notes, createdAt`; increment `events.booked` by exactly 1 up to `capacity` |
| Signed-in user | every collection | create, update, delete everywhere |

Forged inquiry status, extra fields, oversized strings, editing an event's title and setting `booked` directly are all rejected.

## Data & storage

Content lives **only** in **Cloud Firestore**. Collections mirror the app types:

```
services   products   blogs   events   stories   inquiries
```

Each document uses the item's `id` as its document ID.

- `src/lib/db.ts` — server-only, read-only access for public pages and `sitemap.xml` (Admin SDK).
- `src/lib/firebase/browser-data.ts` — the dashboard data layer (Web SDK): list, create, update, delete, inquiry capture, atomic workshop booking and demo reset.
- `src/lib/firebase/client.ts`, `auth.ts`, `store.ts` — lazy browser Firebase app, Auth and Firestore singletons.

[`seed/firestore-seed.json`](seed/firestore-seed.json) holds the studio's starting content (the original demo catalogue, journal, workshops, stories and sample inquiries). It is used by:

- `npm run seed:firestore` — initial load or full re-seed of the Firebase project.
- **Settings → Restore demo content** — a signed-in reset from the browser to the same seed file (loaded on demand, so it stays out of the public bundles).

Firestore rejects `undefined`, so optional fields are stripped before every browser write. There is no JSON database, no in-memory fallback and no local preview data.

> `npm run seed:firestore` deletes and replaces the documents in each collection. Back up live data before running it against a production project.

## Payments

Checkout is a **demo**: it validates the form, shows a confirmation, and records the order as an enquiry so it appears in the dashboard. No card data is sent anywhere.

To take live payments:

1. Add Stripe keys (e.g. `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) to `.env.local`.
2. Replace the `createInquiry(...)` call in `src/app/(site)/checkout/page.tsx` with a Stripe Checkout Session (a route handler or a server action is the right place for the secret key).
3. Enable Apple Pay in the Stripe Dashboard (it is a payment method on the same Checkout Session).

The card fields in the current form are visual placeholders and must be replaced by Stripe Elements or Stripe Checkout before launch.

## Before launch

- Publish `firestore.rules` (see above), confirm the production Firebase project is in the environment, and check the Firebase Authentication user list contains only studio staff.
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
    login/           Firebase Web SDK sign-in
    dashboard/       management dashboard (client data, server metadata)
    sitemap.ts       server-rendered sitemap (Admin SDK)
  components/
    site/            public UI (cards, grids, forms, carousel…)
    dashboard/       dashboard shell, tables, sidebar, inquiry manager
    cart/            cart context + drawer
  lib/
    auth/config.ts   environment readers (server + public config)
    firebase/        admin.ts (server), client.ts/auth.ts/store.ts (browser),
                     browser-data.ts (dashboard CRUD and public writes)
    db.ts            server-only read layer for public pages and sitemap
    resource-config.ts  field definitions for each dashboard resource
    types.ts         domain types
    utils.ts         formatting, slugify, safeImage
public/images/       interim stock photography (see CREDITS.md)
scripts/
  seed-firestore.mjs loads seed/firestore-seed.json into Cloud Firestore
seed/
  firestore-seed.json starting content for the studio
firestore.rules      security rules for direct browser access
.env.example         Firebase environment template
```
