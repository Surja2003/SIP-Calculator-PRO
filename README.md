# SIP-Calculator-PRO

Smart personal finance calculators with SIP, Lumpsum, SWP, and Goal planning, plus inflation-adjusted analysis and modern charts. Built with React + Vite.

## Live Demo
- Website: https://surja2003.github.io/SIP-Calculator-PRO/

## Features
- Monthly compounding across all calculators (consistent math)
- Lightweight charts with INR formatting and scenario comparisons
- SIP step-up, inflation adjustment, and goal calculator (required SIP)
- SWP projections with withdraw-then-grow logic and breakdowns
- Dark mode, responsive UI, and SPA routing with 404 fallback

## Development
```bash
npm install
# Run dev server
npm run dev
# Build static site
npm run build
```

## Deploy

Frontend (GitHub Pages):
- Workflow `.github/workflows/deploy.yml` builds and deploys `dist/` and adds `404.html` for SPA routing.
- Set repository secret `VITE_API_BASE_URL` to your deployed backend API base, e.g. `https://your-api.onrender.com/api`.
- Push to `main` (or trigger manually) to deploy.

Backend (MongoDB + Express):
- Deploy `server/` to Render/Railway/Fly.io/VPS.
- Configure env vars:
  - `MONGODB_URI`: MongoDB Atlas connection string
  - `PORT`: provider port or `5175`
  - `ALLOWED_ORIGIN`: your Pages URL, e.g. `https://<user>.github.io/<repo>`
- After backend is live, update the Pages secret `VITE_API_BASE_URL`.

Local API testing:
- Run Vite on 5173 and API on 5175; `/api` is proxied in dev via `vite.config.js`.

Note: GitHub Pages cannot host Node servers; host the backend separately.
