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
export const dashboardAvatarIcon = document.getElementById('dashboardAvatarIcon');
export const dashboardAvatarImg = document.getElementById('dashboardAvatarImg');
export const logoutBtn = document.getElementById('logoutBtn');
export const forgotForm = document.getElementById('forgotForm');
export const resetForm = document.getElementById('resetForm');
export const backToLoginFromForgot = document.getElementById('backToLoginFromForgot');
export const backToLoginFromReset = document.getElementById('backToLoginFromReset');

// ── Dashboard: Rankings & Match History ──
export const shell = document.querySelector('.shell');
export const dashAlertBox = document.getElementById('dashAlertBox');
export const rankingsTabBtn = document.getElementById('rankingsTabBtn');
export const historyTabBtn = document.getElementById('historyTabBtn');
export const rankingsPanel = document.getElementById('rankingsPanel');
export const historyPanel = document.getElementById('historyPanel');
export const rankingsBody = document.getElementById('rankingsBody');
export const rankingsEmpty = document.getElementById('rankingsEmpty');
export const matchList = document.getElementById('matchList');
export const matchListEmpty = document.getElementById('matchListEmpty');
export const addMatchBtn = document.getElementById('addMatchBtn');

// ── Add Match Modal ──
export const matchModalBackdrop = document.getElementById('matchModalBackdrop');
export const matchModalClose = document.getElementById('matchModalClose');
export const matchModalAlert = document.getElementById('matchModalAlert');
export const matchForm = document.getElementById('matchForm');
export const matchPlayer1 = document.getElementById('matchPlayer1');
export const matchPlayer2 = document.getElementById('matchPlayer2');
export const matchDateInput = document.getElementById('matchDate');
export const gamesList = document.getElementById('gamesList');
export const addGameBtn = document.getElementById('addGameBtn');
export const matchSubmitBtn = document.getElementById('matchSubmitBtn');

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
  shell.classList.add('wide');
  userTag.textContent = user.alias || user.username || user.displayName || user.email;
  if (user.photoUrl) {
    dashboardAvatarImg.src = user.photoUrl;
    dashboardAvatarImg.classList.remove('hidden');
    dashboardAvatarIcon.style.display = 'none';
  } else {
    resetDashboardAvatar();
  }
  showRankingsTab();
}

export function resetDashboardAvatar() {
  dashboardAvatarImg.classList.add('hidden');
  dashboardAvatarImg.removeAttribute('src');
  dashboardAvatarIcon.style.display = '';
}

export function exitDashboard() {
  dashboard.classList.remove('show');
  shell.classList.remove('wide');
  authCard.style.display = '';
  loginForm.reset();
  registerForm.reset();
  resetPhotoPreview();
  resetDashboardAvatar();
  showLoginTab();
}

// ── Dashboard tab switching (Rankings / Historial) ──
export function showRankingsTab() {
  rankingsPanel.classList.remove('hidden');
  historyPanel.classList.add('hidden');
  rankingsTabBtn.classList.add('active'); rankingsTabBtn.setAttribute('aria-selected', 'true');
  historyTabBtn.classList.remove('active'); historyTabBtn.setAttribute('aria-selected', 'false');
}

export function showHistoryTab() {
  historyPanel.classList.remove('hidden');
  rankingsPanel.classList.add('hidden');
  historyTabBtn.classList.add('active'); historyTabBtn.setAttribute('aria-selected', 'true');
  rankingsTabBtn.classList.remove('active'); rankingsTabBtn.setAttribute('aria-selected', 'false');
}

