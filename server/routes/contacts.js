import { Router } from 'express';
import Contact from '../models/Contact.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ ok: false, error: 'Missing fields' });
    await Contact.create({ name, email, message });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const all = await Contact.find().sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, data: all });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
