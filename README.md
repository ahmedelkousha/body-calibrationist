# Shelley's — Skin & Body Studio

A complete, dynamic marketing and commerce site for Shelley's studio, plus a management dashboard for the content the studio updates day to day.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4 and React 19.

## Quick start

```bash
npm install
npm run dev
```

Content and the dashboard are backed by **Firebase** (Authentication + Firestore), so you need a project before the site can load content. Copy `.env.example` to `.env.local`, fill in the values, and run `npm run seed:firestore` — see [Authentication](#authentication) and [Data & storage](#data--storage). Without credentials, content pages return a “Firebase is not configured” error and `/dashboard` stays locked. There is no local database fallback.

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
| Journal / Blog | `/blog` (+ `/blog/[slug]`) |
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

## Authentication

The dashboard is private. Sign-in uses **Firebase Authentication** (email & password) with Firebase Admin **session cookies**:

- `/login` signs in through the Identity Toolkit REST API, then exchanges the ID token for a five-day `__session` cookie.
- `DASHBOARD_ALLOWED_EMAILS` restricts access to the studio account(s), even if someone creates another Firebase user with the project's public API key.
- `src/proxy.ts` redirects anonymous requests for `/dashboard/*` to `/login`.
- `src/app/dashboard/layout.tsx` verifies the cookie with the Firebase Admin SDK before rendering.
- Dashboard API routes return `401` without a valid session. The only public write endpoint is `POST /api/inquiries`, used by the contact, newsletter, checkout and workshop forms.

Sign-in is **Firebase only**: there is no preview mode, shared password or local login bypass. Until the Firebase values are present, `/login` shows a setup checklist and the dashboard remains inaccessible.

### Firebase setup

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method** → enable **Email/Password**, then add the studio user under **Users**.
3. **Project settings → General** → add a **Web app** and copy the API key and project ID.
4. **Project settings → Service accounts** → **Generate new private key**.
5. Copy the environment template and fill it in:
   ```bash
   cp .env.example .env.local
   ```
   Set `DASHBOARD_ALLOWED_EMAILS` to the studio account email (comma-separate multiple people).
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
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Project settings → General → Web app | Browser sign-in |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same | Optional; derived from the project ID if omitted |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same | Project identifier |
| `FIREBASE_PROJECT_ID` | Service account JSON | Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | Service account JSON | Admin SDK |
| `FIREBASE_PRIVATE_KEY` | Service account JSON | Admin SDK (`\n` newlines are normalised automatically) |
| `DASHBOARD_ALLOWED_EMAILS` | Your choice | Comma-separated allowlist for `/dashboard`; set this in production |

Never commit `.env.local` or the service-account JSON. The private key is server-only.

## Data & storage

Content lives **only** in **Cloud Firestore**. Collections mirror the app types:

```
services   products   blogs   events   stories   inquiries
```

Each document uses the item's `id` as its document ID. `src/lib/db.ts` is the single data layer — it reads and writes Firestore through the Firebase Admin SDK. There is no JSON database, no in-memory fallback and no browser access to Firestore.

[`seed/firestore-seed.json`](seed/firestore-seed.json) holds the studio's starting content (the original demo catalogue, journal, workshops, stories and sample inquiries). It is used by:

- `npm run seed:firestore` — initial load or full re-seed of the Firebase project.
- **Settings → Restore demo content** (`POST /api/seed`) — protected reset to the same seed file.

Firestore rejects `undefined`, so optional fields are stripped before every write. Client access is denied in [`firestore.rules`](firestore.rules) — the site only talks to Firestore through the Admin SDK on the server.

> `npm run seed:firestore` deletes and replaces the documents in each collection. Back up live data before running it against a production project.

### API

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/inquiries` | Public — storefront forms only (status forced to `new`) |
| GET | `/api/blogs`, `/api/products`, `/api/services`, `/api/events`, `/api/stories`, `/api/inquiries` | Signed-in dashboard |
| POST | Same collection routes | Signed-in dashboard |
| GET / PUT / DELETE | `/api/{resource}/{id}` | Signed-in dashboard |
| GET | `/api/stats` | Signed-in dashboard |
| POST | `/api/seed` | Signed-in dashboard |

Image fields are sanitised server-side (`src/lib/api-helpers.ts` → `safeImage`) so a bad path falls back to studio imagery instead of breaking a page.

## Payments

Checkout is a **demo**: it validates the form, shows a confirmation, and records the order as an enquiry so it appears in the dashboard. No card data is sent anywhere.

To take live payments:

1. Add Stripe keys (e.g. `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) to `.env.local`.
2. Replace the `fetch("/api/inquiries", …)` call in `src/app/(site)/checkout/page.tsx` with a request to a new `/api/checkout` route that creates a Stripe Checkout Session.
3. Enable Apple Pay in the Stripe Dashboard (it is a payment method on the same Checkout Session).

The card fields in the current form are visual placeholders and must be replaced by Stripe Elements or Stripe Checkout before launch.

## Before launch

- Confirm `.env.local` contains the production Firebase project, that `firestore.rules` is deployed, and that only studio staff exist in Firebase Authentication.
- Update `https://shelleys.studio` in `src/app/sitemap.ts` and the metadata base in `src/app/layout.tsx` to the real domain.
- Replace the interim Pexels stock photography in `public/images/` with real studio photography. These images are illustrative only — they are not Shelley, her studio, products or clients. See [`public/images/CREDITS.md`](public/images/CREDITS.md) for sources, licences and replacement sizes. The logo is `public/logo.jpg`.
- Update contact details, address and opening hours in the seed data and contact page.
- Connect the newsletter and enquiry forms to a real inbox or CRM if email notifications are required (currently they are stored in the database and shown in the dashboard).

## Project structure

```
src/
  app/
    (site)/          public pages
    login/           Firebase sign-in page + server actions
    dashboard/       management dashboard
    api/             JSON API routes (session-protected except inquiry POST)
  components/
    site/            public UI (cards, grids, forms, carousel…)
    dashboard/       dashboard tables, sidebar, inquiry manager
    cart/            cart context + drawer
  lib/
    auth/            Firebase config, session cookies, route guards
    firebase/        lazy Firebase Admin app/auth/Firestore
    db.ts            Firestore data layer (read/write, seed reset)
    api-helpers.ts   shared CRUD handlers + auth checks
    resource-config.ts  field definitions for each dashboard resource
    types.ts         domain types
    utils.ts         formatting, slugify, safeImage
  proxy.ts           dashboard redirect for anonymous requests
public/images/       interim stock photography (see CREDITS.md)
scripts/
  seed-firestore.mjs loads seed/firestore-seed.json into Cloud Firestore
seed/
  firestore-seed.json starting content for the studio
firestore.rules      deny direct client access; Admin SDK only
.env.example         Firebase environment template
```
