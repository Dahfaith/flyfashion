document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const targetId = parseInt(params.get('id'));

    fetch('data/products.json')
        .then(res => res.json())
        .then(products => {
            const product = products.find(p => p.id === targetId);
            if(product) {
                renderProductDetails(product);
            } else {
                document.getElementById('detail-host').innerHTML = `<p class="text-center py-20 text-slate-400">Target architectural reference could not be mapped within registry.</p>`;
            }
        });
});

function renderProductDetails(product) {
    const container = document.getElementById('detail-host');
    if(!container) return;

    // Track active selection parameters
    let selectedSize = product.sizes[0] || 'U';
    let selectedColor = product.colors[0] || '#000';

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div class="flex flex-col gap-4">
                <div class="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                    <img id="main-viewer" src="${product.images[0]}" alt="${product.name}" class="w-full h-full object-cover">
                </div>
                <div class="grid grid-cols-4 gap-2">
                    ${product.images.map((img, idx) => `
                        <div onclick="document.getElementById('main-viewer').src='${img}'" class="aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 cursor-pointer border border-transparent hover:border-black dark:hover:border-white transition">
                            <img src="${img}" class="w-full h-full object-cover">
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="flex flex-col justify-between py-2">
                <div>
                    <span class="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">${product.category}</span>
                    <h1 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white mt-1">${product.name}</h1>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white mt-4">₦${product.price.toLocaleString()}</p>
                    <p class="text-sm font-light text-slate-500 dark:text-slate-400 leading-relaxed mt-6">${product.description}</p>
                    
                    <div class="mt-8">
                        <h3 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">Select Size Matrix</h3>
                        <div class="flex gap-2">
                            ${product.sizes.map(s => `<button onclick="window.activeSize='${s}'; selectUiElement(this, 'size-btn')" class="size-btn px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition hover:border-black dark:hover:border-white">${s}</button>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-3 mt-12">
                    <button id="bag-add-cta" class="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-bold tracking-wide rounded-xl shadow-lg hover:opacity-95 transition">Secure Item In Bag</button>
                    <button id="wa-checkout-cta" class="w-full py-4 bg-emerald-600 text-white font-bold tracking-wide rounded-xl shadow-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.498 1.451 5.438 1.453 5.494 0 9.961-4.47 9.964-9.969.002-2.663-1.033-5.166-2.907-7.042C17.267 1.721 14.76 .684 12.01 .684c-5.497 0-9.965 4.47-9.968 9.97a9.916 9.916 0 0 0 1.514 5.248l-.995 3.634 3.72-.976zm12.115-7.3c-.33-.165-1.951-.963-2.251-1.072-.3-.11-.518-.165-.736.165-.218.33-.844 1.072-1.034 1.292-.19.22-.38.242-.71.077-1.124-.563-1.921-.974-2.682-1.681-.76-.707-1.11-1.425-1.242-1.754-.132-.33-.014-.508.151-.672.15-.147.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.412-.028-.577-.082-.165-.736-1.774-1.009-2.434-.266-.64-.537-.553-.736-.563-.19-.01-.408-.012-.626-.012-.218 0-.572.082-.871.412-.3.33-1.144 1.118-1.144 2.724 0 1.607 1.171 3.159 1.334 3.379.163.22 2.304 3.518 5.582 4.933.78.337 1.389.538 1.864.689.783.248 1.497.213 2.06.13.629-.094 1.951-.798 2.224-1.54.273-.742.273-1.375.191-1.513-.082-.137-.3-.219-.63-.384z"/></svg>
                        Buy Directly via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `;

    // Instantiate State Hooks
    window.activeSize = selectedSize;
    window.activeColor = selectedColor;

    // Attach Interactivity Signals
    document.getElementById('bag-add-cta').addEventListener('click', () => {
        addToCart(product.id, product.name, product.price, product.images[0], window.activeSize, window.activeColor, 1);
    });

    document.getElementById('wa-checkout-cta').addEventListener('click', () => {
        const message = `Hello FLY FASHION, I want to immediately reserve:\n\nProduct: ${product.name}\nSize Matrix: ${window.activeSize}\nColor: ${window.activeColor}\nValuation: ₦${product.price.toLocaleString()}\n\nPlease verify availability queue.`;
        window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`, '_blank');
    });

    // Auto select first entries visual indicator
    const firstBtn = container.querySelector('.size-btn');
    if(firstBtn) firstBtn.classList.add('bg-black', 'text-white', 'dark:bg-white', 'dark:text-black');
}

function selectUiElement(element, className) {
    document.querySelectorAll('.' + className).forEach(b => b.classList.remove('bg-black', 'text-white', 'dark:bg-white', 'dark:text-black'));
    element.classList.add('bg-black', 'text-white', 'dark:bg-white', 'dark:text-black');
}
