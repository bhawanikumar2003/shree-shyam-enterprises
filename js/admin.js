/* ==========================================================================
   SHREE SHYAM ENTERPRISES - ADMIN CONTROL PANEL ENGINE (admin.js)
   ========================================================================== */

const ADMIN_PASSCODE = "431242178704";
let adminProducts = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', async () => {
  initAdminAuth();
});

function initAdminAuth() {
  const loginSection = document.getElementById('admin-login-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const passInput = document.getElementById('admin-passcode-input');
  const loginBtn = document.getElementById('admin-login-btn');
  const logoutBtn = document.getElementById('admin-logout-btn');

  // Check if session authenticated
  const isAuth = sessionStorage.getItem('sse_admin_auth');
  if (isAuth === 'true') {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    loadAdminDashboard();
  } else {
    if (loginSection) loginSection.style.display = 'flex';
    if (dashboardSection) dashboardSection.style.display = 'none';
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const pin = passInput ? passInput.value.trim() : '';
      if (pin === ADMIN_PASSCODE) {
        sessionStorage.setItem('sse_admin_auth', 'true');
        if (loginSection) loginSection.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'block';
        showToast('Admin Access Granted!', 'success');
        loadAdminDashboard();
      } else {
        showToast('Incorrect Passcode! Access Denied.', 'danger');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('sse_admin_auth');
      window.location.reload();
    });
  }
}

async function loadAdminDashboard() {
  const { products } = await loadProductData();
  adminProducts = products;
  renderAdminMetrics();
  renderAdminTable(adminProducts);
  initAdminFilters();
}

function renderAdminMetrics() {
  const totalEl = document.getElementById('metric-total-prod');
  const outStockEl = document.getElementById('metric-out-stock');
  const offersEl = document.getElementById('metric-offers');

  if (totalEl) totalEl.textContent = adminProducts.length;
  if (outStockEl) {
    const outCount = adminProducts.filter(p => p.availability === 'out-of-stock' || p.stockCount === 0).length;
    outStockEl.textContent = outCount;
  }
  if (offersEl) {
    const offerCount = adminProducts.filter(p => p.discount && p.discount !== 'MRP').length;
    offersEl.textContent = offerCount;
  }
}

