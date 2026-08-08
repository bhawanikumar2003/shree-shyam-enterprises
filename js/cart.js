/* ==========================================================================
   SHREE SHYAM ENTERPRISES - SHOPPING CART & WISHLIST LOGIC (cart.js)
   ========================================================================== */

const Cart = {
  getCart() {
    return JSON.parse(localStorage.getItem('sse_cart')) || [];
  },

  saveCart(cart) {
    localStorage.setItem('sse_cart', JSON.stringify(cart));
    this.updateBadge();
    if (window.renderCartDrawerItems) window.renderCartDrawerItems();
    if (window.renderCartPage) window.renderCartPage();
  },

  addToCart(product, quantity = 1, selectedVariant = null) {
    const cart = this.getCart();
    const variantStr = selectedVariant || (product.variants && product.variants[0]) || product.unit;
    const existingIndex = cart.findIndex(item => item.id === product.id && item.variant === variantStr);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        nameHindi: product.nameHindi || '',
        price: product.price,
        mrp: product.mrp,
        image: Array.isArray(product.images) ? product.images[0] : product.image,
        variant: variantStr,
        quantity: quantity
      });
    }

    this.saveCart(cart);
    if (window.showToast) window.showToast(`Added "${product.name}" to cart!`);
  },

  updateQuantity(productId, variant, newQty) {
    let cart = this.getCart();
    if (newQty <= 0) {
      this.removeFromCart(productId, variant);
      return;
    }
    const index = cart.findIndex(item => item.id === productId && item.variant === variant);
    if (index > -1) {
      cart[index].quantity = newQty;
      this.saveCart(cart);
    }
  },

  removeFromCart(productId, variant) {
    let cart = this.getCart();
    cart = cart.filter(item => !(item.id === productId && item.variant === variant));
    this.saveCart(cart);
    if (window.showToast) window.showToast('Item removed from cart', 'info');
  },

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  getCartSubtotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getCartCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // Save for later functionality
  getSavedItems() {
    return JSON.parse(localStorage.getItem('sse_saved_later')) || [];
  },

  saveForLater(productId, variant) {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(i => i.id === productId && i.variant === variant);
    if (itemIndex > -1) {
      const [item] = cart.splice(itemIndex, 1);
      const saved = this.getSavedItems();
      saved.push(item);
      localStorage.setItem('sse_saved_later', JSON.stringify(saved));
      this.saveCart(cart);
      if (window.showToast) window.showToast('Moved item to "Save for Later"', 'info');
    }
  },

  moveToCart(productId, variant) {
    let saved = this.getSavedItems();
    const itemIndex = saved.findIndex(i => i.id === productId && i.variant === variant);
    if (itemIndex > -1) {
      const [item] = saved.splice(itemIndex, 1);
      localStorage.setItem('sse_saved_later', JSON.stringify(saved));
      this.addToCart(item, item.quantity, item.variant);
    }
  }
};

window.Cart = Cart;

// Global renderer for Slide-out Drawer Cart
window.renderCartDrawerItems = function() {
  const container = document.getElementById('cart-drawer-items');
  const subtotalEl = document.getElementById('cart-drawer-subtotal');
  if (!container) return;

  const cart = Cart.getCart();
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="padding: 3rem 1rem;">
        <i class="fas fa-shopping-basket" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
        <h4 style="font-weight: 700;">Your Cart is Empty</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Explore our store and add daily essentials!</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.name}</h4>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${item.variant}</div>
        <div class="cart-item-price">₹${item.price}</div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', '${item.variant}', ${item.quantity - 1})">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', '${item.variant}', ${item.quantity + 1})">+</button>
          </div>
          <button class="remove-item-btn" onclick="Cart.removeFromCart('${item.id}', '${item.variant}')">
            <i class="fas fa-trash-alt"></i> Remove
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = `₹${Cart.getCartSubtotal()}`;
};

document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();
});
