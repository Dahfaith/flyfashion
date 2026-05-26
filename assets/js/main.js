/**
 * FLY FASHION — Core Utilities Module
 * Shared across all pages
 */

// ─── Business Constants ──────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '2347069659752'; // Business WhatsApp number 07069659752

// ─── Currency Formatter & Conversion ──────────────────────────────────────────
const CURRENCIES = {
  NGN: { symbol: '₦', code: 'NGN', rate: 1, locale: 'en-NG', decimals: 0 },
  USD: { symbol: '$', code: 'USD', rate: 0.00065, locale: 'en-US', decimals: 2 },
  GBP: { symbol: '£', code: 'GBP', rate: 0.00051, locale: 'en-GB', decimals: 2 }
};

let currentCurrency = localStorage.getItem('ff_currency') || 'NGN';

function formatPrice(nairaAmount) {
  const cur = CURRENCIES[currentCurrency] || CURRENCIES.NGN;
  const converted = nairaAmount * cur.rate;
  return `${cur.symbol}${converted.toLocaleString(cur.locale, {
    minimumFractionDigits: cur.decimals,
    maximumFractionDigits: cur.decimals
  })}`;
}

function setCurrency(code) {
  if (CURRENCIES[code]) {
    currentCurrency = code;
    localStorage.setItem('ff_currency', code);
    // Reload page or trigger custom event to recalculate
    window.location.reload();
  }
}

// ─── Cart System (localStorage based) ────────────────────────────────────────
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('ff_cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('ff_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, size, color, quantity = 1) {
  const cart = getCart();
  const key = `${product.id}-${size}-${color}`;
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size,
      color,
      quantity,
      stock: product.stock
    });
  }
  saveCart(cart);
  showToast(`"${product.name}" added to cart!`, 'success');
}

function removeFromCart(key) {
  let cart = getCart();
  cart = cart.filter(item => item.key !== key);
  saveCart(cart);
  showToast('Item removed from cart', 'info');
}

function updateCartQty(key, qty) {
  const cart = getCart();
  const item = cart.find(item => item.key === key);
  if (item) {
    if (qty <= 0) {
      removeFromCart(key);
      return;
    }
    item.quantity = Math.min(qty, item.stock);
    saveCart(cart);
  }
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ─── Wishlist System (localStorage based) ───────────────────────────────────
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('ff_wishlist') || '[]');
  } catch {
    return [];
  }
}

function toggleWishlist(productId) {
  let wishlist = getWishlist();
  const id = parseInt(productId);
  let status = false;

  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(item => item !== id);
    showToast('Removed from wishlist', 'info');
  } else {
    wishlist.push(id);
    showToast('Added to wishlist ♥', 'success');
    status = true;
  }
  localStorage.setItem('ff_wishlist', JSON.stringify(wishlist));
  updateWishlistIcons();
  return status;
}

function isInWishlist(productId) {
  return getWishlist().includes(parseInt(productId));
}

function updateWishlistIcons() {
  document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    const id = parseInt(btn.dataset.wishlistId);
    const icon = btn.querySelector('i');
    if (isInWishlist(id)) {
      btn.classList.add('wishlisted');
      if (icon) icon.className = 'fas fa-heart text-red-500 text-sm';
    } else {
      btn.classList.remove('wishlisted');
      if (icon) icon.className = 'far fa-heart text-red-500 text-sm';
    }
  });
}

// ─── Star Rating Renderer ────────────────────────────────────────────────────
function renderStars(rating) {
  let html = '';
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.4;
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      html += '<i class="fas fa-star text-amber-400"></i>';
    } else if (i === fullStars + 1 && halfStar) {
      html += '<i class="fas fa-star-half-alt text-amber-400"></i>';
    } else {
      html += '<i class="far fa-star text-amber-400"></i>';
    }
  }
  return html;
}

