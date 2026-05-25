document.addEventListener('DOMContentLoaded', () => {
    syncCartUI();
});

function syncCartUI() {
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary-card');
    const emptyState = document.getElementById('cart-empty-state');
    
    if(!container) return;

    if(cart.length === 0) {
        container.innerHTML = '';
        summary?.classList.remove('flex');
        summary?.classList.add('hidden');
        emptyState?.classList.remove('hidden');
        emptyState?.classList.add('flex');
        return;
    }

    emptyState?.classList.remove('flex');
    emptyState?.classList.add('hidden');
    summary?.classList.remove('hidden');
    summary?.classList.add('flex');

    let runningTotal = 0;

    container.innerHTML = cart.map((item, idx) => {
        const extendedCost = item.price * item.quantity;
        runningTotal += extendedCost;
        return `
            <div class="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div class="w-20 h-24 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 shrink-0">
                    <img src="${item.img}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-bold truncate text-slate-900 dark:text-white">${item.name}</h3>
                    <p class="text-xs text-slate-400 mt-0.5">Size: ${item.size} | Tonal Metric: ${item.color}</p>
                    <p class="text-sm font-bold text-slate-950 dark:text-slate-50 mt-2">₦${item.price.toLocaleString()}</p>
                </div>
                <div class="flex items-center gap-3 border border-slate-100 dark:border-slate-800 rounded-xl px-2 py-1">
                    <button onclick="modifyQuantity(${idx}, -1)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><i data-lucide="minus" class="w-3 h-3"></i></button>
                    <span class="text-xs font-mono font-bold">${item.quantity}</span>
                    <button onclick="modifyQuantity(${idx}, 1)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><i data-lucide="plus" class="w-3 h-3"></i></button>
                </div>
                <button onclick="purgeCartElement(${idx})" class="p-2 text-slate-300 hover:text-red-500 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        `;
    }).join('');

    document.getElementById('cart-total-val').textContent = `₦${runningTotal.toLocaleString()}`;
    lucide.createIcons();
}

function modifyQuantity(index, shift) {
    cart[index].quantity += shift;
    if(cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateGlobalBadges();
    syncCartUI();
}

function purgeCartElement(index) {
    cart.splice(index, 1);
    updateGlobalBadges();
    syncCartUI();
}

// WhatsApp Checkout Protocol Generator Engine
function dispatchWhatsAppCheckout() {
    if(cart.length === 0) return;
    
    let subtotal = 0;
    let manifestStr = "Hello FLY FASHION, I am dispatching a custom acquisition pipeline order:\n\n";
    
    cart.forEach((item, index) => {
        const cost = item.price * item.quantity;
        subtotal += cost;
        manifestStr += `${index + 1}. Product: ${item.name}\n   Config: Size [${item.size}] | Tonal [${item.color}]\n   Qty: ${item.quantity} units\n   Price: ₦${cost.toLocaleString()}\n\n`;
    });
    
    manifestStr += `------------------------\nTotal Evaluation: ₦${subtotal.toLocaleString()}\n\nPlease verify shipping configurations and process billing.`;
    
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(manifestStr)}`, '_blank');
}
