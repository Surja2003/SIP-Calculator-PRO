import { api } from './api';

const LS_KEYS = {
  newsletter: 'newsletter_subscribers',
  contacts: 'contact_messages',
};

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export async function saveNewsletter(email) {
  const now = new Date().toISOString();
  // 1) Try API
  const apiRes = await api.subscribe(email);
  if (apiRes?.ok) return { ok: true };
  const list = readList(LS_KEYS.newsletter);
  if (!list.find((e) => e.email?.toLowerCase() === email.toLowerCase())) {
    list.push({ email, date: now });
    writeList(LS_KEYS.newsletter, list);
  }
  return { ok: true, fallback: true };
}

export async function saveContact({ name, email, message }) {
  const now = new Date().toISOString();
  // 1) Try API
  const apiRes = await api.contact({ name, email, message });
  if (apiRes?.ok) return { ok: true };
  const list = readList(LS_KEYS.contacts);
  list.push({ name, email, message, date: now });
  writeList(LS_KEYS.contacts, list);
  return { ok: true, fallback: true };
}

export async function getAllNewsletter() {
  const res = await api.listNewsletter();
  if (res?.ok && Array.isArray(res.data)) return res.data;
  return readList(LS_KEYS.newsletter);
}

export async function getAllContacts() {
  const res = await api.listContacts();
  if (res?.ok && Array.isArray(res.data)) return res.data;
  return readList(LS_KEYS.contacts);
}
