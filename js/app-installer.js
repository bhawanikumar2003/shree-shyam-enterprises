/* ==========================================================================
   SHREE SHYAM ENTERPRISES - PWA 1-TAP MOBILE APP INSTALLER (js/app-installer.js)
   ========================================================================== */

let deferredPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
  initAppInstaller();
});

function initAppInstaller() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser install bar
    e.preventDefault();
    deferredPrompt = e;

    showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallBanner();
    showToast('Shree Shyam App successfully installed on your Phone Home Screen! 🎉', 'success');
  });
}

function showInstallBanner() {
  if (document.getElementById('pwa-install-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.style.cssText = `
    position: fixed;
    top: 75px;
    left: 50%;
    transform: translateX(-50%);
    width: 92%;
    max-width: 500px;
    background: linear-gradient(135deg, #1E3A8A, #0F172A);
    color: #FFF;
    border: 2px solid var(--accent-gold);
    border-radius: var(--radius-lg);
    padding: 1rem 1.25rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    z-index: 2200;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    animation: fadeInDown 0.5s ease;
  `;

  banner.innerHTML = `
    <div style="display:flex; align-items:center; gap:0.75rem;">
      <div style="width:42px; height:42px; border-radius:var(--radius-md); background:var(--accent-gold); color:#000; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0;">
        <i class="fas fa-mobile-screen-button"></i>
      </div>
      <div>
        <strong style="font-size:0.95rem; display:block; color:var(--accent-gold-light);">📲 Install Shree Shyam App</strong>
        <span style="font-size:0.75rem; color:#CBD5E1;">Download app to your Phone Home Screen!</span>
      </div>
    </div>

    <div style="display:flex; align-items:center; gap:0.5rem;">
      <button class="btn btn-gold btn-sm" onclick="triggerAppInstall()"><i class="fas fa-download"></i> Install App</button>
      <button onclick="hideInstallBanner()" style="background:transparent; border:none; color:#FFF; font-size:1.2rem; cursor:pointer; padding:0.2rem;"><i class="fas fa-times"></i></button>
    </div>
  `;

  document.body.appendChild(banner);
}

function hideInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
}

function triggerAppInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('Installing Shree Shyam App...', 'success');
      }
      deferredPrompt = null;
      hideInstallBanner();
    });
  } else {
    // Fallback instructions for iOS / browsers that don't support beforeinstallprompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      alert('To install app on iPhone: Tap the Share button in Safari browser, then select "Add to Home Screen" 📲');
    } else {
      alert('To install app on Android: Tap the 3 dots menu in Chrome, then select "Install App" or "Add to Home Screen" 📲');
    }
  }
}

window.triggerAppInstall = triggerAppInstall;
window.hideInstallBanner = hideInstallBanner;
