// login.js — Handles login form logic

// Demo users (in production, this check would go through the backend API)
const DEMO_USERS = [
  { username: 'admin',   password: 'admin123', role: 'Admin',   name: 'Admin User' },
  { username: 'manager', password: 'manager1', role: 'Manager', name: 'Store Manager' },
];

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (localStorage.getItem('cn_user')) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Toggle password visibility
  document.getElementById('togglePwd').addEventListener('click', function () {
    const pwd = document.getElementById('password');
    const isText = pwd.type === 'text';
    pwd.type = isText ? 'password' : 'text';
    this.textContent = isText ? '👁️' : '🙈';
  });

  // Login button click
  document.getElementById('loginBtn').addEventListener('click', handleLogin);

  // Also allow pressing Enter key
  document.getElementById('password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
});

function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('loginBtn');

  // Clear previous errors
  clearErrors();

  // Validate fields
  let valid = true;

  if (!username) {
    showFieldError('usernameErr', 'Username is required');
    document.getElementById('username').classList.add('error');
    valid = false;
  }

  if (!password) {
    showFieldError('passwordErr', 'Password is required');
    document.getElementById('password').classList.add('error');
    valid = false;
  }

  if (!valid) return;

  // Disable button while checking
  btn.disabled = true;
  btn.textContent = 'Signing in...';

  // Simulate a small delay (real app would call the API here)
  setTimeout(() => {
    const user = DEMO_USERS.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      // Save user to localStorage
      localStorage.setItem('cn_user', JSON.stringify({
        username: user.username,
        name: user.name,
        role: user.role,
      }));

      showToast(`Welcome back, ${user.name}! 👋`, 'success');
      setTimeout(() => (window.location.href = 'dashboard.html'), 1200);
    } else {
      showFieldError('passwordErr', 'Invalid username or password');
      document.getElementById('password').classList.add('error');
      btn.disabled = false;
      btn.textContent = 'Sign In →';
    }
  }, 800);
}

function showFieldError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.remove('hidden');
}

function clearErrors() {
  ['usernameErr', 'passwordErr'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = '';
    el.classList.add('hidden');
  });
  ['username', 'password'].forEach(id => {
    document.getElementById(id).classList.remove('error');
  });
}