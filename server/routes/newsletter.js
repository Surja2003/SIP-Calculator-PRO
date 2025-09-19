import { Router } from 'express';
import Newsletter from '../models/Newsletter.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }
    const exists = await Newsletter.findOne({ email: email.toLowerCase() }).lean();
    if (exists) return res.json({ ok: true, duplicate: true });
    await Newsletter.create({ email: email.toLowerCase() });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const all = await Newsletter.find().sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, data: all });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
