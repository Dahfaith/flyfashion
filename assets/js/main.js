/**
 * FLY FASHION — Core Utilities Module
 * Shared across all pages
 */

// ─── Currency Formatter ───────────────────────────────────────────────────────
const CURRENCIES = {
  NGN: { symbol: '₦', code: 'NGN', rate: 1 },
  USD: { symbol: '$', code: 'USD', rate: 0.00065 },
  GBP: { symbol: '£', code: 'GBP', rate: 0.00051 },
};

let currentCurrency = localStorage.getItem('ff_currency') || 'NGN';

function formatPrice(nairaAmount) {
  const cur = CURRENCIES[currentCurrency];
  const converted = nairaAmount * cur.rate;
  if (currentCurrency === 'NGN') {
    return `${cur.symbol}${converted.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
  }
  return `${cur.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function setCurrency(code) {
  currentCurrency = code;
  localStorage.setItem('ff_currency', code);
}

// ─── Cart System ──────────────────────────────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem('ff_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('ff_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, size, color, quantity = 1) {
  const cart = getCart();
  const key = `${product.id}-${size}-${color}`;
  const existing = cart.find(i => i.key === key);
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
      stock: product.stock,
    });
  }
  saveCart(cart);
  showToast(`"${product.name}" added to cart!`, 'success');
}

function removeFromCart(key) {
  let cart = getCart();
  cart = cart.filter(i => i.key !== key);
  saveCart(cart);
}

function updateCartQty(key, qty) {
  const cart = getCart();
  const item = cart.find(i => i.key === key);
  if (item) {
    if (qty <= 0) { removeFromCart(key); return; }
    item.quantity = Math.min(qty, item.stock);
    saveCart(cart);
  }
}

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

function updateCartBadge() {
  document.querySelectorAll('.cart-count').forEach(el => {
    const count = getCartCount();
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ─── Wishlist System ──────────────────────────────────────────────────────────
function getWishlist() {
  return JSON.parse(localStorage.getItem('ff_wishlist') || '[]');
}

function toggleWishlist(productId) {
  let wishlist = getWishlist();
  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter(id => id !== productId);
    showToast('Removed from wishlist', 'info');
  } else {
    wishlist.push(productId);
    showToast('Added to wishlist ♥', 'success');
  }
  localStorage.setItem('ff_wishlist', JSON.stringify(wishlist));
  updateWishlistIcons();
  return wishlist.includes(productId);
}

function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

function updateWishlistIcons() {
  document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    const id = parseInt(btn.dataset.wishlistId);
    if (isInWishlist(id)) {
      btn.classList.add('wishlisted');
      const icon = btn.querySelector('i');
      if (icon) { icon.className = 'fas fa-heart'; }
    } else {
      btn.classList.remove('wishlisted');
      const icon = btn.querySelector('i');
      if (icon) { icon.className = 'far fa-heart'; }
    }
  });
}

// ─── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500', warning: 'bg-yellow-500' };
  toast.className = `flex items-center gap-3 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-2xl transform translate-x-full transition-all duration-500 ${colors[type] || colors.info}`;
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-x-full'), 10);
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

function createToastContainer() {
  const div = document.createElement('div');
  div.id = 'toast-container';
  div.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2';
  document.body.appendChild(div);
  return div;
}

// ─── Products Loader ──────────────────────────────────────────────────────────
let _productsCache = null;
async function loadProducts() {
  if (_productsCache) return _productsCache;
  try {
    const base = window.location.pathname.includes('/fly-fashion') ? '/fly-fashion' : '';
    const res = await fetch(`${base}/data/products.json`);
    _productsCache = await res.json();
    return _productsCache;
  } catch {
    const res = await fetch('./data/products.json').catch(() => fetch('../data/products.json'));
    _productsCache = await res.json();
    return _productsCache;
  }
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) html += '<i class="fas fa-star text-amber-400"></i>';
    else if (i - rating < 1) html += '<i class="fas fa-star-half-alt text-amber-400"></i>';
    else html += '<i class="far fa-star text-amber-400"></i>';
  }
  return html;
}

// ─── WhatsApp Checkout ────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '2348100000000'; // Replace with actual number

