/* ==========================================================================
   SHREE SHYAM ENTERPRISES - LIVE SEARCH & AUTOCOMPLETE (search.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLiveSearch();
});

function initLiveSearch() {
  const searchInput = document.getElementById('header-search-input');
  const resultsContainer = document.getElementById('header-search-results');

  if (!searchInput || !resultsContainer) return;

  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim().toLowerCase();

    if (query.length < 2) {
      resultsContainer.classList.remove('active');
      resultsContainer.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      const { products } = await loadProductData();
      const matches = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.nameHindi && p.nameHindi.includes(query)) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      ).slice(0, 6);

      if (matches.length === 0) {
        resultsContainer.innerHTML = `
          <div style="padding:1rem; text-align:center; color:var(--text-muted); font-size:0.9rem;">
            No items found matching "${query}"
          </div>
        `;
      } else {
        resultsContainer.innerHTML = matches.map(p => `
          <a href="product.html?id=${p.id}" class="search-result-item">
            <img src="${Array.isArray(p.images) ? p.images[0] : p.image}" alt="${p.name}">
            <div class="search-result-info">
              <h4>${p.name}</h4>
              <span>₹${p.price} • ${p.brand}</span>
            </div>
          </a>
        `).join('');
      }

      resultsContainer.classList.add('active');
    }, 250);
  });

  // Hide dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.classList.remove('active');
    }
  });
}