// ─── Toast Notifications ─────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  
  const colors = {
    success: 'bg-green-500 dark:bg-green-600',
    error: 'bg-red-500 dark:bg-red-600',
    info: 'bg-accent dark:bg-amber-600',
    warning: 'bg-yellow-500 dark:bg-yellow-600'
  };
  
  toast.className = `flex items-center gap-3 px-5 py-3.5 rounded-xl text-white text-sm font-medium shadow-2xl transform translate-x-full transition-all duration-500 ${colors[type] || colors.info}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle'
  };
  
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  
  // Animate Entrance
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 50);
  
  // Fading and Removal
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, duration);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full';
  document.body.appendChild(container);
  return container;
}

// ─── Fallback Local Catalog (For complete offline/fetch security) ─────────────
const FALLBACK_PRODUCTS = [
  {
    "id": 1,
    "name": "Luxury Velvet Agbada Set - Rich Maroon",
    "category": "Native Wears",
    "description": "A statement of pure elegance and African prestige. This meticulously tailored velvet Agbada features intricate gold embroidery on the breast and neckline, complete with matching cap, inner top, and trouser set. Crafted for extraordinary occasions and weddings.",
    "price": 85000,
    "oldPrice": 120000,
    "sizes": ["M", "L", "XL", "XXL"],
    "colors": ["#800020", "#ffd700", "#000000"],
    "stock": 8,
    "images": [
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&q=80",
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80"
    ],
    "rating": 4.9,
    "reviews": 38,
    "featured": true,
    "newArrival": true,
    "trending": true
  },
  {
    "id": 2,
    "name": "Midnight Black Oversized Hoodie",
    "category": "Hoodies",
    "description": "Engineered from ultra-heavyweight 450GSM organic French terry cotton. This hoodie features an oversized silhouette, dropped shoulders, double-layered hoodie without drawstrings for a clean look, and a discreet embroidered signature logo on the left wrist.",
    "price": 35000,
    "oldPrice": 45000,
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["#0d0d0d", "#555555", "#e5e5e5"],
    "stock": 25,
    "images": [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80"
    ],
    "rating": 4.8,
    "reviews": 112,
    "featured": true,
    "newArrival": false,
    "trending": true
  },
  {
    "id": 3,
    "name": "\"FLY RUN\" Chunky Platform Sneakers",
    "category": "Sneakers",
    "description": "Step into the future. Combining high-fashion design aesthetics with maximum athletic comfort, these chunky trainers are constructed with premium leather panels, breathable mesh, and an architectural multi-layered rubber sole.",
    "price": 55000,
    "oldPrice": 75000,
    "sizes": ["40", "41", "42", "43", "44", "45"],
    "colors": ["#ffffff", "#000000", "#d4af37"],
    "stock": 14,
    "images": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80"
    ],
    "rating": 4.7,
    "reviews": 94,
    "featured": true,
    "newArrival": true,
    "trending": true
  },
  {
    "id": 4,
    "name": "Nigeria 1996 Retro Olympic Jersey",
    "category": "Jerseys",
    "description": "Celebrate the golden era of Nigerian football. This remake of the iconic 1996 Olympic jersey features the historic green and white wing designs, lightweight breathable performance mesh fabric, and the classic embroidered badge.",
    "price": 28000,
    "oldPrice": 38000,
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "colors": ["#008751", "#ffffff"],
    "stock": 30,
    "images": [
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80"
    ],
    "rating": 4.9,
    "reviews": 156,
    "featured": true,
    "newArrival": false,
    "trending": true
  },
  {
    "id": 5,
    "name": "Silk Wrap Editorial Maxi Dress",
    "category": "Women",
    "description": "Graceful fluidity defined. Made from premium Mulberry silk with a subtle satin sheen, this wrap dress falls beautifully to a maxi hem. Features elegant Bishop sleeves, self-tie waist belt, and a deep V-neckline.",
    "price": 65000,
    "oldPrice": 90000,
    "sizes": ["XS", "S", "M", "L"],
    "colors": ["#d4af37", "#228b22", "#000000"],
    "stock": 6,
    "images": [
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80"
    ],
    "rating": 4.8,
    "reviews": 27,
    "featured": true,
    "newArrival": true,
    "trending": false
  },
  {
    "id": 6,
    "name": "Embroidered Gold Senegalese Kaftan",
    "category": "Native Wears",
    "description": "Crafted from fine polished cotton, this traditional Senegalese style Kaftan set pairs a long-line tunic top with tapered ankle trousers. Richly decorated with golden brocade threading along the chest.",
    "price": 72000,
    "oldPrice": 95000,
    "sizes": ["M", "L", "XL", "XXL"],
    "colors": ["#ffffff", "#0d0d0d", "#1d2e5a"],
    "stock": 10,
    "images": [
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80"
    ],
    "rating": 4.9,
    "reviews": 43,
    "featured": false,
    "newArrival": true,
    "trending": true
  },
  {
    "id": 7,
    "name": "Urban Techwear Cargo Pants",
    "category": "Men",
    "description": "Engineered for utility. Fabricated from premium water-resistant nylon ripstop, these cargo pants feature ergonomic cargo pockets, adjustable drawstrings at the ankles, and an integrated canvas belt.",
    "price": 32000,
    "oldPrice": 40000,
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["#2e3b2e", "#0a0a0a", "#6b7280"],
    "stock": 18,
    "images": [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80"
    ],
    "rating": 4.6,
    "reviews": 61,
    "featured": false,
    "newArrival": false,
    "trending": true
  },
  {
    "id": 8,
    "name": "Luxury 18K Gold Link Chain Necklace",
    "category": "Accessories",
    "description": "Elevate any outfit. An exquisite 18K yellow gold-plated Italian link chain designed with premium stainless steel base. Features a highly-polished textured finish and a secure lobster-claw clasp. Anti-tarnish and hypoallergenic.",
    "price": 18000,
    "oldPrice": 25000,
    "sizes": ["One Size"],
    "colors": ["#ffd700", "#e5e5e5"],
    "stock": 40,
    "images": [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"
    ],
    "rating": 4.8,
    "reviews": 89,
    "featured": true,
    "newArrival": true,
    "trending": false
  },
  {
    "id": 9,
    "name": "Signature Hexagonal Tinted Sunglasses",
    "category": "Accessories",
    "description": "Make a statement under the sun. Featuring custom dark gold wireframes and lightly tinted amber UV400 protective lenses, these hexagonal sunglasses represent contemporary avant-garde luxury.",
    "price": 15000,
    "oldPrice": 22000,
    "sizes": ["One Size"],
    "colors": ["#d4af37", "#000000"],
    "stock": 50,
    "images": [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80"
    ],
    "rating": 4.7,
    "reviews": 57,
    "featured": false,
    "newArrival": false,
    "trending": true
  },
  {
    "id": 10,
    "name": "Minimalist Leather Cardholder - Saffiano",
    "category": "Accessories",
    "description": "Slim utility at its best. Crafted from high-grain Saffiano calfskin leather, offering four dedicated card slots and a middle cash compartment. Fits completely flush in any pocket.",
    "price": 12000,
    "oldPrice": 18000,
    "sizes": ["One Size"],
    "colors": ["#0d0d0d", "#8b5a2b", "#1a365d"],
    "stock": 35,
    "images": [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80"
    ],
    "rating": 4.5,
    "reviews": 32,
    "featured": false,
    "newArrival": true,
    "trending": false
  },
  {
    "id": 11,
    "name": "Cropped Rib Knit Coordinates Set",
    "category": "Women",
    "description": "Comfy-chic streetwear outfit. A matching two-piece set featuring a high-neck long-sleeve crop sweater and a high-waisted midi length ribbed knit pencil skirt. Perfect for cozy days and dynamic nights out.",
    "price": 45000,
    "oldPrice": 60000,
    "sizes": ["XS", "S", "M", "L"],
    "colors": ["#d2b48c", "#0a0a0a", "#e5e5e5"],
    "stock": 12,
    "images": [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80"
    ],
    "rating": 4.8,
    "reviews": 19,
    "featured": false,
    "newArrival": true,
    "trending": true
  },
  {
    "id": 12,
    "name": "Classic Distressed Biker Leather Jacket",
    "category": "Men",
    "description": "Crafted from hand-treated premium sheepskin leather that ages beautifully. Outfitted with heavy-duty metal silver zippers, snap-down lapels, and quilted satin lining for comfortable layering.",
    "price": 78000,
    "oldPrice": 110000,
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "colors": ["#000000", "#3d2314"],
    "stock": 7,
    "images": [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
      "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&q=80"
    ],
    "rating": 4.9,
    "reviews": 46,
    "featured": true,
    "newArrival": false,
    "trending": false
  }
];

// ─── Products Loader ─────────────────────────────────────────────────────────
let _productsCache = null;

async function loadProducts() {
  if (_productsCache) return _productsCache;
  
  // Safe execution with absolute fallback
  try {
    const base = window.location.pathname.includes('/fly-fashion') ? '/fly-fashion' : '';
    
    // First attempt: absolute/relative JSON path
    let response = await fetch(`${base}/data/products.json`);
    if (!response.ok) {
      response = await fetch('./data/products.json');
    }
    if (!response.ok) {
      response = await fetch('../data/products.json');
    }
    
    if (response.ok) {
      _productsCache = await response.json();
      return _productsCache;
    }
  } catch (error) {
    console.warn("Fetch failed, reverting to FLY FASHION secure memory-embedded catalog database.", error);
  }
  
  // Unconditional fallback
  _productsCache = FALLBACK_PRODUCTS;
  return _productsCache;
}

// ─── WhatsApp Checkout Messages ──────────────────────────────────────────────
function buildWhatsAppMessage(items) {
  let msg = `Hello FLY FASHION! 🛍️\n\nI'd like to place an order for the following items:\n\n`;
  items.forEach((item, index) => {
    const cost = item.price * item.quantity;
    msg += `*${index + 1}. ${item.name}*\n`;
    if (item.size) msg += `Size: ${item.size}\n`;
    if (item.color) {
      // Find friendly name or keep hex
      msg += `Color: ${item.color}\n`;
    }
    msg += `Qty: ${item.quantity} x ${formatPrice(item.price)}\n`;
    msg += `Subtotal: ${formatPrice(cost)}\n\n`;
  });
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  msg += `*Total Order Value: ${formatPrice(total)}*\n\nPlease confirm availability and let me know the delivery processing details. Thank you! 🙏`;
  return encodeURIComponent(msg);
}

