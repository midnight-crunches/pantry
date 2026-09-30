/**
 * Hostel Midnight Pantry - AIT Pune (Ramanujan Dorms)
 * Owner: Anukarsh Kaliyar (Room 03, Ground Floor)
 * WhatsApp Orders: 8870803716 | Paytm UPI: 8870803716@ptyes
 * Operating Hours: 12:00 AM to 4:00 AM | Delivery Time: 2-3 Mins
 */

const CURRENCY = '\u20B9'; // Indian Rupee Symbol
const GOOGLE_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxD3qCxNC2JzLLQNDT-aNLuEmyN9sXif4M2OzkmNYKy98c-C3onnEVcwOmvit6f6YUa/exec'; // ✏️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
// ==========================================
// 1. AIT PUNE PRODUCT CATALOG & DEALS
// ==========================================
const PRODUCTS = [
  {
    id: 'lays-magic-masala-small',
    image: 'magic.jpeg',
    name: "Lay's India's Magic Masala",
    variant: "Small Blue Pack",
    category: 'chips',
    type: 'snack',
    weight: '27 g',
    mrp: 15,
    basePrice: 13,
    pantryMarkup: 0,
    spice: '🌶️🌶️ Medium Hot',
    temp: 'Crispy & Fresh',
    badge: '₹13 Deal 🔥',
    badgeColor: '#0066ff',
    color: '#0052cc',
    accent: '#3385ff',
    desc: 'The legendary blue pack in a perfect single-serve size.',
    nutrition: 'Calories: 140 kcal | Sodium: 160mg | Crunch Index: 9.8/10',
    emoji: '🥔'
  },
  {
    id: 'lays-magic-masala-big',
    image: 'magic.jpeg',
    name: "Lay's India's Magic Masala",
    variant: "Large Blue Pack",
    category: 'chips',
    type: 'snack',
    weight: '50 g',
    mrp: 25,
    basePrice: 25,
    pantryMarkup: 0,
    spice: '🌶️🌶️ Medium Hot',
    temp: 'Crispy & Fresh',
    badge: 'Hostel Favorite ⭐',
    badgeColor: '#0066ff',
    color: '#0052cc',
    accent: '#3385ff',
    desc: 'The legendary blue pack. Perfect for sharing with your roommate (or not).',
    nutrition: 'Calories: 285 kcal | Sodium: 320mg | Crunch Index: 9.8/10',
    emoji: '🥔'
  },
  {
    id: 'kurkure-masala-munch',
    image: 'kurkure.jpeg',
    name: "Kurkure Masala Munch",
    variant: "Orange Pack",
    category: 'chips',
    type: 'snack',
    weight: '90 g',
    mrp: 25,
    basePrice: 25,
    pantryMarkup: 0,
    spice: '🌶️🌶️ Desi Chatpata',
    temp: 'Extra Crunchy',
    badge: 'Spicy 🔥',
    badgeColor: '#ff6d00',
    color: '#e65100',
    accent: '#ff9100',
    desc: 'The iconic Tedhe-Medhe collets made with rice, corn, and loaded with fiery secret spices.',
    nutrition: 'Serves 2 Roommates | Crunch Index: 10/10',
    emoji: '🥨'
  },
  {
    id: 'kurkure-pack-3',
    image: 'kurkure.jpeg',
    name: "Kurkure Masala Munch (Pack of 3)",
    variant: "Combo Pack",
    category: 'chips',
    type: 'snack',
    weight: '270 g',
    mrp: 75,
    basePrice: 70,
    pantryMarkup: 0,
    spice: '🌶️🌶️ Desi Chatpata',
    temp: 'Extra Crunchy',
    badge: '₹5 OFF Combo',
    badgeColor: '#00c853',
    color: '#d84315',
    accent: '#ff5722',
    desc: 'A massive 3-pack combo for long study sessions or late-night dorm parties.',
    nutrition: 'Mega Pack | Crunch Index: 10/10',
    emoji: '🥨'
  },
  {
    id: 'oreo-strawberry',
    image: 'oreo.jpeg',
    name: "Oreo Strawberry Cream",
    variant: "Pink Pack",
    category: 'biscuits',
    type: 'snack',
    weight: '43 g',
    mrp: 15,
    basePrice: 13,
    pantryMarkup: 0,
    spice: '🍓 Sweet Berry',
    temp: 'Sweet',
    badge: 'Fruity 🍓',
    badgeColor: '#e91e63',
    color: '#c2185b',
    accent: '#f06292',
    desc: 'Twist, Lick, Dunk! Delicious chocolate cookies with fruity strawberry cream.',
    nutrition: 'Strawberry | Creamy | Crunch: 8.5/10',
    emoji: '🍪'
  },
  {
    id: 'balaji-wafers',
    image: 'balaji.jpeg',
    name: "Balaji Wafers",
    variant: "Masala Masti",
    category: 'chips',
    type: 'snack',
    weight: '140 g',
    mrp: 50,
    basePrice: 50,
    pantryMarkup: 0,
    spice: '🌶️ Desi Masala',
    temp: 'Crunchy',
    badge: 'Jumbo Pack',
    badgeColor: '#f57f17',
    color: '#f9a825',
    accent: '#ffeb3b',
    desc: 'The legendary premium potato wafers from Balaji, packed with Indian spices.',
    nutrition: 'Huge Portion | Crunch Index: 9.5/10',
    emoji: '🥔'
  }
];

// ==========================================
// 2. STATE MANAGEMENT & AIT DORMS CONFIG
// ==========================================
class HostelPantryApp {
  constructor() {
    this.initStock();
    this.cart = JSON.parse(localStorage.getItem('hostel_pantry_cart') || '{}');
    this.isRoomDelivery = true; // true = Room Delivery (+5/pkt), false = Self Service (Pickup at Room 03)
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.appliedCoupon = null; // e.g. 'AITDORMS' = 10 off on >100

    // Owner info from user specifications
    this.adminName = "Anukarsh Kaliyar";
    this.adminPhone = "8870803716";
    this.adminUpiId = "8870803716@ptyes";
    this.ownerRoom = "Room 03 (Ground Floor, Ramanujan Dorms)";

    // Testing mode to allow owner to test orders during the day


    this.init();
  }

