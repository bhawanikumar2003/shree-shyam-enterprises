/* ==========================================================================
   SHREE SHYAM ENTERPRISES - ANIMATIONS & SCROLL REVEALS (animation.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveals();
  initCounterStats();
});

function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

function initCounterStats() {
  const counterElements = document.querySelectorAll('.stat-counter');
  if (counterElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        let count = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          count += step;
          if (count >= target) {
            entry.target.textContent = target.toLocaleString() + '+';
            clearInterval(timer);
          } else {
            entry.target.textContent = count.toLocaleString() + '+';
          }
        }, 30);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => observer.observe(el));
}
