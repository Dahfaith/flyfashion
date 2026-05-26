let productsDatabase = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Immediately extract URL query parameter mapping
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category');
    
    const categoryFilter = document.getElementById('category-filter');
    if (initialCategory && categoryFilter) {
        categoryFilter.value = initialCategory;
    }

    // 2. Fetch data from local storage/JSON database infrastructure
    fetch('data/products.json')
        .then(res => res.json())
        .then(data => {
            productsDatabase = data;
            setupFilterListeners();
            executeFilterPipeline(); // Run explicitly after dataset ingestion
        })
        .catch(err => {
            console.error('Database Ingestion Engine Failure:', err);
            // Fallback UI to notify user of fetch errors
            const grid = document.getElementById('shop-grid');
            if(grid) grid.innerHTML = `<p class="col-span-full text-center text-xs text-red-500">Failed to load system products matrix.</p>`;
        });
});

function setupFilterListeners() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const priceRange = document.getElementById('price-range');

    if (searchInput) searchInput.addEventListener('input', executeFilterPipeline);
    if (categoryFilter) categoryFilter.addEventListener('change', executeFilterPipeline);
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            const priceValDisplay = document.getElementById('price-val');
            if (priceValDisplay) {
                priceValDisplay.textContent = `₦${(parseInt(e.target.value) / 1000)}k`;
            }
            executeFilterPipeline();
        });
    }
}

function executeFilterPipeline() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const priceRange = document.getElementById('price-range');

    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const catVal = categoryFilter ? categoryFilter.value : 'all';
    const maxPrice = priceRange ? parseInt(priceRange.value) : 200000;

    const filteredOutput = productsDatabase.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchVal) || p.description.toLowerCase().includes(searchVal);
        const matchesCat = (catVal === 'all') || (p.category === catVal);
        const matchesPrice = p.price <= maxPrice;
        return matchesSearch && matchesCat && matchesPrice;
    });

    renderShopGrid(filteredOutput);
}

function renderShopGrid(items) {
    const grid = document.getElementById('shop-grid');
    const empty = document.getElementById('empty-view');
    if (!grid) return;

    if (!items || items.length === 0) {
        grid.innerHTML = '';
        if (empty) {
            empty.classList.remove('hidden');
            empty.classList.add('flex');
        }
        return;
    }

    if (empty) {
        empty.classList.remove('flex');
        empty.classList.add('hidden');
    }

    grid.innerHTML = items.map(p => {
        // Stringify product safely for quickview execution injection
        const productString = JSON.stringify(p).replace(/"/g, '&quot;');
        return `
        <div class="group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl overflow-hidden p-3 shadow-xs hover:shadow-md border border-slate-100 dark:border-slate-800 transition">
            <div class="w-full aspect-[4/5] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
                <img src="${p.images[0]}" alt="${p.name}" class="w-full h-full object-cover zoom-img" loading="lazy">
                <button onclick="event.preventDefault(); openQuickView(${productString})" class="absolute bottom-3 left-3 right-3 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md py-2.5 rounded-xl text-center text-xs font-bold tracking-wider uppercase shadow-md transition opacity-0 group-hover:opacity-100 text-slate-900 dark:text-white cursor-pointer z-10">Quick View</button>
            </div>
            <div class="mt-4 px-1 flex flex-col flex-1 justify-between">
                <div class="mb-3">
                    <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">${p.category}</span>
                    <h3 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-0.5 truncate">
                        <a href="product.html?id=${p.id}" class="hover:underline">${p.name}</a>
                    </h3>
                    <p class="text-sm font-bold text-slate-900 dark:text-white mt-1">₦${p.price.toLocaleString()}</p>
                </div>
                <button onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${p.images[0]}', '${p.sizes[0] || 'M'}', '${p.colors[0] || '#000'}', 1)" class="w-full py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition cursor-pointer">Add To Bag</button>
            </div>
        </div>`;
    }).join('');
    
    if (window.lucide) {
        lucide.createIcons();
    }
}
