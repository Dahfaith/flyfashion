// Configuration Properties
const WHATSAPP_PHONE = "2347069659752"; // Replace with your corporate standard WhatsApp number

// Global Cart & Wishlist State Management Engines
let cart = JSON.parse(localStorage.getItem('fly_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('fly_wishlist')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initGlobalUI();
    updateGlobalBadges();
    initQuickViewModal();
});

function initGlobalUI() {
    // Theme Management Engine
    const themeToggle = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // Mobile Navigation Drawer Toggle Handler
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if(menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
        });
    }

    // Back to Top Interactive Element logic
    const bttBtn = document.getElementById('back-to-top');
    if(bttBtn) {
        window.addEventListener('scroll', () => {
            if(window.scrollY > 500) {
                bttBtn.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                bttBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        });
        bttBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Global Notification Alert Subsystem
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `animate-toast flex items-center p-4 rounded-xl shadow-xl text-sm font-medium transition-all ${
        type === 'success' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-red-600 text-white'
    }`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateGlobalBadges() {
    const cartCountBadges = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountBadges.forEach(badge => badge.textContent = totalItems);
    localStorage.setItem('fly_cart', JSON.stringify(cart));
    localStorage.setItem('fly_wishlist', JSON.stringify(wishlist));
}

// Global Cart Insertion API Interface
function addToCart(id, name, price, img, size, color, quantity = 1) {
    const existingIndex = cart.findIndex(item => item.id === id && item.size === size && item.color === color);
    if(existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({ id, name, price, img, size, color, quantity });
    }
    updateGlobalBadges();
    showToast(`${name} added to cart.`);
}

// Shared Component: Dynamic Framework Micro-Modal Module
function initQuickViewModal() {
    const modalHtml = `
    <div id="quickview-modal" class="fixed inset-0 z-50 items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300">
        <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button id="close-qv" class="absolute top-4 right-4 text-slate-500 hover:text-black dark:hover:text-white"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            <div id="qv-content" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"></div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('quickview-modal');
    const closeBtn = document.getElementById('close-qv');
    if(closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex', 'opacity-100');
        });
    }
}

function openQuickView(product) {
    const modal = document.getElementById('quickview-modal');
    const content = document.getElementById('qv-content');
    if(!modal || !content) return;
    
    content.innerHTML = `
        <div class="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img class="w-full h-full object-cover" src="${product.images[0]}" alt="${product.name}">
        </div>
        <div class="flex flex-col justify-between">
            <div>
                <span class="text-xs tracking-widest text-slate-400 uppercase font-bold">${product.category}</span>
                <h2 class="text-xl font-bold mt-1 text-slate-900 dark:text-white">${product.name}</h2>
                <p class="text-lg font-semibold mt-2 text-emerald-600 dark:text-emerald-400">₦${product.price.toLocaleString()}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-3">${product.description}</p>
            </div>
            <div class="mt-6">
                <button onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.images[0]}', '${product.sizes[0] || 'U'}', '${product.colors[0] || '#000'}', 1); document.getElementById('quickview-modal').classList.add('hidden');" class="w-full py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium tracking-wide hover:opacity-90 transition">Add to Bag</button>
                <a href="product.html?id=${product.id}" class="block text-center text-xs underline mt-3 font-medium text-slate-500 hover:text-black dark:hover:text-white">View Full Details</a>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex', 'opacity-100');
}
