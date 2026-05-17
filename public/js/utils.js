// utils.js — Shared utility functions used across all pages

// ─── BACKEND API BASE URL ─────────────────────────────────
// Change this when deploying to production
const API_BASE = 'http://localhost:5000/api';

// ─── TOAST NOTIFICATIONS ─────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;

  container.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── LOADING SPINNER ─────────────────────────────────────
function showLoader() {
  let overlay = document.querySelector('.spinner-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'spinner-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
  }
  overlay.classList.add('active');
}

function hideLoader() {
  const overlay = document.querySelector('.spinner-overlay');
  if (overlay) overlay.classList.remove('active');
}

// ─── DARK MODE TOGGLE ─────────────────────────────────────
function initDarkMode() {
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') document.body.classList.add('light-mode');

  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const current = document.body.classList.contains('light-mode') ? 'light' : 'dark';
      localStorage.setItem('theme', current);
    });
  }
}

// ─── AUTH GUARD ───────────────────────────────────────────
// Redirect to login if not authenticated
function requireAuth() {
  const user = localStorage.getItem('cn_user');
  if (!user) {
    window.location.href = 'login.html';
  }
  return JSON.parse(user || '{}');
}

// ─── LOGOUT ──────────────────────────────────────────────
function logout() {
  localStorage.removeItem('cn_user');
  showToast('Logged out successfully', 'info', 1500);
  setTimeout(() => (window.location.href = 'login.html'), 1500);
}

// ─── FORMAT DATE ─────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

// ─── STOCK STATUS BADGE HTML ─────────────────────────────
function stockBadge(status) {
  const map = {
    'In Stock':     '<span class="badge badge-success">● In Stock</span>',
    'Low Stock':    '<span class="badge badge-warning">⚠ Low Stock</span>',
    'Out of Stock': '<span class="badge badge-danger">✕ Out of Stock</span>',
  };
  return map[status] || status;
}

// ─── API FETCH HELPER ────────────────────────────────────
async function apiCall(endpoint, method = 'GET', body = null) {
  showLoader();
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  } finally {
    hideLoader();
  }
}

// ─── CONFIRM MODAL ────────────────────────────────────────
function showConfirm(title, message, onConfirm) {
  let overlay = document.getElementById('confirmModal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirmModal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h3 id="confirmTitle"></h3>
        <p id="confirmMessage"></p>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="confirmNo">No, Cancel</button>
          <button class="btn btn-primary" id="confirmYes">Yes, Confirm</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  overlay.classList.add('active');

  const yes = document.getElementById('confirmYes');
  const no  = document.getElementById('confirmNo');

  const closeModal = () => overlay.classList.remove('active');

  yes.onclick = () => { closeModal(); onConfirm(); };
  no.onclick  = closeModal;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

// ─── INIT ON EVERY PAGE ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();

  // Set active sidebar link
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
});