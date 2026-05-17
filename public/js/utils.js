/* utils.js — CyberNova shared utilities */

// ============================================================
// TOAST SYSTEM (replaces all alert() popups)
// ============================================================
window.showToast = function(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span style="flex:1">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close">✕</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
};

// ============================================================
// AUTH HELPERS
// ============================================================
window.getUser = function() {
  try {
    return JSON.parse(localStorage.getItem('cn_user'));
  } catch { return null; }
};

window.requireAuth = function() {
  const user = window.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
};

window.logout = function() {
  localStorage.removeItem('cn_user');
  window.location.href = 'login.html';
};

// ============================================================
// POPULATE USER UI
// ============================================================
window.populateUserUI = function() {
  const user = window.getUser();
  if (!user) return;

  const initials = (user.name || user.username || 'U').slice(0, 2).toUpperCase();
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name || user.username);
  document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = user.role || '');
  document.querySelectorAll('[data-user-avatar]').forEach(el => el.textContent = initials);
};

// ============================================================
// LIVE CLOCK
// ============================================================
window.startClock = function(selector = '[data-clock]') {
  const update = () => {
    const els = document.querySelectorAll(selector);
    const now = new Date().toLocaleString('en-US', {
      month: 'numeric', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    });
    els.forEach(el => el.textContent = now);
  };
  update();
  setInterval(update, 1000);
};

// ============================================================
// API HELPER
// ============================================================
window.api = {
  BASE: '/api',

  async request(path, options = {}) {
    try {
      const res = await fetch(this.BASE + path, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      console.error('API error:', err);
      throw err;
    }
  },

  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); },
  put(path, body) { return this.request(path, { method: 'PUT', body: JSON.stringify(body) }); },
  delete(path) { return this.request(path, { method: 'DELETE' }); }
};

// ============================================================
// ACTIVE NAV HIGHLIGHT
// ============================================================
window.setActiveNav = function() {
  const page = location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
};

// ============================================================
// TYPE BADGE HELPER
// ============================================================
window.typeBadge = function(type) {
  const t = (type || 'unknown').toLowerCase();
  const map = {
    storage: 'storage', hardware: 'hardware',
    software: 'software', network: 'network'
  };
  const cls = map[t] || 'storage';
  return `<span class="badge ${cls}"><span class="badge-dot"></span>${type}</span>`;
};

window.statusBadge = function(status) {
  const s = (status || '').toLowerCase();
  const cls = s.replace(/\s+/g, '-');
  return `<span class="status-badge ${cls}"><span class="badge-dot"></span>${status}</span>`;
};

window.priorityBadge = function(priority) {
  const p = (priority || '').toLowerCase();
  return `<span class="priority-badge ${p}">${priority}</span>`;
};

// ============================================================
// CONFIRM DIALOG (no alert/confirm)
// ============================================================
window.confirmDialog = function(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `
    <div class="modal" style="max-width:380px;text-align:center;">
      <div style="width:52px;height:52px;border-radius:14px;background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;color:#ff4757;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h3 style="font-size:16px;font-weight:700;margin-bottom:10px;">Confirm Action</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:24px;">${message}</p>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button class="btn btn-ghost" id="dlg-cancel">Cancel</button>
        <button class="btn btn-danger" id="dlg-confirm">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#dlg-cancel').onclick = () => overlay.remove();
  overlay.querySelector('#dlg-confirm').onclick = () => {
    overlay.remove();
    onConfirm();
  };
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.populateUserUI();
  window.startClock();
  window.setActiveNav();
});