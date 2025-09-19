const base = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  try {
    const res = await fetch(`${base}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export const api = {
  subscribe(email) {
    return request('/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
  },
  contact(payload) {
    return request('/contacts', { method: 'POST', body: JSON.stringify(payload) });
  },
  listNewsletter() {
    return request('/newsletter', { method: 'GET' });
  },
  listContacts() {
    return request('/contacts', { method: 'GET' });
  },
};
