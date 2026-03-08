# GSC Visualizer

Frontend-only Google Search Console visualizer and CTR/intent toolkit built with React + Vite.

## Setup
- `npm install`
- `npm run dev` (opens locally at `http://127.0.0.1:5173` or `http://localhost:5173`)

## GitHub Note
- `127.0.0.1`/`localhost` only works on your own machine, not from GitHub.
- For a shareable link, deploy the `app/dist` build to GitHub Pages and use:
  `https://<your-username>.github.io/<repo-name>/`
- This repo now includes a workflow at `.github/workflows/deploy-pages.yml`.
- In GitHub: `Settings -> Pages -> Build and deployment -> Source` and select `GitHub Actions`.

## Usage
- Go to `/tools/gsc-visualizer`
- Upload a GSC Performance CSV (columns: Query, Page, Clicks, Impressions, CTR, Position; Date optional). If no CSV is uploaded, sample mock data is shown.
- Overview shows total clicks, impressions, CTR, and average position.
- Trends shows placeholder line charts; if Date is present, charts plot clicks, impressions, CTR, and avg position by date.
- Opportunities table lists queries/pages with impressions, clicks, CTR, position, and an opportunity score.
- CTR Optimizer (`/tools/ctr-optimizer`) and Intent Classifier (`/tools/intent-classifier`) can reuse the same uploaded session data or accept their own CSV/text input.

## Build
- `npm run build`
- `npm run lint` (currently has upstream lint warnings in shared UI library; app builds successfully)

## Stripe Subscriptions
- Copy `app/.env.example` to `app/.env` and set your Stripe values:
  - `VITE_STRIPE_PAYMENT_LINK_PRO`
  - `VITE_STRIPE_PAYMENT_LINK_AGENCY`
- In Stripe, create recurring subscription Payment Links for Pro and Agency and paste those URLs.
- Subscription checkout is wired to:
  - Landing page pricing buttons (Pro/Agency)
  - Settings -> Subscription & Billing (`Get Pro Subscription`, `Get Agency Subscription`)

## Firebase Auth
- Copy `app/.env.example` to `app/.env` and set:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`
- In Firebase Console:
  - Create/select your project
  - Enable `Authentication -> Sign-in method -> Email/Password`
  - Add your app domain to `Authentication -> Settings -> Authorized domains`