function avatarImg(player, cssClass) {
  const initial = (player.displayName || '?').trim().charAt(0).toUpperCase();
  if (player.photoUrl) {
    return `<img class="${cssClass}" src="${escapeHtml(player.photoUrl)}" alt="${escapeHtml(player.displayName)}">`;
  }
  return `<span class="${cssClass}" style="display:grid;place-items:center;font-weight:700;color:var(--accent)">${escapeHtml(initial)}</span>`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function renderRankings(rankings) {
  rankingsBody.innerHTML = '';
  if (!rankings || rankings.length === 0) {
    rankingsEmpty.style.display = '';
    return;
  }
  rankingsEmpty.style.display = 'none';
  rankings.forEach((r, idx) => {
    const tr = document.createElement('tr');
    const pos = idx + 1;
    tr.innerHTML = `
      <td><span class="rank-pos ${pos <= 1 ? 'top' : ''}">${pos}</span></td>
      <td><div class="rank-player">${avatarImg(r, 'rank-avatar')}<span>${escapeHtml(r.displayName)}</span></div></td>
      <td>${r.matchesPlayed}</td>
      <td>${r.wins}</td>
      <td>${r.losses}</td>
      <td>${r.winPct === null ? '—' : `<span class="winpct">${r.winPct}%</span>`}</td>
    `;
    rankingsBody.appendChild(tr);
  });
}

export function renderMatchList(matches) {
  matchList.innerHTML = '';
  if (!matches || matches.length === 0) {
    matchListEmpty.style.display = '';
    return;
  }
  matchListEmpty.style.display = 'none';
  matches.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'match-card';
    const p1Winner = m.winnerId === m.player1.id;
    const p2Winner = m.winnerId === m.player2.id;
    const dateLabel = new Date(m.matchDate + 'T00:00:00').toLocaleDateString('es-GT', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    const gamesPills = m.games.map((g) => `<span class="match-game-pill">Match ${g.gameNumber}: ${g.player1Score}-${g.player2Score}</span>`).join('');
    card.innerHTML = `
      <div class="match-date">${escapeHtml(dateLabel)}</div>
      <div class="match-players">
        <div class="match-side ${p1Winner ? 'winner' : ''}">${avatarImg(m.player1, 'match-avatar')}<span class="match-name">${escapeHtml(m.player1.displayName)}</span></div>
        <span class="match-score">${m.player1.gamesWon}</span>
        <span class="match-vs">vs</span>
        <span class="match-score">${m.player2.gamesWon}</span>
        <div class="match-side right ${p2Winner ? 'winner' : ''}">${avatarImg(m.player2, 'match-avatar')}<span class="match-name">${escapeHtml(m.player2.displayName)}</span></div>
      </div>
      <div class="match-games">${gamesPills}</div>
    `;
    matchList.appendChild(card);
  });
}

export function populatePlayerSelects(players, excludeNoneId) {
  const optionsHtml = players.map((p) => `<option value="${p.id}">${escapeHtml(p.displayName)}</option>`).join('');
  matchPlayer1.innerHTML = optionsHtml;
  matchPlayer2.innerHTML = optionsHtml;
  if (players.length > 1) matchPlayer2.value = players[1].id;
}

export function addGameRow(index) {
  const row = document.createElement('div');
  row.className = 'game-row';
  row.dataset.index = index;

  row.innerHTML = `
    <span>Match ${index + 1}</span>
    <input type="number" min="0" max="99" placeholder="SETS J1" class="game-p1" required>
    <input type="number" min="0" max="99" placeholder="SETS J2" class="game-p2" required>
    <button type="button" class="game-remove" aria-label="Quitar match">&times;</button>
  `;

  gamesList.appendChild(row);

  row.querySelector('.game-remove').addEventListener('click', () => {
    row.remove();
    renumberGameRows();
  });

  return row;
}

export function renumberGameRows() {
  gamesList.querySelectorAll('.game-row').forEach((row, idx) => {
    row.dataset.index = idx;
    row.querySelector('span').textContent = `Match ${idx + 1}`;
  });
}

export function resetMatchForm() {
  matchForm.reset();
  gamesList.innerHTML = '';
  matchModalAlert.className = 'alert';
  matchModalAlert.textContent = '';
}

export function openMatchModal() {
  matchModalBackdrop.classList.remove('hidden');
}

export function closeMatchModal() {
  matchModalBackdrop.classList.add('hidden');
}

export function showDashAlert(message, type) {
  dashAlertBox.textContent = message;
  dashAlertBox.className = `alert show ${type}`;
}

export function clearDashAlert() {
  dashAlertBox.className = 'alert';
  dashAlertBox.textContent = '';
}

export function showModalAlert(message, type) {
  matchModalAlert.textContent = message;
  matchModalAlert.className = `alert show ${type}`;
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
