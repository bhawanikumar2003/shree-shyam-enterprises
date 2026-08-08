/* ==========================================================================
   SHREE SHYAM ENTERPRISES - MONTHLY RASHAN GENERATOR ENGINE (js/rashan.js)
   ========================================================================== */

const RASHAN_PRESETS = {
  2: [
    { id: 'r1', name: 'Aashirvaad Shuddh Chakki Atta', category: 'Grocery', qty: 10, unit: 'kg', pricePerUnit: 44 },
    { id: 'r2', name: 'India Gate Basmati Rice', category: 'Grocery', qty: 10, unit: 'kg', pricePerUnit: 70 },
    { id: 'r3', name: 'Fortune Kachi Ghani Mustard Oil', category: 'Oil', qty: 2, unit: 'Litre', pricePerUnit: 145 },
    { id: 'r4', name: 'Fortune Refined Sunflower Oil', category: 'Oil', qty: 2, unit: 'Litre', pricePerUnit: 125 },
    { id: 'r5', name: 'Tata Salt Vacuum Evaporated', category: 'Spices', qty: 2, unit: 'kg', pricePerUnit: 28 },
    { id: 'r6', name: 'Madhur Pure Sugar', category: 'Grocery', qty: 3, unit: 'kg', pricePerUnit: 46 },
    { id: 'r7', name: 'Toor / Arhar Dal Premium', category: 'Pulses', qty: 2, unit: 'kg', pricePerUnit: 160 },
    { id: 'r8', name: 'Red Label Tea', category: 'Beverage', qty: 500, unit: 'g', pricePerUnit: 0.5 },
    { id: 'r9', name: 'MDH Turmeric & Red Chilli Powder', category: 'Spices', qty: 2, unit: 'Pkt', pricePerUnit: 65 }
  ],
  4: [
    { id: 'r1', name: 'Aashirvaad Shuddh Chakki Atta', category: 'Grocery', qty: 20, unit: 'kg', pricePerUnit: 44 },
    { id: 'r2', name: 'India Gate Basmati Rice', category: 'Grocery', qty: 20, unit: 'kg', pricePerUnit: 70 },
    { id: 'r3', name: 'Fortune Kachi Ghani Mustard Oil', category: 'Oil', qty: 4, unit: 'Litre', pricePerUnit: 145 },
    { id: 'r4', name: 'Fortune Refined Sunflower Oil', category: 'Oil', qty: 3, unit: 'Litre', pricePerUnit: 125 },
    { id: 'r5', name: 'Tata Salt Vacuum Evaporated', category: 'Spices', qty: 3, unit: 'kg', pricePerUnit: 28 },
    { id: 'r6', name: 'Madhur Pure Sugar', category: 'Grocery', qty: 5, unit: 'kg', pricePerUnit: 46 },
    { id: 'r7', name: 'Toor / Arhar Dal Premium', category: 'Pulses', qty: 4, unit: 'kg', pricePerUnit: 160 },
    { id: 'r8', name: 'Red Label Tea', category: 'Beverage', qty: 1, unit: 'kg', pricePerUnit: 480 },
    { id: 'r9', name: 'MDH Turmeric, Coriander & Chilli Pkt', category: 'Spices', qty: 4, unit: 'Pkt', pricePerUnit: 65 }
  ],
  6: [
    { id: 'r1', name: 'Aashirvaad Shuddh Chakki Atta', category: 'Grocery', qty: 35, unit: 'kg', pricePerUnit: 44 },
    { id: 'r2', name: 'India Gate Basmati Rice', category: 'Grocery', qty: 35, unit: 'kg', pricePerUnit: 70 },
    { id: 'r3', name: 'Fortune Kachi Ghani Mustard Oil', category: 'Oil', qty: 6, unit: 'Litre', pricePerUnit: 145 },
    { id: 'r4', name: 'Fortune Refined Sunflower Oil', category: 'Oil', qty: 5, unit: 'Litre', pricePerUnit: 125 },
    { id: 'r5', name: 'Tata Salt Vacuum Evaporated', category: 'Spices', qty: 5, unit: 'kg', pricePerUnit: 28 },
    { id: 'r6', name: 'Madhur Pure Sugar', category: 'Grocery', qty: 8, unit: 'kg', pricePerUnit: 46 },
    { id: 'r7', name: 'Toor / Arhar Dal Premium', category: 'Pulses', qty: 6, unit: 'kg', pricePerUnit: 160 },
    { id: 'r8', name: 'Red Label Tea', category: 'Beverage', qty: 1.5, unit: 'kg', pricePerUnit: 480 },
    { id: 'r9', name: 'MDH Turmeric, Coriander & Chilli Pkt', category: 'Spices', qty: 6, unit: 'Pkt', pricePerUnit: 65 }
  ]
};

