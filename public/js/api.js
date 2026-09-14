/* ─── API layer ───
   All communication with the Vercel serverless backend (/api/*) lives here.
   UI code never calls fetch() directly — it calls the functions below.
   This keeps endpoint paths and request/response shapes in one place, so if
   an API route changes, only this file needs to change. */

const API_BASE = ''; // relative path — Vercel serves frontend and /api/* from the same domain

// Public (anon-key) Supabase client — safe to expose client-side, used only
// to upload profile photos directly to Storage before registering. This
// avoids sending large base64 payloads through the register API, which sits
// behind Vercel's fixed 4.5MB request body limit.
const SUPABASE_URL = 'https://zuagudtzqjstddwqydsm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_d0IAZ4wv7g8yQrANaqLE-w_xLEQV3r-';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

/** Same as apiRequest, but attaches the current session's Bearer token. */
async function authedRequest(path, token, options = {}) {
  return apiRequest(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

export function login(identifier, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

/**
 * Uploads a profile photo File directly to Supabase Storage and returns its
 * public URL. Called before register() when the user picked a photo.
 */
export async function uploadProfilePhoto(file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabaseClient.storage
    .from('profile-photos')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error('No se pudo subir la foto. Intenta de nuevo.');
  const { data } = supabaseClient.storage.from('profile-photos').getPublicUrl(path);
  return data.publicUrl;
}

export function register({ firstName, lastName, username, alias, email, password, photoUrl }) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, username, alias, email, password, photoUrl }),
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

/** Registered players, for opponent pickers. */
export function getPlayers(sessionToken) {
  return authedRequest('/api/players', sessionToken);
}

/** Win/loss/win% leaderboard. */
export function getRankings(sessionToken) {
  return authedRequest('/api/rankings', sessionToken);
}

/** Match history, newest first. */
export function getMatches(sessionToken) {
  return authedRequest('/api/matches', sessionToken);
}

/** Record a new match: { player1Id, player2Id, matchDate, games: [{player1Score, player2Score}, ...] } */
export function createMatch(sessionToken, payload) {
  return authedRequest('/api/matches', sessionToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