function buildWhatsAppMessage(items) {
  let msg = `Hello FLY FASHION! 🛍️\n\nI'd like to order:\n\n`;
  items.forEach((item, i) => {
    msg += `*Item ${i + 1}:*\n`;
    msg += `Product: ${item.name}\n`;
    msg += `Color: ${item.color}\n`;
    msg += `Size: ${item.size}\n`;
    msg += `Quantity: ${item.quantity}\n`;
    msg += `Price: ${formatPrice(item.price * item.quantity)}\n\n`;
  });
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  msg += `*Total: ${formatPrice(total)}*\n\nPlease confirm availability and delivery details. Thank you! 🙏`;
  return encodeURIComponent(msg);
}

function openWhatsApp(items) {
  const msg = buildWhatsAppMessage(items);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

// ─── Dark Mode ────────────────────────────────────────────────────────────────
function initDarkMode() {
  const saved = localStorage.getItem('ff_theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('ff_theme', isDark ? 'dark' : 'light');
  return isDark;
}

// ─── Scroll Animations ────────────────────────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

// ─── Back to Top ──────────────────────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('opacity-100', window.scrollY > 500);
    btn.classList.toggle('opacity-0', window.scrollY <= 500);
    btn.classList.toggle('pointer-events-auto', window.scrollY > 500);
    btn.classList.toggle('pointer-events-none', window.scrollY <= 500);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('menu-overlay');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('translate-x-0');
    menu.classList.toggle('translate-x-0', !isOpen);
    menu.classList.toggle('translate-x-full', isOpen);
    overlay?.classList.toggle('opacity-0', isOpen);
    overlay?.classList.toggle('opacity-100', !isOpen);
    overlay?.classList.toggle('pointer-events-none', isOpen);
    overlay?.classList.toggle('pointer-events-auto', !isOpen);
    toggle.innerHTML = isOpen
      ? '<i class="fas fa-bars text-xl"></i>'
      : '<i class="fas fa-times text-xl"></i>';
  });

  overlay?.addEventListener('click', () => {
    menu.classList.add('translate-x-full');
    menu.classList.remove('translate-x-0');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100', 'pointer-events-auto');
    toggle.innerHTML = '<i class="fas fa-bars text-xl"></i>';
  });
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
function showLoader() {
  document.getElementById('page-loader')?.classList.remove('hidden');
}
function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.add('opacity-0');
    setTimeout(() => loader.classList.add('hidden'), 500);
  }
}

// ─── Quick View Modal ─────────────────────────────────────────────────────────
function openQuickView(product) {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;
  document.getElementById('qv-image').src = product.images[0];
  document.getElementById('qv-name').textContent = product.name;
  document.getElementById('qv-price').textContent = formatPrice(product.price);
  document.getElementById('qv-old-price').textContent = product.oldPrice ? formatPrice(product.oldPrice) : '';
  document.getElementById('qv-rating').innerHTML = renderStars(product.rating) + ` <span class="text-gray-500 text-sm">(${product.reviews})</span>`;
  document.getElementById('qv-description').textContent = product.description;
  document.getElementById('qv-link').href = `product.html?id=${product.id}`;

  // Sizes
  const sizesEl = document.getElementById('qv-sizes');
  sizesEl.innerHTML = product.sizes.map(s =>
    `<button onclick="selectQVSize(this,'${s}')" class="size-btn px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:border-black dark:hover:border-white transition-colors">${s}</button>`
  ).join('');

  // Colors
  const colorsEl = document.getElementById('qv-colors');
  colorsEl.innerHTML = product.colors.map((c, i) =>
    `<button onclick="selectQVColor(this,'${c}')" data-color="${c}" class="color-dot w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform ${i === 0 ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''}" style="background:${c}"></button>`
  ).join('');

  modal._product = product;
  modal._selectedSize = product.sizes[0];
  modal._selectedColor = product.colors[0];

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  modal?.classList.add('hidden');
  document.body.style.overflow = '';
}

function selectQVSize(btn, size) {
  document.querySelectorAll('#qv-sizes .size-btn').forEach(b => b.classList.remove('bg-black', 'text-white', 'dark:bg-white', 'dark:text-black', 'border-black'));
  btn.classList.add('bg-black', 'text-white', 'border-black');
  document.getElementById('quick-view-modal')._selectedSize = size;
}

function selectQVColor(btn, color) {
  document.querySelectorAll('#qv-colors .color-dot').forEach(b => b.classList.remove('ring-2', 'ring-offset-2', 'ring-black', 'dark:ring-white'));
  btn.classList.add('ring-2', 'ring-offset-2', 'ring-black', 'dark:ring-white');
  document.getElementById('quick-view-modal')._selectedColor = color;
}

