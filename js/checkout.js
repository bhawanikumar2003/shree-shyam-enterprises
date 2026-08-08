/* ==========================================================================
   SHREE SHYAM ENTERPRISES - WHATSAPP CHECKOUT ENGINE (checkout.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('checkout-form')) {
    renderCheckoutSummary();
    initCheckoutForm();
  }
});

function renderCheckoutSummary() {
  const container = document.getElementById('checkout-items-summary');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const deliveryEl = document.getElementById('checkout-delivery');
  const grandTotalEl = document.getElementById('checkout-grand-total');

  if (!container) return;

  const cart = Cart.getCart();
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px solid var(--border-color); font-size:0.9rem;">
      <div>
        <strong style="color:var(--text-main);">${item.name}</strong>
        <div style="font-size:0.75rem; color:var(--text-muted);">${item.variant} x ${item.quantity}</div>
      </div>
      <div style="font-weight:700; color:var(--primary-blue-light);">₹${item.price * item.quantity}</div>
    </div>
  `).join('');

  const subtotal = Cart.getCartSubtotal();
  const deliveryFee = subtotal >= 500 ? 0 : 30;
  const grandTotal = subtotal + deliveryFee;

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (deliveryEl) deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;

  window.orderCheckoutData = { subtotal, deliveryFee, grandTotal };
}

function initCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const pincode = document.getElementById('cust-pin').value.trim();
    const landmark = document.getElementById('cust-landmark').value.trim();
    const slot = document.getElementById('cust-slot').value;
    const note = document.getElementById('cust-note').value.trim();

    if (!name || !phone || !address || !pincode) {
      showToast('Please fill all required fields!', 'warning');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      showToast('Please enter a valid 10-digit Indian phone number!', 'warning');
      return;
    }

    const cart = Cart.getCart();
    const { subtotal, deliveryFee, grandTotal } = window.orderCheckoutData;

    // Generate Beautiful Structured WhatsApp Message Text
    let waMessage = `🛒 *NEW STORE ORDER - SHREE SHYAM ENTERPRISES*\n`;
    waMessage += `===================================\n\n`;
    waMessage += `👤 *CUSTOMER DETAILS:*\n`;
    waMessage += `• *Name:* ${name}\n`;
    waMessage += `• *Phone:* ${phone}\n`;
    waMessage += `• *Address:* ${address}\n`;
    waMessage += `• *Landmark:* ${landmark || 'N/A'}\n`;
    waMessage += `• *PIN Code:* ${pincode}\n`;
    waMessage += `• *Preferred Slot:* ${slot}\n\n`;

    waMessage += `📦 *ITEMS ORDERED:* (${cart.length} items)\n`;
    cart.forEach((item, index) => {
      waMessage += `${index + 1}. ${item.name} (${item.variant})\n   Qty: ${item.quantity} x ₹${item.price} = *₹${item.price * item.quantity}*\n`;
    });

    waMessage += `\n===================================\n`;
    waMessage += `💰 *ORDER SUMMARY:*\n`;
    waMessage += `• Subtotal: ₹${subtotal}\n`;
    waMessage += `• Taxes & GST: ₹0 (Included)\n`;
    waMessage += `• Delivery Charges: ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}\n`;
    waMessage += `*TOTAL AMOUNT TO PAY: ₹${grandTotal}*\n`;

    if (note) {
      waMessage += `\n📝 *ORDER NOTE:* ${note}\n`;
    }

    waMessage += `\n===================================\n`;
    waMessage += `*Thank you for ordering with Shree Shyam Enterprises!*`;

    const encodedMessage = encodeURIComponent(waMessage);
    const shopWhatsappNumber = '917352383419'; // Business WhatsApp

    showToast('Redirecting to WhatsApp to send your order...', 'success');

    // Clear Cart in LocalStorage after successful order generation
    localStorage.removeItem('sse_cart');
    Cart.updateBadge();

    setTimeout(() => {
      window.open(`https://wa.me/${shopWhatsappNumber}?text=${encodedMessage}`, '_blank');
      window.location.href = 'index.html?order=success';
    }, 1200);
  });
}
