// Grovity Theme System - Professional Implementation
const THEME_KEY = 'grovity_theme';

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);
}

function toggleTheme() {
  const currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initTheme);
