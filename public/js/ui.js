/* ─── UI layer ───
   DOM element references and view-switching logic (which form/card is visible).
   No fetch() calls here — this module only reads/writes the DOM.
   auth.js imports these and wires them to form submit handlers. */

export const authCard = document.getElementById('authCard');
export const dashboard = document.getElementById('dashboard');
export const alertBox = document.getElementById('alertBox');

export const loginForm = document.getElementById('loginForm');
export const registerForm = document.getElementById('registerForm');
export const photoChooseBtn = document.getElementById('photoChooseBtn');
export const registerPhoto = document.getElementById('registerPhoto');
export const photoPreview = document.getElementById('photoPreview');
export const photoPreviewImg = document.getElementById('photoPreviewImg');
export const photoPlaceholderIcon = document.getElementById('photoPlaceholderIcon');
export const loginTabBtn = document.getElementById('loginTabBtn');
export const registerTabBtn = document.getElementById('registerTabBtn');
export const switchHint = document.getElementById('switchHint');
export const forgotLink = document.getElementById('forgotLink');
export const userTag = document.getElementById('userTag');
export const logoutBtn = document.getElementById('logoutBtn');
export const forgotForm = document.getElementById('forgotForm');
export const resetForm = document.getElementById('resetForm');
export const backToLoginFromForgot = document.getElementById('backToLoginFromForgot');
export const backToLoginFromReset = document.getElementById('backToLoginFromReset');

export function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert show ${type}`;
}

export function clearAlert() {
  alertBox.className = 'alert';
  alertBox.textContent = '';
}

export function showLoginTab() {
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  forgotForm.classList.add('hidden');
  resetForm.classList.add('hidden');
  loginTabBtn.classList.add('active'); loginTabBtn.setAttribute('aria-selected', 'true');
  registerTabBtn.classList.remove('active'); registerTabBtn.setAttribute('aria-selected', 'false');
  switchHint.classList.remove('hidden');
  switchHint.innerHTML = '¿No tienes cuenta? <a id="goRegister">Regístrate</a>';
  document.getElementById('goRegister').addEventListener('click', showRegisterTab);
  clearAlert();
}

export function showRegisterTab() {
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  forgotForm.classList.add('hidden');
  resetForm.classList.add('hidden');
  registerTabBtn.classList.add('active'); registerTabBtn.setAttribute('aria-selected', 'true');
  loginTabBtn.classList.remove('active'); loginTabBtn.setAttribute('aria-selected', 'false');
  switchHint.classList.remove('hidden');
  switchHint.innerHTML = '¿Ya tienes cuenta? <a id="goLogin">Inicia sesión</a>';
  document.getElementById('goLogin').addEventListener('click', showLoginTab);
  clearAlert();
}

export function showForgotTab() {
  loginForm.classList.add('hidden');
  registerForm.classList.add('hidden');
  resetForm.classList.add('hidden');
  forgotForm.classList.remove('hidden');
  loginTabBtn.classList.remove('active'); loginTabBtn.setAttribute('aria-selected', 'false');
  registerTabBtn.classList.remove('active'); registerTabBtn.setAttribute('aria-selected', 'false');
  switchHint.classList.add('hidden');
  clearAlert();
}

export function showResetTab() {
  loginForm.classList.add('hidden');
  registerForm.classList.add('hidden');
  forgotForm.classList.add('hidden');
  resetForm.classList.remove('hidden');
  loginTabBtn.classList.remove('active'); loginTabBtn.setAttribute('aria-selected', 'false');
  registerTabBtn.classList.remove('active'); registerTabBtn.setAttribute('aria-selected', 'false');
  switchHint.classList.add('hidden');
  clearAlert();
}

export function enterDashboard(user) {
  authCard.style.display = 'none';
  dashboard.classList.add('show');
  userTag.textContent = user.alias || user.username || user.displayName || user.email;
}

export function exitDashboard() {
  dashboard.classList.remove('show');
  authCard.style.display = '';
  loginForm.reset();
  registerForm.reset();
  resetPhotoPreview();
  showLoginTab();
}

export function showPhotoPreview(dataUrl) {
  photoPreviewImg.src = dataUrl;
  photoPreviewImg.classList.remove('hidden');
  photoPlaceholderIcon.classList.add('hidden');
}

export function resetPhotoPreview() {
  photoPreviewImg.src = '';
  photoPreviewImg.classList.add('hidden');
  photoPlaceholderIcon.classList.remove('hidden');
}
