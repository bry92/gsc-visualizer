# GSC Visualizer

Frontend-only Google Search Console visualizer and CTR/intent toolkit built with React + Vite.

## Setup
- `npm install`
- `npm run dev` (opens at http://127.0.0.1:5173)

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
