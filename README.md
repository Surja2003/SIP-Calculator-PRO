<<<<<<< HEAD
# SIP-Calculator-PRO
Smart personal finance calculator with SIP, Lumpsum &amp; SWP planning, goal calculator, and inflation-adjusted analysis. Includes interactive graphs to compare real vs nominal returns and track monthly investments to achieve financial goals.
=======
## SIP, Lumpsum, SWP Calculators (React + Vite)

Modern calculators for SIP, Lumpsum, and SWP with:
- Monthly compounding math throughout
- Lightweight-charts projections (INR formatting)
- Scenario comparison and breakdowns
- Market widgets and live charts

### UI Polish Checklist (Home)
- Hero: add breathing room between the two CTA buttons and keep consistent container width.
- Market Settings: clear heading, helper text, and three labeled controls (Source, Symbol, Interval). Ensure adequate spacing and keyboard focus states.
- Inputs: rounded borders, helpful placeholder examples (e.g., TCS.NS / RELIANCE.NS, BTCUSDT / BTCINR).
- Sections: maintain 24–32px vertical rhythm; use subtle card borders and shadows.
- Feedback: show concise error text beneath charts (e.g., “Failed to load chart: …”).
- Accessibility: labels linked to inputs; color contrast suitable for dark/light themes.

These are general best practices inspired by established finance portals without copying proprietary content.

### Development
```bash
npm install
# Run dev server
npm run dev
# Build
npm run build
## SIP, Lumpsum, SWP Calculators (React + Vite)

Modern calculators for SIP, Lumpsum, and SWP with:
- Monthly compounding math throughout
- Lightweight-charts projections (INR formatting)
- Scenario comparison and breakdowns
- Market widgets and live charts

### UI Polish Checklist (Home)
- Hero: add breathing room between the two CTA buttons and keep consistent container width.
- Market Settings: clear heading, helper text, and three labeled controls (Source, Symbol, Interval). Ensure adequate spacing and keyboard focus states.
- Inputs: rounded borders, helpful placeholder examples (e.g., TCS.NS / RELIANCE.NS, BTCUSDT / BTCINR).
- Sections: maintain 24–32px vertical rhythm; use subtle card borders and shadows.
- Feedback: show concise error text beneath charts (e.g., “Failed to load chart: …”).
- Accessibility: labels linked to inputs; color contrast suitable for dark/light themes.

These are general best practices inspired by established finance portals without copying proprietary content.

### Development
```bash
npm install
# Run dev server
npm run dev
# Build
npm run build
```

### Deploy

Frontend (GitHub Pages):
- Workflow `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages and adds `404.html` for SPA routing.
- Set repository secret `VITE_API_BASE_URL` to your deployed backend API base, e.g.: `https://your-api.onrender.com/api`.
- Push to `main` (or `master`) or trigger manually.

Backend (MongoDB + Express):
- Deploy `server/` to Render/Railway/Fly.io/VPS.
- Configure env vars on the host:
	- `MONGODB_URI`: MongoDB Atlas connection string
	- `PORT`: provider port or `5175`
	- `ALLOWED_ORIGIN`: your Pages site URL, e.g. `https://<user>.github.io/<repo>`
- After backend is live, update the Pages secret `VITE_API_BASE_URL`.

Local API testing:
- Run Vite on 5173 and API on 5175; `/api` is proxied in dev per `vite.config.js`.

Note: GitHub Pages cannot host Node servers; host the backend separately.
>>>>>>> de14d48 (feat: merge local project with remote README)