function addToCartFromModal() {
  const modal = document.getElementById('quick-view-modal');
  if (!modal?._product) return;
  addToCart(modal._product, modal._selectedSize || modal._product.sizes[0], modal._selectedColor || modal._product.colors[0], 1);
}

// ─── Product Card HTML ────────────────────────────────────────────────────────
function buildProductCard(product, base = '') {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return `
  <article class="product-card group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 scroll-reveal">
    <div class="relative overflow-hidden aspect-[3/4]">
      <img 
        src="${product.images[0]}" 
        alt="${product.name}"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=60'"
      />
      ${discount > 0 ? `<span class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-${discount}%</span>` : ''}
      ${product.newArrival ? `<span class="absolute top-3 ${discount > 0 ? 'left-16' : 'left-3'} bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-1 rounded-full">NEW</span>` : ''}
      
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex flex-col items-center justify-end p-4 gap-2 opacity-0 group-hover:opacity-100">
        <button onclick='openQuickView(${JSON.stringify(product).replace(/'/g, "&#39;")})' class="w-full bg-white text-black text-sm font-semibold py-2.5 rounded-xl hover:bg-black hover:text-white transition-colors duration-300">
          <i class="fas fa-eye mr-2"></i>Quick View
        </button>
      </div>

      <button 
        data-wishlist-id="${product.id}"
        onclick="toggleWishlist(${product.id}); updateWishlistIcons();"
        class="wishlist-btn absolute top-3 right-3 w-9 h-9 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300 ${isInWishlist(product.id) ? 'wishlisted' : ''}"
      >
        <i class="${isInWishlist(product.id) ? 'fas' : 'far'} fa-heart text-red-500 text-sm"></i>
      </button>
    </div>

    <div class="p-4">
      <p class="text-xs text-accent font-semibold uppercase tracking-widest mb-1">${product.category}</p>
      <a href="${base}product.html?id=${product.id}" class="block">
        <h3 class="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-2 hover:text-accent transition-colors line-clamp-2">${product.name}</h3>
      </a>
      
      <div class="flex items-center gap-1 mb-2">
        ${renderStars(product.rating)}
        <span class="text-xs text-gray-500 ml-1">(${product.reviews})</span>
      </div>

      <div class="flex items-center gap-2 mb-3">
        ${product.colors.slice(0, 5).map(c => `<span class="w-4 h-4 rounded-full border border-gray-200" style="background:${c}"></span>`).join('')}
        ${product.colors.length > 5 ? `<span class="text-xs text-gray-400">+${product.colors.length - 5}</span>` : ''}
      </div>

      <div class="flex items-center justify-between">
        <div>
          <span class="font-bold text-gray-900 dark:text-white">${formatPrice(product.price)}</span>
          ${product.oldPrice ? `<span class="text-xs text-gray-400 line-through ml-1">${formatPrice(product.oldPrice)}</span>` : ''}
        </div>
        <button 
          onclick='(function(){const p=${JSON.stringify(product).replace(/'/g, "&#39;")}; addToCart(p, p.sizes[0], p.colors[0], 1);})()'
          class="bg-black dark:bg-white text-white dark:text-black text-xs font-semibold px-3 py-2 rounded-xl hover:bg-accent hover:text-white transition-colors duration-300 flex items-center gap-1"
        >
          <i class="fas fa-bag-shopping text-xs"></i>
          <span class="hidden sm:inline">Add</span>
        </button>
      </div>
    </div>
  </article>`;
}

// ─── Init on DOM Ready ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initMobileMenu();
  initBackToTop();
  updateCartBadge();
  updateWishlistIcons();
  setTimeout(initScrollAnimations, 100);
  setTimeout(hideLoader, 800);

  // Currency switcher
  document.querySelectorAll('[data-currency]').forEach(btn => {
    btn.addEventListener('click', () => {
      setCurrency(btn.dataset.currency);
      window.location.reload();
    });
  });

  // Dark mode toggle
  document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = toggleDarkMode();
      btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
    const isDark = document.documentElement.classList.contains('dark');
    btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });

  // Quick view modal close
  document.getElementById('qv-close')?.addEventListener('click', closeQuickView);
  document.getElementById('quick-view-modal')?.addEventListener('click', function(e) {
    if (e.target === this) closeQuickView();
  });
});
