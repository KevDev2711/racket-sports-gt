/*
 * Session state for the current browser tab.
 *
 * sessionStorage survives page refreshes but is cleared when the tab closes.
 * If browser storage is blocked, the app still works with in-memory state.
 */

const TOKEN_KEY = "racket_sports_gt_token";
const USER_KEY = "racket_sports_gt_user";

let sessionToken = null;
let sessionUser = null;

function loadStoredSession() {
  try {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    const storedUser = sessionStorage.getItem(USER_KEY);

    if (!storedToken) {
      return;
    }

    sessionToken = storedToken;
    sessionUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.warn("Could not restore session storage:", error);
    sessionToken = null;
    sessionUser = null;
  }
}

loadStoredSession();

export function setSession(token, user) {
  sessionToken = token;
  sessionUser = user;

  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("Could not save session storage:", error);
  }
}

export function clearSession() {
  sessionToken = null;
  sessionUser = null;

  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (error) {
    console.warn("Could not clear session storage:", error);
  }
}

export function getToken() {
  return sessionToken;
}

export function getUser() {
  return sessionUser;
}