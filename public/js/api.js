/* ─── API layer ───
   All communication with the Vercel serverless backend (/api/*) lives here.
   UI code never calls fetch() directly — it calls the functions below.
   This keeps endpoint paths and request/response shapes in one place, so if
   an API route changes, only this file needs to change. */

const API_BASE = ''; // relative path — Vercel serves frontend and /api/* from the same domain

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado.');
  }
  return data;
}

export function login(identifier, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

export function register(displayName, identifier, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ displayName, identifier, password }),
  });
}

export function requestPasswordReset(identifier) {
  return apiRequest('/api/auth/request-reset', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  });
}

export function confirmPasswordReset(token, password) {
  return apiRequest('/api/auth/confirm-reset', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}