function renderAdminTable(productsList) {
  const tbody = document.getElementById('admin-products-tbody');
  if (!tbody) return;

  if (productsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:2rem;">No products found matching your search.</td></tr>`;
    return;
  }

  tbody.innerHTML = productsList.map(p => {
    const img = Array.isArray(p.images) ? p.images[0] : (p.image || 'assets/products/grocery_atta.jpg');
    return `
      <tr>
        <td style="padding:0.75rem;"><img src="${img}" style="width:50px; height:50px; object-fit:contain; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#FFF;"></td>
        <td style="padding:0.75rem;">
          <strong style="display:block;">${p.name}</strong>
          <span style="font-family:var(--font-hindi); font-size:0.85rem; color:var(--text-muted);">${p.nameHindi || ''}</span>
        </td>
        <td style="padding:0.75rem;"><span class="badge badge-gold">${p.category}</span></td>
        <td style="padding:0.75rem;"><strong style="color:var(--primary-blue-light);">₹${p.price}</strong> ${p.mrp > p.price ? `<span style="font-size:0.8rem; text-decoration:line-through; color:var(--text-muted);">₹${p.mrp}</span>` : ''}</td>
        <td style="padding:0.75rem;"><span class="badge badge-discount">${p.discount || 'MRP'}</span></td>
        <td style="padding:0.75rem;"><span class="badge ${p.availability === 'out-of-stock' ? 'badge-discount' : 'badge-stock'}">${p.availability || 'in-stock'}</span></td>
        <td style="padding:0.75rem;">
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="editProductModal('${p.id}')" title="Edit Product"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-sm" onclick="deleteProduct('${p.id}')" style="background:var(--danger-red); color:#FFF;" title="Delete Product"><i class="fas fa-trash-alt"></i> Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function initAdminFilters() {
  const searchInput = document.getElementById('admin-search-input');
  const catSelect = document.getElementById('admin-category-select');

  if (searchInput) searchInput.addEventListener('input', filterAdminTable);
  if (catSelect) catSelect.addEventListener('change', filterAdminTable);
}

function filterAdminTable() {
  const query = (document.getElementById('admin-search-input')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('admin-category-select')?.value || 'all';

  const filtered = adminProducts.filter(p => {
    if (cat !== 'all' && p.category !== cat) return false;
    if (query) {
      const matchName = p.name.toLowerCase().includes(query);
      const matchHindi = p.nameHindi && p.nameHindi.includes(query);
      const matchBrand = p.brand && p.brand.toLowerCase().includes(query);
      if (!matchName && !matchHindi && !matchBrand) return false;
    }
    return true;
  });

  renderAdminTable(filtered);
}

function openAddProductModal() {
  editingProductId = null;
  document.getElementById('product-form').reset();
  document.getElementById('modal-title-text').textContent = 'Add New Product';
  document.getElementById('admin-prod-modal').classList.add('active');
}

function editProductModal(productId) {
  const product = adminProducts.find(p => String(p.id).trim() === String(productId).trim());
  if (!product) return;

  editingProductId = product.id;
  document.getElementById('modal-title-text').textContent = 'Edit Product';
  document.getElementById('adm-name').value = product.name || '';
  document.getElementById('adm-hindi-name').value = product.nameHindi || '';
  document.getElementById('adm-brand').value = product.brand || '';
  document.getElementById('adm-category').value = product.category || 'groceries';
  document.getElementById('adm-unit').value = product.unit || '';
  document.getElementById('adm-price').value = product.price || 0;
  document.getElementById('adm-mrp').value = product.mrp || 0;
  document.getElementById('adm-stock').value = product.stockCount || 50;
  document.getElementById('adm-availability').value = product.availability || 'in-stock';
  document.getElementById('adm-image-url').value = Array.isArray(product.images) ? product.images[0] : (product.image || '');
  document.getElementById('adm-desc').value = product.description || '';

  document.getElementById('admin-prod-modal').classList.add('active');
}

function closeAdminProductModal() {
  document.getElementById('admin-prod-modal').classList.remove('active');
}

function saveProductFromForm(e) {
  e.preventDefault();

  const name = document.getElementById('adm-name').value.trim();
  const nameHindi = document.getElementById('adm-hindi-name').value.trim();
  const brand = document.getElementById('adm-brand').value.trim();
  const category = document.getElementById('adm-category').value;
  const unit = document.getElementById('adm-unit').value.trim();
  const price = parseFloat(document.getElementById('adm-price').value) || 0;
  const mrp = parseFloat(document.getElementById('adm-mrp').value) || price;
  const stockCount = parseInt(document.getElementById('adm-stock').value) || 50;
  const availability = document.getElementById('adm-availability').value;
  const imageUrl = document.getElementById('adm-image-url').value.trim() || 'assets/products/grocery_atta.jpg';
  const description = document.getElementById('adm-desc').value.trim();

  // Auto calculate discount label
  let discountStr = 'MRP';
  if (mrp > price) {
    const diffPct = (((mrp - price) / mrp) * 100).toFixed(1);
    discountStr = `${diffPct}% OFF`;
  }

  let customProducts = JSON.parse(localStorage.getItem('sse_custom_products')) || [];

  if (editingProductId) {
    const editIdStr = String(editingProductId).trim();
    const index = adminProducts.findIndex(p => String(p.id).trim() === editIdStr);
    
    const updatedProd = {
      ...(adminProducts[index] || {}),
      id: editingProductId,
      name, nameHindi, brand, category, unit, price, mrp, stockCount, availability,
      discount: discountStr,
      images: [imageUrl],
      description,
      features: [name],
      specifications: { "Brand": brand, "Unit": unit },
      variants: [unit]
    };

    if (index > -1) adminProducts[index] = updatedProd;

    const customIdx = customProducts.findIndex(p => String(p.id).trim() === editIdStr);
    if (customIdx > -1) {
      customProducts[customIdx] = updatedProd;
    } else {
      customProducts.push(updatedProd);
    }

  } else {
    // Create New Product
    const newId = `prod-cust-${Date.now()}`;
    const newProduct = {
      id: newId,
      name, nameHindi, brand, category, unit, price, mrp, stockCount, availability,
      discount: discountStr,
      rating: 5.0,
      reviewsCount: 1,
      featured: true,
      bestseller: false,
      images: [imageUrl],
      description,
      features: [name],
      specifications: { "Brand": brand, "Unit": unit },
      variants: [unit]
    };
    adminProducts.unshift(newProduct);
    customProducts.unshift(newProduct);
  }

  localStorage.setItem('sse_custom_products', JSON.stringify(customProducts));
  showToast(editingProductId ? 'Product Updated! Live on website.' : 'New Product Added! Live on website.', 'success');
  closeAdminProductModal();
  renderAdminMetrics();
  renderAdminTable(adminProducts);
}

function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    const delIdStr = String(productId).trim();
    adminProducts = adminProducts.filter(p => String(p.id).trim() !== delIdStr);
    
    let customProducts = JSON.parse(localStorage.getItem('sse_custom_products')) || [];
    customProducts = customProducts.filter(p => String(p.id).trim() !== delIdStr);
    localStorage.setItem('sse_custom_products', JSON.stringify(customProducts));

    let deletedProducts = JSON.parse(localStorage.getItem('sse_deleted_products')) || [];
    if (!deletedProducts.includes(delIdStr)) deletedProducts.push(delIdStr);
    localStorage.setItem('sse_deleted_products', JSON.stringify(deletedProducts));

    showToast('Product Deleted Successfully!', 'info');
    renderAdminMetrics();
    renderAdminTable(adminProducts);
  }
}

// 1-Click Export JSON File for Backup/Deployment
function exportUpdatedJson() {
  const jsonStr = JSON.stringify(adminProducts, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('products.json Exported! Replace data/products.json to save permanently.', 'success');
}

// Reset Catalog to Original
function resetAdminProductsToDefault() {
  if (confirm('Reset custom changes and restore default products catalog?')) {
    localStorage.removeItem('sse_custom_products');
    localStorage.removeItem('sse_deleted_products');
    window.location.reload();
  }
}

window.openAddProductModal = openAddProductModal;
window.editProductModal = editProductModal;
window.closeAdminProductModal = closeAdminProductModal;
window.saveProductFromForm = saveProductFromForm;
window.deleteProduct = deleteProduct;
window.exportUpdatedJson = exportUpdatedJson;
window.resetAdminProductsToDefault = resetAdminProductsToDefault;
