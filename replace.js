const fs = require('fs');
const file = 'c:/Users/AE/OneDrive/Desktop/ADA/hostel-midnight-pantry/app.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace PRODUCTS
const productsStart = content.indexOf('const PRODUCTS = [');
const productsEnd = content.indexOf('];', productsStart) + 2;
const newProducts = `const PRODUCTS = [
  {
    id: 'lays-magic-masala',
    name: "Lay's India's Magic Masala",
    variant: "Blue Pack",
    category: 'chips',
    type: 'snack',
    weight: '52 g',
    mrp: 25,
    basePrice: 20,
    pantryMarkup: 3,
    spice: '🌶️🌶️ Medium Hot',
    temp: 'Crispy & Fresh',
    badge: 'Hostel Favorite ⭐',
    badgeColor: '#0066ff',
    color: '#0052cc',
    accent: '#3385ff',
    desc: 'The legendary blue pack. Perfectly spiced with dried mango, chili, and authentic Indian spices.',
    nutrition: 'Calories: 285 kcal | Sodium: 320mg | Crunch Index: 9.8/10',
    emoji: '🥔'
  },
  {
    id: 'lays-cream-onion',
    name: "Lay's American Style Cream & Onion",
    variant: "Green Pack",
    category: 'chips',
    type: 'snack',
    weight: '52 g',
    mrp: 25,
    basePrice: 20,
    pantryMarkup: 3,
    spice: '🌿 Herb & Cream',
    temp: 'Crispy & Fresh',
    badge: '₹5 OFF 🔥',
    badgeColor: '#00c853',
    color: '#2e7d32',
    accent: '#66bb6a',
    desc: 'Smooth sour cream perfectly balanced with mild spring onions and aromatic garden herbs.',
    nutrition: 'Calories: 280 kcal | Sweet & Tangy | Crunch Index: 9.7/10',
    emoji: '🥔'
  },
  {
    id: 'kurkure-masala-munch',
    name: "Kurkure Namkeen Masala Munch",
    variant: "Orange Pack",
    category: 'chips',
    type: 'snack',
    weight: '95 g',
    mrp: 20,
    basePrice: 19,
    pantryMarkup: 3,
    spice: '🌶️🌶️ Desi Chatpata',
    temp: 'Extra Crunchy',
    badge: 'Big 95g Pack',
    badgeColor: '#ff6d00',
    color: '#e65100',
    accent: '#ff9100',
    desc: 'The iconic Tedhe-Medhe collets made with rice, corn, and loaded with fiery secret spices.',
    nutrition: 'Weight: 95g | Serves 2 Roommates | Crunch Index: 10/10',
    emoji: '🥨'
  },
  {
    id: 'too-yumm-bhoot',
    name: "Too Yumm Smoking Hot Bhoot Chips",
    variant: "Black-Red Pack",
    category: 'chips',
    type: 'snack',
    weight: '45 g',
    mrp: 20,
    basePrice: 19,
    pantryMarkup: 3,
    spice: '🔥 Bhoot Jolokia Extreme',
    temp: 'Fiery Wakeup Call',
    badge: 'Dare You! 🔥🔥',
    badgeColor: '#ff1744',
    color: '#b71c1c',
    accent: '#ff5252',
    desc: 'Infused with legendary Ghost Pepper. Guaranteed to wake you up through any boring textbook.',
    nutrition: 'Extreme Heat | Baked | Crunch: 9.7/10',
    emoji: '🌶️'
  },
  {
    id: 'parle-g-biscuit',
    name: "Parle-G Original",
    variant: "Golden Pack",
    category: 'biscuits',
    type: 'snack',
    weight: '130 g',
    mrp: 10,
    basePrice: 10,
    pantryMarkup: 2,
    spice: '🍪 Sweet Classic',
    temp: 'Crispy',
    badge: 'Classic 🍪',
    badgeColor: '#fbc02d',
    color: '#f57f17',
    accent: '#fff176',
    desc: 'The all-time classic glucose biscuit, perfect for a quick snack with chai or coffee.',
    nutrition: 'Glucose Energy | Classic | Crunch: 8/10',
    emoji: '🍪'
  },
  {
    id: 'oreo-biscuit',
    name: "Oreo Original Chocolate",
    variant: "Blue Pack",
    category: 'biscuits',
    type: 'snack',
    weight: '120 g',
    mrp: 30,
    basePrice: 30,
    pantryMarkup: 4,
    spice: '🍫 Chocolate Cream',
    temp: 'Sweet',
    badge: 'Choco 🍫',
    badgeColor: '#1976d2',
    color: '#0d47a1',
    accent: '#42a5f5',
    desc: 'Twist, Lick, Dunk! Delicious chocolate cookies with vanilla cream.',
    nutrition: 'Chocolate | Creamy | Crunch: 8.5/10',
    emoji: '🍪'
  }
];`;
content = content.substring(0, productsStart) + newProducts + content.substring(productsEnd);

// 2. Remove test mode usages
content = content.replace("this.ownerTestMode = localStorage.getItem('dorms_test_mode') === 'true';", "");
content = content.replace(/toggleOwnerTestMode\(\) \{[\s\S]*?\n  \}/g, "");

// 3. Connect backend
const channel3Code = `    // Channel 3: Local server fallback (if student is on same local Wi-Fi)
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
    );`;
const channel4Code = `
    // Channel 4: Google Apps Script Backend
    promises.push(
      fetch(GOOGLE_SHEET_WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(orderPayload)
      }).then(res => res.json()).then(data => console.log("✅ Dispatched to Google Sheets")).catch(e => console.warn(e))
    );`;
content = content.replace(channel3Code, channel3Code + channel4Code);

// 4. Remove all payment systems
const upiBtnStart = content.indexOf('<button class="upi-checkout-btn"');
const upiBtnEnd = content.indexOf('</button>', upiBtnStart) + 9;
const newUpiBtn = `        <button class="upi-checkout-btn" onclick="app.confirmPayment('Confirm Order', '')">
          <span class="btn-icon">✅</span>
          <span class="btn-copy">
            <strong>Place Order</strong>
            <small>Directly place without payment</small>
          </span>
        </button>`;
content = content.substring(0, upiBtnStart) + newUpiBtn + content.substring(upiBtnEnd);

// Also remove modal methods
const modalMethodsRegex = /  openUpiModal\(\) \{[\s\S]*?  \}\n\n  closeUpiModal\(\) \{[\s\S]*?  \}\n\n  copyUpiId\(\) \{[\s\S]*?  \}\n\n  confirmPaidWithUtr\(\) \{[\s\S]*?  \}/;
content = content.replace(modalMethodsRegex, "");

// In confirmPayment, remove modal close calls:
content = content.replace("this.closeUpiModal();\n", "");

fs.writeFileSync(file, content, 'utf8');
