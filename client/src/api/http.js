const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api(path, { method='GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export function apiForm(path, { formData, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${BASE}${path}`, { method: 'POST', headers, body: formData })
    .then(async res => {
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.message || `HTTP ${res.status}`);
      }
      return res.json();
    });
}
