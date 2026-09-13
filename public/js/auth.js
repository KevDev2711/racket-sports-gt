/* ─── Auth entry point ───
   Wires DOM events to the API layer (api.js), session state (session.js),
   and view-switching helpers (ui.js). This is the only file that combines
   all three — keeps the "glue" logic in one place and out of the HTML. */

import * as api from './api.js';
import { setSession, clearSession } from './session.js';
import {
  loginForm, registerForm, loginTabBtn, registerTabBtn,
  forgotLink, logoutBtn, forgotForm, resetForm,
  backToLoginFromForgot, backToLoginFromReset,
  showAlert, clearAlert, showLoginTab, showRegisterTab, showForgotTab, showResetTab,
  enterDashboard, exitDashboard,
} from './ui.js';

// ── Tab / navigation wiring ──
loginTabBtn.addEventListener('click', showLoginTab);
registerTabBtn.addEventListener('click', showRegisterTab);
document.getElementById('goRegister').addEventListener('click', showRegisterTab);
forgotLink.addEventListener('click', showForgotTab);
backToLoginFromForgot.addEventListener('click', showLoginTab);
backToLoginFromReset.addEventListener('click', showLoginTab);
logoutBtn.addEventListener('click', () => {
  clearSession();
  exitDashboard();
});

// ── Login ──
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearAlert();
  const btn = document.getElementById('loginBtn');
  const identifier = document.getElementById('loginIdentifier').value;
  const password = document.getElementById('loginPassword').value;

  btn.disabled = true; btn.textContent = 'Entrando…';
  try {
    const data = await api.login(identifier, password);
    setSession(data.token, data.user);
    btn.textContent = '¡Bienvenido!';
    setTimeout(() => {
      btn.disabled = false; btn.textContent = 'Iniciar Sesión';
      enterDashboard(data.user);
    }, 500);
  } catch (err) {
    btn.disabled = false; btn.textContent = 'Iniciar Sesión';
    showAlert(err.message, 'error');
  }
});

// ── Register ──
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearAlert();
  const btn = document.getElementById('registerBtn');
  const displayName = document.getElementById('registerName').value;
  const identifier = document.getElementById('registerIdentifier').value;
  const password = document.getElementById('registerPassword').value;

  btn.disabled = true; btn.textContent = 'Creando cuenta…';
  try {
    const data = await api.register(displayName, identifier, password);
    setSession(data.token, data.user);
    btn.textContent = '¡Cuenta creada!';
    setTimeout(() => {
      btn.disabled = false; btn.textContent = 'Crear Cuenta';
      enterDashboard(data.user);
    }, 500);
  } catch (err) {
    btn.disabled = false; btn.textContent = 'Crear Cuenta';
    showAlert(err.message, 'error');
  }
});

// ── Forgot password (request reset link) ──
forgotForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearAlert();
  const btn = document.getElementById('forgotBtn');
  const identifier = document.getElementById('forgotIdentifier').value;

  btn.disabled = true; btn.textContent = 'Enviando…';
  try {
    const data = await api.requestPasswordReset(identifier);
    showAlert(data.message, 'success');
    forgotForm.reset();
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Enviar enlace';
  }
});

// ── Reset password (confirm new password via emailed token) ──
resetForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearAlert();
  const btn = document.getElementById('resetBtn');
  const password = document.getElementById('resetPassword').value;
  const passwordConfirm = document.getElementById('resetPasswordConfirm').value;
  const token = new URLSearchParams(window.location.search).get('reset_token');

  if (password !== passwordConfirm) {
    showAlert('Las contraseñas no coinciden.', 'error');
    return;
  }
  if (!token) {
    showAlert('Enlace de restablecimiento inválido. Solicita uno nuevo.', 'error');
    return;
  }

  btn.disabled = true; btn.textContent = 'Guardando…';
  try {
    const data = await api.confirmPasswordReset(token, password);
    showAlert(data.message, 'success');
    resetForm.reset();
    window.history.replaceState({}, document.title, window.location.pathname);
    setTimeout(showLoginTab, 1500);
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Guardar nueva contraseña';
  }
});

// If the page was opened from a reset-password email link, jump straight to the reset form.
(function checkForResetToken() {
  const token = new URLSearchParams(window.location.search).get('reset_token');
  if (token) showResetTab();
})();