  initStock() {
    let stock = JSON.parse(localStorage.getItem('dorms_pantry_stock')) || {};
    let updated = false;

    PRODUCTS.forEach(p => {
      if (!stock[p.id]) {
        stock[p.id] = { name: p.name, qty: 20 };
        updated = true;
      } else if (stock[p.id].name !== p.name) {
        stock[p.id].name = p.name;
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('dorms_pantry_stock', JSON.stringify(stock));
    }
    this.stock = stock;
  }

  init() {
    this.renderCatalog();
    this.updateCartBadge();
    this.bindEvents();
    this.startLiveOrdersSimulation();
    this.initDormsTimingEngine();
  }

  // Check if store is in official midnight hours (12:00 AM to 4:00 AM IST)
  isMidnightHours() {
    const now = new Date();
    const hours = now.getHours();
    return (hours >= 0 && hours < 4);
  }

  // Always return true so students and owner can order / test 24/7!
  isStoreOpen() {
    return true;
  }



  // Real-time countdown & status indicator
  initDormsTimingEngine() {
    const tickerEl = document.getElementById('gate-status-badge');
    const heroStatusEl = document.getElementById('hero-store-status-banner');

    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const isMidnight = this.isMidnightHours();

      if (isMidnight) {
        let minsLeft = (3 - hours) * 60 + (59 - minutes);
        if (minsLeft < 0) minsLeft = 0;

        if (tickerEl) {
          tickerEl.innerHTML = `
            <span class="pulse-dot active"></span>
            <span class="gate-text">DORMS LIVE NOW! <strong>OPEN (12 AM - 4 AM)</strong> \u{26A1} | <strong>2-3 Min Delivery</strong> or Pickup at Room 03</span>
          `;
          tickerEl.className = 'gate-ticker-pill night-active';
        }

        if (heroStatusEl) {
          heroStatusEl.innerHTML = `
            <div class="store-open-pill">
              <span class="pulse-dot active"></span>
              <span>\u{1F7E2} <strong>STORE IS LIVE NOW</strong> &bull; Delivering in <strong>2-3 mins</strong> to your room! (Closes at 4:00 AM)</span>
            </div>
          `;
        }
      } else {
        if (tickerEl) {
          tickerEl.innerHTML = `
            <span class="pulse-dot active"></span>
            <span class="gate-text">DORMS ORDERS: <strong>OPEN (Orders &amp; Testing Live)</strong> \u{26A1} | <strong>2-3 Min Delivery</strong> or Pickup Room 03</span>
          `;
          tickerEl.className = 'gate-ticker-pill night-active';
        }

        if (heroStatusEl) {
          heroStatusEl.innerHTML = `
            <div class="store-open-pill" style="border: 1px solid rgba(0, 242, 254, 0.4); background: rgba(0, 242, 254, 0.1);">
              <span class="pulse-dot active"></span>
              <span>\u{26A1} <strong>ACCEPTING ORDERS NOW</strong> &bull; Delivering in <strong>2-3 mins</strong> to your room! (Official Midnight Hours: 12 AM - 4 AM)</span>
            </div>
          `;
        }
      }
    };

    updateClock();
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = setInterval(updateClock, 1000);
  }

  // ==========================================
  // 3. CATALOG RENDERING & FILTERING
  // ==========================================
  renderCatalog() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    let items = PRODUCTS.filter(p => {
      const matchCat = this.activeCategory === 'all' || p.category === this.activeCategory;
      const matchQuery = p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.variant.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="empty-catalog">
          <div class="empty-icon">\u{1F319}</div>
          <h3>No late-night cravings found!</h3>
          <p>Try searching for "Lay's", "Thums Up", "Kurkure", or select another category tab.</p>
          <button class="reset-filter-btn" onclick="app.setCategory('all')">View All Snacks & Drinks</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(p => {
      const qtyInCart = this.cart[p.id] ? this.cart[p.id].qty : 0;
      const currentStock = this.stock[p.id] ? this.stock[p.id].qty : 0;
      const isOutOfStock = currentStock <= 0;
      const isMaxQtyReached = qtyInCart >= currentStock;

      return `
        <div class="product-card tilt-card" data-id="${p.id}" style="--item-color: ${p.color}; --item-accent: ${p.accent};">
          <div class="card-shine"></div>
          
          <div class="card-header-badge">
            <span class="badge-pill" style="background: ${p.badgeColor}; color: #fff;">${p.badge}</span>
            <div style="display:flex; gap: 5px;">
              <span class="weight-tag" style="background: ${currentStock <= 5 ? (currentStock === 0 ? '#555' : '#ff4444') : '#333'}; color: #fff; font-weight: bold;">
                ${currentStock > 0 ? `📦 ${currentStock} Left` : '0 Left'}
              </span>
              <span class="weight-tag">${p.weight}</span>
            </div>
          </div>

          <!-- Product 3D Pack Presentation -->
          <div class="product-visual-stage" onclick="app.openQuickView('${p.id}')">
            <div class="visual-glow-aura" style="background: radial-gradient(circle, ${p.color}55 0%, transparent 70%);"></div>
            
            ${p.image ? `
            <div style="height: 180px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 12px; margin-bottom: 10px;">
              <img src="${p.image}" alt="${p.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5)); transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(2deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'">
            </div>
            ` : `
            <div class="product-mockup ${p.type === 'drink' ? 'mockup-drink' : 'mockup-chip'}">
              <div class="pack-wrapper">
                <span class="pack-emoji">${p.emoji}</span>
                <div class="pack-label">
                  <div class="pack-brand">${p.name.split(' ')[0]}</div>
                  <div class="pack-sub">${p.variant}</div>
                </div>
              </div>
              ${p.type === 'drink' ? '<div class="fizz-bubble b1"></div><div class="fizz-bubble b2"></div><div class="fizz-bubble b3"></div>' : ''}
            </div>
            `}

            <button class="flipbook-btn" title="View Nutrition & Flavour Notes" onclick="event.stopPropagation(); app.flipCard('${p.id}')">
              <span>\u{1F4D6} Flip</span>
            </button>
          </div>

          <!-- Card Flip Overlay -->
          <div class="card-flip-back" id="flip-${p.id}">
            <button class="close-flip" onclick="app.flipCard('${p.id}')">\u2715</button>
            <h4 style="color: ${p.accent};">${p.name}</h4>
            <div class="flip-info-item">
              <strong>Flavor:</strong> ${p.spice}
            </div>
            <div class="flip-info-item">
              <strong>Serving:</strong> ${p.temp}
            </div>
            <div class="flip-info-item">
              <strong>Dorms Note:</strong> ${p.nutrition}
            </div>
            <div class="flip-footer">
              <span class="room-delivery-hint">Room Doorstep: FREE | Room 03 Pickup: FREE</span>
            </div>
          </div>

          <div class="product-details">
            <div class="item-meta-bar">
              <span class="spice-level">${p.spice}</span>
              <span class="temp-indicator">${p.temp}</span>
            </div>
            
            <h3 class="product-title" onclick="app.openQuickView('${p.id}')">${p.name}</h3>
            <p class="product-variant">${p.variant}</p>
            <p class="product-snippet">${p.desc}</p>

            <div class="price-and-action-row">
              <div class="price-box">
                <div class="mrp-row">
                  <span class="mrp-strike">MRP ${CURRENCY}${p.mrp}</span>
                  <span class="save-tag">${CURRENCY}${p.mrp - p.basePrice} OFF</span>
                </div>
                <div class="current-price-row">
                  <span class="currency">${CURRENCY}</span>
                  <span class="price-num">${p.basePrice}</span>
                </div>
              </div>

              <div class="action-btn-container" id="action-box-${p.id}">
                ${isOutOfStock ? `
                  <button class="add-to-cart-btn" disabled style="background: #555; cursor: not-allowed; opacity: 0.7;">
                    <span class="btn-text">OUT OF STOCK</span>
                  </button>
                ` : (qtyInCart > 0 ? `
                  <div class="qty-stepper">
                    <button class="qty-btn" onclick="app.updateQuantity('${p.id}', -1)">\u2212</button>
                    <span class="qty-val">${qtyInCart}</span>
                    <button class="qty-btn" onclick="app.updateQuantity('${p.id}', 1)" ${isMaxQtyReached ? 'disabled style="opacity:0.5;"' : ''}>+</button>
                  </div>
                ` : `
                  <button class="add-to-cart-btn" onclick="app.addToCart('${p.id}', this)">
                    <span class="btn-text">ADD</span>
                    <span class="plus-icon">+</span>
                  </button>
                `)}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.initCardTilt) {
      window.initCardTilt();
    }
  }

  flipCard(productId) {
    const flipEl = document.getElementById(`flip-${productId}`);
    if (flipEl) {
      flipEl.classList.toggle('flipped');
    }
  }

  // ==========================================
  // 4. CART & PRICING ENGINE
  // ==========================================
  addToCart(productId, btnElement) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const currentStock = this.stock[productId] ? this.stock[productId].qty : 0;
    if (currentStock <= 0) {
      alert("Item is out of stock!");
      return;
    }

    if (!this.cart[productId]) {
      this.cart[productId] = {
        product: product,
        qty: 1
      };
    } else {
      this.cart[productId].qty++;
    }

    this.saveCart();
    this.updateCartBadge();
    this.renderCatalog();

    if (window.sounds) {
      if (product.type === 'drink') {
        window.sounds.playFizz();
      } else {
        window.sounds.playCrunch();
      }
    }

    if (window.triggerFlyToCart && btnElement) {
      window.triggerFlyToCart(btnElement, product.emoji);
    }
  }

  updateQuantity(productId, delta) {
    if (!this.cart[productId]) return;

    const currentStock = this.stock[productId] ? this.stock[productId].qty : 0;
    if (delta > 0 && this.cart[productId].qty >= currentStock) {
      alert("Cannot add more, maximum stock reached.");
      return;
    }

    this.cart[productId].qty += delta;
    if (this.cart[productId].qty <= 0) {
      delete this.cart[productId];
    }

    this.saveCart();
    this.updateCartBadge();
    this.renderCatalog();
    this.renderCartDrawer();

    if (delta > 0 && window.sounds) {
      window.sounds.playChime();
    }
  }

  saveCart() {
    localStorage.setItem('hostel_pantry_cart', JSON.stringify(this.cart));
  }

  applyCoupon(code) {
    const clean = code.trim().toUpperCase();
    if (clean === 'AITDORMS') {
      const totals = this.getCartTotals();
      if (totals.subtotal >= 100) {
        this.appliedCoupon = 'AITDORMS';
        alert("\u{1F389} Coupon AITDORMS applied! Flat \u20B910 Discount added.");
      } else {
        alert("Coupon AITDORMS is valid on orders of \u20B9100 and above. Add a few more snacks to unlock!");
        return;
      }
    } else {
      alert("Invalid coupon code. Try 'AITDORMS'!");
      return;
    }
    this.renderCartDrawer();
    this.updateCartBadge();
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.renderCartDrawer();
    this.updateCartBadge();
  }

  getCartTotals() {
    let subtotal = 0;
    let totalPackets = 0;

    Object.values(this.cart).forEach(item => {
      subtotal += item.product.basePrice * item.qty;
      totalPackets += item.qty;
    });

    // Discount
    let discount = 0;
    if (this.appliedCoupon === 'AITDORMS' && subtotal >= 100) {
      discount = 10;
    }

    const grandTotal = Math.max(0, subtotal - discount);

    return {
      subtotal,
      totalPackets,
      discount,
      roomDeliverySurcharge: 0,
      grandTotal
    };
  }

  updateCartBadge() {
    const totals = this.getCartTotals();
    const countBadges = document.querySelectorAll('.cart-count-badge');
    const totalAmountBadges = document.querySelectorAll('.cart-bar-total');

    countBadges.forEach(b => {
      b.textContent = totals.totalPackets;
      b.style.display = totals.totalPackets > 0 ? 'flex' : 'none';
    });

    totalAmountBadges.forEach(b => {
      b.textContent = `${CURRENCY}${totals.grandTotal}`;
    });

    const floatingBar = document.getElementById('mobile-floating-cart');
    if (floatingBar) {
      if (totals.totalPackets > 0) {
        floatingBar.classList.add('visible');
      } else {
        floatingBar.classList.remove('visible');
      }
    }
  }

  toggleDeliveryMode(isDelivery) {
    this.isRoomDelivery = isDelivery;
    this.renderCartDrawer();
    this.updateCartBadge();
    if (window.sounds) window.sounds.playChime();
  }

  // ==========================================
  // 5. CART DRAWER & 2 CHECKOUT MODES
  // ==========================================
  openCart() {
    this.renderCartDrawer();
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    if (window.sounds) window.sounds.playChime();
  }

  closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }

  renderCartDrawer() {
    const listEl = document.getElementById('cart-items-list');
    const summaryEl = document.getElementById('cart-bill-summary');
    if (!listEl || !summaryEl) return;

    const items = Object.values(this.cart);
    const totals = this.getCartTotals();
    const isOpen = this.isStoreOpen();

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty-cart-view">
          <div class="empty-cart-art">\u{1F35F}\u{1F964}</div>
          <h4>Your Dorms Stash is Empty!</h4>
          <p>Add some crunchy Lay's, fiery Kurkure, or chilled Thums Up to fuel your late-night study session in Ramanujan.</p>
          <button class="shop-now-btn" onclick="app.closeCart()">Browse Snacks</button>
        </div>
      `;
      summaryEl.innerHTML = '';
      return;
    }

    listEl.innerHTML = items.map(item => {
      const p = item.product;
      const lineTotal = p.basePrice * item.qty;
      return `
        <div class="cart-item-row">
          <div class="cart-item-emoji">${p.emoji}</div>
          <div class="cart-item-meta">
            <h5 class="cart-item-name">${p.name}</h5>
            <span class="cart-item-var">${p.variant}</span>
            <div class="cart-item-price-tag">${CURRENCY}${p.basePrice} each</div>
          </div>
          <div class="cart-item-actions">
            <div class="qty-stepper compact">
              <button class="qty-btn" onclick="app.updateQuantity('${p.id}', -1)">\u2212</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="app.updateQuantity('${p.id}', 1)">+</button>
            </div>
            <div class="cart-item-line-total">${CURRENCY}${lineTotal}</div>
          </div>
        </div>
      `;
    }).join('');

    summaryEl.innerHTML = `
      <!-- 2 OPTIONS: ROOM DELIVERY vs SELF SERVICE -->
      <div class="delivery-toggle-box">
        <div class="toggle-header">
          <span>Choose How to Get Your Order:</span>
          <span class="rule-hint">${this.isRoomDelivery ? '\u{1F680} Room Doorstep (2-3 Mins)' : '\u{1F3C3} Self-Collect from Room 03'}</span>
        </div>
        <div class="delivery-switch-pills">
          <button class="delivery-pill ${this.isRoomDelivery ? 'active' : ''}" onclick="app.toggleDeliveryMode(true)">
            <span class="pill-icon">\u{1F6AA}</span>
            <span class="pill-title">Room Delivery</span>
            <span class="pill-fee">2-3 Mins &bull; FREE</span>
          </button>
          <button class="delivery-pill ${!this.isRoomDelivery ? 'active' : ''}" onclick="app.toggleDeliveryMode(false)">
            <span class="pill-icon">\u{1F3E0}</span>
            <span class="pill-title">Self Service</span>
            <span class="pill-fee">Collect at Room 03 &bull; FREE</span>
          </button>
        </div>

        ${!this.isRoomDelivery ? `
          <div class="self-service-instruction-box">
            \u{1F4CD} <strong>Self-Collection Point:</strong> Ground Floor, <strong>Room 03 (Anukarsh's Room)</strong>.
            <br><small style="color: #cbd5e1;">Pay online via QR, and come right over to pick up your chilled items immediately!</small>
          </div>
        ` : `
          <div class="delivery-speed-callout">
            \u{26A1} <strong>Superfast In-Hostel Delivery:</strong> We are in Ramanujan Dorms itself! Delivered to your room in <strong>2 to 3 minutes</strong>.
          </div>
        `}
      </div>

      <!-- Coupon Code Section -->
      <div class="coupon-section-box">
        <div class="coupon-input-group">
          <input type="text" id="coupon-code-input" placeholder="Enter coupon code (try AITDORMS)" value="${this.appliedCoupon || ''}" ${this.appliedCoupon ? 'readonly' : ''}>
          ${this.appliedCoupon ? `
            <button class="apply-coupon-btn remove" onclick="app.removeCoupon()">Remove</button>
          ` : `
            <button class="apply-coupon-btn" onclick="app.applyCoupon(document.getElementById('coupon-code-input').value)">Apply</button>
          `}
        </div>
        ${this.appliedCoupon ? `<div class="coupon-success-tag">\u2705 AITDORMS: \u20B910 Discount Applied!</div>` : ''}
      </div>

      <!-- Bill Breakdown -->
      <div class="bill-breakdown">
        <div class="bill-row">
          <span>Items Subtotal (${totals.totalPackets} items)</span>
          <span>${CURRENCY}${totals.subtotal}</span>
        </div>
        ${totals.discount > 0 ? `
          <div class="bill-row" style="color: #00e676; font-weight: 700;">
            <span>Coupon Discount (AITDORMS)</span>
            <span>-${CURRENCY}${totals.discount}</span>
          </div>
        ` : ''}
        <div class="bill-row highlight">
          <span>
            ${this.isRoomDelivery ? 'Room Delivery (Free)' : 'Self-Service Pickup at Room 03'}
            <small style="display:block; opacity:0.75;">${this.isRoomDelivery ? `(2-3 mins)` : 'Free \u2013 Ground Floor'}</small>
          </span>
          <span>FREE</span>
        </div>
        <div class="bill-row grand-total-row">
          <span>Total Payable</span>
          <span class="grand-price">${CURRENCY}${totals.grandTotal}</span>
        </div>
      </div>

      <!-- Student Details Form -->
      <div class="hostel-details-form">
        <div class="form-title">\u{1F464} Ramanujan Dorms Student Info:</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Your Name *</label>
            <input type="text" id="order-student-name" placeholder="e.g. Aryan Singh" value="${localStorage.getItem('saved_student_name') || ''}">
          </div>
          <div class="form-group">
            <label>Your Room No. *</label>
            <select id="order-room-no">
              <optgroup label="Ground Floor (8 Rooms)">
                <option value="Room 16 (GF, 5-Seater)">Room 16 (5-Seater)</option>
                <option value="Room 17 (GF, 5-Seater)">Room 17 (5-Seater)</option>
                <option value="Room 18 (GF, 5-Seater)">Room 18 (5-Seater)</option>
                <option value="Room 19 (GF, 5-Seater)">Room 19 (5-Seater)</option>
                <option value="Room 20 (GF, 5-Seater)">Room 20 (5-Seater)</option>
                <option value="Room 21 (GF, 5-Seater)">Room 21 (5-Seater)</option>
                <option value="Room 22 (GF, 5-Seater)">Room 22 (5-Seater)</option>
                <option value="Room 23 (GF, 5-Seater)">Room 23 (5-Seater)</option>
              </optgroup>
              <optgroup label="First Floor (15 Rooms)">
                <option value="Room 01 (1F, 3-Seater)">Room 01 (2-Seater)</option>
                <option value="Room 02 (1F, 3-Seater)">Room 02 (4-Seater)</option>
                <option value="Room 03 (1F, 2-Seater)">Room 03 (3-Seater)</option>
                <option value="Room 04 (1F, 2-Seater)">Room 04 (2-Seater)</option>
                <option value="Room 05 (1F, 4-Seater)">Room 05 (2-Seater)</option>
                <option value="Room 06 (1F, 4-Seater)">Room 06 (3-Seater)</option>
                <option value="Room 07 (1F, 3-Seater)">Room 07 (4-Seater)</option>
                <option value="Room 08 (1F, 3-Seater)">Room 08 (4-Seater)</option>
                <option value="Room 09 (1F, 2-Seater)">Room 09 (4-Seater)</option>
                <option value="Room 10 (1F, 3-Seater)">Room 10 (4-Seater)</option>
                <option value="Room 11 (1F, 4-Seater)">Room 11 (3-Seater)</option>
                <option value="Room 12 (1F, 3-Seater)">Room 12 (2-Seater)</option>
                <option value="Room 13 (1F, 2-Seater)">Room 13 (2-Seater)</option>
                <option value="Room 14 (1F, 4-Seater)">Room 14 (2-Seater)</option>
                <option value="Room 15 (1F, 3-Seater)">Room 15 (3-Seater)</option>
              </optgroup>
            </select>
          </div>
          <div class="form-group full-width">
            <label>WhatsApp / Mobile Number *</label>
            <input type="tel" id="order-phone-no" placeholder="e.g. 8870803716" value="${localStorage.getItem('saved_phone_no') || ''}">
          </div>
          ${this.isRoomDelivery ? `
            <div class="form-group full-width">
              <label>Delivery Instructions (Stealth notes)</label>
              <input type="text" id="order-stealth-note" placeholder="e.g. Roommate sleeping, drop a WhatsApp text / tap gently">
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Closed Store Warning / Active Actions -->
      ${!this.isMidnightHours() ? `
        <div class="closed-notice-card" style="border: 1px solid rgba(0, 242, 254, 0.4); background: rgba(0, 242, 254, 0.08);">
          <div class="notice-icon">🌙</div>
          <div>
            <strong style="color: #00f2fe;">Pre-Order &amp; Testing Active</strong>
            <p style="margin: 0.2rem 0 0; font-size: 0.78rem; color: #cbd5e1;">Official midnight rush is 12 AM - 4 AM. Orders placed now are instantly sent to Room 03!</p>
          </div>
        </div>
      ` : ''}

      <!-- Checkout Actions -->
      <div class="checkout-actions-row">
        <button class="upi-checkout-btn" onclick="app.showPaymentModal()">
          <span class="btn-icon">✅</span>
          <span class="btn-copy">
            <strong>Make Payment</strong>
            <small>Pay via UPI &amp; Order</small>
          </span>
        </button>
      </div>
    `;

    // Restore saved room if previously selected
    const savedRoom = localStorage.getItem('saved_room_no');
    if (savedRoom && document.getElementById('order-room-no')) {
      document.getElementById('order-room-no').value = savedRoom;
    }
  }

  getStudentFormDetails() {
    const name = document.getElementById('order-student-name')?.value.trim() || 'Dorms Hostelite';
    const room = document.getElementById('order-room-no')?.value || 'Room Unspecified';
    const phone = document.getElementById('order-phone-no')?.value.trim() || '';
    const note = document.getElementById('order-stealth-note')?.value.trim() || (this.isRoomDelivery ? 'Deliver in 2-3 mins' : 'Self pickup at Room 03');

    localStorage.setItem('saved_student_name', name);
    localStorage.setItem('saved_room_no', room);
    localStorage.setItem('saved_phone_no', phone);

    return { name, room, phone, note };
  }

  // Real-time Multi-Channel Cloud Push to Room 03 Laptop & Phone
  async pushOrderToCloud(orderPayload) {
    const promises = [];

    // Channel 1: Webhook.site (100% reachable across all Indian college & mobile networks)
    promises.push(
      fetch('https://webhook.site/ad528725-84e7-40c6-8b99-80d42355f16e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      }).then(() => console.log("✅ Dispatched via Webhook channel")).catch(e => console.warn(e))
    );

    // Channel 2: ntfy.sh (Fast pub/sub when mobile data is used)
    promises.push(
      fetch('https://ntfy.sh/ait_dorms_pantry_8870803716', {
        method: 'POST',
        headers: {
          'Title': `🚨 NEW DORMS ORDER: ${orderPayload.roomNo} (₹${orderPayload.grandTotal})`,
          'Priority': 'urgent',
          'Tags': 'rotating_light,bell,package'
        },
        body: JSON.stringify(orderPayload)
      }).then(() => console.log("✅ Dispatched via ntfy channel")).catch(e => console.warn(e))
    );

    // Channel 3: Local server fallback (if student is on same local Wi-Fi)
    promises.push(
      fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      }).then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (data.orderId) orderPayload.orderId = data.orderId;
        }
      }).catch(() => { })
    );
    // Channel 4: Google Apps Script Backend
    promises.push(
      fetch(GOOGLE_SHEET_WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(orderPayload)
      }).then(res => res.json()).then(data => console.log("✅ Dispatched to Google Sheets")).catch(e => console.warn(e))
    );

    await Promise.allSettled(promises);
  }

  // ==========================================
  // 6. WHATSAPP ORDER DISPATCH (TO 8870803716)
  // ==========================================


  // ==========================================
  // 7. PAYTM QR CODE & UPI MODAL
  // ==========================================

  showPaymentModal() {
    const totals = this.getCartTotals();
    if (totals.grandTotal <= 0) {
      alert("Cart is empty!");
      return;
    }

    // Close cart drawer to show modal clearly
    this.closeCart();

    const upiLink = `upi://pay?pa=${this.adminUpiId}&pn=Anukarsh&am=${totals.grandTotal}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    const modal = document.getElementById('payment-modal');
    const content = document.getElementById('payment-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="tracker-card" style="text-align: center;">
        <button class="close-modal-btn" onclick="app.closePaymentModal()">\u2715</button>
        <h2>Pay \u20B9${totals.grandTotal} via UPI</h2>
        <p style="color: #cbd5e1; margin-bottom: 1rem;">Scan the QR code below and take a screenshot of successful payment.</p>
        
        <div style="background: white; padding: 10px; display: inline-block; border-radius: 10px; margin-bottom: 1rem;">
          <img src="${qrUrl}" alt="UPI QR Code" style="width: 200px; height: 200px;">
        </div>
        
        <p style="font-weight: bold; color: #00e676;">UPI ID: ${this.adminUpiId}</p>
        
        <button onclick="app.handleWhatsAppOrder()" style="margin-top: 1.5rem; background: #25d366; color: #052e16; font-weight: 800; font-size: 1rem; padding: 0.8rem 1.2rem; border-radius: 8px; border: none; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          <span>\u{1F4AC}</span> Forward order details to admin WhatsApp
        </button>
      </div>
    `;

    modal.classList.add('open');
  }

  closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.remove('open');
  }

  handleWhatsAppOrder() {
    this.closePaymentModal();
    const totals = this.getCartTotals();
    const { name, room, phone, note } = this.getStudentFormDetails();

    let orderList = Object.values(this.cart).map(i => `${i.qty}x ${i.product.name}`).join('\n');
    let generatedOrderId = '#DORMS-' + Math.floor(100 + Math.random() * 900);

    let waTextRaw = `*NEW DORMS ORDER*\n\n` +
      `*Order ID:* ${generatedOrderId}\n` +
      `*Name:* ${name}\n` +
      `*Room:* ${room}\n` +
      `*Phone:* ${phone}\n` +
      `*Mode:* ${this.isRoomDelivery ? 'Room Delivery' : 'Self Pickup'}\n` +
      `*Total:* \u20B9${totals.grandTotal}\n\n` +
      `*Items:*\n${orderList}\n\n` +
      `*Note:* ${note}\n\n` +
      `_Attached screenshot of payment below_`;

    const waLink = `https://wa.me/91${this.adminPhone}?text=${encodeURIComponent(waTextRaw)}`;

    // Process order in background
    this.confirmPayment('UPI / WhatsApp', '', generatedOrderId);

    // Redirect to WhatsApp
    window.open(waLink, '_blank');
  }

  async confirmPayment(paymentMethod, utr = '', overrideOrderId = null) {
    const totals = this.getCartTotals();
    const { name, room, phone, note } = this.getStudentFormDetails();

    let generatedOrderId = overrideOrderId || ('#DORMS-' + Math.floor(100 + Math.random() * 900));

    const orderPayload = {
      orderId: generatedOrderId,
      timestamp: new Date().toLocaleString(),
      studentName: name,
      roomNo: room,
      phone: phone,
      orderType: this.isRoomDelivery ? 'Room Delivery (2-3 Mins)' : 'Self Service (Pickup at Room 03)',
      instructions: note,
      items: Object.values(this.cart).map(i => ({
        name: i.product.name,
        variant: i.product.variant,
        qty: i.qty,
        basePrice: i.product.basePrice
      })),
      totalPackets: totals.totalPackets,
      subtotal: totals.subtotal,
      discount: totals.discount,
      roomDeliveryFee: totals.roomDeliverySurcharge,
      grandTotal: totals.grandTotal,
      paymentMethod: paymentMethod,
      utrNo: utr,
      status: 'pending'
    };

    // Cache locally for GitHub Pages serverless sync
    try {
      const existingRaw = localStorage.getItem('dorms_orders_cloud') || '[]';
      const parsedOrders = JSON.parse(existingRaw);
      parsedOrders.unshift(orderPayload);
      localStorage.setItem('dorms_orders_cloud', JSON.stringify(parsedOrders));
    } catch (e) { }

    // Direct Telegram Alert if configured
    try {
      const savedTgToken = localStorage.getItem('dorms_tg_token');
      const savedTgChat = localStorage.getItem('dorms_tg_chat');
      if (savedTgToken && savedTgChat) {
        const tgText = `🚨 *NEW RAMANUJAN DORMS ORDER!*\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `🆔 *Order:* ${generatedOrderId}\n` +
          `🚪 *Room:* ${room}\n` +
          `👤 *Student:* ${name} (${phone || 'No phone'})\n` +
          `💰 *Total:* ${CURRENCY}${totals.grandTotal}\n` +
          `💳 *Payment:* ${paymentMethod}\n` +
          `${utr ? '🔍 *UTR:* `' + utr + '` (MATCH WITH PAYTM SMS)\n' : ''}` +
          `🚀 *Mode:* ${orderPayload.orderType}\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `⏰ Deliver in 2-3 Mins!`;
        fetch(`https://api.telegram.org/bot${savedTgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: savedTgChat, text: tgText, parse_mode: 'Markdown' })
        }).catch(() => { });
      }
    } catch (e) { }

    // Instant Cloud & Local Push Notification (fire-and-forget to avoid blocking UI)
    this.pushOrderToCloud(orderPayload);

    this.closeCart();

    // Deduct stock
    Object.keys(this.cart).forEach(productId => {
      if (this.stock[productId]) {
        this.stock[productId].qty = Math.max(0, this.stock[productId].qty - this.cart[productId].qty);
      }
    });
    localStorage.setItem('dorms_pantry_stock', JSON.stringify(this.stock));

    // Clear cart
    this.cart = {};
    this.saveCart();
    this.updateCartBadge();
    this.renderCatalog();

    if (window.sounds) window.sounds.playDoorbell();
    if (window.launchHostelConfetti) window.launchHostelConfetti();

    this.showDeliveryTracker(name, room, totals.grandTotal, paymentMethod, generatedOrderId);
  }

  // ==========================================
  // 8. 2-3 MINUTE DELIVERY & PICKUP TRACKER
  // ==========================================
  showDeliveryTracker(name, room, amount, paymentMethod = 'Online Order', orderId = '') {
    const modal = document.getElementById('tracker-modal');
    const content = document.getElementById('tracker-modal-content');
    if (!modal || !content) return;

    modal.classList.add('open');

    const isDelivery = this.isRoomDelivery;

    content.innerHTML = `
      <div class="tracker-card">
        <button class="close-modal-btn" onclick="app.closeTrackerModal()">\u2715</button>
        
        <div class="tracker-header">
          <div class="live-pill"><span class="pulse-circle"></span> ORDER CONFIRMED &amp; DISPATCHED</div>
          <div style="font-size: 0.9rem; font-weight: 800; color: #ffaa00; margin: 0.4rem 0;">Receipt: <strong>${orderId || '#DORMS-CONFIRMED'}</strong></div>
          <h2>${isDelivery ? '2-3 Min Room Delivery in Progress \u{1F6F5}' : 'Order Ready for Pickup at Room 03 \u{1F3E0}'}</h2>
          <p>${isDelivery ? 'Delivering to: <strong>' + room + '</strong>' : 'Pick up from: <strong>Room 03 (Ground Floor, Ramanujan)</strong>'} | Total: <strong>${CURRENCY}${amount}</strong></p>
        </div>

        <div class="timeline-visual">
          <div class="timeline-step step-1 active" id="track-step-1">
            <div class="step-icon">\u{1F4CB}</div>
            <div class="step-text">
              <h4>Order Received at Room 03</h4>
              <p>Anukarsh received your live notification on his laptop</p>
            </div>
            <div class="step-time">Just now</div>
          </div>

          <div class="timeline-step step-2" id="track-step-2">
            <div class="step-icon">\u{1F35F}</div>
            <div class="step-text">
              <h4>Snacks Packed from Chiller</h4>
              <p>Chips crisped &amp; drinks frosty cold</p>
            </div>
            <div class="step-time">1 min</div>
          </div>

          <div class="timeline-step step-3" id="track-step-3">
            <div class="step-icon">${isDelivery ? '\u{1F3C3}\u200D\u2642\uFE0F' : '\u{1F3C3}'}</div>
            <div class="step-text">
              <h4>${isDelivery ? 'Runner in Dorms Corridor' : 'Waiting for You at Room 03'}</h4>
              <p>${isDelivery ? 'Heading to ' + room : 'Come down to Ground Floor Room 03'}</p>
            </div>
            <div class="step-time">2 mins</div>
          </div>

          <div class="timeline-step step-4" id="track-step-4">
            <div class="step-icon">\u{1F6AA}</div>
            <div class="step-text">
              <h4>${isDelivery ? 'Arrived at Your Door!' : 'Handover Complete!'}</h4>
              <p>Enjoy your midnight study snacks!</p>
            </div>
            <div class="step-time">2-3 mins</div>
          </div>
        </div>

        <div class="tracker-footer-note">
          <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; margin-bottom: 1rem; border: 1px dashed rgba(255,255,255,0.2);">
            <p style="margin-top: 0; font-size: 0.85rem; color: #cbd5e1;">Forgot to pay? Scan below to pay via UPI:</p>
            <div style="background: white; padding: 5px; display: inline-block; border-radius: 5px; margin: 0.5rem 0;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('upi://pay?pa=' + this.adminUpiId + '&pn=Anukarsh&am=' + amount + '&cu=INR')}" alt="UPI QR" style="width: 100px; height: 100px;">
            </div>
            <p style="margin: 0; font-weight: bold; color: #00e676; font-size: 0.85rem;">${this.adminUpiId}</p>
          </div>
          <p>\u{1F4F1} <em>"Notification sent to Anukarsh (8870803716). Need help? WhatsApp him directly!"</em></p>
          <div style="display: flex; gap: 0.6rem; justify-content: center; margin: 0.8rem 0;">
            <a href="https://wa.me/8870803716?text=Hi%20Anukarsh,%20regarding%20my%20Dorms%20order%20${encodeURIComponent(orderId)}" target="_blank" style="background: #25d366; color: #052e16; font-weight: 800; font-size: 0.85rem; padding: 0.6rem 1.2rem; border-radius: 100px; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>\u{1F4AC}</span> WhatsApp Anukarsh
            </a>
            <button class="ok-done-btn" style="margin: 0;" onclick="app.closeTrackerModal()">Done</button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      document.getElementById('track-step-2')?.classList.add('active');
    }, 1200);

    setTimeout(() => {
      document.getElementById('track-step-3')?.classList.add('active');
    }, 2500);

    setTimeout(() => {
      document.getElementById('track-step-4')?.classList.add('active');
      if (window.sounds) window.sounds.playDoorbell();
    }, 4500);
  }

  closeTrackerModal() {
    const modal = document.getElementById('tracker-modal');
    if (modal) modal.classList.remove('open');
  }

  // ==========================================
  // 9. QUICK VIEW 3D PRODUCT MODAL
  // ==========================================
  openQuickView(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('quick-view-modal');
    const container = document.getElementById('quick-view-content');
    if (!modal || !container) return;

    container.innerHTML = `
      <div class="quick-view-card">
        <button class="close-modal-btn" onclick="app.closeQuickView()">\u2715</button>
        
        <div class="quick-view-left" style="background: radial-gradient(circle, ${product.color}66 0%, #0d1124 80%); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
          ${product.image ? `<img src="${product.image}" style="max-width: 80%; max-height: 80%; object-fit: contain; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.6));">` : `<div class="quick-view-hero-emoji">${product.emoji}</div>`}
          <div class="quick-view-tag" style="background: ${product.badgeColor}; position: absolute; top: 15px; left: 15px;">${product.badge}</div>
          <button class="sound-test-btn" onclick="app.testSound('${product.type}')">
            ${product.type === 'drink' ? '\u{1F50A} Hear Soda Fizz' : '\u{1F50A} Hear Chip Crunch'}
          </button>
        </div>

        <div class="quick-view-right">
          <span class="quick-cat">${product.category.toUpperCase()} &bull; ${product.weight}</span>
          <h2>${product.name}</h2>
          <p class="quick-var">${product.variant}</p>
          <p class="quick-desc">${product.desc}</p>

          <div class="quick-stats-grid">
            <div class="stat-box">
              <span class="stat-lbl">Taste & Heat</span>
              <span class="stat-val">${product.spice}</span>
            </div>
            <div class="stat-box">
              <span class="stat-lbl">Serving Temp</span>
              <span class="stat-val">${product.temp}</span>
            </div>
            <div class="stat-box">
              <span class="stat-lbl">Dorms Notes</span>
              <span class="stat-val">${product.nutrition}</span>
            </div>
          </div>

          <div class="quick-pricing-box">
            <div>
              <div class="mrp-strike">MRP ${CURRENCY}${product.mrp}</div>
              <div class="quick-price">${CURRENCY}${product.basePrice} <span class="room-pill">+${CURRENCY}5 Room / \u20B90 Pickup</span></div>
            </div>
            <button class="quick-add-btn" onclick="app.addToCart('${product.id}', this); app.closeQuickView();">
              <span>ADD TO STASH</span>
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
  }

  closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) modal.classList.remove('open');
  }

  testSound(type) {
    if (!window.sounds) return;
    if (type === 'drink') {
      window.sounds.playFizz();
    } else {
      window.sounds.playCrunch();
    }
  }

  // ==========================================
  // 10. REAL-TIME HOSTEL ORDERS SIMULATION
  // ==========================================
  startLiveOrdersSimulation() {
    const tickerList = [
      { name: 'Kunal', room: 'Room 105 (First Floor)', item: "Dorms Midterm Power Duo \u{26A1}" },
      { name: 'Sameer', room: 'Room 06 (Ground Floor)', item: "4-Seater Room Binge Box \u{1F389}" },
      { name: 'Piyush', room: 'Room 112 (First Floor)', item: "2x Lay's Magic Masala + Thums Up 750ml" },
      { name: 'Deepak', room: 'Room 02 (First Floor)', item: "1x Kurkure 95g + Sprite 750ml" },
      { name: 'Shivam', room: 'Room 108 (First Floor)', item: "1x Too Yumm Bhoot Chips + Diet Coke Can" },
      { name: 'Aditya', room: 'Room 07 (Ground Floor)', item: "Picked up from Room 03: 1x Thums Up 1.25L" },
      { name: 'Mayank', room: 'Room 114 (First Floor)', item: "1x Lay's Cream & Onion + Puffcorn Cheese" }
    ];

    const tickerEl = document.getElementById('live-order-ticker-text');
    if (!tickerEl) return;

    let index = 0;
    const showNext = () => {
      const order = tickerList[index];
      tickerEl.style.opacity = '0';
      tickerEl.style.transform = 'translateY(8px)';

      setTimeout(() => {
        tickerEl.innerHTML = `\u{1F525} <strong>${order.name}</strong> from <strong>${order.room}</strong> ordered: <em>${order.item}</em>`;
        tickerEl.style.opacity = '1';
        tickerEl.style.transform = 'translateY(0px)';
      }, 300);

      index = (index + 1) % tickerList.length;
    };

    showNext();
    setInterval(showNext, 8500);
  }

  // ==========================================
  // 11. RAMANUJAN DORMS ROOM SELECTOR
  // ==========================================
  selectHostelRoom(floor, roomNum, seaters) {
    const select = document.getElementById('order-room-no');
    const roomStr = `Room ${roomNum} (${floor === 'Ground' ? 'GF' : '1F'}, ${seaters})`;

    if (select) {
      // Find matching option
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value.includes(`Room ${roomNum}`)) {
          select.selectedIndex = i;
          break;
        }
      }
    }

    document.querySelectorAll('.iso-room-cell').forEach(cell => {
      cell.classList.remove('selected');
    });
    const clickedCell = document.querySelector(`.iso-room-cell[data-room="${roomNum}"]`);
    if (clickedCell) clickedCell.classList.add('selected');

    if (window.sounds) window.sounds.playChime();

    this.openCart();
  }

  // ==========================================
  // 12. EVENT BINDINGS
  // ==========================================
  bindEvents() {
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderCatalog();
      });
    }

    document.querySelectorAll('.cat-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeCategory = e.currentTarget.getAttribute('data-category');
        this.renderCatalog();
      });
    });

    const backdrop = document.getElementById('cart-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeCart());
    }
  }

  setCategory(cat) {
    this.activeCategory = cat;
    document.querySelectorAll('.cat-pill-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-category') === cat);
    });
    this.renderCatalog();
  }
}

// Instantiate globally
window.app = new HostelPantryApp();
