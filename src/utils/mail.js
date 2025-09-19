// Mail utility using EmailJS (client-side)
// Requires Vite env vars:
// - VITE_EMAILJS_SERVICE_ID
// - VITE_EMAILJS_TEMPLATE_ID_NEWSLETTER
// - VITE_EMAILJS_TEMPLATE_ID_CONTACT
// - VITE_EMAILJS_PUBLIC_KEY

import emailjs from '@emailjs/browser';

const env = import.meta.env || {};

const EMAIL_ENABLED =
  !!env.VITE_EMAILJS_SERVICE_ID &&
  !!env.VITE_EMAILJS_PUBLIC_KEY &&
  (!!env.VITE_EMAILJS_TEMPLATE_ID_NEWSLETTER || !!env.VITE_EMAILJS_TEMPLATE_ID_CONTACT);

export async function sendNewsletterEmail({ email }) {
  if (!EMAIL_ENABLED || !env.VITE_EMAILJS_TEMPLATE_ID_NEWSLETTER) {
    return { ok: true, simulated: true };
  }
  try {
    const res = await emailjs.send(
      env.VITE_EMAILJS_SERVICE_ID,
      env.VITE_EMAILJS_TEMPLATE_ID_NEWSLETTER,
      { subscriber_email: email, date: new Date().toISOString() },
      { publicKey: env.VITE_EMAILJS_PUBLIC_KEY }
    );
    return { ok: true, result: res };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export async function sendContactEmail({ name, email, message }) {
  if (!EMAIL_ENABLED || !env.VITE_EMAILJS_TEMPLATE_ID_CONTACT) {
    return { ok: true, simulated: true };
  }
  try {
    const res = await emailjs.send(
      env.VITE_EMAILJS_SERVICE_ID,
      env.VITE_EMAILJS_TEMPLATE_ID_CONTACT,
      { from_name: name, reply_to: email, message, date: new Date().toISOString() },
      { publicKey: env.VITE_EMAILJS_PUBLIC_KEY }
    );
    return { ok: true, result: res };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}
