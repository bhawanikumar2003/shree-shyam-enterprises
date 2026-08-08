/* ==========================================================================
   SHREE SHYAM ENTERPRISES - SINGLE PRODUCT DETAILS PAGE (product.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'prod-001';

  const { products } = await loadProductData();
  const product = products.find(p => p.id === productId);

  if (!product) {
    document.getElementById('product-detail-container').innerHTML = `
      <div class="text-center" style="padding: 5rem 0;">
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <a href="products.html" class="btn btn-primary" style="margin-top:1rem;">Back to Store</a>
      </div>
    `;
    return;
  }

  // Update Page Title
  document.title = `${product.name} - Shree Shyam Enterprises`;

  renderProductDetails(product, products);
  addToRecentlyViewed(product.id);
});

function renderProductDetails(product, allProducts) {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  const images = Array.isArray(product.images) ? product.images : [product.image];
  let selectedVariant = product.variants ? product.variants[0] : product.unit;

  container.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 4rem;">
      <!-- Image Gallery -->
      <div>
        <div style="background:#FFF; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem; text-align:center; position:relative; overflow:hidden;">
          <img id="main-product-image" src="${images[0]}" alt="${product.name}" style="max-height:400px; width:100%; object-fit:contain; transition: transform 0.3s ease;">
          <div style="position:absolute; top:1rem; left:1rem;">
            ${product.discount ? `<span class="badge badge-discount">${product.discount}</span>` : ''}
          </div>
        </div>
        <div style="display:flex; gap:1rem; margin-top:1rem;">
          ${images.map((img, i) => `
            <img src="${img}" class="thumb-img ${i === 0 ? 'active' : ''}" onclick="switchProductImage(this, '${img}')" style="width:75px; height:75px; object-fit:contain; border:2px solid ${i === 0 ? 'var(--primary-blue-light)' : 'var(--border-color)'}; border-radius:var(--radius-sm); cursor:pointer; padding:0.3rem; background:#FFF;">
          `).join('')}
        </div>
      </div>

      <!-- Info & Buy Options -->
      <div>
        <span class="section-subtitle">${product.brand} • ${product.category}</span>
        <h1 style="font-size:2.2rem; font-weight:800; line-height:1.2; margin: 0.5rem 0;">${product.name}</h1>
        ${product.nameHindi ? `<div style="font-family:var(--font-hindi); font-size:1.3rem; color:var(--text-muted); font-weight:600; margin-bottom:1rem;">${product.nameHindi}</div>` : ''}
        
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
          <div style="background:var(--accent-gold); color:#0F172A; padding:0.2rem 0.6rem; border-radius:var(--radius-sm); font-weight:800; font-size:0.9rem;">
            <i class="fas fa-star"></i> ${product.rating}
          </div>
          <span style="color:var(--text-muted); font-size:0.9rem;">${product.reviewsCount} verified ratings</span>
          <span class="badge badge-stock" style="background:var(--success-green);"><i class="fas fa-check-circle"></i> In Stock</span>
        </div>

        <div style="background:var(--bg-tertiary); padding:1.25rem; border-radius:var(--radius-md); margin-bottom:1.5rem; display:flex; align-items:baseline; gap:1.5rem;">
          <span style="font-size:2.4rem; font-weight:900; color:var(--primary-blue-light);">₹${product.price}</span>
          ${product.mrp > product.price ? `<span style="font-size:1.2rem; text-decoration:line-through; color:var(--text-muted);">MRP ₹${product.mrp}</span>` : ''}
          <span style="color:var(--success-green); font-weight:700;">You Save ₹${product.mrp - product.price}</span>
        </div>

        <!-- Variants Selector -->
        ${product.variants ? `
          <div style="margin-bottom:1.5rem;">
            <label style="font-weight:700; display:block; margin-bottom:0.5rem;">Select Size / Pack:</label>
            <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
              ${product.variants.map((v, i) => `
                <button class="variant-opt-btn ${i === 0 ? 'active' : ''}" onclick="selectVariant(this, '${v}')" style="padding:0.5rem 1.2rem; border:2px solid ${i === 0 ? 'var(--primary-blue-light)' : 'var(--border-color)'}; border-radius:var(--radius-sm); font-weight:600; background:var(--bg-card); cursor:pointer;">${v}</button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Quantity & Add to Cart -->
        <div style="display:flex; gap:1rem; align-items:center; margin-bottom:2rem;">
          <div class="qty-control" style="padding:0.4rem;">
            <button class="qty-btn" style="width:36px; height:36px; font-size:1.2rem;" onclick="adjustDetailQty(-1)">-</button>
            <span id="detail-qty-val" class="qty-val" style="font-size:1.1rem; padding:0 1rem;">1</span>
            <button class="qty-btn" style="width:36px; height:36px; font-size:1.2rem;" onclick="adjustDetailQty(1)">+</button>
          </div>
          <button class="btn btn-primary btn-lg" style="flex:1;" onclick="addCurrentProductToCart('${product.id}')">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
          <button class="btn btn-gold btn-lg" style="flex:1;" onclick="buyNowCurrentProduct('${product.id}')">
            <i class="fas fa-bolt"></i> Buy Now
          </button>
        </div>

        <!-- Key Features List -->
        <div style="border-top:1px solid var(--border-color); padding-top:1.5rem;">
          <h4 style="font-weight:700; margin-bottom:0.75rem;">Product Features:</h4>
          <ul style="list-style:disc; padding-left:1.2rem; color:var(--text-secondary); line-height:1.8;">
            ${(product.features || []).map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div style="margin-top:4rem;">
      <h3 class="section-title" style="margin-bottom:1.5rem;">Related Products</h3>
      <div class="products-grid">
        ${allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4).map(createProductCardHTML).join('')}
      </div>
    </div>
  `;

  window.currentProductObj = product;
  window.selectedProductVariant = selectedVariant;
}

function switchProductImage(thumb, src) {
  document.getElementById('main-product-image').src = src;
  document.querySelectorAll('.thumb-img').forEach(t => t.style.borderColor = 'var(--border-color)');
  thumb.style.borderColor = 'var(--primary-blue-light)';
}

function selectVariant(btn, variantStr) {
  document.querySelectorAll('.variant-opt-btn').forEach(b => b.style.borderColor = 'var(--border-color)');
  btn.style.borderColor = 'var(--primary-blue-light)';
  window.selectedProductVariant = variantStr;
}

function adjustDetailQty(delta) {
  const el = document.getElementById('detail-qty-val');
  let current = parseInt(el.textContent) || 1;
  current += delta;
  if (current < 1) current = 1;
  el.textContent = current;
}

function addCurrentProductToCart(productId) {
  const qty = parseInt(document.getElementById('detail-qty-val').textContent) || 1;
  Cart.addToCart(window.currentProductObj, qty, window.selectedProductVariant);
}

function buyNowCurrentProduct(productId) {
  addCurrentProductToCart(productId);
  window.location.href = 'checkout.html';
}

function addToRecentlyViewed(productId) {
  let viewed = JSON.parse(localStorage.getItem('sse_recently_viewed')) || [];
  viewed = viewed.filter(id => id !== productId);
  viewed.unshift(productId);
  if (viewed.length > 8) viewed.pop();
  localStorage.setItem('sse_recently_viewed', JSON.stringify(viewed));
}

window.switchProductImage = switchProductImage;
window.selectVariant = selectVariant;
window.adjustDetailQty = adjustDetailQty;
window.addCurrentProductToCart = addCurrentProductToCart;
window.buyNowCurrentProduct = buyNowCurrentProduct;
