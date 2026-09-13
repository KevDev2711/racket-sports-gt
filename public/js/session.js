/* ─── Session state ───
   Kept in memory only (no localStorage/cookies — sandboxed iframe safe).
   Any module that needs to read or update "who is logged in" imports from here
   instead of keeping its own copy of the token/user. */

let sessionToken = null;
let sessionUser = null;

export function setSession(token, user) {
  sessionToken = token;
  sessionUser = user;
}

export function clearSession() {
  sessionToken = null;
  sessionUser = null;
}

export function getToken() {
  return sessionToken;
}

export function getUser() {
  return sessionUser;
}
