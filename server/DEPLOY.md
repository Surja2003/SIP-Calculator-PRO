# Deploying the Backend (Express + MongoDB)

This guide shows how to deploy the API in `server/` to Render and Railway, and how to connect the frontend (GitHub Pages) via `VITE_API_BASE_URL`.

## Prerequisites
- MongoDB Atlas cluster (or another reachable MongoDB instance)
- The repository pushed to GitHub
- Confirm `server/index.js` runs locally:

```bash
npm run server
# API should respond at http://localhost:5175/health
```

Environment variables used by the server:
- `MONGODB_URI` (required): e.g., `mongodb+srv://<user>:<pass>@cluster0.x.mongodb.net/sipcalc?retryWrites=true&w=majority`
- `PORT` (optional): default `5175` (Render/Railway may override)
- `ALLOWED_ORIGIN` (required in prod): your site origin, e.g., `https://<user>.github.io/<repo>`

---

## Option A: Deploy to Render

1) Create a new Web Service
- Dashboard → New → Web Service → Connect your GitHub repo
- Root directory: `server/`
- Runtime: Node 20+
- Build command: `npm install`
- Start command: `node index.js`

2) Set Environment Variables
- `MONGODB_URI`: your Atlas connection string
- `ALLOWED_ORIGIN`: your GitHub Pages URL (e.g. `https://<user>.github.io/<repo>`)
- (Optional) `PORT`: leave empty; Render provides `PORT` automatically

3) Deploy
- Click Deploy. After it starts, note your service URL, e.g. `https://your-api.onrender.com`
- Validate health: `https://your-api.onrender.com/health` → `{ ok: true }`

4) Frontend configuration (GitHub Pages)
- In your GitHub repo, set repository secret `VITE_API_BASE_URL` to `https://your-api.onrender.com/api`
- Push to main or re-run the Pages workflow to rebuild the frontend.

---

## Option B: Deploy to Railway

1) Create a New Project
- Dashboard → New Project → Deploy from GitHub → select this repo
- Service root: `server/`
- Railway usually detects Node and installs dependencies automatically

2) Variables
- Add the following variables in the service settings:
  - `MONGODB_URI`
  - `ALLOWED_ORIGIN` = your Pages URL (e.g. `https://<user>.github.io/<repo>`)
  - `PORT`: not strictly necessary; Railway injects one. If you set it, use `${PORT}` in start command or read from process.env.

3) Start Command
- If Railway needs it explicitly, set Start Command: `node index.js`

4) Deploy
- Railway provides a public URL, e.g. `https://your-api.up.railway.app`
- Check `https://your-api.up.railway.app/health`

5) Frontend configuration (GitHub Pages)
- Set repository secret `VITE_API_BASE_URL` to `https://your-api.up.railway.app/api`
- Re-run the Pages workflow to update the frontend.

---

## CORS and Security Notes
- CORS is restricted by `ALLOWED_ORIGIN`. Ensure it matches your production frontend origin.
- Rate limit is configured (30 req/min). Adjust in `server/index.js` if needed.
- Keep your MongoDB credentials in provider secrets/variables; never commit them.

---

## Troubleshooting
- 404 at `/`: The API root returns a small JSON. Use `/health` to check status.
- CORS errors: Verify `ALLOWED_ORIGIN` exactly matches your Pages URL and no trailing slashes.
- ECONNREFUSED to MongoDB: Whitelist IPs in Atlas or use `0.0.0.0/0` temporarily (not recommended in prod).
- Wrong API base on frontend: Confirm the Pages secret `VITE_API_BASE_URL` is set and the Pages workflow re-built after changes.

---

## Local vs Production
- Dev uses Vite proxy for `/api` to `http://localhost:5175`.
- Production uses `VITE_API_BASE_URL` provided at build time by the Pages workflow.

