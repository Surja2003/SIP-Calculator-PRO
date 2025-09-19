import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import newsletterRouter from './routes/newsletter.js';
import contactsRouter from './routes/contacts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5174;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sipcalc';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 30 }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.json({ ok: true, service: 'sip-calculator-api', endpoints: ['/health', '/api/newsletter', '/api/contacts'] }));
app.use('/api/newsletter', newsletterRouter);
app.use('/api/contacts', contactsRouter);

// Lightweight proxy for Yahoo Finance to avoid browser CORS in production
app.use('/api/yahoo', async (req, res) => {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const upstreamPath = req.originalUrl.replace(/^\/api\/yahoo/, '') || '/';
    const url = `https://query1.finance.yahoo.com${upstreamPath}`;
    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json,text/plain,*/*',
        'user-agent': 'Mozilla/5.0 (compatible; SIPCalc/1.0; +https://github.com/surja2003/SIP-Calculator-PRO)'
      }
    });
    const contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';
    const text = await upstream.text();
    res.status(upstream.status).set('content-type', contentType).send(text);
  } catch (err) {
    res.status(502).json({ error: 'Upstream error', detail: err.message });
  }
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Mongo connection error:', err.message);
    process.exit(1);
  });