function openWhatsApp(items) {
  if (!items || items.length === 0) return;
  const msg = buildWhatsAppMessage(items);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  window.open(url, '_blank');
}

// ─── Dark Mode Handler ───────────────────────────────────────────────────────
function initDarkMode() {
  const saved = localStorage.getItem('ff_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  syncDarkModeToggles();
}

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('ff_theme', isDark ? 'dark' : 'light');
  syncDarkModeToggles();
  return isDark;
}

function syncDarkModeToggles() {
  const isDark = document.documentElement.classList.contains('dark');
  document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
    btn.innerHTML = isDark ? '<i class="fas fa-sun text-sm"></i>' : '<i class="fas fa-moon text-sm"></i>';
  });
}

// ─── Scroll Reveal Observer ──────────────────────────────────────────────────
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    
    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if no observer is supported
    revealElements.forEach(el => el.classList.add('animate-in'));
  }
}

// ─── Back to Top Controller ──────────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, { passive: true });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── Mobile Slide Menu ───────────────────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('menu-overlay');
  if (!toggle || !menu) return;
  
  function openMenu() {
    menu.style.transform = 'translateX(0%)';
    if (overlay) {
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
    }
    toggle.innerHTML = '<i class="fas fa-times text-xl"></i>';
  }
  
  function closeMenu() {
    menu.style.transform = 'translateX(100%)';
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }
    toggle.innerHTML = '<i class="fas fa-bars text-xl"></i>';
  }
  
  toggle.addEventListener('click', () => {
    const isOpen = menu.style.transform === 'translateX(0%)';
    if (isOpen) closeMenu();
    else openMenu();
  });
  
  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }
}

