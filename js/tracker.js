/* ==========================================================================
   SHREE SHYAM ENTERPRISES - LIVE ORDER TRACKER ENGINE (js/tracker.js)
   ========================================================================== */

function searchOrderStatus(e) {
  if (e) e.preventDefault();

  const query = (document.getElementById('tracker-search-input')?.value || '').trim();
  const resultDiv = document.getElementById('tracker-result-card');

  if (!query) {
    showToast('Please enter your Mobile Number or Order ID!', 'info');
    return;
  }

  if (!resultDiv) return;

  // Mock live status generator based on search input
  const orderId = query.length === 10 ? `ORD-${query.slice(-4)}-${Math.floor(Math.random()*90 + 10)}` : query;
  
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.75rem; box-shadow:var(--shadow-md); margin-top:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1.5rem; flex-wrap:wrap; gap:0.5rem;">
        <div>
          <h3 style="font-size:1.3rem; font-weight:800; color:var(--primary-blue-light);">Order Status: ${orderId}</h3>
          <span style="font-size:0.85rem; color:var(--text-muted);">Destination: Barkagaon Devriya Road</span>
        </div>
        <span class="badge badge-stock" style="font-size:0.9rem; padding:0.4rem 0.8rem;"><i class="fas fa-motorcycle"></i> Out for Delivery</span>
      </div>

      <!-- Stepper Progress Timeline -->
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:0.5rem; text-align:center; position:relative; margin: 2rem 0;">
        <div>
          <div style="width:40px; height:40px; border-radius:50%; background:var(--success-green); color:#FFF; display:flex; align-items:center; justify-content:center; margin:0 auto 0.5rem auto;">
            <i class="fas fa-check"></i>
          </div>
          <strong style="font-size:0.85rem; display:block;">Order Received</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">07:15 PM</span>
        </div>
        <div>
          <div style="width:40px; height:40px; border-radius:50%; background:var(--success-green); color:#FFF; display:flex; align-items:center; justify-content:center; margin:0 auto 0.5rem auto;">
            <i class="fas fa-box-open"></i>
          </div>
          <strong style="font-size:0.85rem; display:block;">Packed at Shop</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">07:25 PM</span>
        </div>
        <div>
          <div style="width:40px; height:40px; border-radius:50%; background:var(--primary-blue-light); color:#FFF; display:flex; align-items:center; justify-content:center; margin:0 auto 0.5rem auto;" class="pulse-glow">
            <i class="fas fa-biking"></i>
          </div>
          <strong style="font-size:0.85rem; display:block; color:var(--primary-blue-light);">Out For Delivery</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">07:35 PM</span>
        </div>
        <div>
          <div style="width:40px; height:40px; border-radius:50%; background:var(--bg-tertiary); color:var(--text-muted); display:flex; align-items:center; justify-content:center; margin:0 auto 0.5rem auto;">
            <i class="fas fa-home"></i>
          </div>
          <strong style="font-size:0.85rem; display:block; color:var(--text-muted);">Delivered</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">Est. 15 Mins</span>
        </div>
      </div>

      <div style="background:var(--bg-tertiary); border-radius:var(--radius-md); padding:1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <strong style="font-size:0.9rem; display:block;">Delivery Agent: Kaushal Tiwari / Shop Partner</strong>
          <span style="font-size:0.8rem; color:var(--text-muted);">Muzaffarpur • Barkagaon Devriya Road</span>
        </div>
        <a href="tel:7352383419" class="btn btn-primary btn-sm"><i class="fas fa-phone-alt"></i> Call Store (7352383419)</a>
      </div>
    </div>
  `;
}

window.searchOrderStatus = searchOrderStatus;