let currentRashanList = [];

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('rashan-list-container')) {
    selectFamilyPreset(4);
  }
});

function selectFamilyPreset(size) {
  currentRashanList = JSON.parse(JSON.stringify(RASHAN_PRESETS[size] || RASHAN_PRESETS[4]));
  
  // Highlight active preset button
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`preset-btn-${size}`);
  if (activeBtn) activeBtn.classList.add('active');

  renderRashanList();
}

function updateRashanQty(itemId, newQty) {
  const item = currentRashanList.find(i => i.id === itemId);
  if (item) {
    item.qty = Math.max(0, parseFloat(newQty) || 0);
    renderRashanList();
  }
}

function renderRashanList() {
  const container = document.getElementById('rashan-list-container');
  const totalAmountEl = document.getElementById('rashan-total-amount');

  if (!container) return;

  let grandTotal = 0;

  container.innerHTML = currentRashanList.map(item => {
    const itemTotal = Math.round(item.qty * item.pricePerUnit);
    grandTotal += itemTotal;

    return `
      <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; padding:0.9rem 1rem; border-bottom:1px solid var(--border-color); background:var(--bg-card); gap:1rem;">
        <div style="flex:1; min-width:200px;">
          <strong style="display:block; font-size:1rem;">${item.name}</strong>
          <span style="font-size:0.8rem; color:var(--text-muted);">${item.category} • ₹${item.pricePerUnit} / ${item.unit}</span>
        </div>

        <div style="display:flex; align-items:center; gap:1rem;">
          <div style="display:flex; align-items:center; border:1px solid var(--border-color); border-radius:var(--radius-sm); overflow:hidden;">
            <button type="button" onclick="updateRashanQty('${item.id}', ${item.qty - 1})" style="padding:0.4rem 0.8rem; background:var(--bg-tertiary); color:var(--text-main); font-weight:700;">-</button>
            <span style="padding:0.4rem 0.8rem; font-weight:800; background:var(--bg-card); min-width:45px; text-align:center;">${item.qty} ${item.unit}</span>
            <button type="button" onclick="updateRashanQty('${item.id}', ${item.qty + 1})" style="padding:0.4rem 0.8rem; background:var(--bg-tertiary); color:var(--text-main); font-weight:700;">+</button>
          </div>

          <div style="font-size:1.1rem; font-weight:900; color:var(--primary-blue-light); min-width:80px; text-align:right;">
            ₹${itemTotal}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (totalAmountEl) totalAmountEl.textContent = `₹${grandTotal}`;
}

function sendRashanOrderToWhatsApp() {
  const custName = (document.getElementById('rashan-cust-name')?.value || '').trim();
  const custPhone = (document.getElementById('rashan-cust-phone')?.value || '').trim();
  const custAddress = (document.getElementById('rashan-cust-address')?.value || '').trim();

  if (!custName || !custPhone) {
    showToast('Please enter your Name and Mobile Number!', 'danger');
    return;
  }

  const activeItems = currentRashanList.filter(i => i.qty > 0);
  if (activeItems.length === 0) {
    showToast('Your Rashan list is empty!', 'danger');
    return;
  }

  let total = 0;
  let itemsStr = activeItems.map((item, idx) => {
    const itemTotal = Math.round(item.qty * item.pricePerUnit);
    total += itemTotal;
    return `${idx + 1}. *${item.name}* - ${item.qty} ${item.unit} (₹${itemTotal})`;
  }).join('\n');

  const message = `🌾 *SHREE SHYAM ENTERPRISES - MONTHLY RASHAN ORDER* 🌾\n\n` +
    `👤 *Customer Name:* ${custName}\n` +
    `📞 *Mobile:* ${custPhone}\n` +
    `📍 *Delivery Address:* ${custAddress || 'Barkagaon Devriya Road'}\n\n` +
    `📦 *MONTHLY GROCERY RASHAN LIST:*\n` +
    `${itemsStr}\n\n` +
    `-----------------------------------\n` +
    `💰 *ESTIMATED TOTAL BILL: ₹${total}*\n` +
    `-----------------------------------\n\n` +
    `Kripya yeh rashan order pack karke delivery address par bhej dein.\n` +
    `Shop Address: Barkagaon Devriya Road (Tiwari Niwash Bhawan)`;

  const whatsappUrl = `https://wa.me/917352383419?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

window.selectFamilyPreset = selectFamilyPreset;
window.updateRashanQty = updateRashanQty;
window.sendRashanOrderToWhatsApp = sendRashanOrderToWhatsApp;