// ─── Loading Screen Dismissal (Absolutely Frozen-proof) ──────────────────────
function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.add('fade-out');
    // Ensure display hidden after transition
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 500);
  }
}

// ─── Quick View Modal Functionality ──────────────────────────────────────────
function openQuickView(product) {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;
  
  // Set details
  document.getElementById('qv-image').src = product.images[0];
  document.getElementById('qv-name').textContent = product.name;
  document.getElementById('qv-price').textContent = formatPrice(product.price);
  
  const oldPriceEl = document.getElementById('qv-old-price');
  if (product.oldPrice) {
    oldPriceEl.textContent = formatPrice(product.oldPrice);
    oldPriceEl.style.display = 'inline';
  } else {
    oldPriceEl.style.display = 'none';
  }
  
  document.getElementById('qv-rating').innerHTML = renderStars(product.rating) + 
    ` <span class="text-gray-500 dark:text-gray-400 text-xs">(${product.reviews} reviews)</span>`;
  document.getElementById('qv-description').textContent = product.description;
  document.getElementById('qv-link').href = `product.html?id=${product.id}`;
  
  // Sizes Setup
  const sizesEl = document.getElementById('qv-sizes');
  sizesEl.innerHTML = product.sizes.map(s => 
    `<button onclick="selectQVSize(this, '${s}')" class="size-btn px-3 py-1.5 text-xs font-semibold">${s}</button>`
  ).join('');
  
  // Colors Setup
  const colorsEl = document.getElementById('qv-colors');
  colorsEl.innerHTML = product.colors.map(c => 
    `<button onclick="selectQVColor(this, '${c}')" class="color-swatch" style="background:${c}" title="${c}"></button>`
  ).join('');
  
  // Selection references
  modal._product = product;
  modal._selectedSize = product.sizes[0];
  modal._selectedColor = product.colors[0];
  
  // Pre-select first options
  setTimeout(() => {
    const firstSizeBtn = sizesEl.querySelector('button');
    if (firstSizeBtn) firstSizeBtn.click();
    const firstColorBtn = colorsEl.querySelector('button');
    if (firstColorBtn) firstColorBtn.click();
  }, 10);
  
  // Show Modal
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function selectQVSize(btn, size) {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;
  modal._selectedSize = size;
  
  const container = document.getElementById('qv-sizes');
  container.querySelectorAll('button').forEach(b => b.classList.remove('active', 'selected'));
  btn.classList.add('active', 'selected');
}

function selectQVColor(btn, color) {
  const modal = document.getElementById('quick-view-modal');
  if (!modal || !modal._product) return;
  modal._selectedColor = color;
  
  const container = document.getElementById('qv-colors');
  container.querySelectorAll('button').forEach(b => b.classList.remove('active', 'selected'));
  btn.classList.add('active', 'selected');

  // Dynamically change image based on selected color index
  const btns = Array.from(container.querySelectorAll('button'));
  const index = btns.indexOf(btn);
  if (index !== -1 && modal._product.images[index]) {
    document.getElementById('qv-image').src = modal._product.images[index];
  } else {
    document.getElementById('qv-image').src = modal._product.images[0];
  }
}

function addToCartFromModal() {
  const modal = document.getElementById('quick-view-modal');
  if (!modal || !modal._product) return;
  
  if (!modal._selectedSize) {
    showToast('Please select a size first!', 'warning');
    return;
  }
  
  addToCart(modal._product, modal._selectedSize, modal._selectedColor || modal._product.colors[0], 1);
  closeQuickView();
}

// ─── Product Card Builder Utility ────────────────────────────────────────────
function buildProductCard(product, relativePath = '') {
  const discount = product.oldPrice ? Math.round((1 - (product.price / product.oldPrice)) * 100) : 0;
  const escapedProduct = JSON.stringify(product).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
  
  return `
  <article class="product-card group relative rounded-2xl overflow-hidden shadow-sm transition-all duration-500 scroll-reveal">
    <div class="relative overflow-hidden aspect-[4/5] bg-gray-50 dark:bg-zinc-900">
      <img 
        src="${product.images[0]}" 
        alt="${product.name}"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80'"
      />
      ${discount > 0 ? `<span class="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-${discount}%</span>` : ''}
      ${product.newArrival ? `<span class="absolute top-3 ${discount > 0 ? 'left-16' : 'left-3'} bg-accent text-black text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>` : ''}
      
      <!-- Quick Actions -->
      <div class="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2">
        <button onclick="openQuickView(${escapedProduct})" class="w-full bg-white dark:bg-zinc-800 text-black dark:text-white text-xs font-bold py-2.5 rounded-xl hover:bg-accent hover:text-black dark:hover:bg-accent dark:hover:text-black transition-colors duration-300">
          <i class="fas fa-eye mr-2"></i>Quick View
        </button>
      </div>

      <!-- Wishlist Action -->
      <button 
        data-wishlist-id="${product.id}"
        onclick="toggleWishlist(${product.id})"
        class="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300"
        aria-label="Toggle Wishlist"
      >
        <i class="far fa-heart text-red-500 text-sm"></i>
      </button>
    </div>

    <!-- Details -->
    <div class="p-4">
      <p class="text-[10px] text-accent font-bold uppercase tracking-widest mb-1.5">${product.category}</p>
      <a href="${relativePath}product.html?id=${product.id}" class="block mb-2">
        <h3 class="font-semibold text-gray-900 dark:text-white text-xs leading-snug hover:text-accent transition-colors line-clamp-2 min-h-[32px]">${product.name}</h3>
      </a>
      
      <div class="flex items-center gap-1 mb-2.5">
        ${renderStars(product.rating)}
        <span class="text-[10px] text-gray-400 dark:text-gray-500 ml-1">(${product.reviews})</span>
      </div>

      <div class="flex items-center gap-1.5 mb-3.5">
        ${product.colors.slice(0, 4).map(c => `<span class="w-3 h-3 rounded-full border border-gray-200 dark:border-zinc-700" style="background:${c}"></span>`).join('')}
        ${product.colors.length > 4 ? `<span class="text-[10px] text-gray-400">+${product.colors.length - 4}</span>` : ''}
      </div>

      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <span class="font-bold text-sm text-gray-900 dark:text-white">${formatPrice(product.price)}</span>
          ${product.oldPrice ? `<span class="text-[10px] text-gray-400 line-through">${formatPrice(product.oldPrice)}</span>` : ''}
        </div>
        <button 
          onclick="addToCart(JSON.parse('${escapedProduct}'), '${product.sizes[0]}', '${product.colors[0]}', 1)"
          class="bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-3 py-2 rounded-xl hover:bg-accent dark:hover:bg-accent hover:text-black dark:hover:text-black transition-colors duration-300 flex items-center gap-1"
        >
          <i class="fas fa-bag-shopping"></i>
          <span>Add</span>
        </button>
      </div>
    </div>
  </article>`;
}

// ─── Bootstrapper ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Try-catch system load to secure screen block prevention
  try {
    initDarkMode();
    initMobileMenu();
    initBackToTop();
    updateCartBadge();
    
    // Wire up currencies
    document.querySelectorAll('[data-currency]').forEach(btn => {
      btn.addEventListener('click', () => {
        setCurrency(btn.getAttribute('data-currency'));
      });
      // Active states
      if (btn.getAttribute('data-currency') === currentCurrency) {
        btn.classList.add('active');
      }
    });

    // Dark modes
    document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
      btn.addEventListener('click', toggleDarkMode);
    });

    // Wire quick view modal closers
    document.getElementById('qv-close')?.addEventListener('click', closeQuickView);
    document.getElementById('quick-view-modal')?.addEventListener('click', function(e) {
      if (e.target === this) closeQuickView();
    });

    // Load initial icons
    updateWishlistIcons();
    setTimeout(initScrollAnimations, 150);

  } catch (error) {
    console.error("Critical initialization failure: ", error);
  } finally {
    // Dismiss loading overlay in 400ms under all circumstances
    setTimeout(hideLoader, 400);
  }
});
