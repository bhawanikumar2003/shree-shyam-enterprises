/* ==========================================================================
   SHREE SHYAM ENTERPRISES - CATALOG FILTER & SORTING ENGINE (filter.js)
   ========================================================================== */

let allCatalogProducts = [];
let activeCategory = 'all';
let activeBrand = 'all';
let maxPriceLimit = 1000;
let activeSortOption = 'featured';

document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('catalog-products-grid')) {
    const { products, categories } = await loadProductData();
    allCatalogProducts = products;

    // Check URL parameters for category filter
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    if (catParam) activeCategory = catParam;

    renderCategoryPillFilters(categories);
    initFilterEventListeners();
    applyCatalogFilters();
  }
});

function renderCategoryPillFilters(categories) {
  const container = document.getElementById('category-pills-container');
  if (!container) return;

  container.innerHTML = `
    <button class="pill-btn ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">All Products</button>
    ${categories.map(c => `
      <button class="pill-btn ${activeCategory === c.id ? 'active' : ''}" data-cat="${c.id}">${c.name}</button>
    `).join('')}
  `;

  container.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      container.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.getAttribute('data-cat');
      applyCatalogFilters();
    });
  });
}

function initFilterEventListeners() {
  const sortSelect = document.getElementById('sort-select');
  const priceRange = document.getElementById('price-range-input');
  const priceValDisplay = document.getElementById('price-range-val');
  const searchInput = document.getElementById('catalog-search-input');

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSortOption = e.target.value;
      applyCatalogFilters();
    });
  }

  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      maxPriceLimit = parseInt(e.target.value);
      if (priceValDisplay) priceValDisplay.textContent = `₹${maxPriceLimit}`;
      applyCatalogFilters();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyCatalogFilters();
    });
  }
}

function applyCatalogFilters() {
  const grid = document.getElementById('catalog-products-grid');
  const resultCountEl = document.getElementById('catalog-results-count');
  const searchQuery = (document.getElementById('catalog-search-input')?.value || '').toLowerCase().trim();

  if (!grid) return;

  let filtered = allCatalogProducts.filter(p => {
    // Category match
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    // Price match
    if (p.price > maxPriceLimit) return false;
    // Search query match
    if (searchQuery) {
      const matchName = p.name.toLowerCase().includes(searchQuery);
      const matchHindi = p.nameHindi && p.nameHindi.includes(searchQuery);
      const matchBrand = p.brand.toLowerCase().includes(searchQuery);
      if (!matchName && !matchHindi && !matchBrand) return false;
    }
    return true;
  });

  // Apply Sorting
  if (activeSortOption === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (activeSortOption === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (activeSortOption === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (activeSortOption === 'newest') {
    filtered.sort((a, b) => b.id.localeCompare(a.id));
  }

  if (resultCountEl) {
    resultCountEl.textContent = `Showing ${filtered.length} products`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 4rem 1rem;">
        <i class="fas fa-search" style="font-size: 3rem; color:var(--text-muted); margin-bottom:1rem;"></i>
        <h3>No Products Found</h3>
        <p style="color:var(--text-muted);">Try adjusting your search criteria or resetting filters.</p>
        <button class="btn btn-outline" style="margin-top:1rem;" onclick="resetCatalogFilters()">Reset All Filters</button>
      </div>
    `;
  } else {
    grid.innerHTML = filtered.map(createProductCardHTML).join('');
  }
}

function resetCatalogFilters() {
  activeCategory = 'all';
  maxPriceLimit = 1000;
  activeSortOption = 'featured';

  const priceRange = document.getElementById('price-range-input');
  if (priceRange) priceRange.value = 1000;

  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) searchInput.value = '';

  const priceValDisplay = document.getElementById('price-range-val');
  if (priceValDisplay) priceValDisplay.textContent = '₹1000';

  document.querySelectorAll('#category-pills-container .pill-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-cat') === 'all');
  });

  applyCatalogFilters();
}

window.applyCatalogFilters = applyCatalogFilters;
window.resetCatalogFilters = resetCatalogFilters;
