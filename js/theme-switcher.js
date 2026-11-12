/**
 * Portfolio Theme Switcher (Light / Dark Mode Controller)
 * Supports desktop navbar, mobile header, and mobile drawer switcher buttons.
 * Persists user preference via localStorage with seamless class & stylesheet management.
 */
(function () {
  'use strict';

  var THEME_KEY = 'abinash_portfolio_theme';
  var DARK_CSS_ID = 'dark-theme-css';
  var isToggling = false;

  // Get current preference: defaults to 'dark'
  function getPreferredTheme() {
    try {
      var stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch (e) {}
    // Default to dark theme as requested for the portfolio
    return 'dark';
  }

  // Apply theme to the document and update all switcher buttons
  function applyTheme(theme, animate) {
    var isDark = theme === 'dark';
    var body = document.body;
    var html = document.documentElement;
    var darkCss = document.getElementById(DARK_CSS_ID);

    // 1. Update DOM classes
    if (body) {
      if (isDark) {
        body.classList.add('dark-theme', 'active-dark-mode');
      } else {
        body.classList.remove('dark-theme', 'active-dark-mode');
      }
    }
    if (html) {
      html.setAttribute('data-theme', theme);
      if (isDark) {
        html.classList.add('dark-theme', 'active-dark-mode');
      } else {
        html.classList.remove('dark-theme', 'active-dark-mode');
      }
    }

    // 2. Enable or disable dark-theme.css stylesheet
    if (darkCss) {
      darkCss.disabled = !isDark;
    }

    // 3. Update all switcher buttons in the DOM
    var buttons = document.querySelectorAll('.theme-switcher-btn, .mode__switcher');
    buttons.forEach(function (btn) {
      if (isDark) {
        btn.classList.add('is-dark', 'active');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'Switch to light mode');
        btn.setAttribute('title', 'Switch to light mode (Current: Dark Mode)');
      } else {
        btn.classList.remove('is-dark', 'active');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Switch to dark mode');
        btn.setAttribute('title', 'Switch to dark mode (Current: Light Mode)');
      }
    });

    // 4. Save to localStorage
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}

    // 5. Notify any listeners
    try {
      window.dispatchEvent(new CustomEvent('portfolioThemeChanged', { detail: { theme: theme, isDark: isDark } }));
    } catch (e) {}
  }

  // Toggle between dark and light with debounce protection
  function toggleTheme() {
    if (isToggling) return;
    isToggling = true;
    setTimeout(function () {
      isToggling = false;
    }, 100);

    var current = getPreferredTheme();
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  }

  // Initialize event listeners
  function init() {
    var theme = getPreferredTheme();
    applyTheme(theme, false);

    // Delegated click handler
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.theme-switcher-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }
    });

    // Keyboard support (Enter / Space)
    document.addEventListener('keydown', function (e) {
      var btn = e.target.closest('.theme-switcher-btn');
      if (btn && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  // Run on DOM ready or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose helper globally
  window.PortfolioTheme = {
    get: getPreferredTheme,
    set: applyTheme,
    toggle: toggleTheme
  };
})();
