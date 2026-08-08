/* ==========================================================================
   SHREE SHYAM ENTERPRISES - SUPERCHARGED 5-TAB ADMIN ENGINE (js/admin.js)
   ========================================================================== */

const ADMIN_PASSCODE = "431242178704";
let adminProducts = [];
let editingProductId = null;
let activeAdminTab = 'overview';

document.addEventListener('DOMContentLoaded', async () => {
  initAdminAuth();
});

function initAdminAuth() {
  const loginSection = document.getElementById('admin-login-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const passInput = document.getElementById('admin-passcode-input');
  const loginBtn = document.getElementById('admin-login-btn');
  const logoutBtn = document.getElementById('admin-logout-btn');

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
  renderKhataTab();
  renderGalleryTab();
}

function switchAdminTab(tabName) {
  activeAdminTab = tabName;
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(content => content.style.display = 'none');

  const targetBtn = document.getElementById(`tab-btn-${tabName}`);
  const targetContent = document.getElementById(`tab-content-${tabName}`);

  if (targetBtn) targetBtn.classList.add('active');
  if (targetContent) targetContent.style.display = 'block';

  if (tabName === 'khata') renderKhataTab();
  if (tabName === 'gallery') renderGalleryTab();
}

function renderAdminMetrics() {
  const totalEl = document.getElementById('metric-total-prod');
  const outStockEl = document.getElementById('metric-out-stock');
  const offersEl = document.getElementById('metric-offers');
  const khataDueEl = document.getElementById('metric-khata-due');

  if (totalEl) totalEl.textContent = adminProducts.length;
  if (outStockEl) {
    const outCount = adminProducts.filter(p => p.availability === 'out-of-stock' || p.stockCount === 0).length;
    outStockEl.textContent = outCount;
  }
  if (offersEl) {
    const offerCount = adminProducts.filter(p => p.discount && p.discount !== 'MRP').length;
    offersEl.textContent = offerCount;
  }
  if (khataDueEl) {
    const customers = KhataEngine.getCustomers();
    let totalDue = 0;
    customers.forEach(c => {
      const summary = KhataEngine.getCustomerSummary(c.id);
      totalDue += Math.max(0, summary.netDue);
    });
    khataDueEl.textContent = `₹${totalDue}`;
  }
}

/* --------------------------------------------------------------------------
   PRODUCTS TAB LOGIC
   -------------------------------------------------------------------------- */
function renderAdminTable(productsList) {
  const tbody = document.getElementById('admin-products-tbody');
  if (!tbody) return;

  if (productsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:2rem;">No products found matching search.</td></tr>`;
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
            <button class="btn btn-outline btn-sm" onclick="editProductModal('${p.id}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-sm" onclick="deleteProduct('${p.id}')" style="background:var(--danger-red); color:#FFF;"><i class="fas fa-trash-alt"></i> Delete</button>
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
    if (customIdx > -1) customProducts[customIdx] = updatedProd;
    else customProducts.push(updatedProd);

  } else {
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

function importJsonProductsFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedProducts = JSON.parse(e.target.result);
      if (Array.isArray(importedProducts)) {
        let customProducts = JSON.parse(localStorage.getItem('sse_custom_products')) || [];
        const customMap = new Map(customProducts.map(p => [String(p.id).trim(), p]));

        importedProducts.forEach(p => {
          if (p && p.id) customMap.set(String(p.id).trim(), p);
        });

        const mergedCustom = Array.from(customMap.values());
        localStorage.setItem('sse_custom_products', JSON.stringify(mergedCustom));

        showToast(`Successfully imported ${importedProducts.length} products! Refreshing...`, 'success');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showToast('Invalid JSON file format!', 'danger');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to parse JSON file!', 'danger');
    }
  };
  reader.readAsText(file);
}

/* --------------------------------------------------------------------------
   OKCREDIT KHATA TAB LOGIC & ADVANCED CONTROLS
   -------------------------------------------------------------------------- */
let selectedKhataCustId = null;

function renderKhataTab() {
  const customers = KhataEngine.getCustomers();
  const custContainer = document.getElementById('khata-customer-list');
  const detailsContainer = document.getElementById('khata-customer-details');

  if (!custContainer) return;

  if (customers.length === 0) {
    custContainer.innerHTML = `<p style="padding:1rem; color:var(--text-muted);">No khata customers added yet.</p>`;
    return;
  }

  custContainer.innerHTML = customers.map(c => {
    const summary = KhataEngine.getCustomerSummary(c.id);
    const isDue = summary.netDue > 0;
    return `
      <div onclick="selectKhataCustomer('${c.id}')" style="display:flex; align-items:center; gap:0.75rem; padding:0.85rem; border-bottom:1px solid var(--border-color); cursor:pointer; background:${selectedKhataCustId === c.id ? 'var(--primary-blue-light)' : 'transparent'}; color:${selectedKhataCustId === c.id ? '#FFF' : 'inherit'}; border-radius:var(--radius-sm); position:relative;">
        <img src="${c.avatar}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color);">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:0.3rem;">
            <strong style="font-size:0.95rem;">${c.name}</strong>
            ${c.isDefaulter ? `<span class="badge badge-discount" style="font-size:0.65rem; padding:0.1rem 0.3rem;">Defaulter</span>` : ''}
            ${c.isBlocked ? `<span class="badge" style="background:#64748B; color:#FFF; font-size:0.65rem; padding:0.1rem 0.3rem;">Blocked</span>` : ''}
          </div>
          <span style="font-size:0.8rem; opacity:0.8;">${c.mobile}</span>
        </div>
        <div style="text-align:right;">
          <span style="font-weight:900; font-size:1rem; color:${isDue ? (selectedKhataCustId === c.id ? '#FFD700' : 'var(--danger-red)') : 'var(--success-green)'};">₹${summary.netDue}</span>
          <span style="display:block; font-size:0.7rem; opacity:0.7;">${isDue ? 'Due (बाकी)' : 'Clear'}</span>
        </div>
      </div>
    `;
  }).join('');

  if (!selectedKhataCustId && customers.length > 0) {
    selectedKhataCustId = customers[0].id;
  }

  if (selectedKhataCustId) {
    renderKhataCustomerDetails(selectedKhataCustId);
  }
}

function selectKhataCustomer(id) {
  selectedKhataCustId = id;
  renderKhataTab();
}

function renderKhataCustomerDetails(id) {
  const customers = KhataEngine.getCustomers();
  const cust = customers.find(c => c.id === id);
  const container = document.getElementById('khata-customer-details');

  if (!cust || !container) return;

  const summary = KhataEngine.getCustomerSummary(id);
  const txs = KhataEngine.getTransactions().filter(t => t.customerId === id);
  const waUrl = KhataEngine.generateWhatsAppReminderLink(id);
  const waDefaulterUrl = KhataEngine.generateWhatsAppDefaulterNoticeLink(id);

  container.innerHTML = `
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem;">
      
      <!-- Customer Info Header & Status Badges -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1.25rem; flex-wrap:wrap; gap:1rem;">
        <div style="display:flex; align-items:center; gap:1rem;">
          <img src="${cust.avatar}" style="width:65px; height:65px; border-radius:50%; object-fit:cover; border:2px solid var(--primary-blue-light);">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <h3 style="font-size:1.3rem; font-weight:800;">${cust.name}</h3>
              ${cust.isDefaulter ? `<span class="badge badge-discount"><i class="fas fa-exclamation-triangle"></i> DEFAULTER (डिफॉल्टर)</span>` : ''}
              ${cust.isBlocked ? `<span class="badge" style="background:#64748B; color:#FFF;"><i class="fas fa-ban"></i> BLOCKED (खाता बंद)</span>` : ''}
            </div>
            <span style="font-size:0.85rem; color:var(--text-muted);"><i class="fas fa-phone-alt"></i> ${cust.mobile} • ${cust.address || 'Barkagaon'}</span>
            ${cust.dueDate ? `<div style="font-size:0.8rem; font-weight:700; color:var(--accent-gold); margin-top:0.2rem;"><i class="fas fa-calendar-alt"></i> Payment Due Date: ${cust.dueDate}</div>` : ''}
          </div>
        </div>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-sm"><i class="fab fa-whatsapp"></i> Bill Statement</a>
          ${cust.isDefaulter ? `<a href="${waDefaulterUrl}" target="_blank" class="btn btn-sm" style="background:var(--danger-red); color:#FFF;"><i class="fas fa-exclamation-circle"></i> Send Defaulter Notice</a>` : ''}
        </div>
      </div>

      <!-- Advanced Khatabook Management Action Buttons -->
      <div style="background:var(--bg-tertiary); padding:0.75rem 1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center; justify-content:space-between;">
        <span style="font-weight:700; font-size:0.85rem; color:var(--text-muted);">Customer Controls:</span>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="toggleDefaulterStatus('${cust.id}')">
            <i class="fas fa-user-slash" style="color:var(--danger-red);"></i> ${cust.isDefaulter ? 'Remove Defaulter Tag' : 'Mark as Defaulter (🔴)'}
          </button>
          <button class="btn btn-outline btn-sm" onclick="toggleBlockCustomerStatus('${cust.id}')">
            <i class="fas fa-ban" style="color:#64748B;"></i> ${cust.isBlocked ? 'Unblock Account' : 'Block Account (🚫)'}
          </button>
          <button class="btn btn-sm" style="background:var(--danger-red); color:#FFF;" onclick="deleteKhataCustomer('${cust.id}')">
            <i class="fas fa-trash-alt"></i> Delete Customer
          </button>
        </div>
      </div>

      <!-- Net Balance Cards -->
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
        <div style="background:rgba(239,68,68,0.1); border:1px solid var(--danger-red); padding:1rem; border-radius:var(--radius-md); text-align:center;">
          <span style="font-size:0.75rem; font-weight:700; color:var(--danger-red); text-transform:uppercase;">Total Udhar (उधार दिया)</span>
          <div style="font-size:1.5rem; font-weight:900; color:var(--danger-red);">₹${summary.totalUdhar}</div>
        </div>
        <div style="background:rgba(34,197,94,0.1); border:1px solid var(--success-green); padding:1rem; border-radius:var(--radius-md); text-align:center;">
          <span style="font-size:0.75rem; font-weight:700; color:var(--success-green); text-transform:uppercase;">Total Jama (जमा लिया)</span>
          <div style="font-size:1.5rem; font-weight:900; color:var(--success-green);">₹${summary.totalJama}</div>
        </div>
        <div style="background:var(--bg-tertiary); border:1px solid var(--border-color); padding:1rem; border-radius:var(--radius-md); text-align:center;">
          <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Net Remaining Due</span>
          <div style="font-size:1.5rem; font-weight:900; color:var(--primary-blue-light);">₹${summary.netDue}</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
        <button class="btn" style="background:var(--danger-red); color:#FFF; justify-content:center;" onclick="openKhataTransactionModal('${cust.id}', 'udhar')">
          <i class="fas fa-minus-circle"></i> + Gave Udhar (उधार दिया)
        </button>
        <button class="btn" style="background:var(--success-green); color:#FFF; justify-content:center;" onclick="openKhataTransactionModal('${cust.id}', 'jama')">
          <i class="fas fa-plus-circle"></i> - Received Jama (जमा लिया)
        </button>
      </div>

      <!-- Transaction Ledger History -->
      <h4 style="font-size:1.05rem; font-weight:800; margin-bottom:0.75rem;">Transaction Ledger History</h4>
      <div style="max-height:300px; overflow-y:auto; border:1px solid var(--border-color); border-radius:var(--radius-md);">
        ${txs.length === 0 ? `<p style="padding:1rem; text-align:center; color:var(--text-muted);">No transaction entries recorded yet.</p>` :
          txs.map(t => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; border-bottom:1px solid var(--border-color);">
              <div>
                <strong style="display:block; font-size:0.95rem;">${t.note}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted);">${t.date}</span>
              </div>
              <div style="text-align:right;">
                <span style="font-weight:900; font-size:1.1rem; color:${t.type === 'udhar' ? 'var(--danger-red)' : 'var(--success-green)'};">
                  ${t.type === 'udhar' ? '+ ₹' : '- ₹'}${t.amount}
                </span>
                <span style="display:block; font-size:0.7rem; font-weight:700; text-transform:uppercase; color:${t.type === 'udhar' ? 'var(--danger-red)' : 'var(--success-green)'};">${t.type === 'udhar' ? 'Gave Udhar' : 'Received Jama'}</span>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
}

function toggleDefaulterStatus(id) {
  KhataEngine.toggleDefaulter(id);
  showToast('Defaulter Status Updated!', 'info');
  renderKhataTab();
}

function toggleBlockCustomerStatus(id) {
  KhataEngine.toggleBlock(id);
  showToast('Customer Block Status Updated!', 'info');
  renderKhataTab();
}

function deleteKhataCustomer(id) {
  if (confirm('Are you sure you want to delete this customer and all their ledger history?')) {
    KhataEngine.deleteCustomer(id);
    selectedKhataCustId = null;
    showToast('Khata Customer Deleted!', 'info');
    renderKhataTab();
    renderAdminMetrics();
  }
}

function openAddCustomerModal() {
  document.getElementById('add-cust-modal').classList.add('active');
}
function closeAddCustomerModal() {
  document.getElementById('add-cust-modal').classList.remove('active');
}

function saveNewKhataCustomer(e) {
  e.preventDefault();
  const name = document.getElementById('khata-cust-name').value.trim();
  const mobile = document.getElementById('khata-cust-mobile').value.trim();
  const address = document.getElementById('khata-cust-address').value.trim();
  const limit = document.getElementById('khata-cust-limit').value || 5000;
  const dueDate = document.getElementById('khata-cust-duedate')?.value || '';

  if (!name || !mobile) {
    showToast('Customer Name and Mobile number are required!', 'danger');
    return;
  }

  const newCust = KhataEngine.addCustomer(name, mobile, address, limit, dueDate);
  selectedKhataCustId = newCust.id;
  showToast('New Khata Customer Added!', 'success');
  closeAddCustomerModal();
  renderKhataTab();
  renderAdminMetrics();
}

let activeTxCustId = null;
let activeTxType = 'udhar';

function openKhataTransactionModal(custId, type) {
  activeTxCustId = custId;
  activeTxType = type;

  document.getElementById('tx-modal-title').textContent = type === 'udhar' ? 'Record Gave Udhar (उधार दिया)' : 'Record Received Jama (जमा लिया)';
  document.getElementById('khata-tx-amount').value = '';
  document.getElementById('khata-tx-note').value = '';
  document.getElementById('khata-tx-modal').classList.add('active');
}
function closeKhataTxModal() {
  document.getElementById('khata-tx-modal').classList.remove('active');
}

function saveKhataTransaction(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('khata-tx-amount').value) || 0;
  const note = document.getElementById('khata-tx-note').value.trim();

  if (amount <= 0) {
    showToast('Please enter a valid transaction amount!', 'danger');
    return;
  }

  const res = KhataEngine.addTransaction(activeTxCustId, activeTxType, amount, note);
  if (res) {
    showToast(activeTxType === 'udhar' ? 'Udhar Recorded!' : 'Payment Jama Recorded!', 'success');
    closeKhataTxModal();
    renderKhataTab();
    renderAdminMetrics();
  }
}

/* --------------------------------------------------------------------------
   GALLERY PHOTO TAB LOGIC
   -------------------------------------------------------------------------- */
function getGalleryItems() {
  return JSON.parse(localStorage.getItem('sse_custom_gallery')) || [
    { title: "Store Front & Exterior Signboard", category: "Store", img: "assets/images/shop_exterior.jpg" },
    { title: "Supermarket Aisles & Groceries", category: "Store", img: "assets/banners/hero_banner.jpg" },
    { title: "Digital Photo Printing & Xerox Desk", category: "Services", img: "assets/images/printing_service.jpg" },
    { title: "Official LIC Policy Consultation Corner", category: "LIC", img: "assets/banners/lic_banner.jpg" }
  ];
}

function renderGalleryTab() {
  const container = document.getElementById('admin-gallery-grid');
  if (!container) return;

  const items = getGalleryItems();

  container.innerHTML = items.map((item, idx) => `
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden; position:relative;">
      <img src="${item.img}" style="width:100%; height:140px; object-fit:cover;">
      <div style="padding:0.75rem;">
        <strong style="display:block; font-size:0.9rem;">${item.title}</strong>
        <span class="badge badge-gold" style="margin-top:0.3rem;">${item.category}</span>
      </div>
      <button onclick="deleteGalleryPhoto(${idx})" style="position:absolute; top:8px; right:8px; background:var(--danger-red); color:#FFF; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
    </div>
  `).join('');
}

function openAddGalleryModal() {
  document.getElementById('add-gallery-modal').classList.add('active');
}
function closeAddGalleryModal() {
  document.getElementById('add-gallery-modal').classList.remove('active');
}

function saveNewGalleryPhoto(e) {
  e.preventDefault();
  const title = document.getElementById('gal-title').value.trim();
  const category = document.getElementById('gal-category').value;
  const imgUrl = document.getElementById('gal-img-url').value.trim();

  if (!title || !imgUrl) {
    showToast('Photo Title and Image URL are required!', 'danger');
    return;
  }

  const items = getGalleryItems();
  items.unshift({ title, category, img: imgUrl });
  localStorage.setItem('sse_custom_gallery', JSON.stringify(items));

  showToast('New Photo Added to Gallery!', 'success');
  closeAddGalleryModal();
  renderGalleryTab();
}

function deleteGalleryPhoto(idx) {
  if (confirm('Delete this photo from Gallery?')) {
    const items = getGalleryItems();
    items.splice(idx, 1);
    localStorage.setItem('sse_custom_gallery', JSON.stringify(items));
    showToast('Photo Deleted!', 'info');
    renderGalleryTab();
  }
}

window.switchAdminTab = switchAdminTab;
window.openAddCustomerModal = openAddCustomerModal;
window.closeAddCustomerModal = closeAddCustomerModal;
window.saveNewKhataCustomer = saveNewKhataCustomer;
window.selectKhataCustomer = selectKhataCustomer;
window.toggleDefaulterStatus = toggleDefaulterStatus;
window.toggleBlockCustomerStatus = toggleBlockCustomerStatus;
window.deleteKhataCustomer = deleteKhataCustomer;
window.openKhataTransactionModal = openKhataTransactionModal;
window.closeKhataTxModal = closeKhataTxModal;
window.saveKhataTransaction = saveKhataTransaction;
window.openAddGalleryModal = openAddGalleryModal;
window.closeAddGalleryModal = closeAddGalleryModal;
window.saveNewGalleryPhoto = saveNewGalleryPhoto;
window.deleteGalleryPhoto = deleteGalleryPhoto;
window.exportUpdatedJson = exportUpdatedJson;
window.importJsonProductsFile = importJsonProductsFile;
