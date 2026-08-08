/* ==========================================================================
   SHREE SHYAM ENTERPRISES - PRODUCT DATA LOADER & RENDERER (js/products.js)
   ========================================================================== */

let productsCache = [];
let categoriesCache = [];

async function loadProductData() {
  try {
    // Cache buster timestamp to prevent stale browser caching
    const cacheBuster = `?v=${Date.now()}`;
    const [prodRes, catRes] = await Promise.all([
      fetch('data/products.json' + cacheBuster, { cache: 'no-store' }),
      fetch('data/categories.json' + cacheBuster, { cache: 'no-store' })
    ]);
    const jsonProducts = await prodRes.json();
    categoriesCache = await catRes.json();

    // Retrieve custom products saved in LocalStorage by Admin
    const customProducts = JSON.parse(localStorage.getItem('sse_custom_products')) || [];
    const customMap = new Map();

    customProducts.forEach(p => {
      if (p && p.id) customMap.set(String(p.id).trim(), p);
    });

    // Merge JSON products with custom edited versions (Custom versions override defaults)
    let merged = jsonProducts.map(p => {
      const pIdStr = String(p.id).trim();
      const custom = customMap.get(pIdStr);
      return custom ? { ...p, ...custom } : p;
    });

    // Append newly added products created in Admin Panel
    const defaultIds = new Set(jsonProducts.map(p => String(p.id).trim()));
    customProducts.forEach(cp => {
      if (cp && cp.id) {
        const cpIdStr = String(cp.id).trim();
        if (!defaultIds.has(cpIdStr)) {
          merged.unshift(cp);
        }
      }
    });

    // Filter out deleted product IDs
    const deletedIds = new Set((JSON.parse(localStorage.getItem('sse_deleted_products')) || []).map(id => String(id).trim()));
    productsCache = merged.filter(p => !deletedIds.has(String(p.id).trim()));

    return { products: productsCache, categories: categoriesCache };
  } catch (error) {
    console.error('Failed to load JSON data:', error);
    // Safety fallback to LocalStorage custom products if fetch fails
    const customProducts = JSON.parse(localStorage.getItem('sse_custom_products')) || [];
    productsCache = customProducts;
    return { products: productsCache, categories: categoriesCache };
  }
}

function createProductCardHTML(product) {
  const image = Array.isArray(product.images) ? product.images[0] : (product.image || 'assets/products/grocery_atta.jpg');
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-media">
        <div class="product-badges">
          ${product.discount ? `<span class="badge badge-discount">${product.discount}</span>` : ''}
          ${product.bestseller ? `<span class="badge badge-gold">Bestseller</span>` : ''}
        </div>
        <button class="wishlist-btn" onclick="toggleWishlist('${product.id}')" title="Add to Wishlist">
          <i class="far fa-heart"></i>
        </button>
        <img src="${image}" alt="${product.name}" loading="lazy">
        <div class="quick-view-overlay">
          <button class="quick-view-btn" onclick="openQuickView('${product.id}')">
            <i class="fas fa-eye"></i> Quick View
          </button>
        </div>
      </div>
      <div class="product-content">
        <div class="product-brand">${product.brand || 'Shree Shyam'} • ${product.unit || '1 Unit'}</div>
        <a href="product.html?id=${product.id}" class="product-name" title="${product.name}">${product.name}</a>
        ${product.nameHindi ? `<div class="product-name-hindi">${product.nameHindi}</div>` : ''}
        <div class="product-rating">
          <div class="stars">
            <i class="fas fa-star"></i> <span>${product.rating || 4.8}</span>
          </div>
          <span class="review-count">(${product.reviewsCount || 45})</span>
        </div>
        <div class="product-footer">
          <div class="product-price">
            <span class="current-price">₹${product.price}</span>
            ${product.mrp > product.price ? `<span class="original-price">₹${product.mrp}</span>` : ''}
          </div>
          <button class="btn btn-primary btn-sm" onclick="handleAddToCart('${product.id}')">
            <i class="fas fa-cart-plus"></i> Add
          </button>
        </div>
      </div>
    </div>
  `;
}

function handleAddToCart(productId) {
  const product = productsCache.find(p => String(p.id).trim() === String(productId).trim());
  if (product) {
    Cart.addToCart(product, 1);
  }
}

function toggleWishlist(productId) {
  let wishlist = JSON.parse(localStorage.getItem('sse_wishlist')) || [];
  const index = wishlist.indexOf(productId);
  if (index > -1) {
    wishlist.splice(index, 1);
    showToast('Removed from Wishlist', 'info');
  } else {
    wishlist.push(productId);
    showToast('Added to Wishlist', 'success');
  }
  localStorage.setItem('sse_wishlist', JSON.stringify(wishlist));
}

function openQuickView(productId) {
  const product = productsCache.find(p => String(p.id).trim() === String(productId).trim());
  if (!product) return;

  let modal = document.getElementById('quickview-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickview-modal-overlay';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const images = Array.isArray(product.images) ? product.images : [product.image || 'assets/products/grocery_atta.jpg'];

  modal.innerHTML = `
    <div class="quickview-modal">
      <button class="close-modal-btn" onclick="closeQuickView()"><i class="fas fa-times"></i></button>
      <div class="quickview-content">
        <div>
          <img src="${images[0]}" alt="${product.name}" id="qv-main-img" style="width:100%; max-height:350px; object-fit:contain; border-radius: var(--radius-md); border:1px solid var(--border-color); padding: 1rem;">
          <div style="display:flex; gap:0.5rem; margin-top:1rem;">
            ${images.map((img) => `
              <img src="${img}" onclick="document.getElementById('qv-main-img').src='${img}'" style="width:60px; height:60px; object-fit:contain; border:1px solid var(--border-color); border-radius:var(--radius-sm); cursor:pointer; padding:0.2rem;">
            `).join('')}
          </div>
        </div>
        <div style="display:flex; flex-direction:column; justify-between;">
          <div>
            <span class="section-subtitle">${product.category}</span>
            <h2 style="font-size:1.5rem; font-weight:800; margin-top:0.3rem;">${product.name}</h2>
            <div style="font-family:var(--font-hindi); color:var(--text-muted); font-size:1rem;">${product.nameHindi || ''}</div>
            <div style="margin: 1rem 0; display:flex; align-items:baseline; gap:1rem;">
              <span style="font-size:1.8rem; font-weight:800; color:var(--primary-blue-light);">₹${product.price}</span>
              ${product.mrp > product.price ? `<span style="text-decoration:line-through; color:var(--text-muted);">₹${product.mrp}</span>` : ''}
              ${product.discount ? `<span class="badge badge-discount">${product.discount}</span>` : ''}
            </div>
            <p style="color:var(--text-secondary); font-size:0.95rem; margin-bottom:1.5rem;">${product.description || ''}</p>
          </div>
          <div>
            <div style="display:flex; gap:1rem; margin-bottom:1rem;">
              <button class="btn btn-primary btn-lg" style="flex:1;" onclick="handleAddToCart('${product.id}'); closeQuickView();">
                <i class="fas fa-cart-plus"></i> Add to Cart
              </button>
              <a href="product.html?id=${product.id}" class="btn btn-outline btn-lg">View Details</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quickview-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

window.loadProductData = loadProductData;
window.createProductCardHTML = createProductCardHTML;
window.handleAddToCart = handleAddToCart;
window.toggleWishlist = toggleWishlist;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
