/* ==========================================================================
   SHREE SHYAM ENTERPRISES - OKCREDIT / KHATABOOK UDHAR ENGINE (js/khata.js)
   ========================================================================== */

class KhataEngine {
  static getCustomers() {
    return JSON.parse(localStorage.getItem('sse_khata_customers')) || [
      {
        id: 'cust-101',
        name: 'Ramesh Kumar',
        mobile: '9801234567',
        address: 'Barkagaon Devriya Road',
        creditLimit: 5000,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      },
      {
        id: 'cust-102',
        name: 'Suresh Tiwari',
        mobile: '9123456789',
        address: 'Near Shiv Mandir, Barkagaon',
        creditLimit: 10000,
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
      }
    ];
  }

  static getTransactions() {
    return JSON.parse(localStorage.getItem('sse_khata_transactions')) || [
      {
        id: 'tx-1',
        customerId: 'cust-101',
        type: 'udhar', // 'udhar' (Gave credit - Red) or 'jama' (Received payment - Green)
        amount: 850,
        note: 'Grocery & Atta 5kg',
        date: '2026-08-01 10:30 AM'
      },
      {
        id: 'tx-2',
        customerId: 'cust-101',
        type: 'jama',
        amount: 500,
        note: 'Cash payment',
        date: '2026-08-04 06:15 PM'
      }
    ];
  }

  static saveCustomers(customers) {
    localStorage.setItem('sse_khata_customers', JSON.stringify(customers));
  }

  static saveTransactions(txs) {
    localStorage.setItem('sse_khata_transactions', JSON.stringify(txs));
  }

  static getCustomerSummary(customerId) {
    const txs = this.getTransactions().filter(t => t.customerId === customerId);
    let totalUdhar = 0;
    let totalJama = 0;

    txs.forEach(t => {
      if (t.type === 'udhar') totalUdhar += parseFloat(t.amount) || 0;
      else if (t.type === 'jama') totalJama += parseFloat(t.amount) || 0;
    });

    const netDue = totalUdhar - totalJama;
    return { totalUdhar, totalJama, netDue, count: txs.length };
  }

  static addCustomer(name, mobile, address = '', creditLimit = 5000, avatar = '') {
    const customers = this.getCustomers();
    const newCust = {
      id: `cust-${Date.now()}`,
      name,
      mobile,
      address,
      creditLimit: parseFloat(creditLimit) || 5000,
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E3A8A&color=fff`
    };
    customers.unshift(newCust);
    this.saveCustomers(customers);
    return newCust;
  }

  static addTransaction(customerId, type, amount, note = '') {
    const txs = this.getTransactions();
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    const newTx = {
      id: `tx-${Date.now()}`,
      customerId,
      type, // 'udhar' or 'jama'
      amount: parseFloat(amount) || 0,
      note: note || (type === 'udhar' ? 'Goods purchased' : 'Payment received'),
      date: dateStr
    };
    txs.unshift(newTx);
    this.saveTransactions(txs);
    return newTx;
  }

  static generateWhatsAppReminderLink(customerId) {
    const customers = this.getCustomers();
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return '';

    const summary = this.getCustomerSummary(customerId);
    const phone = cust.mobile.replace(/\D/g, '');

    const message = `🙏 *SHREE SHYAM ENTERPRISES - DIGITAL KHATA BILL RECEIPT* 🙏\n\n` +
      `👤 *Customer Name:* ${cust.name}\n` +
      `📞 *Mobile:* ${cust.mobile}\n` +
      `📍 *Address:* Barkagaon Devriya Road\n\n` +
      `-----------------------------------\n` +
      `🔴 Total Udhar (उधार लिया): ₹${summary.totalUdhar}\n` +
      `🟢 Total Jama (जमा किया): ₹${summary.totalJama}\n` +
      `💰 *NET REMAINING BALANCE: ₹${summary.netDue}*\n` +
      `-----------------------------------\n\n` +
      `Aapka baaki khata balance *₹${summary.netDue}* hai. Kripya dukan par aakar ya Online payment karke ise jama karein.\n\n` +
      `🏪 *Shree Shyam Enterprises*\n` +
      `Barkagaon Devriya Road, In front of Tiwari Niwash Bhawan\n` +
      `📞 Call / WhatsApp: 7352383419`;

    return `https://wa.me/91${phone.length === 10 ? phone : '7352383419'}?text=${encodeURIComponent(message)}`;
  }
}

window.KhataEngine = KhataEngine;
