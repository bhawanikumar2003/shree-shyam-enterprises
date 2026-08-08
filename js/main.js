/* ==========================================================================
   SHREE SHYAM ENTERPRISES - MAIN CORE LOGIC (main.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initCartDrawer();
  registerServiceWorker();
});

/* --------------------------------------------------------------------------
   1. THEME MANAGER (Auto system detect + manual toggle persistent)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const storedTheme = localStorage.getItem('sse_theme');

  if (storedTheme) {
    document.documentElement.setAttribute('data-theme', storedTheme);
    updateThemeIcon(storedTheme);
  } else {
    // Auto detect system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('sse_theme', newTheme);
      updateThemeIcon(newTheme);
      showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info');
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#theme-toggle-btn i');
  if (icon) {
    if (theme === 'dark') {
      icon.className = 'fas fa-sun';
    } else {
      icon.className = 'fas fa-moon';
    }
  }
}

/* --------------------------------------------------------------------------
   2. NAV BAR & MOBILE HAMBURGER MENU
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  // Sticky header scroll elevation
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isOpen = navLinks.classList.contains('active');
      hamburgerBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
  }
}

/* --------------------------------------------------------------------------
   3. CART DRAWER TOGGLE
   -------------------------------------------------------------------------- */
function initCartDrawer() {
  const cartIconBtn = document.getElementById('cart-icon-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const drawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartDrawer = document.getElementById('cart-drawer');

  function openDrawer() {
    if (drawerOverlay && cartDrawer) {
      drawerOverlay.classList.add('active');
      cartDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (window.renderCartDrawerItems) {
        window.renderCartDrawerItems();
      }
    }
  }

  function closeDrawer() {
    if (drawerOverlay && cartDrawer) {
      drawerOverlay.classList.remove('active');
      cartDrawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (cartIconBtn) cartIconBtn.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  window.openCartDrawer = openDrawer;
  window.closeCartDrawer = closeDrawer;
}

/* --------------------------------------------------------------------------
   4. TOAST NOTIFICATION SYSTEM
   -------------------------------------------------------------------------- */
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-check-circle';
  if (type === 'info') iconClass = 'fa-info-circle';
  if (type === 'warning') iconClass = 'fa-exclamation-triangle';
  if (type === 'danger') iconClass = 'fa-times-circle';

  toast.innerHTML = `<i class="fas ${iconClass}"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
window.showToast = showToast;

/* --------------------------------------------------------------------------
   5. SERVICE WORKER REGISTRATION (PWA)
   -------------------------------------------------------------------------- */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('PWA Service Worker registered:', reg.scope))
      .catch(err => console.log('Service Worker registration failed:', err));
  }
}
