/* ============================================================
   Sri Devi Textiles — Shared JavaScript (User + Admin)
   Products: Firestore | Other data: localStorage
   ============================================================ */

const SD_KEYS = {
  products: 'sd_products',
  orders: 'sd_orders',
  cart: 'sd_cart',
  wishlist: 'sd_wishlist',
  reviews: 'sd_reviews',
  session: 'sd_admin_session',
  customers: 'sd_customers',
  settings: 'sd_settings',
  initialized: 'sd_initialized'
};

const RAZORPAY_KEY = 'RAZORPAY_TEST_KEY';

const EMAILJS_CONFIG = {
  serviceId: 'service_sri_devi_demo',
  templateId: 'template_contact_demo',
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
};

const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin@123' };

const COLOR_MAP = {
  Red: '#c0392b', Maroon: '#8B0000', Gold: '#D4AF37', Blue: '#2980b9',
  Green: '#27ae60', Black: '#111111', Ivory: '#FFFFF0', Pink: '#e91e8c',
  Peach: '#ffcba4', Cream: '#fffdd0', Silver: '#c0c0c0', Navy: '#001f3f',
  Emerald: '#2ecc71', Purple: '#7b2cbf', Pearl: '#f5f5dc', Orange: '#e67e22',
  Teal: '#008080', Magenta: '#c71585', Beige: '#f5f5dc', Wine: '#722f37',
  Yellow: '#FFD700', White: '#FFFFFF', Grey: '#808080', Gray: '#808080',
  Brown: '#8B4513', Coral: '#FF7F50', Turquoise: '#40E0D0', Lavender: '#E6E6FA',
  Mint: '#98FF98', Olive: '#808000', Cyan: '#00FFFF', Indigo: '#4B0082',
  Violet: '#8F00FF', Rose: '#FF007F', Champagne: '#F7E7CE', Rust: '#B7410E',
  Copper: '#B87333', Bronze: '#CD7F32', Charcoal: '#36454F', Sky: '#87CEEB',
  Aqua: '#00FFFF', Lime: '#32CD32', Mustard: '#FFDB58', Burgundy: '#800020',
  Fuchsia: '#FF00FF', Hotpink: '#FF69B4', HotPink: '#FF69B4', Tan: '#D2B48C',
  Khaki: '#F0E68C', Slate: '#708090', Crimson: '#DC143C', Scarlet: '#FF2400'
};

const CSS_COLOR_KEYWORDS = {
  red: '#FF0000', blue: '#0057B7', green: '#008000', black: '#000000',
  white: '#FFFFFF', yellow: '#FFD700', orange: '#FFA500', pink: '#FFC0CB',
  purple: '#800080', brown: '#A52A2A', grey: '#808080', gray: '#808080',
  navy: '#000080', teal: '#008080', cyan: '#00FFFF', magenta: '#FF00FF',
  gold: '#FFD700', silver: '#C0C0C0', maroon: '#800000', olive: '#808000',
  lime: '#00FF00', aqua: '#00FFFF', coral: '#FF7F50', salmon: '#FA8072',
  violet: '#EE82EE', indigo: '#4B0082', beige: '#F5F5DC', ivory: '#FFFFF0',
  khaki: '#F0E68C', lavender: '#E6E6FA', plum: '#DDA0DD', orchid: '#DA70D6',
  chocolate: '#D2691E', tomato: '#FF6347', turquoise: '#40E0D0', wheat: '#F5DEB3',
  snow: '#FFFAFA', mint: '#98FF98', peach: '#FFCBA4', cream: '#FFFDD0',
  wine: '#722F37', rust: '#B7410E', charcoal: '#36454F', fuchsia: '#FF00FF',
  hotpink: '#FF69B4', skyblue: '#87CEEB', royalblue: '#4169E1', midnightblue: '#191970',
  forestgreen: '#228B22', seagreen: '#2E8B57', darkgreen: '#006400', darkred: '#8B0000',
  darkblue: '#00008B', darkorange: '#FF8C00', lightblue: '#ADD8E6', lightgreen: '#90EE90',
  lightpink: '#FFB6C1', lightgray: '#D3D3D3', lightgrey: '#D3D3D3', darkgray: '#A9A9A9',
  darkgrey: '#A9A9A9', rosybrown: '#BC8F8F', sandybrown: '#F4A460', goldenrod: '#DAA520',
  darkgoldenrod: '#B8860B', darkkhaki: '#BDB76B', darkslategray: '#2F4F4F', slategray: '#708090'
};

const GENERIC_COLOR_RE = /^color\s*\d+$/i;

function isLightHex(hex) {
  if (!hex || !hex.startsWith('#')) return false;
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  if (full.length < 6) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 200;
}

function getColorHex(name, product = null) {
  if (!name) return null;
  const np = product ? (product.variants ? product : normalizeProduct(product)) : null;
  if (np?.colorVariants) {
    const cv = np.colorVariants.find(c => c.name === name);
    if (cv?.hex && !GENERIC_COLOR_RE.test(cv.name)) return cv.hex;
  }
  if (np?.variants) {
    const v = np.variants.find(x => x.color === name);
    if (v?.hex && !GENERIC_COLOR_RE.test(v.color)) return v.hex;
  }
  const trimmed = String(name).trim();
  if (COLOR_MAP[trimmed]) return COLOR_MAP[trimmed];
  const mapKey = Object.keys(COLOR_MAP).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (mapKey) return COLOR_MAP[mapKey];
  const lower = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (CSS_COLOR_KEYWORDS[lower]) return CSS_COLOR_KEYWORDS[lower];
  for (const [key, val] of Object.entries(CSS_COLOR_KEYWORDS)) {
    if (lower.includes(key) || key.includes(lower)) return val;
  }
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return val;
  }
  return null;
}

function getColorName(entry) {
  if (!entry) return '';
  if (typeof entry === 'object' && entry.name) return entry.name;
  return String(entry);
}

function getColorNames(product) {
  const p = normalizeProduct(product);
  return p.colors || [];
}

function loadProductImages(product, color) {
  const p = normalizeProduct(product);
  const colorName = color || p.colors[0];
  const variant = p.variants.find(x => x.color === colorName) || p.variants[0];
  let imgs = (variant?.images || []).filter(Boolean).map(safeImg);
  if (!imgs.length) {
    const cv = p.colorVariants?.find(c => c.name === colorName);
    if (cv?.image) imgs = [safeImg(cv.image)];
  }
  if (!imgs.length && p.galleryImages?.length) imgs = p.galleryImages.map(safeImg);
  if (!imgs.length && p.mainImage) imgs = [safeImg(p.mainImage)];
  if (!imgs.length) imgs = [CATEGORY_IMAGES[p.category] || PLACEHOLDER_IMAGE];
  return imgs;
}

function getProductImages(product, color) {
  return loadProductImages(product, color);
}

function changeProductImage(mainEl, src, thumbsContainer = null, thumbIndex = 0) {
  if (!mainEl) return;
  const url = safeImg(src);
  mainEl.classList.add('fade-out');
  setTimeout(() => {
    mainEl.src = url;
    bindImageFallback(mainEl);
    mainEl.classList.remove('fade-out');
  }, 150);
  if (thumbsContainer) {
    thumbsContainer.querySelectorAll('.pd-thumb, .qv-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === thumbIndex);
    });
  }
}

function renderGallery(container, images, activeIndex = 0, thumbClass = 'pd-thumb') {
  if (!container) return;
  const imgs = (images || []).filter(Boolean).map(safeImg);
  container.classList.toggle('gallery-hidden', imgs.length <= 1);
  container.innerHTML = imgs.map((img, i) =>
    `<button type="button" class="${thumbClass} ${i === activeIndex ? 'active' : ''}" data-index="${i}" data-img="${img}" aria-label="View image ${i + 1}">
      <img src="${img}" alt="" loading="lazy">
    </button>`
  ).join('');
  container.querySelectorAll('img').forEach(bindImageFallback);
}

function renderColorVariants(container, product, activeColor = null) {
  if (!container) return;
  const p = normalizeProduct(product);
  const active = activeColor || p.colors[0];
  container.className = 'color-swatches';
  container.innerHTML = p.colorVariants.map(cv =>
    colorSwatchHTML(cv, cv.name === active, container.id === 'pd-colors' ? 'pd-color-swatch' : '', p)
  ).join('');
}

function renderSignatureBadgeHTML(label = 'Signature') {
  return `<span class="badge signature signature-badge-pos">${label}</span>`;
}

function renderSignatureBadge(el, badge, label) {
  if (!el) return;
  const show = badge === 'signature';
  el.classList.toggle('hidden', !show);
  if (show) el.textContent = label || BADGE_LABELS.signature || 'Signature Collection';
}

const SHOP_NAV_SLUGS = ['new-arrivals', 'men', 'women', 'kids', 'accessories', 'signature'];

const CATEGORY_META = {
  women: { label: 'Women' },
  men: { label: 'Men' },
  kids: { label: 'Kids' },
  accessories: { label: 'Accessories' },
  signature: { label: 'Signature Sarees' },
  'new-arrivals': { label: 'New Arrivals' }
};

const CATEGORY_ALIASES = {
  women: 'women', men: 'men', kids: 'kids', accessories: 'accessories',
  signature: 'signature', 'new-arrivals': 'new-arrivals',
  Women: 'women', Men: 'men', Kids: 'kids', Accessories: 'accessories',
  'Signature Sarees': 'signature', Signature: 'signature', 'Signature Collection': 'signature',
  'New Arrivals': 'new-arrivals'
};

function normalizeCategory(value) {
  if (!value) return '';
  const key = String(value).trim();
  if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key];
  const lower = key.toLowerCase();
  if (CATEGORY_ALIASES[lower]) return CATEGORY_ALIASES[lower];
  const slug = lower.replace(/\s+/g, '-');
  return CATEGORY_META[slug] ? slug : slug;
}

function getCategoryLabel(slug) {
  const normalized = normalizeCategory(slug);
  return CATEGORY_META[normalized]?.label || normalized || 'All Products';
}

function filterProducts(filters = {}) {
  let products = getProducts()
    .filter(p => p.status === 'active' || p.status === 'out_of_stock')
    .map(p => normalizeProduct(p));

  const cat = normalizeCategory(filters.category);
  if (cat === 'signature') {
    products = products.filter(p => p.category === 'signature');
  } else if (cat === 'new-arrivals') {
    products = [...products].sort((a, b) => b.createdAt - a.createdAt);
  } else if (cat) {
    products = products.filter(p => p.category === cat);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      getCategoryLabel(p.category).toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.badge || '').toLowerCase().includes(q) ||
      p.colors.some(c => c.toLowerCase().includes(q))
    );
  }
  if (filters.color) products = products.filter(p => p.colors.includes(filters.color));
  if (filters.size) products = products.filter(p => p.sizes.includes(filters.size));
  products = products.filter(p => {
    const price = p.offerPrice || p.price;
    return price >= (filters.priceMin || 0) && price <= (filters.priceMax || 50000);
  });

  switch (filters.sort) {
    case 'price-low': products.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price)); break;
    case 'price-high': products.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price)); break;
    default: products.sort((a, b) => b.createdAt - a.createdAt);
  }
  return products;
}

function renderProductGrid(container, products, options = {}) {
  if (!container) return;
  if (!products.length) {
    container.innerHTML = options.emptyMessage || '<p class="empty-msg">No products found matching your filters.</p>';
    return;
  }
  container.innerHTML = products
    .map(p => productCardHTML(p, { noReveal: options.noReveal }))
    .join('');
  initImageFallbacks(container);
}

function renderPagination(container, currentPage, totalPages) {
  if (!container) return;
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  const cur = Math.min(Math.max(1, currentPage), totalPages);
  let html = `<button type="button" class="page-btn" data-page="${cur - 1}" ${cur === 1 ? 'disabled' : ''} aria-label="Previous page">&lt;</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button type="button" class="page-btn ${i === cur ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button type="button" class="page-btn" data-page="${cur + 1}" ${cur === totalPages ? 'disabled' : ''} aria-label="Next page">&gt;</button>`;
  container.innerHTML = html;
}

function updateNavActive(page, categorySlug = '') {
  const cat = normalizeCategory(categorySlug);
  document.querySelectorAll('.main-nav a').forEach(a => {
    const nav = a.dataset.nav;
    const linkCat = normalizeCategory(a.dataset.category || '');
    let active = false;
    if (page === 'home' && nav === 'home') active = true;
    else if (page === 'about' && nav === 'about') active = true;
    else if (page === 'contact' && nav === 'contact') active = true;
    else if (page === 'shop' && nav === 'shop' && linkCat && linkCat === cat) active = true;
    a.classList.toggle('active', active);
  });
}

function migrateData() {
  let products = getProducts().map(p => normalizeProduct({
    ...p,
    signatureSaree: p.signatureSaree ?? p.badge === 'signature',
    badge: p.badge || (p.signatureSaree ? 'signature' : p.featured ? 'featured' : '')
  }));

  const ver = localStorage.getItem('sd_data_version') || '1';

  if (ver < '3') {
    const extraProducts = [
      {
        id: sdGenerateId('PRD'), name: 'Kundan Bridal Jewellery Set', category: 'Accessories',
        price: 8999, offerPrice: 7499, stock: 15, status: 'active', featured: true, signatureSaree: false,
        colors: ['Gold', 'Red'], sizes: ['One Size'],
        description: 'Exquisite Kundan necklace, earrings, and tikka set for bridal occasions.',
        images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80&auto=format'],
        createdAt: Date.now() - 86400000
      },
      {
        id: sdGenerateId('PRD'), name: 'Zari Embroidered Clutch', category: 'Accessories',
        price: 2499, offerPrice: 1999, stock: 35, status: 'active', featured: false, signatureSaree: false,
        colors: ['Gold', 'Maroon', 'Black'], sizes: ['One Size'],
        description: 'Hand-embroidered zari clutch with silk lining — perfect for weddings and parties.',
        images: ['https://images.unsplash.com/photo-1566150905458-677bf13735aa?w=600&q=80&auto=format'],
        createdAt: Date.now()
      },
      {
        id: sdGenerateId('PRD'), name: 'Pearl & Stone Bangles Set', category: 'Accessories',
        price: 3499, offerPrice: 2799, stock: 28, status: 'active', featured: true, signatureSaree: false,
        colors: ['Gold', 'Pearl'], sizes: ['One Size'],
        description: 'Set of 12 premium pearl and stone bangles with traditional meenakari work.',
        images: ['https://images.unsplash.com/photo-1611591436357-78863a34d769?w=600&q=80&auto=format'],
        createdAt: Date.now()
      }
    ];
    const names = products.map(p => p.name);
    extraProducts.forEach(ep => { if (!names.includes(ep.name)) products.unshift(ep); });
    localStorage.setItem('sd_data_version', '3');
  }

  if (ver < '5') {
    const nonWomen = products.filter(p => p.category !== 'Women');
    products = [...buildWomenProductCatalog(), ...nonWomen];
    seedWomenReviews();
    localStorage.setItem('sd_data_version', '5');
  }

  if (ver < '6') {
    products = products.map(p => {
      const np = { ...p };
      np.category = normalizeCategory(np.category);
      if (np.badge === 'signature' || np.signatureSaree) {
        np.category = 'signature';
        np.badge = 'signature';
        np.signatureSaree = true;
      }
      return np;
    });
    localStorage.setItem('sd_data_version', '6');
  }

  return products;
}

async function migrateDataAsync() {
  const verBefore = localStorage.getItem('sd_data_version') || '1';
  const products = migrateData();
  const verAfter = localStorage.getItem('sd_data_version') || '1';
  if (verBefore !== verAfter) {
    await saveProducts(products);
  }
}

function getProductReviews(productId) {
  return getPublicReviews(productId);
}

function getPublicReviews(productId) {
  return getReviews().filter(r =>
    (!productId || r.productId === productId) &&
    (r.status === 'approved' || !r.status)
  );
}

function getProductRating(productId) {
  const revs = getProductReviews(productId);
  if (!revs.length) return { avg: 0, count: 0 };
  const avg = revs.reduce((s, r) => s + r.rating, 0) / revs.length;
  return { avg: Math.round(avg * 10) / 10, count: revs.length };
}

function getCategoryCounts() {
  const products = getProducts()
    .filter(p => p.status === 'active' || p.status === 'out_of_stock')
    .map(p => normalizeProduct(p));
  const counts = { all: products.length };
  SHOP_NAV_SLUGS.forEach(slug => {
    if (slug === 'new-arrivals') counts[slug] = products.length;
    else counts[slug] = products.filter(p => p.category === slug).length;
  });
  return counts;
}

function colorSwatchHTML(color, active = false, extraClass = '', product = null) {
  const name = getColorName(color);
  const p = product ? normalizeProduct(product) : null;
  const hex = (typeof color === 'object' && color.hex) ? color.hex : getColorHex(name, p);
  const imgs = p ? loadProductImages(p, name) : [];
  const useImage = !hex || GENERIC_COLOR_RE.test(name);
  const lightClass = hex && isLightHex(hex) ? 'swatch-light' : '';
  const imageClass = useImage && imgs[0] ? 'swatch-image' : '';
  let style = '';
  if (useImage && imgs[0]) {
    style = `background-image:url('${safeImg(imgs[0])}');background-size:cover;background-position:center`;
  } else if (hex) {
    style = `--swatch:${hex}`;
  } else {
    style = '--swatch:#bdbdbd';
  }
  const qvClass = extraClass.includes('qv') ? 'qv-color-swatch' : '';
  return `<button type="button" class="color-swatch ${extraClass} ${qvClass} ${active ? 'active' : ''} ${lightClass} ${imageClass}" data-color="${name}" title="${name}" style="${style}"></button>`;
}

/* ── Storage Helpers ── */
function sdGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function sdSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('sd-storage-update', { detail: { key } }));
}

function sdGenerateId(prefix = 'SD') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

function calcDiscount(price, offerPrice) {
  if (!offerPrice || offerPrice >= price) return 0;
  return Math.round(((price - offerPrice) / price) * 100);
}

/* ── Enhancement Constants ── */
const IMAGE_FALLBACK = 'assets/logo.png';
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1610030311149-89168f342cc0?w=600&q=80&auto=format';
const SAREE_STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1610030311149-89168f342cc0?w=800&q=80&auto=format',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80&auto=format',
  'https://images.unsplash.com/photo-1610030311149-89168f342cc0?w=800&q=80&auto=format&sig=2',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80&auto=format&sig=3',
  'https://images.unsplash.com/photo-1610030311149-89168f342cc0?w=800&q=80&auto=format&sig=4',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80&auto=format&sig=5'
];
const LOCAL_SAREES = SAREE_STOCK_IMAGES;

const HOME_CATEGORY_CARDS = [
  { slug: 'men', label: "Men's Collection" },
  { slug: 'women', label: "Women's Collection" },
  { slug: 'kids', label: 'Kids Collection' },
  { slug: 'accessories', label: 'Accessories' }
];

function safeImg(src) {
  if (!src || typeof src !== 'string' || !src.trim()) return IMAGE_FALLBACK;
  return src.trim();
}

function bindImageFallback(img) {
  if (!img) return;
  img.onerror = () => {
    const cur = img.src || '';
    if (cur.includes(PLACEHOLDER_IMAGE) || img.dataset.fallbackFinal) {
      img.onerror = null;
      return;
    }
    if (cur.includes('logo.png') || !cur.includes('unsplash')) {
      img.src = PLACEHOLDER_IMAGE;
      if (img.src === PLACEHOLDER_IMAGE) img.dataset.fallbackFinal = '1';
      return;
    }
    img.onerror = null;
    img.src = IMAGE_FALLBACK;
  };
}

function initImageFallbacks(root = document) {
  root.querySelectorAll('img:not([data-fallback-bound])').forEach(img => {
    img.dataset.fallbackBound = '1';
    bindImageFallback(img);
  });
}

function imgTag(src, alt = '', className = '') {
  const url = safeImg(src);
  const cls = className ? ` class="${className}"` : '';
  return `<img src="${url}" alt="${alt}"${cls} loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'">`;
}

function getCategoryCardImage(categorySlug) {
  const slug = normalizeCategory(categorySlug);
  const active = getProducts()
    .filter(p => p.status === 'active')
    .map(p => normalizeProduct(p))
    .filter(p => p.category === slug);
  if (active.length) {
    const hero = active.find(p => p.mainImage) || active[0];
    const img = safeImg(hero.mainImage || loadProductImages(hero)[0]);
    if (img && img !== IMAGE_FALLBACK) return img;
  }
  return CATEGORY_IMAGES[slug] || PLACEHOLDER_IMAGE;
}

function getCategoryActiveCount(categorySlug) {
  const slug = normalizeCategory(categorySlug);
  return getProducts()
    .filter(p => p.status === 'active')
    .map(p => normalizeProduct(p))
    .filter(p => p.category === slug).length;
}

function renderHomeCategoryCards() {
  const grid = document.getElementById('home-category-grid');
  if (!grid) return;
  grid.innerHTML = HOME_CATEGORY_CARDS.map(({ slug, label }) => {
    const count = getCategoryActiveCount(slug);
    const img = getCategoryCardImage(slug);
    const countLabel = count ? `${count} product${count !== 1 ? 's' : ''}` : 'Explore collection';
    return `
      <a href="#shop/${slug}" class="category-card reveal" data-nav="shop" data-category="${slug}">
        ${imgTag(img, label)}
        <div class="category-overlay">
          <span class="category-count">${countLabel}</span>
          <h3>${label}</h3>
          <span>Explore now →</span>
        </div>
      </a>`;
  }).join('');
  initImageFallbacks(grid);
}

function isSareeProduct(p) {
  const n = (p.name || '').toLowerCase();
  return /saree|paithani|kanjivaram|banarasi|organza|georgette|linen|half saree/i.test(n);
}

function getSizesForProduct(product) {
  const p = product || {};
  const name = (p.name || '').toLowerCase();
  const category = p.category || '';
  if (category === 'women' && /saree|paithani|kanjivaram|banarasi|organza|georgette|linen|half saree/i.test(name)) {
    return ['Free Size', '5.5 Meter', '6 Meter', 'With Blouse', 'Without Blouse'];
  }
  if (category === 'women') return SIZE_OPTIONS.Women;
  if (category === 'men') return SIZE_OPTIONS.Men;
  if (category === 'kids') return SIZE_OPTIONS.Kids;
  if (category === 'accessories') return SIZE_OPTIONS.Accessories;
  return SIZE_OPTIONS.default;
}

function sareeImagesForColor(baseIdx, colorIdx) {
  const start = (baseIdx + colorIdx) % LOCAL_SAREES.length;
  return [
    LOCAL_SAREES[start],
    LOCAL_SAREES[(start + 1) % LOCAL_SAREES.length],
    LOCAL_SAREES[(start + 2) % LOCAL_SAREES.length],
    LOCAL_SAREES[(start + 3) % LOCAL_SAREES.length]
  ];
}

function makeWomenProduct(def) {
  const id = def.keepId || sdGenerateId('PRD');
  const colors = def.colors;
  const sizes = def.sizes || getSizesForProduct({ category: def.signature ? 'signature' : 'women', name: def.name });
  const variants = colors.map((color, i) => ({
    color,
    images: sareeImagesForColor(def.sareeBase || 0, i),
    sizes: sizes.map(s => ({
      size: s,
      stock: Math.max(2, Math.floor(def.stock / colors.length)),
      sku: `${id}-${color}-${s}`,
      priceAdjust: 0
    }))
  }));
  const badge = def.signature ? 'signature' : (def.featured ? 'featured' : (def.badge || ''));
  return {
    id,
    name: def.name,
    category: def.signature ? 'signature' : 'women',
    price: def.price,
    offerPrice: def.offerPrice,
    stock: def.stock,
    status: 'active',
    featured: def.featured || def.signature || false,
    signatureSaree: def.signature || false,
    badge,
    colors,
    sizes,
    description: def.description,
    images: variants[0].images,
    variants,
    attributes: {
      fabric: def.fabric || 'Premium Silk / Cotton Blend',
      occasion: def.occasion || 'Festive, Wedding, Casual',
      pattern: def.pattern || 'Traditional',
      workType: def.workType || 'Handwoven / Embroidered',
      care: 'Dry Clean Only',
      origin: 'India',
      brand: 'Sri Devi Textiles',
      dispatch: '2-4 Business Days',
      returns: '7 Days Easy Return'
    },
    createdAt: def.createdAt || Date.now() - Math.floor(Math.random() * 86400000 * 14)
  };
}

function buildWomenProductCatalog() {
  const sareeSizes = ['Free Size', '5.5 Meter', '6 Meter', 'With Blouse', 'Without Blouse'];
  const apparelSizes = SIZE_OPTIONS.Women;
  const defs = [
    { name: 'Kanjivaram Pure Silk Saree', price: 14999, offerPrice: 12999, stock: 18, signature: true, sareeBase: 0, colors: ['Maroon', 'Gold', 'Blue'], fabric: 'Pure Kanjivaram Silk', occasion: 'Wedding, Festive', description: 'Authentic Kanjivaram silk saree with temple border, rich zari pallu, and timeless South Indian craftsmanship.' },
    { name: 'Banarasi Silk Saree', price: 11999, offerPrice: 9999, stock: 22, signature: true, sareeBase: 1, colors: ['Gold', 'Maroon', 'Green'], fabric: 'Banarasi Silk', occasion: 'Wedding, Bridal', description: 'Handwoven Banarasi silk saree with intricate brocade work and luxurious metallic zari patterns.' },
    { name: 'Soft Silk Saree', price: 6999, offerPrice: 5499, stock: 30, featured: true, sareeBase: 2, colors: ['Pink', 'Peach', 'Cream'], fabric: 'Soft Silk', occasion: 'Festive, Party', description: 'Lightweight soft silk saree with elegant drape and subtle sheen — perfect for celebrations.' },
    { name: 'Cotton Saree', price: 2999, offerPrice: 2299, stock: 40, sareeBase: 3, colors: ['Blue', 'Green', 'Ivory'], fabric: 'Pure Cotton', occasion: 'Daily, Casual', description: 'Breathable pure cotton saree with traditional weave and comfortable all-day wear.' },
    { name: 'Designer Saree', price: 8999, offerPrice: 7499, stock: 25, featured: true, sareeBase: 4, colors: ['Magenta', 'Navy', 'Wine'], fabric: 'Designer Silk Blend', occasion: 'Party, Festive', description: 'Contemporary designer saree with modern motifs and premium finishing for statement looks.' },
    { name: 'Party Wear Saree', price: 7999, offerPrice: 6499, stock: 28, sareeBase: 5, colors: ['Pink', 'Gold', 'Black'], fabric: 'Georgette Silk Blend', occasion: 'Party, Evening', description: 'Glamorous party wear saree with shimmer finish and designer border detailing.' },
    { name: 'Wedding Silk Saree', price: 18999, offerPrice: 15999, stock: 14, featured: true, sareeBase: 0, colors: ['Red', 'Maroon', 'Gold'], fabric: 'Pure Silk', occasion: 'Wedding, Bridal', description: 'Opulent wedding silk saree with heavy zari work, crafted for bridal and ceremonial occasions.' },
    { name: 'Paithani Heritage Saree', price: 21999, offerPrice: 18999, stock: 10, featured: true, sareeBase: 1, colors: ['Purple', 'Gold', 'Green'], fabric: 'Paithani Silk', occasion: 'Wedding, Heritage', description: 'Authentic Paithani saree with iconic peacock pallu motifs — a heritage masterpiece.' },
    { name: 'Organza Embroidered Saree', price: 9999, offerPrice: 8499, stock: 20, sareeBase: 2, colors: ['Peach', 'Ivory', 'Blue'], fabric: 'Organza', occasion: 'Wedding, Reception', description: 'Sheer organza saree with delicate floral embroidery and scalloped borders.' },
    { name: 'Georgette Printed Saree', price: 4499, offerPrice: 3599, stock: 35, sareeBase: 3, colors: ['Teal', 'Pink', 'Orange'], fabric: 'Georgette', occasion: 'Casual, Office', description: 'Flowing georgette saree with elegant prints and lightweight comfort.' },
    { name: 'Linen Casual Saree', price: 3499, offerPrice: 2799, stock: 32, sareeBase: 4, colors: ['Beige', 'Blue', 'Green'], fabric: 'Linen', occasion: 'Daily, Summer', description: 'Natural linen saree with breathable weave — ideal for everyday elegance.' },
    { name: 'Printed Cotton Saree', price: 2499, offerPrice: 1999, stock: 45, sareeBase: 5, colors: ['Red', 'Navy', 'Cream'], fabric: 'Printed Cotton', occasion: 'Daily, Casual', description: 'Vibrant printed cotton saree with soft texture and easy maintenance.' },
    { name: 'Half Saree Lehenga Style', price: 12999, offerPrice: 10999, stock: 16, sareeBase: 0, colors: ['Pink', 'Gold', 'Maroon'], fabric: 'Silk Blend', occasion: 'Wedding, Festive', description: 'Trendy half saree lehenga style drape with rich border and contemporary flair.' },
    { name: 'Designer Lehenga Choli', price: 15999, offerPrice: 12999, stock: 12, featured: true, sareeBase: 1, colors: ['Pink', 'Peach', 'Red'], sizes: apparelSizes, fabric: 'Net & Silk', occasion: 'Wedding, Reception', description: 'Stunning designer lehenga with heavy embroidery, net dupatta, and premium finishing.' },
    { name: 'Anarkali Suit Set', price: 5999, offerPrice: 4799, stock: 24, sareeBase: 2, colors: ['Maroon', 'Navy', 'Gold'], sizes: apparelSizes, fabric: 'Georgette', occasion: 'Festive, Party', description: 'Elegant Anarkali suit set with flared kurta, matching bottom, and dupatta.' },
    { name: 'Salwar Suit Premium', price: 4999, offerPrice: 3999, stock: 28, sareeBase: 3, colors: ['Green', 'Pink', 'Ivory'], sizes: apparelSizes, fabric: 'Cotton Silk', occasion: 'Festive, Casual', description: 'Premium salwar suit with intricate embroidery and comfortable fit.' },
    { name: 'Kurti Collection Set', price: 2999, offerPrice: 2399, stock: 36, sareeBase: 4, colors: ['Blue', 'Peach', 'Black'], sizes: apparelSizes, fabric: 'Cotton', occasion: 'Daily, Casual', description: 'Stylish kurti collection with contemporary prints and soft fabric.' },
    { name: 'Readymade Designer Blouse', price: 1999, offerPrice: 1599, stock: 40, sareeBase: 5, colors: ['Gold', 'Maroon', 'Black'], sizes: ['32', '34', '36', '38', '40', '42'], fabric: 'Silk Blend', occasion: 'Festive, Wedding', description: 'Readymade designer blouse with premium embroidery to pair with your sarees.' }
  ];
  return defs.map(d => makeWomenProduct({ ...d, sizes: d.sizes || sareeSizes }));
}

function seedWomenReviews() {
  const reviews = getReviews();
  const women = getProducts().filter(p => normalizeCategory(p.category) === 'women');
  const names = ['Priya Sharma', 'Ananya Nair', 'Kavitha Reddy', 'Meera Joshi', 'Divya Patel'];
  women.slice(0, 12).forEach((p, i) => {
    if (reviews.some(r => r.productId === p.id)) return;
    reviews.push({
      id: sdGenerateId('REV'),
      name: names[i % names.length],
      rating: 4 + (i % 2),
      text: `Beautiful ${p.name.split(' ')[0]} quality! Exactly as shown. Highly recommend Sri Devi Textiles.`,
      productId: p.id,
      status: 'approved',
      createdAt: Date.now() - i * 86400000
    });
  });
  sdSet(SD_KEYS.reviews, reviews);
}

function isSignatureProduct(p) {
  return normalizeProduct(p).category === 'signature';
}

const BADGE_LABELS = {
  '': 'Normal Product', featured: 'Featured Product', signature: 'Signature Collection',
  new: 'New Arrival', best_seller: 'Best Seller', trending: 'Trending', limited: 'Limited Edition'
};
const CATEGORY_IMAGES = {
  men: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80&auto=format',
  women: 'https://images.unsplash.com/photo-1610030311149-89168f342cc0?w=800&q=80&auto=format',
  kids: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80&auto=format',
  accessories: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80&auto=format',
  signature: 'https://images.unsplash.com/photo-1610030311149-89168f342cc0?w=800&q=80&auto=format&sig=sig',
  'new-arrivals': 'https://images.unsplash.com/photo-1610030311149-89168f342cc0?w=800&q=80&auto=format'
};
const SIZE_OPTIONS = {
  Women: ['XS','S','M','L','XL','XXL','XXXL','Free Size','Semi Stitched','Unstitched','Custom Stitching','32','34','36','38','40','42','44'],
  Men: ['36','38','40','42','44','46','48','50','S','M','L','XL','XXL','XXXL'],
  Kids: ['0-6 Months','6-12 Months','1-2 Years','2-3 Years','4-5 Years','6-7 Years','8-9 Years','10-11 Years','12-13 Years','14-15 Years'],
  Accessories: ['Free Size','Adjustable','One Size'],
  default: ['5.5 Meter','6 Meter','With Blouse','Without Blouse','Free Size','S','M','L','XL']
};
const DATE_FILTER_LABELS = {
  today: 'Today', yesterday: 'Yesterday', last7: 'Last 7 Days', last30: 'Last 30 Days',
  this_month: 'This Month', last_month: 'Last Month', last3: 'Last 3 Months',
  last6: 'Last 6 Months', this_year: 'This Year', custom: 'Custom Range'
};

function normalizeProduct(p) {
  if (!p) return p;
  const np = { ...p };
  if (!np.badge) {
    if (np.signatureSaree) np.badge = 'signature';
    else if (np.featured) np.badge = 'featured';
    else np.badge = '';
  }
  np.category = normalizeCategory(np.category);
  if (np.badge === 'signature' || np.signatureSaree) {
    np.category = 'signature';
    np.badge = 'signature';
    np.signatureSaree = true;
  }
  np.sizes = np.sizes?.length ? np.sizes : getSizesForProduct(np);
  if (!np.variants || !np.variants.length) {
    const colorEntries = np.colorVariants?.length
      ? np.colorVariants
      : (np.colors?.length ? np.colors.map(c => (typeof c === 'object' ? c : { name: c })) : [{ name: 'Default' }]);
    const imgs = np.galleryImages?.length ? np.galleryImages.map(safeImg)
      : (np.images?.length ? np.images.map(safeImg) : [CATEGORY_IMAGES[np.category] || IMAGE_FALLBACK]);
    np.variants = colorEntries.map((c) => {
      const colorName = getColorName(c);
      const colorImgs = c.images?.length ? c.images.map(safeImg)
        : (c.image ? [safeImg(c.image)] : imgs.map((img, j) => img.includes('unsplash') ? `${img.split('&sig=')[0]}&sig=${encodeURIComponent(colorName + j)}` : safeImg(img)));
      return {
        color: colorName,
        hex: c.hex || getColorHex(colorName),
        images: colorImgs,
        sizes: np.sizes.map(s => ({
          size: s, stock: Math.max(1, Math.floor((np.stock || 10) / colorEntries.length)), sku: `${np.id}-${colorName}-${s}`, priceAdjust: 0
        }))
      };
    });
  }
  np.variants = np.variants.map(v => ({
    ...v,
    hex: v.hex || getColorHex(v.color, np),
    images: (v.images || []).filter(Boolean).map(safeImg)
  }));
  np.colorVariants = np.variants.map(v => ({
    name: v.color,
    hex: v.hex || getColorHex(v.color),
    image: safeImg(v.images[0]),
    images: v.images
  }));
  np.colors = np.colorVariants.map(c => c.name);
  const allGallery = [
    ...np.variants.flatMap(v => v.images),
    ...(np.galleryImages || []),
    ...(np.images || [])
  ].filter(Boolean).map(safeImg);
  np.galleryImages = [...new Set(allGallery)];
  np.mainImage = safeImg(np.variants[0]?.images[0] || np.galleryImages[0] || CATEGORY_IMAGES[np.category] || IMAGE_FALLBACK);
  if (!np.attributes) np.attributes = {
    fabric: 'Premium Silk / Cotton Blend', occasion: 'Festive, Wedding, Casual',
    pattern: 'Traditional', workType: 'Handwoven / Embroidered', care: 'Dry Clean Only',
    origin: 'India', brand: 'Sri Devi Textiles', dispatch: '2-4 Business Days', returns: '7 Days Easy Return'
  };
  np.sizes = [...new Set(np.variants.flatMap(v => v.sizes.map(s => s.size)))];
  np.images = np.galleryImages.slice(0, 8);
  np.stock = np.variants.reduce((s, v) => s + v.sizes.reduce((a, sz) => a + sz.stock, 0), 0);
  return np;
}

function getBadgeHTML(badge, discount, outOfStock) {
  let html = '';
  let topLeft = '';
  if (discount) topLeft += `<span class="badge discount">-${discount}%</span>`;
  if (outOfStock) topLeft += `<span class="badge oos">Out of Stock</span>`;
  if (topLeft) html += `<div class="product-card-badges-left">${topLeft}</div>`;
  if (badge === 'signature') {
    html += `<div class="product-card-badges-bottom">${renderSignatureBadgeHTML('Signature')}</div>`;
  }
  return html;
}

function getBodyBadgeHTML(badge) {
  if (!badge || badge === 'signature' || !BADGE_LABELS[badge]) return '';
  const cls = badge === 'new' ? 'new' : badge === 'signature' ? 'signature' : 'featured';
  const label = badge === 'featured' ? 'Featured Product' : BADGE_LABELS[badge];
  return `<span class="product-body-badge badge ${cls}">${label}</span>`;
}

function renderQVGallery(p, color, thumbIndex = 0) {
  const imgs = loadProductImages(p, color);
  const main = document.getElementById('qv-main-image');
  const thumbs = document.getElementById('qv-thumbs');
  if (!main) return;
  const idx = Math.min(thumbIndex, imgs.length - 1);
  main.alt = p.name;
  changeProductImage(main, imgs[idx], thumbs, idx);
  renderGallery(thumbs, imgs, idx, 'qv-thumb');
}

function getDateRange(filterKey, customStart, customEnd) {
  const now = new Date();
  const start = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  switch (filterKey) {
    case 'today': start.setHours(0, 0, 0, 0); break;
    case 'yesterday': start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0); end.setDate(end.getDate() - 1); end.setHours(23, 59, 59, 999); break;
    case 'last7': start.setDate(start.getDate() - 7); start.setHours(0, 0, 0, 0); break;
    case 'last30': start.setDate(start.getDate() - 30); start.setHours(0, 0, 0, 0); break;
    case 'this_month': start.setDate(1); start.setHours(0, 0, 0, 0); break;
    case 'last_month': start.setMonth(start.getMonth() - 1, 1); start.setHours(0, 0, 0, 0); end.setDate(0); end.setHours(23, 59, 59, 999); break;
    case 'last3': start.setMonth(start.getMonth() - 3); start.setHours(0, 0, 0, 0); break;
    case 'last6': start.setMonth(start.getMonth() - 6); start.setHours(0, 0, 0, 0); break;
    case 'this_year': start.setMonth(0, 1); start.setHours(0, 0, 0, 0); break;
    case 'custom': if (customStart) start = new Date(customStart); if (customEnd) end = new Date(customEnd); break;
    default: start.setDate(1); start.setHours(0, 0, 0, 0);
  }
  return { start: start.getTime(), end: end.getTime() };
}

function filterByDateRange(items, range, dateField = 'createdAt') {
  return items.filter(i => i[dateField] >= range.start && i[dateField] <= range.end);
}

function calcGrowthPct(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function getPreviousDateRange(rangeKey, customStart, customEnd) {
  const range = getDateRange(rangeKey, customStart, customEnd);
  const span = range.end - range.start + 1;
  return { start: range.start - span, end: range.start - 1 };
}

function getAnalytics(rangeKey, customStart, customEnd) {
  const range = getDateRange(rangeKey, customStart, customEnd);
  const prevRange = getPreviousDateRange(rangeKey, customStart, customEnd);
  const allOrders = getOrders();
  const orders = filterByDateRange(allOrders, range);
  const prevOrders = filterByDateRange(allOrders, prevRange);
  const products = getProducts();
  const customers = sdGet(SD_KEYS.customers, []);
  const allReviews = getReviews();
  const reviews = filterByDateRange(allReviews, range);
  const wishlist = getWishlist();
  const cart = getCart();

  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const prevRevenue = prevOrders.reduce((s, o) => s + (o.total || 0), 0);
  const allRevenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);
  const pending = allOrders.filter(o => o.status === 'pending').length;
  const completed = allOrders.filter(o => o.status === 'paid' || o.status === 'completed').length;
  const cancelled = allOrders.filter(o => o.status === 'cancelled').length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const outOfStock = products.filter(p => p.status === 'out_of_stock' || (p.stock || 0) <= 0).length;
  const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
  const avgOrder = orders.length ? revenue / orders.length : 0;

  const todayRange = getDateRange('today');
  const todayOrders = filterByDateRange(allOrders, todayRange);
  const todaySales = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const weeklySales = filterByDateRange(allOrders, getDateRange('last7')).reduce((s, o) => s + (o.total || 0), 0);
  const monthlySales = filterByDateRange(allOrders, getDateRange('this_month')).reduce((s, o) => s + (o.total || 0), 0);

  const catCounts = {};
  products.forEach(p => {
    const cat = p.category || 'other';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  const topCategory = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0] || '—';

  const productSales = {};
  allOrders.filter(o => o.status !== 'cancelled').forEach(o => {
    (o.items || []).forEach(item => {
      const id = item.productId || item.id;
      if (!id) return;
      productSales[id] = (productSales[id] || 0) + (item.qty || 1);
    });
  });
  const topProductId = Object.keys(productSales).sort((a, b) => productSales[b] - productSales[a])[0];
  const topProduct = topProductId ? (getProductById(topProductId)?.name || '—') : (products[0]?.name || '—');

  const prevCustomers = customers.filter(c => (c.createdAt || 0) <= prevRange.end).length;

  return {
    totalProducts: products.length,
    activeProducts,
    outOfStock,
    totalOrders: orders.length,
    allOrdersCount: allOrders.length,
    totalCustomers: customers.length,
    totalRevenue: revenue,
    allRevenue,
    todaySales,
    weeklySales,
    monthlySales,
    avgOrderValue: avgOrder,
    pendingOrders: pending,
    completedOrders: completed,
    cancelledOrders: cancelled,
    todayOrdersCount: todayOrders.length,
    lowStock,
    topCategory,
    topProduct,
    wishlistCount: wishlist.length,
    cartCount: cart.reduce((s, i) => s + (i.qty || 1), 0),
    totalReviews: allReviews.length,
    approvedReviews: allReviews.filter(r => r.status === 'approved' || !r.status).length,
    orders,
    allOrders: [...allOrders].sort((a, b) => b.createdAt - a.createdAt),
    reviews,
    allReviews: [...allReviews].sort((a, b) => b.createdAt - a.createdAt),
    growth: {
      products: calcGrowthPct(products.length, products.length),
      orders: calcGrowthPct(orders.length, prevOrders.length),
      customers: calcGrowthPct(customers.length, prevCustomers),
      revenue: calcGrowthPct(revenue, prevRevenue)
    }
  };
}

function compressImage(file, maxW = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxW) { h = (h * maxW) / w; w = maxW; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function initDateFilter(onChange) {
  const btn = document.getElementById('date-filter-btn');
  const dropdown = document.getElementById('date-filter-dropdown');
  if (!btn || !dropdown) return;
  let current = localStorage.getItem('sd_date_filter') || 'this_month';
  btn.textContent = '📅 ' + DATE_FILTER_LABELS[current];
  dropdown.innerHTML = Object.entries(DATE_FILTER_LABELS).map(([k, v]) =>
    `<button type="button" class="date-filter-opt ${k === current ? 'active' : ''}" data-range="${k}">${v}</button>`
  ).join('') + `<div class="custom-range hidden" id="custom-range-fields"><input type="date" id="custom-start"><input type="date" id="custom-end"><button type="button" class="btn btn-sm btn-red" id="apply-custom-range">Apply</button></div>`;
  btn.onclick = () => dropdown.classList.toggle('open');
  dropdown.querySelectorAll('.date-filter-opt').forEach(opt => {
    opt.onclick = () => {
      current = opt.dataset.range;
      if (current === 'custom') {
        document.getElementById('custom-range-fields')?.classList.remove('hidden');
        return;
      }
      localStorage.setItem('sd_date_filter', current);
      btn.textContent = '📅 ' + DATE_FILTER_LABELS[current];
      dropdown.classList.remove('open');
      onChange(current);
    };
  });
  document.getElementById('apply-custom-range')?.addEventListener('click', () => {
    localStorage.setItem('sd_date_filter', 'custom');
    btn.textContent = '📅 Custom Range';
    dropdown.classList.remove('open');
    onChange('custom', document.getElementById('custom-start').value, document.getElementById('custom-end').value);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.date-filter-wrap')) dropdown.classList.remove('open');
  });
  onChange(current);
}

/* ── Seed Initial Data (orders, cart, reviews — products in Firestore) ── */
function buildSampleProducts() {
  return [
    {
      id: sdGenerateId('PRD'),
      name: 'Banarasi Silk Saree',
      category: 'Women',
      price: 8999,
      offerPrice: 7499,
      stock: 25,
      status: 'active',
      featured: true,
      signatureSaree: true,
      colors: ['Maroon', 'Gold', 'Emerald'],
      sizes: ['Free Size'],
      description: 'Handwoven Banarasi silk saree with intricate zari work. A timeless piece for weddings and festive occasions.',
      images: ['https://images.unsplash.com/photo-1610030311149-89168f342cc0?w=600&q=80'],
      createdAt: Date.now() - 86400000 * 5
    },
    {
      id: sdGenerateId('PRD'),
      name: 'Kanjivaram Pure Silk',
      category: 'Women',
      price: 12999,
      offerPrice: 10999,
      stock: 15,
      status: 'active',
      featured: true,
      signatureSaree: true,
      colors: ['Red', 'Gold'],
      sizes: ['Free Size'],
      description: 'Authentic Kanjivaram silk saree with temple border and rich pallu design.',
      images: ['https://images.unsplash.com/photo-1583391735256-47e273a1a5a8?w=600&q=80'],
      createdAt: Date.now() - 86400000 * 3
    },
    {
      id: sdGenerateId('PRD'),
      name: 'Men\'s Premium Kurta Set',
      category: 'Men',
      price: 3499,
      offerPrice: 2799,
      stock: 40,
      status: 'active',
      featured: true,
      colors: ['Ivory', 'Navy', 'Black'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      description: 'Elegant cotton-silk blend kurta with matching churidar. Perfect for festive gatherings.',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'],
      createdAt: Date.now() - 86400000 * 2
    },
    {
      id: sdGenerateId('PRD'),
      name: 'Designer Lehenga Choli',
      category: 'Women',
      price: 15999,
      offerPrice: 12999,
      stock: 10,
      status: 'active',
      featured: true,
      colors: ['Pink', 'Peach', 'Red'],
      sizes: ['S', 'M', 'L'],
      description: 'Stunning designer lehenga with heavy embroidery and net dupatta.',
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80'],
      createdAt: Date.now() - 86400000
    },
    {
      id: sdGenerateId('PRD'),
      name: 'Kids Festive Ethnic Set',
      category: 'Kids',
      price: 1999,
      offerPrice: 1499,
      stock: 30,
      status: 'active',
      featured: false,
      colors: ['Blue', 'Red', 'Green'],
      sizes: ['2-4Y', '4-6Y', '6-8Y', '8-10Y'],
      description: 'Adorable ethnic wear set for kids with comfortable fabric and festive embroidery.',
      images: ['https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80'],
      createdAt: Date.now()
    },
    {
      id: sdGenerateId('PRD'),
      name: 'Gold-Plated Temple Jewellery Set',
      category: 'Accessories',
      price: 4999,
      offerPrice: 3999,
      stock: 20,
      status: 'active',
      featured: true,
      colors: ['Gold'],
      sizes: ['One Size'],
      description: 'Traditional temple jewellery set with necklace, earrings, and maang tikka.',
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'],
      createdAt: Date.now()
    },
    {
      id: sdGenerateId('PRD'),
      name: 'Embroidered Potli Bag',
      category: 'Accessories',
      price: 1299,
      offerPrice: 999,
      stock: 50,
      status: 'active',
      featured: false,
      colors: ['Gold', 'Silver', 'Maroon'],
      sizes: ['One Size'],
      description: 'Handcrafted potli bag with zari embroidery — the perfect festive accessory.',
      images: ['https://images.unsplash.com/photo-1590874103328-eac38a683116?w=600&q=80'],
      createdAt: Date.now() - 86400000 * 4
    },
    {
      id: sdGenerateId('PRD'),
      name: 'Men\'s Silk Sherwani',
      category: 'Men',
      price: 18999,
      offerPrice: 15999,
      stock: 8,
      status: 'active',
      featured: false,
      colors: ['Cream', 'Maroon'],
      sizes: ['M', 'L', 'XL'],
      description: 'Luxurious silk sherwani with intricate thread work for grooms and groomsmen.',
      images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80'],
      createdAt: Date.now() - 86400000 * 6
    }
  ];
}

async function seedInitialData() {
  if (localStorage.getItem(SD_KEYS.initialized)) return;

  if (getProducts().length === 0) {
    await saveProducts(buildSampleProducts());
  }

  const sampleProducts = getProducts();
  const sampleReviews = [
    { id: sdGenerateId('REV'), name: 'Priya Sharma', rating: 5, text: 'Absolutely stunning saree! The quality exceeded my expectations. Sri Devi Textiles is my go-to now.', productId: sampleProducts[0].id, status: 'approved', createdAt: Date.now() - 86400000 * 10 },
    { id: sdGenerateId('REV'), name: 'Ananya Reddy', rating: 5, text: 'The Kanjivaram silk is authentic and beautifully crafted. Fast delivery and elegant packaging.', productId: sampleProducts[1].id, status: 'approved', createdAt: Date.now() - 86400000 * 7 },
    { id: sdGenerateId('REV'), name: 'Rahul Mehta', rating: 4, text: 'Premium kurta set with perfect fit. Great value for the price. Highly recommended!', productId: sampleProducts[2].id, status: 'approved', createdAt: Date.now() - 86400000 * 5 },
    { id: sdGenerateId('REV'), name: 'Kavitha Nair', rating: 5, text: 'The jewellery set is gorgeous! Received so many compliments at the wedding.', productId: sampleProducts[5].id, status: 'approved', createdAt: Date.now() - 86400000 * 3 }
  ];

  sdSet(SD_KEYS.orders, []);
  sdSet(SD_KEYS.cart, []);
  sdSet(SD_KEYS.wishlist, []);
  sdSet(SD_KEYS.reviews, sampleReviews);
  sdSet(SD_KEYS.customers, []);
  sdSet(SD_KEYS.settings, {
    storeName: 'Sri Devi Textiles',
    tagline: 'Traditional & Modern Collection',
    email: 'info@sridevtextiles.com',
    phone: '+91 98765 43210',
    address: '123 Silk Market, T. Nagar, Chennai - 600017'
  });
  localStorage.setItem(SD_KEYS.initialized, 'true');
  localStorage.setItem('sd_data_version', '3');
}

/* ── Product store (Firestore + in-memory cache) ── */
let productsCache = [];

function notifyProductsUpdated() {
  window.dispatchEvent(new CustomEvent('sd-storage-update', { detail: { key: SD_KEYS.products } }));
}

function serializeProductForFirestore(product) {
  return JSON.parse(JSON.stringify(product));
}

function getFirestoreProductsCollection() {
  const name = window.SD_FIRESTORE_COLLECTIONS?.products || 'products';
  return window.sdFirestore.collection(name);
}

async function loadProductsFromFirestore() {
  if (!window.sdFirestore) {
    productsCache = sdGet(SD_KEYS.products, []).map(normalizeProduct);
    return productsCache;
  }
  const snap = await getFirestoreProductsCollection().get();
  productsCache = snap.docs.map(doc => normalizeProduct({ ...doc.data(), id: doc.id }));
  return productsCache;
}

async function initProductStore() {
  await loadProductsFromFirestore();

  if (productsCache.length === 0 && window.sdFirestore) {
    const localProducts = sdGet(SD_KEYS.products, []);
    if (localProducts.length > 0) {
      await saveProducts(localProducts);
      await loadProductsFromFirestore();
    }
  }

  await seedInitialData();
  await migrateDataAsync();
  subscribeProductUpdates();
}

function subscribeProductUpdates() {
  if (!window.sdFirestore || window._sdProductUnsub) return;
  window._sdProductUnsub = getFirestoreProductsCollection().onSnapshot(
    (snap) => {
      productsCache = snap.docs.map(doc => normalizeProduct({ ...doc.data(), id: doc.id }));
      notifyProductsUpdated();
    },
    (err) => console.warn('[Sri Devi] Product realtime sync error:', err)
  );
}

function getProducts() {
  return productsCache.map(normalizeProduct);
}

function getProductById(id) {
  return getProducts().find(p => p.id === id);
}

async function saveProducts(products) {
  const normalized = products.map(p => normalizeProduct(p));
  productsCache = normalized;

  if (!window.sdFirestore) {
    sdSet(SD_KEYS.products, normalized);
    notifyProductsUpdated();
    return normalized;
  }

  const col = getFirestoreProductsCollection();
  const CHUNK = 400;
  for (let i = 0; i < normalized.length; i += CHUNK) {
    const slice = normalized.slice(i, i + CHUNK);
    const chunkBatch = window.sdFirestore.batch();
    slice.forEach(p => {
      const id = p.id || sdGenerateId('PRD');
      chunkBatch.set(col.doc(id), serializeProductForFirestore({ ...p, id }));
    });
    await chunkBatch.commit();
  }
  notifyProductsUpdated();
  return normalized;
}

async function addProduct(product) {
  const id = product.id || sdGenerateId('PRD');
  const newProduct = normalizeProduct({ ...product, id, createdAt: product.createdAt || Date.now() });
  productsCache.unshift(newProduct);

  if (window.sdFirestore) {
    await getFirestoreProductsCollection().doc(id).set(serializeProductForFirestore(newProduct));
  } else {
    sdSet(SD_KEYS.products, productsCache);
  }
  notifyProductsUpdated();
  return productsCache;
}

async function updateProduct(id, updates) {
  const existing = productsCache.find(p => p.id === id) || {};
  const updated = normalizeProduct({ ...existing, ...updates, id });
  productsCache = productsCache.map(p => p.id === id ? updated : p);

  if (window.sdFirestore) {
    await getFirestoreProductsCollection().doc(id).set(serializeProductForFirestore(updated));
  } else {
    sdSet(SD_KEYS.products, productsCache);
  }
  notifyProductsUpdated();
  return productsCache;
}

async function deleteProduct(id) {
  productsCache = productsCache.filter(p => p.id !== id);

  if (window.sdFirestore) {
    await getFirestoreProductsCollection().doc(id).delete();
  } else {
    sdSet(SD_KEYS.products, productsCache);
  }
  notifyProductsUpdated();
}

/* ── Orders ── */
function getOrders() {
  return sdGet(SD_KEYS.orders, []);
}

function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  sdSet(SD_KEYS.orders, orders);
  updateCustomersFromOrder(order);
  return order;
}

function getOrderById(id) {
  return getOrders().find(o => o.id === id);
}

function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  const oldStatus = order.status;
  if (oldStatus === newStatus) return order;
  order.status = newStatus;
  orders[idx] = order;
  sdSet(SD_KEYS.orders, orders);
  if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
    adjustStockFromOrder(order, 'restore');
  } else if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
    adjustStockFromOrder(order, 'reduce');
  }
  return order;
}

async function adjustStockFromOrder(order, mode) {
  const sign = mode === 'restore' ? 1 : -1;
  const products = getProducts().map(p => ({ ...p }));
  let changed = false;
  (order.items || []).forEach(item => {
    const idx = products.findIndex(pr => pr.id === item.productId);
    if (idx < 0) return;
    const qty = item.qty || 1;
    products[idx].stock = Math.max(0, (products[idx].stock || 0) + sign * qty);
    if (products[idx].stock <= 0) products[idx].status = 'out_of_stock';
    else if (products[idx].status === 'out_of_stock') products[idx].status = 'active';
    changed = true;
  });
  if (changed) await saveProducts(products);
}

function updateCustomersFromOrder(order) {
  const customers = sdGet(SD_KEYS.customers, []);
  const emailKey = (order.email || '').toLowerCase().trim();
  const phoneKey = (order.phone || '').trim();
  const existing = customers.find(c =>
    (emailKey && c.email && c.email.toLowerCase() === emailKey) ||
    (phoneKey && c.phone && c.phone === phoneKey)
  );
  if (existing) {
    existing.orders = (existing.orders || 0) + 1;
    existing.totalSpent = (existing.totalSpent || 0) + (order.total || 0);
    existing.lastOrder = order.createdAt;
    existing.name = order.name || existing.name;
    existing.phone = order.phone || existing.phone;
    existing.email = order.email || existing.email;
    existing.address = order.address || existing.address;
    existing.city = order.city || existing.city;
    existing.state = order.state || existing.state;
    existing.pincode = order.pincode || existing.pincode;
    existing.status = (existing.orders || 0) > 1 ? 'returning' : (existing.status || 'active');
  } else {
    customers.push({
      id: sdGenerateId('CUS'),
      name: order.name,
      email: order.email || '',
      phone: order.phone || '',
      address: order.address || '',
      city: order.city || '',
      state: order.state || '',
      pincode: order.pincode || '',
      orders: 1,
      totalSpent: order.total || 0,
      lastOrder: order.createdAt,
      status: 'new',
      createdAt: Date.now()
    });
  }
  sdSet(SD_KEYS.customers, customers);
}

/* ── Cart & Wishlist ── */
function getCart() {
  return sdGet(SD_KEYS.cart, []);
}

function saveCart(cart) {
  sdSet(SD_KEYS.cart, cart);
}

function getWishlist() {
  return sdGet(SD_KEYS.wishlist, []);
}

function saveWishlist(list) {
  sdSet(SD_KEYS.wishlist, list);
}

function toggleWishlist(productId) {
  let list = getWishlist();
  if (list.includes(productId)) {
    list = list.filter(id => id !== productId);
  } else {
    list.push(productId);
  }
  saveWishlist(list);
  return list;
}

function addToCart(productId, color, size, qty = 1) {
  return CartManager.addItem(productId, color, size, qty, false);
}

function updateCartQty(key, delta) {
  CartManager.updateItemQty(key, delta);
}

function getCartTotals() {
  return CartManager.calculateTotals();
}

function renderOrderSummary(containerId, prefix = 'checkout') {
  const items = CartManager.getItems();
  const { subtotal, shipping, total } = calculateCart(items);
  const listEl = document.getElementById(`${prefix}-items`);
  if (listEl) {
    listEl.innerHTML = items.map(item => {
      const p = normalizeProduct(getProductById(item.productId));
      const name = p?.name || 'Product';
      return `<div class="checkout-item"><span>${name} × ${item.qty}</span><span>${formatCurrency(item.price * item.qty)}</span></div>`;
    }).join('');
  }
  const subEl = document.getElementById(`${prefix}-subtotal`);
  const shipEl = document.getElementById(`${prefix}-shipping`);
  const totalEl = document.getElementById(`${prefix}-total`);
  if (subEl) subEl.textContent = formatCurrency(subtotal);
  if (shipEl) shipEl.textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
  if (totalEl) totalEl.textContent = formatCurrency(total);
  return { subtotal, shipping, total, items };
}

function removeFromCart(key) {
  CartManager.removeItem(key);
}

function clearCart() {
  saveCart([]);
  CartManager.checkoutSession = null;
}

/* ── Cart Manager (single source of truth) ── */
const CartManager = {
  checkoutSession: null,

  getItems() {
    return this.checkoutSession || getCart();
  },

  isBuyNowSession() {
    return Array.isArray(this.checkoutSession);
  },

  setBuyNowItem(item) {
    this.checkoutSession = [item];
  },

  clearCheckoutSession() {
    this.checkoutSession = null;
  },

  getLinePrice(product, color, size) {
    const p = normalizeProduct(product);
    const variant = p.variants?.find(v => v.color === color);
    const sizeRow = variant?.sizes?.find(s => s.size === size);
    const adjust = sizeRow?.priceAdjust || 0;
    return (p.offerPrice || p.price) + adjust;
  },

  calculateTotals(items = this.getItems()) {
    let subtotal = 0;
    let count = 0;
    items.forEach(item => {
      subtotal += item.price * item.qty;
      count += item.qty;
    });
    const shipping = subtotal >= 999 ? 0 : (subtotal > 0 ? 99 : 0);
    return { subtotal, shipping, total: subtotal + shipping, count, items };
  },

  addItem(productId, color, size, qty = 1, replaceQty = false) {
    const product = normalizeProduct(getProductById(productId));
    if (!product || product.stock <= 0 || product.status !== 'active') return false;

    const safeColor = color || product.colors[0];
    const safeSize = size || getSizesForProduct(product)[0];
    const safeQty = Math.max(1, parseInt(qty, 10) || 1);
    const price = this.getLinePrice(product, safeColor, safeSize);

    const cart = getCart();
    const key = `${productId}-${safeColor}-${safeSize}`;
    const existing = cart.find(i => i.key === key);
    const newQty = replaceQty ? safeQty : (existing ? existing.qty + safeQty : safeQty);
    const finalQty = Math.min(newQty, product.stock);

    if (existing) {
      existing.qty = finalQty;
      existing.price = price;
    } else {
      cart.push({ key, productId, color: safeColor, size: safeSize, qty: finalQty, price });
    }
    saveCart(cart);
    return true;
  },

  updateItemQty(key, delta) {
    const cart = getCart();
    const item = cart.find(i => i.key === key);
    if (!item) return;
    const product = getProductById(item.productId);
    const maxStock = product?.stock || 99;
    item.qty = Math.max(1, Math.min(item.qty + delta, maxStock));
    saveCart(cart);
    if (this.checkoutSession) {
      const sess = this.checkoutSession.find(i => i.key === key);
      if (sess) sess.qty = item.qty;
    }
  },

  removeItem(key) {
    saveCart(getCart().filter(i => i.key !== key));
    if (this.checkoutSession) {
      this.checkoutSession = this.checkoutSession.filter(i => i.key !== key);
      if (!this.checkoutSession.length) this.checkoutSession = null;
    }
  },

  clearCart() {
    clearCart();
  }
};

function calculateCart(items) {
  return CartManager.calculateTotals(items);
}

function updateNavbar() {
  updateHeaderCounts();
}

/* ── Reviews ── */
function getReviews() {
  return sdGet(SD_KEYS.reviews, []);
}

function addReview(review) {
  const reviews = getReviews();
  const status = review.status || (review.fromAdmin ? 'approved' : 'pending');
  reviews.unshift({
    ...review,
    id: sdGenerateId('REV'),
    status,
    createdAt: Date.now()
  });
  sdSet(SD_KEYS.reviews, reviews);
  return reviews;
}

function updateReviewStatus(id, status) {
  const reviews = getReviews().map(r => r.id === id ? { ...r, status } : r);
  sdSet(SD_KEYS.reviews, reviews);
  return reviews;
}

function deleteReview(id) {
  sdSet(SD_KEYS.reviews, getReviews().filter(r => r.id !== id));
}

/* ── Admin Session ── */
function isAdminLoggedIn() {
  return sdGet(SD_KEYS.session, null)?.loggedIn === true;
}

function adminLogin(username, password) {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    sdSet(SD_KEYS.session, { loggedIn: true, loginAt: Date.now() });
    return true;
  }
  return false;
}

function adminLogout() {
  localStorage.removeItem(SD_KEYS.session);
}

/* ── Dashboard Stats ── */
function getSettings() {
  return sdGet(SD_KEYS.settings, {
    storeName: 'Sri Devi Textiles',
    tagline: 'Traditional & Modern Collection',
    email: 'info@sridevtextiles.com',
    phone: '+91 98765 43210',
    address: '123 Silk Market, T. Nagar, Chennai - 600017',
    freeShippingThreshold: 999,
    returnDays: 7
  });
}

function saveSettings(settings) {
  sdSet(SD_KEYS.settings, settings);
}

/* ── EmailJS (Dummy Integration) ── */
function sendEmailJS(templateParams, onSuccess, onError) {
  if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams, EMAILJS_CONFIG.publicKey)
      .then(onSuccess)
      .catch(onError);
  } else {
    console.log('[EmailJS Demo] Message simulated:', templateParams);
    setTimeout(() => {
      if (onSuccess) onSuccess({ status: 200, text: 'OK (Demo Mode)' });
    }, 800);
  }
}

/* ── Razorpay Demo Payment (frontend simulation) ── */
const PAYMENT_METHOD_LABELS = {
  upi: 'UPI / QR Code',
  card: 'Credit / Debit Card',
  netbanking: 'Net Banking',
  cod: 'Cash on Delivery'
};

function processDummyPayment(orderData, paymentMethod, onSuccess, onCancel) {
  const existing = document.getElementById('razorpay-demo-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'razorpay-demo-overlay';
  overlay.className = 'razorpay-demo-overlay';
  overlay.innerHTML = `
    <div class="razorpay-demo-modal">
      <div class="razorpay-demo-header">
        <span class="razorpay-brand">Razorpay</span>
        <button type="button" class="razorpay-demo-close" aria-label="Close">✕</button>
      </div>
      <div class="razorpay-demo-body" id="razorpay-demo-body">
        <p class="razorpay-merchant">Sri Devi Textiles</p>
        <p class="razorpay-amount">${formatCurrency(orderData.total)}</p>
        <p class="razorpay-method">${PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}</p>
        <div class="razorpay-processing">
          <div class="razorpay-spinner"></div>
          <p class="razorpay-status">Payment Processing...</p>
          <p class="razorpay-countdown">Please wait <strong id="payment-countdown">10</strong> seconds</p>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  const closeBtn = overlay.querySelector('.razorpay-demo-close');
  let cancelled = false;
  closeBtn?.addEventListener('click', () => {
    cancelled = true;
    overlay.remove();
    if (onCancel) onCancel();
  });

  let seconds = 10;
  const body = overlay.querySelector('#razorpay-demo-body');
  const countdownEl = overlay.querySelector('#payment-countdown');

  const timer = setInterval(() => {
    if (cancelled) {
      clearInterval(timer);
      return;
    }
    seconds -= 1;
    if (countdownEl) countdownEl.textContent = String(seconds);
    if (seconds <= 0) {
      clearInterval(timer);
      if (body) {
        body.innerHTML = `
          <div class="razorpay-success">
            <div class="razorpay-success-icon">✓</div>
            <h3>Payment Successful</h3>
            <p>Order Confirmed</p>
          </div>`;
      }
      setTimeout(() => {
        overlay.remove();
        onSuccess({
          razorpay_payment_id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          razorpay_order_id: `order_${Date.now()}`,
          invoiceNumber: `INV-${Date.now().toString().slice(-8)}`
        });
      }, 1200);
    }
  }, 1000);
}

function openRazorpayCheckout(orderData, onSuccess, onFailure) {
  const paymentMethod = orderData.paymentMethod || 'upi';
  if (paymentMethod === 'cod') {
    setTimeout(() => onSuccess({
      razorpay_payment_id: `COD-${Date.now()}`,
      razorpay_order_id: `order_cod_${Date.now()}`,
      invoiceNumber: `INV-COD-${Date.now().toString().slice(-8)}`
    }), 600);
    return;
  }
  processDummyPayment(orderData, paymentMethod, onSuccess, onFailure);
}

/* ── UI Helpers ── */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
  }
  return html;
}

function productCardHTML(product, options = {}) {
  const p = normalizeProduct(product);
  const price = p.offerPrice || p.price;
  const discount = calcDiscount(p.price, p.offerPrice);
  const inWishlist = getWishlist().includes(p.id);
  const outOfStock = p.stock <= 0 || p.status !== 'active';
  const rating = getProductRating(p.id);
  const displayRating = rating.count ? rating.avg : 4.5;
  const img = safeImg(getProductImages(p, p.colors[0])[0]);
  const animClass = options.noReveal ? 'product-card' : 'product-card reveal';

  return `
    <article class="${animClass}" data-id="${p.id}">
      <div class="product-card-image">
        <img src="${img}" alt="${p.name}" loading="lazy" class="product-card-img" data-product-id="${p.id}" onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'">
        ${getBadgeHTML(p.badge, discount, outOfStock)}
        <button class="wishlist-btn ${inWishlist ? 'active' : ''}" data-wishlist="${p.id}" aria-label="Wishlist">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
        <div class="product-card-overlay">
          <button class="btn btn-gold btn-sm quick-view-btn" data-id="${p.id}">Quick View</button>
        </div>
      </div>
      <div class="product-card-body">
        ${getBodyBadgeHTML(p.badge)}
        <span class="product-category">${p.category === 'signature' ? 'Signature' : getCategoryLabel(p.category)}</span>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-rating-mini">${renderStars(Math.round(displayRating))}${rating.count ? `<span class="rating-count">(${rating.count})</span>` : ''}</div>
        <div class="product-price-row">
          <span class="price-current">${formatCurrency(price)}</span>
          ${p.offerPrice ? `<span class="price-original">${formatCurrency(p.price)}</span>` : ''}
        </div>
        <div class="card-color-swatches">${p.colorVariants.slice(0, 6).map((c, i) => colorSwatchHTML(c, i === 0, 'card-color-swatch', p)).join('')}</div>
      </div>
    </article>`;
}

function signatureSareeCardHTML(product) {
  const p = normalizeProduct(product);
  const price = p.offerPrice || p.price;
  const discount = calcDiscount(p.price, p.offerPrice);
  const inWishlist = getWishlist().includes(p.id);
  const rating = getProductRating(p.id);
  const displayRating = rating.count ? rating.avg : 4.8;
  const displayCount = rating.count || 24;
  const img = safeImg(getProductImages(p, p.colors[0])[0]);

  return `
    <article class="signature-card reveal" data-id="${p.id}">
      <div class="signature-card-image product-card-image">
        <img src="${img}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'">
        <div class="signature-card-badges">
          ${discount ? `<span class="badge discount signature-discount-badge">-${discount}%</span>` : ''}
        </div>
        <div class="product-card-badges-bottom">${renderSignatureBadgeHTML('Signature Saree')}</div>
        <button class="wishlist-btn ${inWishlist ? 'active' : ''}" data-wishlist="${p.id}" aria-label="Wishlist">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>
      <div class="signature-card-body">
        <span class="product-category">Signature Collection</span>
        <h3>${p.name}</h3>
        <div class="signature-card-rating">${renderStars(Math.round(displayRating))}<span>(${displayCount} reviews)</span></div>
        <div class="signature-card-price product-price-row">
          <span class="price-current">${formatCurrency(price)}</span>
          ${p.offerPrice ? `<span class="price-original">${formatCurrency(p.price)}</span>` : ''}
        </div>
        <p class="signature-card-desc">${p.description}</p>
        <div class="signature-card-actions">
          <button class="btn btn-gold btn-sm quick-view-btn" data-id="${p.id}">Quick View</button>
          <button class="btn btn-red btn-sm" data-add-cart="${p.id}" data-color="${p.colors[0]}" data-size="${p.sizes[0]}">Add to Cart</button>
          <a href="#product/${p.id}" class="btn btn-outline btn-sm view-product" data-id="${p.id}">View Details</a>
        </div>
      </div>
    </article>`;
}

function updateHeaderCounts() {
  const cartCount = document.querySelector('.cart-count');
  const wishCount = document.querySelector('.wishlist-count');
  const { count } = getCartTotals();
  if (cartCount) cartCount.textContent = count;
  if (wishCount) wishCount.textContent = getWishlist().length;
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── Hero Slider ── */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;
  let current = 0;
  let timer = null;

  function showSlide(n) {
    current = n;
    slides.forEach((s, i) => s.classList.toggle('active', i === n));
    dots.forEach((d, i) => d.classList.toggle('active', i === n));
    slides.forEach((s, i) => {
      const text = s.querySelector('.hero-text');
      if (text) {
        text.style.animation = 'none';
        if (i === n) requestAnimationFrame(() => { text.style.animation = 'fadeUp 0.8s ease'; });
      }
    });
  }

  function next() {
    showSlide((current + 1) % slides.length);
  }

  function startAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, 5500);
  }

  showSlide(0);
  startAutoplay();

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      startAutoplay();
    });
  });

  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', () => clearInterval(timer));
    hero.addEventListener('mouseleave', startAutoplay);
  }

  initImageFallbacks(document.querySelector('.hero'));
}

/* ============================================================
   USER WEBSITE
   ============================================================ */
const UserApp = {
  currentPage: 'home',
  shopFilters: { category: '', priceMin: 0, priceMax: 50000, color: '', size: '', search: '', sort: 'newest', page: 1 },
  perPage: 6,
  selectedProduct: null,

  init() {
    if (!document.body.classList.contains('user-site')) return;
    this.bindEvents();
    this.handleRoute();
    updateHeaderCounts();
    initHeroSlider();
    initScrollReveal();
    initImageFallbacks();

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('sd-storage-update', () => this.refreshCurrentView());
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('sd_')) this.refreshCurrentView();
    });
  },

  bindEvents() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-nav]');
      if (target) {
        e.preventDefault();
        const page = target.dataset.nav;
        const rawCat = target.dataset.category || '';
        const category = normalizeCategory(rawCat);
        if (page === 'shop') {
          if (category !== this.shopFilters.category) this.shopFilters.page = 1;
          this.shopFilters.category = category;
          location.hash = category ? `#shop/${category}` : '#shop';
        } else {
          location.hash = `#${page}`;
        }
      }

      if (e.target.closest('.quick-view-btn')) {
        e.stopPropagation();
        const id = e.target.closest('.quick-view-btn').dataset.id;
        if (id) { UserApp.openQuickView(id); return; }
      }
      if (e.target.closest('.card-color-swatch')) {
        e.stopPropagation();
        const sw = e.target.closest('.card-color-swatch');
        const card = sw.closest('.product-card');
        const id = card?.dataset?.id;
        const color = sw.dataset.color;
        const p = normalizeProduct(getProductById(id));
        if (p) {
          card.querySelectorAll('.card-color-swatch').forEach(s => s.classList.remove('active'));
          sw.classList.add('active');
          const img = card.querySelector('.product-card-img');
          if (img) {
            img.style.opacity = '0';
            setTimeout(() => {
              img.src = safeImg(loadProductImages(p, color)[0]);
              bindImageFallback(img);
              img.style.opacity = '1';
            }, 150);
          }
        }
      }
      if (e.target.closest('.product-card:not(.wishlist-btn):not(.quick-view-btn):not(.card-color-swatch)')) {
        const card = e.target.closest('.product-card');
        const id = card?.dataset?.id;
        if (id && !e.target.closest('.wishlist-btn') && !e.target.closest('.quick-view-btn') && !e.target.closest('.card-color-swatch')) {
          location.hash = `#product/${id}`;
        }
      }

      if (e.target.closest('[data-wishlist]')) {
        e.stopPropagation();
        const id = e.target.closest('[data-wishlist]').dataset.wishlist;
        toggleWishlist(id);
        updateHeaderCounts();
        this.refreshCurrentView();
        showToast(getWishlist().includes(id) ? 'Added to wishlist' : 'Removed from wishlist');
      }

      if (e.target.closest('.hero-shop-btn')) location.hash = '#shop';
      if (e.target.closest('.hero-collection-btn')) location.hash = '#shop/signature';
      if (e.target.closest('#shop-now-btn')) location.hash = '#shop';
      if (e.target.closest('#view-collection-btn')) location.hash = '#shop/signature';

      if (e.target.closest('.add-to-cart-btn')) this.handleAddToCart();
      if (e.target.closest('.buy-now-btn')) this.handleBuyNow();
      if (e.target.closest('.cart-qty-plus')) {
        updateCartQty(e.target.closest('[data-key]').dataset.key, 1);
        this.renderCart();
        if (this.currentPage === 'checkout') this.renderCheckout();
        updateNavbar();
      }
      if (e.target.closest('.cart-qty-minus')) {
        updateCartQty(e.target.closest('[data-key]').dataset.key, -1);
        this.renderCart();
        if (this.currentPage === 'checkout') this.renderCheckout();
        updateNavbar();
      }
      if (e.target.closest('.cart-remove')) {
        removeFromCart(e.target.closest('[data-key]').dataset.key);
        this.renderCart();
        if (this.currentPage === 'checkout') this.renderCheckout();
        updateNavbar();
        showToast('Item removed from cart');
      }
      if (e.target.closest('.cart-wishlist')) {
        const key = e.target.closest('[data-key]').dataset.key;
        const item = getCart().find(i => i.key === key);
        if (item) {
          toggleWishlist(item.productId);
          updateHeaderCounts();
          showToast('Moved to wishlist');
        }
      }
      if (e.target.closest('.filter-cat-link')) {
        e.preventDefault();
        const cat = normalizeCategory(e.target.closest('.filter-cat-link').dataset.cat);
        this.shopFilters.category = cat;
        this.shopFilters.page = 1;
        location.hash = cat ? `#shop/${cat}` : '#shop';
      }
      if (e.target.closest('.color-swatch.filter-swatch')) {
        const sw = e.target.closest('.color-swatch');
        this.shopFilters.color = sw.classList.contains('active') ? '' : sw.dataset.color;
        document.querySelectorAll('.color-swatch.filter-swatch').forEach(s => s.classList.toggle('active', s.dataset.color === this.shopFilters.color));
        this.shopFilters.page = 1;
        this.renderShop();
      }
      if (e.target.closest('.size-filter-btn')) {
        const btn = e.target.closest('.size-filter-btn');
        this.shopFilters.size = btn.classList.contains('active') ? '' : btn.dataset.size;
        document.querySelectorAll('.size-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.size === this.shopFilters.size));
        this.shopFilters.page = 1;
        this.renderShop();
      }
      if (e.target.closest('#clear-filters-btn')) {
        this.shopFilters = { category: '', priceMin: 0, priceMax: 50000, color: '', size: '', search: '', sort: 'newest', page: 1 };
        const slider = document.getElementById('price-slider');
        if (slider) slider.value = 50000;
        this.renderShop();
      }
      if (e.target.closest('.pd-thumb')) {
        const btn = e.target.closest('.pd-thumb');
        const main = document.getElementById('pd-main-image');
        const thumbs = document.getElementById('pd-thumbs');
        const idx = parseInt(btn.dataset.index, 10) || 0;
        changeProductImage(main, btn.dataset.img, thumbs, idx);
      }

      if (e.target.closest('#pd-colors .color-swatch')) {
        const btn = e.target.closest('#pd-colors .color-swatch');
        const color = btn.dataset.color;
        const p = normalizeProduct(this.selectedProduct);
        document.querySelectorAll('#pd-colors .color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (p) {
          const main = document.getElementById('pd-main-image');
          const thumbs = document.getElementById('pd-thumbs');
          const imgs = loadProductImages(p, color);
          changeProductImage(main, imgs[0], thumbs, 0);
          renderGallery(thumbs, imgs, 0, 'pd-thumb');
        }
      }

      if (e.target.closest('[data-add-cart]')) {
        e.stopPropagation();
        const btn = e.target.closest('[data-add-cart]');
        if (addToCart(btn.dataset.addCart, btn.dataset.color, btn.dataset.size, 1)) {
          showToast('Added to cart!');
          updateHeaderCounts();
        }
      }

      if (e.target.closest('.qv-thumb')) {
        const thumb = e.target.closest('.qv-thumb');
        const p = UserApp.qvProduct;
        if (!p) return;
        const color = document.querySelector('#qv-colors .qv-color-swatch.active')?.dataset.color || p.colors[0];
        const idx = parseInt(thumb.dataset.index, 10) || 0;
        document.querySelectorAll('.qv-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        renderQVGallery(p, color, idx);
      }

      if (e.target.closest('.qv-color-swatch')) {
        const sw = e.target.closest('.qv-color-swatch');
        const color = sw.dataset.color;
        const p = UserApp.qvProduct;
        if (!p) return;
        document.querySelectorAll('.qv-color-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        renderQVGallery(p, color, 0);
        const sizes = getSizesForProduct(p);
        const activeSize = document.querySelector('#qv-sizes .option-btn.active')?.dataset.size;
        document.getElementById('qv-sizes').innerHTML = sizes.map((s, i) =>
          `<button class="option-btn ${(activeSize === s || (!activeSize && i === 0)) ? 'active' : ''}" data-size="${s}">${s}</button>`
        ).join('');
      }
      if (e.target.closest('#qv-sizes .option-btn')) {
        document.querySelectorAll('#qv-sizes .option-btn').forEach(b => b.classList.remove('active'));
        e.target.closest('.option-btn').classList.add('active');
      }
      if (e.target.closest('#qv-close') || e.target.closest('#quick-view-overlay')) {
        if (e.target.id === 'quick-view-overlay' || e.target.closest('#qv-close')) {
          document.getElementById('quick-view-overlay')?.classList.remove('open');
        }
      }
      if (e.target.closest('#qv-add-cart')) UserApp.handleQVAddCart();
      if (e.target.closest('#qv-view-details')) {
        const id = UserApp.qvProduct?.id;
        document.getElementById('quick-view-overlay')?.classList.remove('open');
        if (id) location.hash = `#product/${id}`;
      }
    });

    document.getElementById('search-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('search-input').value.trim();
      this.shopFilters.search = q;
      location.hash = '#shop';
    });

    document.getElementById('shop-filters')?.addEventListener('change', () => this.applyShopFilters());
    document.getElementById('price-slider')?.addEventListener('input', (e) => {
      this.shopFilters.priceMax = Number(e.target.value);
      document.getElementById('price-slider-val').textContent = formatCurrency(e.target.value);
      this.shopFilters.page = 1;
      this.renderShop();
    });
    document.querySelectorAll('.price-checkboxes input').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const [min, max] = e.target.value.split('-').map(Number);
        this.shopFilters.priceMin = min;
        this.shopFilters.priceMax = max;
        this.shopFilters.page = 1;
        this.renderShop();
      });
    });
    document.getElementById('sort-select')?.addEventListener('change', (e) => {
      this.shopFilters.sort = e.target.value;
      this.shopFilters.page = 1;
      this.renderShop();
    });

    document.getElementById('contact-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleContactSubmit(e.target);
    });

    document.getElementById('review-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleReviewSubmit(e.target);
    });

    document.getElementById('place-order-btn')?.addEventListener('click', () => this.handlePlaceOrder());

    document.getElementById('download-invoice-btn')?.addEventListener('click', () => {
      showToast('Invoice download is a demo feature');
    });

    document.querySelector('.mobile-menu-btn')?.addEventListener('click', () => {
      document.querySelector('.main-nav')?.classList.toggle('open');
    });

    document.getElementById('shop-pagination')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.page-btn:not([disabled])');
      if (!btn || !btn.dataset.page) return;
      e.preventDefault();
      e.stopPropagation();
      const page = Number(btn.dataset.page);
      if (page === this.shopFilters.page) return;
      this.shopFilters.page = page;
      this.renderShop(true);
    });
  },

  handleRoute() {
    const hash = location.hash.slice(1) || 'home';
    const parts = hash.split('/');
    const page = parts[0];
    const param = parts[1] ? decodeURIComponent(parts[1].replace(/\+/g, ' ')) : '';

    if (page === 'shop') {
      const normalized = param ? normalizeCategory(param) : '';
      if (this.shopFilters.category !== normalized) this.shopFilters.page = 1;
      this.shopFilters.category = normalized;
    }
    if (page === 'product' && param) {
      this.selectedProduct = normalizeProduct(getProductById(param));
      if (!this.selectedProduct) { location.hash = '#shop'; return; }
    }
    if (page !== 'checkout') CartManager.clearCheckoutSession();

    this.currentPage = page;
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const sectionMap = {
      home: 'page-home',
      shop: 'page-shop',
      product: 'page-product',
      cart: 'page-cart',
      checkout: 'page-checkout',
      success: 'page-success',
      about: 'page-about',
      contact: 'page-contact'
    };
    document.getElementById(sectionMap[page] || 'page-home')?.classList.add('active');

    updateNavActive(page, this.shopFilters.category);

    if (page !== 'shop') window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (page) {
      case 'home': this.renderHome(); break;
      case 'shop': this.renderShop(); break;
      case 'product': this.renderProductDetail(); break;
      case 'cart': this.renderCart(); break;
      case 'checkout': this.renderCheckout(); break;
      case 'success': this.renderSuccess(); break;
      case 'about': break;
      case 'contact': break;
    }

    initScrollReveal();
  },

  refreshCurrentView() {
    switch (this.currentPage) {
      case 'home': this.renderHome(); break;
      case 'shop': this.renderShop(); break;
      case 'product': this.renderProductDetail(); break;
      case 'cart': this.renderCart(); break;
      case 'checkout': this.renderCheckout(); break;
    }
    updateHeaderCounts();
  },

  renderHome() {
    const all = getProducts().filter(p => p.status === 'active').map(p => normalizeProduct(p));
    const signatureSarees = all.filter(p => p.category === 'signature');

    const sareeGrid = document.getElementById('signature-sarees-grid');
    if (sareeGrid) {
      sareeGrid.innerHTML = signatureSarees.length
        ? signatureSarees.slice(0, 2).map(p => signatureSareeCardHTML(p)).join('')
        : '<p class="empty-msg">No Signature Sarees Available</p>';
      initImageFallbacks(sareeGrid);
    }

    const featuredGrid = document.getElementById('featured-grid');
    if (featuredGrid) {
      const featured = getFeaturedHomeProducts(all, 8);
      featuredGrid.innerHTML = featured.length
        ? featured.map(p => productCardHTML(p)).join('')
        : '<p class="empty-msg">Featured items coming soon.</p>';
      initImageFallbacks(featuredGrid);
    }

    this.renderReviews('home-reviews');
    renderHomeCategoryCards();
    renderInstagramGrid();
    this.renderHomeSections();
    initImageFallbacks(document.getElementById('page-home'));
  },

  renderReviews(containerId, productId = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const pid = productId || (containerId === 'product-reviews'
      ? (location.hash.split('/')[1] || this.selectedProduct?.id)
      : null);
    const reviews = getPublicReviews(pid).slice(0, 6);
    container.innerHTML = reviews.length
      ? reviews.map(r => `
        <div class="review-card reveal">
          <div class="review-stars">${renderStars(r.rating)}</div>
          <p class="review-text">"${r.text}"</p>
          <div class="review-author">
            <div class="review-avatar">${r.name.charAt(0)}</div>
            <div>
              <strong>${r.name}</strong>
              <span>${new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>`).join('')
      : '<p class="empty-msg">No reviews yet.</p>';
  },

  applyShopFilters() {
    const form = document.getElementById('shop-filters');
    if (!form) return;
    this.shopFilters.category = form.querySelector('[name="category"]')?.value || '';
    this.shopFilters.color = form.querySelector('[name="color"]')?.value || '';
    this.shopFilters.size = form.querySelector('[name="size"]')?.value || '';
    const priceRange = form.querySelector('[name="price"]')?.value || '';
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      this.shopFilters.priceMin = min;
      this.shopFilters.priceMax = max;
    }
    this.shopFilters.page = 1;
    this.renderShop();
  },

  renderShop(pageChange = false) {
    const f = this.shopFilters;
    const filtered = filterProducts(f);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / this.perPage) || 1);

    if (f.page > totalPages) {
      f.page = totalPages;
      this.shopFilters.page = totalPages;
    }
    if (f.page < 1) {
      f.page = 1;
      this.shopFilters.page = 1;
    }

    const start = (f.page - 1) * this.perPage;
    const pageProducts = filtered.slice(start, start + this.perPage);

    const crumbs = document.getElementById('shop-breadcrumbs');
    if (crumbs) {
      const catLabel = f.category ? getCategoryLabel(f.category) : 'All Products';
      crumbs.innerHTML = `<a href="#home" data-nav="home">Home</a> <span>/</span> <a href="#shop" data-nav="shop">Shop</a>${f.category ? ` <span>/</span> <strong>${catLabel}</strong>` : ''}`;
    }

    const counts = getCategoryCounts();
    const catList = document.getElementById('sidebar-categories');
    if (catList) {
      catList.innerHTML = [
        { label: 'All Categories', key: '' },
        ...SHOP_NAV_SLUGS.map(slug => ({ label: getCategoryLabel(slug), key: slug }))
      ].map(c => `
        <button type="button" class="filter-cat-link ${f.category === c.key ? 'active' : ''}" data-cat="${c.key}">
          ${c.label} <span>(${c.key ? counts[c.key] || 0 : counts.all})</span>
        </button>`).join('');
    }

    const updateGrid = () => {
      const grid = document.getElementById('shop-grid');
      renderProductGrid(grid, pageProducts, { noReveal: true });
      if (grid) {
        grid.classList.remove('grid-fade-out');
        grid.classList.add('grid-fade-in');
        requestAnimationFrame(() => grid.classList.remove('grid-fade-in'));
      }
    };

    const grid = document.getElementById('shop-grid');
    if (grid && pageChange) {
      grid.classList.add('grid-fade-out');
      setTimeout(updateGrid, 200);
      const scrollTarget = document.getElementById('shop-toolbar') || grid;
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      updateGrid();
    }

    renderPagination(document.getElementById('shop-pagination'), f.page, totalPages);

    document.getElementById('shop-result-count').textContent = `Showing ${total ? start + 1 : 0} to ${Math.min(start + this.perPage, total)} of ${total} products`;
    document.getElementById('shop-page-title').textContent = f.category ? getCategoryLabel(f.category) : 'All Products';

    const sizeFilters = document.getElementById('size-filters');
    if (sizeFilters && !sizeFilters.dataset.built) {
      sizeFilters.innerHTML = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(s =>
        `<button type="button" class="size-filter-btn ${f.size === s ? 'active' : ''}" data-size="${s}">${s}</button>`
      ).join('');
      sizeFilters.dataset.built = '1';
    } else if (sizeFilters) {
      sizeFilters.querySelectorAll('.size-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.size === f.size));
    }
  },

  renderProductDetail() {
    const id = location.hash.split('/')[1];
    const p = normalizeProduct(getProductById(id) || this.selectedProduct);
    if (!p) return;
    this.selectedProduct = p;

    const outOfStock = p.stock <= 0 || p.status !== 'active';
    const price = p.offerPrice || p.price;
    const discount = calcDiscount(p.price, p.offerPrice);
    const rating = getProductRating(p.id);

    const crumbs = document.getElementById('pd-breadcrumbs');
    if (crumbs) {
      crumbs.innerHTML = `<a href="#home" data-nav="home">Home</a> <span>/</span> <a href="#shop/${p.category}" data-nav="shop" data-category="${p.category}">${getCategoryLabel(p.category)}</a> <span>/</span> <strong>${p.name}</strong>`;
    }

    document.getElementById('pd-name').textContent = p.name;
    document.getElementById('pd-price').textContent = formatCurrency(price);
    document.getElementById('pd-original-price').textContent = p.offerPrice ? formatCurrency(p.price) : '';
    document.getElementById('pd-discount').textContent = discount ? `-${discount}% OFF` : '';
    document.getElementById('pd-description').textContent = p.description;
    const imgs = loadProductImages(p, p.colors[0]);
    const mainImg = document.getElementById('pd-main-image');
    if (mainImg) {
      mainImg.src = safeImg(imgs[0]);
      mainImg.alt = p.name;
      bindImageFallback(mainImg);
    }

    const ratingEl = document.getElementById('pd-rating');
    if (ratingEl) {
      ratingEl.innerHTML = rating.count
        ? `${renderStars(Math.round(rating.avg))} <span>${rating.avg} (${rating.count} Reviews)</span>`
        : `${renderStars(5)} <span>Be the first to review</span>`;
    }

    renderGallery(document.getElementById('pd-thumbs'), imgs, 0, 'pd-thumb');
    renderColorVariants(document.getElementById('pd-colors'), p, p.colors[0]);

    const sizesEl = document.getElementById('pd-sizes');
    const pdSizes = getSizesForProduct(p);
    sizesEl.innerHTML = pdSizes.map((s, i) =>
      `<button class="option-btn size-box ${i === 0 ? 'active' : ''}" data-size="${s}">${s}</button>`
    ).join('');

    document.getElementById('pd-qty').value = 1;
    document.getElementById('pd-stock').textContent = outOfStock ? 'Out of Stock' : `${p.stock} in stock`;

    const addBtn = document.querySelector('.add-to-cart-btn');
    const buyBtn = document.querySelector('.buy-now-btn');
    addBtn.disabled = outOfStock;
    buyBtn.disabled = outOfStock;
    addBtn.textContent = outOfStock ? 'Out of Stock' : 'Add to Cart';
    buyBtn.textContent = outOfStock ? 'Out of Stock' : 'Buy Now';

    sizesEl.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sizesEl.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const sigBadge = document.getElementById('pd-signature-badge');
    renderSignatureBadge(sigBadge, p.badge, BADGE_LABELS[p.badge] || 'Signature Collection');

    const specs = document.getElementById('pd-specs');
    if (specs && p.attributes) {
      specs.innerHTML = Object.entries(p.attributes).map(([k,v]) =>
        `<div class="spec-row"><span>${k.replace(/([A-Z])/g,' $1')}</span><strong>${v}</strong></div>`
      ).join('');
    }

    const related = document.getElementById('pd-related');
    if (related) {
      const rel = getProducts().filter(x => normalizeProduct(x).category === p.category && x.id !== p.id).slice(0, 4);
      related.innerHTML = rel.map(x => productCardHTML(x)).join('');
    }

    this.renderReviews('product-reviews');
  },

  getSelectedOptions(p = this.selectedProduct) {
    const product = normalizeProduct(p);
    if (!product) return { color: '', size: '', qty: 1 };
    const color = document.querySelector('#pd-colors .color-swatch.active, #pd-colors .pd-color-swatch.active')?.dataset.color || product.colors[0];
    const size = document.querySelector('#pd-sizes .option-btn.active')?.dataset.size || getSizesForProduct(product)[0];
    const qty = Math.max(1, parseInt(document.getElementById('pd-qty')?.value, 10) || 1);
    return { color, size, qty };
  },

  handleAddToCart() {
    const p = normalizeProduct(this.selectedProduct);
    if (!p) return;
    const { color, size, qty } = this.getSelectedOptions(p);
    if (CartManager.addItem(p.id, color, size, qty, false)) {
      showToast('Added to cart!');
      updateNavbar();
    } else {
      showToast('Unable to add — out of stock', 'error');
    }
  },

  handleBuyNow() {
    const p = normalizeProduct(this.selectedProduct);
    if (!p) return;
    const { color, size, qty } = this.getSelectedOptions(p);
    const price = CartManager.getLinePrice(p, color, size);
    CartManager.setBuyNowItem({
      key: `${p.id}-${color}-${size}`,
      productId: p.id,
      color,
      size,
      qty,
      price
    });
    location.hash = '#checkout';
  },

  renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items');
    const empty = document.getElementById('cart-empty');
    const { count } = CartManager.calculateTotals(cart);

    const title = document.getElementById('cart-title');
    if (title) title.textContent = `Shopping Cart (${count} item${count !== 1 ? 's' : ''})`;

    if (!cart.length) {
      if (container) container.innerHTML = '';
      empty?.classList.remove('hidden');
      document.getElementById('cart-summary')?.classList.add('hidden');
      return;
    }

    empty?.classList.add('hidden');
    document.getElementById('cart-summary')?.classList.remove('hidden');

    container.innerHTML = cart.map(item => {
      const p = normalizeProduct(getProductById(item.productId));
      if (!p) return '';
      const inWish = getWishlist().includes(item.productId);
      const img = safeImg(getProductImages(p, item.color)[0]);
      return `
        <div class="cart-item" data-key="${item.key}">
          <img src="${img}" alt="${p.name}" onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'">
          <div class="cart-item-info">
            <h4>${p.name}</h4>
            <p class="cart-variant">${item.color} · Size: ${item.size}</p>
            <span class="price-current">${formatCurrency(item.price)}</span>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn cart-qty-minus">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn cart-qty-plus">+</button>
          </div>
          <div class="cart-item-total">${formatCurrency(item.price * item.qty)}</div>
          <div class="cart-item-actions">
            <button class="cart-wishlist ${inWish ? 'active' : ''}" aria-label="Wishlist" title="Add to Wishlist">♥</button>
            <button class="cart-remove" aria-label="Remove" title="Remove">🗑</button>
          </div>
        </div>`;
    }).join('');

    const { subtotal, shipping, total } = CartManager.calculateTotals(cart);
    document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('cart-shipping').textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
    document.getElementById('cart-total').textContent = formatCurrency(total);
  },

  renderCheckout() {
    const items = CartManager.getItems();
    if (!items.length) {
      CartManager.clearCheckoutSession();
      location.hash = '#cart';
      return;
    }
    renderOrderSummary('checkout', 'checkout');
  },

  handlePlaceOrder() {
    const form = document.getElementById('checkout-form');
    if (!form || !form.checkValidity()) {
      if (form) form.reportValidity();
      return;
    }

    const items = CartManager.getItems();
    const { subtotal, shipping, total } = calculateCart(items);
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'upi';
    const orderData = {
      name: form.fullname.value,
      phone: form.phone.value,
      email: form.email.value,
      address: form.address.value,
      city: form.city.value,
      pincode: form.pincode.value,
      paymentMethod,
      items: items.map(i => ({ ...i, product: getProductById(i.productId) })),
      subtotal,
      shipping,
      total
    };

    const btn = document.getElementById('place-order-btn');
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = '<span class="loader-inline"></span> Processing...';

    sendEmailJS({
      from_name: orderData.name,
      from_email: orderData.email,
      phone: orderData.phone,
      message: `New order placed for ${formatCurrency(total)}`
    });

    const completeOrder = async (payment) => {
      const order = {
        id: sdGenerateId('ORD'),
        ...orderData,
        paymentId: payment?.razorpay_payment_id || `COD-${Date.now()}`,
        invoiceNumber: payment?.invoiceNumber || `INV-${Date.now().toString().slice(-8)}`,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        createdAt: Date.now()
      };
      saveOrder(order);
      await adjustStockFromOrder(order, 'reduce');

      if (CartManager.isBuyNowSession()) {
        CartManager.clearCheckoutSession();
      } else {
        clearCart();
      }

      sessionStorage.setItem('lastOrderId', order.id);
      sessionStorage.setItem('lastOrderTotal', String(order.total));
      btn.disabled = false;
      btn.textContent = 'Place Order';
      location.hash = '#success';
    };

    openRazorpayCheckout(orderData, (payment) => {
      completeOrder(payment);
    }, () => {
      btn.disabled = false;
      btn.textContent = 'Place Order';
      showToast('Payment cancelled', 'error');
    });
  },

  renderSuccess() {
    const orderId = sessionStorage.getItem('lastOrderId');
    const order = getOrders().find(o => o.id === orderId);
    const orderIdEl = document.getElementById('success-order-id');
    const totalEl = document.getElementById('success-total');
    const deliveryEl = document.getElementById('success-delivery');
    const paymentIdEl = document.getElementById('success-payment-id');
    const invoiceEl = document.getElementById('success-invoice');

    if (orderIdEl) orderIdEl.textContent = order?.id || orderId || 'N/A';
    if (totalEl) totalEl.textContent = order ? formatCurrency(order.total) : formatCurrency(sessionStorage.getItem('lastOrderTotal') || 0);
    if (paymentIdEl) paymentIdEl.textContent = order?.paymentId || 'N/A';
    if (invoiceEl) invoiceEl.textContent = order?.invoiceNumber || 'N/A';
    if (deliveryEl) {
      const eta = new Date();
      eta.setDate(eta.getDate() + 5);
      deliveryEl.textContent = eta.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
  },

  handleContactSubmit(form) {
    const data = {
      from_name: form.name.value,
      from_email: form.email.value,
      phone: form.phone.value,
      message: form.message.value
    };
    sendEmailJS(data, () => {
      showToast('Message sent successfully!');
      form.reset();
    }, () => showToast('Failed to send. Try again.', 'error'));
  },

  handleReviewSubmit(form) {
    addReview({
      name: form.name.value,
      rating: parseInt(form.rating.value),
      text: form.text.value,
      productId: form.productId?.value || ''
    });
    showToast('Thank you! Your review will appear after approval.');
    form.reset();
    this.renderReviews('home-reviews');
    if (this.currentPage === 'product') this.renderReviews('product-reviews');
  },

  qvProduct: null,

  openQuickView(id) {
    const p = normalizeProduct(getProductById(id));
    if (!p) return;
    this.qvProduct = p;
    const modal = document.getElementById('quick-view-overlay');
    if (!modal) { location.hash = `#product/${id}`; return; }
    const price = p.offerPrice || p.price;
    const color = p.colors[0];
    const sizes = getSizesForProduct(p);
    document.getElementById('qv-name').textContent = p.name;
    document.getElementById('qv-price').textContent = formatCurrency(price);
    document.getElementById('qv-original').textContent = p.offerPrice ? formatCurrency(p.price) : '';
    document.getElementById('qv-desc').textContent = p.description;
    document.getElementById('qv-colors').innerHTML = p.colorVariants.map((c, i) => colorSwatchHTML(c, i === 0, 'qv-color-swatch', p)).join('');
    document.getElementById('qv-sizes').innerHTML = sizes.map((s, i) =>
      `<button class="option-btn ${i === 0 ? 'active' : ''}" data-size="${s}">${s}</button>`
    ).join('');
    renderQVGallery(p, color, 0);
    modal.classList.add('open');
  },

  handleQVAddCart() {
    const p = this.qvProduct;
    if (!p) return;
    const color = document.querySelector('#qv-colors .qv-color-swatch.active')?.dataset.color || p.colors[0];
    const size = document.querySelector('#qv-sizes .option-btn.active')?.dataset.size || p.sizes[0];
    if (addToCart(p.id, color, size, 1)) {
      showToast('Added to cart!');
      updateHeaderCounts();
      document.getElementById('quick-view-overlay')?.classList.remove('open');
    }
  },

  renderHomeSections() {
    const all = getProducts().filter(p => p.status === 'active').map(p => normalizeProduct(p));
    const grids = {
      'trending-grid': all.filter(p => p.badge === 'trending' || p.badge === 'best_seller').slice(0, 4),
      'latest-grid': [...all].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4)
    };
    Object.entries(grids).forEach(([id, prods]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = prods.length
        ? prods.map(p => productCardHTML(p)).join('')
        : '<p class="empty-msg">Coming soon</p>';
      initImageFallbacks(el);
    });
  }
};

function getFeaturedHomeProducts(all, limit = 8) {
  const picked = [];
  const seen = new Set();
  const add = (list) => {
    for (const p of list) {
      if (picked.length >= limit || seen.has(p.id)) continue;
      seen.add(p.id);
      picked.push(p);
    }
  };
  add(all.filter(p => p.featured || p.badge === 'featured'));
  add(all.filter(p => p.badge === 'trending' || p.badge === 'best_seller'));
  add([...all].sort((a, b) => b.createdAt - a.createdAt));
  return picked.slice(0, limit);
}

function renderInstagramGrid() {
  const grid = document.getElementById('instagram-grid');
  if (!grid) return;
  const items = getProducts()
    .filter(p => p.status === 'active')
    .map(p => normalizeProduct(p))
    .slice(0, 6);
  grid.innerHTML = items.length
    ? items.map(p => {
      const src = safeImg(p.mainImage || loadProductImages(p)[0]);
      return `<a href="#product/${p.id}" class="instagram-item reveal" aria-label="${p.name}">
        <img src="${src}" alt="${p.name}" loading="lazy">
      </a>`;
    }).join('')
    : '<p class="empty-msg">Gallery coming soon</p>';
  initImageFallbacks(grid);
}

/* ============================================================
   ADMIN WEBSITE
   ============================================================ */
const AdminApp = {
  currentView: 'dashboard',
  editingProductId: null,
  revenueChart: null,
  dateFilter: 'this_month',
  variantDraft: [],

  init() {
    if (!document.body.classList.contains('admin-site')) return;
    this.bindEvents();
    initDateFilter((key, start, end) => {
      this.dateFilter = key;
      this.customStart = start;
      this.customEnd = end;
      this.refreshView();
    });

    if (isAdminLoggedIn()) {
      this.showDashboard();
    } else {
      this.showLogin();
    }

    initImageFallbacks();

    window.addEventListener('sd-storage-update', () => this.refreshView());
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('sd_')) this.refreshView();
    });
  },

  bindEvents() {
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = e.target.username.value;
      const pass = e.target.password.value;
      if (adminLogin(user, pass)) {
        if (e.target.remember?.checked) localStorage.setItem('sd_remember_admin', user);
        else localStorage.removeItem('sd_remember_admin');
        showToast('Welcome back, Admin!');
        this.showDashboard();
      } else {
        showToast('Invalid credentials', 'error');
        document.getElementById('login-error').textContent = 'Invalid username or password';
      }
    });

    document.getElementById('toggle-password')?.addEventListener('click', () => {
      const inp = document.getElementById('password');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });

    const remembered = localStorage.getItem('sd_remember_admin');
    if (remembered) {
      const u = document.getElementById('username');
      if (u) u.value = remembered;
    }

    document.getElementById('logout-btn')?.addEventListener('click', () => {
      adminLogout();
      this.showLogin();
    });
    document.getElementById('logout-btn-sidebar')?.addEventListener('click', () => {
      adminLogout();
      this.showLogin();
    });

    document.querySelectorAll('[data-admin-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        this.currentView = btn.dataset.adminNav;
        this.switchView();
      });
    });

    document.getElementById('product-image-upload')?.addEventListener('change', (e) => this.handleImageUpload(e));
    document.getElementById('add-variant-btn')?.addEventListener('click', () => this.addVariantRow());

    document.getElementById('product-search')?.addEventListener('input', (e) => {
      this.renderProductsTable(e.target.value, document.getElementById('product-filter-category')?.value, 1);
    });

    document.getElementById('product-filter-category')?.addEventListener('change', (e) => {
      this.renderProductsTable(document.getElementById('product-search')?.value, e.target.value, 1);
    });

    document.getElementById('products-table-pagination')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.page-btn');
      if (!btn || btn.disabled) return;
      const page = parseInt(btn.dataset.page, 10);
      if (!page) return;
      this.renderProductsTable(this._productSearch || '', this._productCategory || '', page);
    });

    document.getElementById('add-product-btn')?.addEventListener('click', () => {
      this.editingProductId = null;
      this.openProductModal();
    });

    document.getElementById('product-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await this.saveProductForm(e.target);
      } catch (err) {
        console.error(err);
        showToast('Failed to save product', 'error');
      }
    });

    document.getElementById('close-product-modal')?.addEventListener('click', () => {
      document.getElementById('product-modal').classList.remove('open');
    });

    document.getElementById('add-review-btn')?.addEventListener('click', () => {
      document.getElementById('review-modal').classList.add('open');
    });

    document.getElementById('admin-review-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      addReview({ name: f.name.value, rating: parseInt(f.rating.value), text: f.text.value, productId: f.productId.value, fromAdmin: true });
      document.getElementById('review-modal').classList.remove('open');
      f.reset();
      this.renderReviewsTable();
      showToast('Review added — visible on user site');
    });

    document.getElementById('close-review-modal')?.addEventListener('click', () => {
      document.getElementById('review-modal').classList.remove('open');
    });

    const settingsSaveBtn = document.querySelector('#view-settings .btn-red');
    if (settingsSaveBtn) {
      settingsSaveBtn.onclick = () => {
        const form = document.querySelector('#view-settings .settings-form');
        if (!form) return;
        const fields = form.querySelectorAll('input, textarea');
        const settings = getSettings();
        if (fields[2]) settings.email = fields[2].value;
        if (fields[3]) settings.phone = fields[3].value;
        if (fields[4]) settings.address = fields[4].value;
        if (fields[5]) settings.freeShippingThreshold = parseInt(fields[5].value) || 999;
        if (fields[6]) settings.returnDays = parseInt(fields[6].value) || 7;
        saveSettings(settings);
        showToast('Settings saved');
      };
    }
  },

  showLogin() {
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
  },

  showDashboard() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    this.switchView();
  },

  switchView() {
    document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${this.currentView}`)?.classList.add('active');
    document.querySelectorAll('[data-admin-nav]').forEach(n => {
      n.classList.toggle('active', n.dataset.adminNav === this.currentView);
    });

    switch (this.currentView) {
      case 'dashboard': this.renderDashboard(); break;
      case 'products': this.renderProductsTable(this._productSearch || '', this._productCategory || '', this._productPage || 1); break;
      case 'orders': this.renderOrdersTable(); break;
      case 'reviews': this.renderReviewsTable(); break;
      case 'customers': this.renderCustomersTable(); break;
      case 'settings': this.renderSettings(); break;
    }
  },

  renderSettings() {
    const s = getSettings();
    const form = document.querySelector('#view-settings .settings-form');
    if (!form) return;
    const fields = form.querySelectorAll('input, textarea');
    if (fields[0]) fields[0].value = s.storeName || '';
    if (fields[1]) fields[1].value = s.tagline || '';
    if (fields[2]) fields[2].value = s.email || '';
    if (fields[3]) fields[3].value = s.phone || '';
    if (fields[4]) fields[4].value = s.address || '';
    if (fields[5]) fields[5].value = s.freeShippingThreshold || 999;
    if (fields[6]) fields[6].value = s.returnDays || 7;
  },

  refreshView() {
    if (!isAdminLoggedIn()) return;
    this.switchView();
  },

  renderDashboard() {
    const stats = getAnalytics(this.dateFilter, this.customStart, this.customEnd);
    document.getElementById('stat-products').textContent = stats.totalProducts;
    document.getElementById('stat-orders').textContent = stats.totalOrders;
    document.getElementById('stat-customers').textContent = stats.totalCustomers;
    document.getElementById('stat-revenue').textContent = formatCurrency(stats.totalRevenue);

    const growthHTML = (pct) => {
      if (!pct) return '<span class="stat-growth">—</span>';
      const sign = pct > 0 ? '↑' : '↓';
      return `<span class="stat-growth">${sign} ${Math.abs(pct)}%</span>`;
    };
    ['stat-products-growth', 'stat-orders-growth', 'stat-customers-growth', 'stat-revenue-growth'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = growthHTML(Object.values(stats.growth)[i]);
    });

    const extra = document.getElementById('dashboard-extra-stats');
    if (extra) {
      extra.innerHTML = `
        <div class="stat-mini"><span>Today's Sales</span><strong>${formatCurrency(stats.todaySales)}</strong></div>
        <div class="stat-mini"><span>Weekly Sales</span><strong>${formatCurrency(stats.weeklySales)}</strong></div>
        <div class="stat-mini"><span>Avg Order</span><strong>${formatCurrency(stats.avgOrderValue)}</strong></div>
        <div class="stat-mini"><span>Pending Orders</span><strong>${stats.pendingOrders}</strong></div>
        <div class="stat-mini"><span>Today's Orders</span><strong>${stats.todayOrdersCount}</strong></div>
        <div class="stat-mini"><span>Active Products</span><strong>${stats.activeProducts}</strong></div>
        <div class="stat-mini"><span>Low Stock</span><strong>${stats.lowStock} items</strong></div>
        <div class="stat-mini"><span>Out of Stock</span><strong>${stats.outOfStock}</strong></div>
        <div class="stat-mini"><span>Reviews</span><strong>${stats.approvedReviews}</strong></div>
        <div class="stat-mini"><span>Wishlist</span><strong>${stats.wishlistCount}</strong></div>
        <div class="stat-mini"><span>Cart Items</span><strong>${stats.cartCount}</strong></div>
        <div class="stat-mini"><span>Top Category</span><strong>${stats.topCategory}</strong></div>`;
    }

    this.renderRevenueChart(stats.allOrders);
    this.renderRecentOrders(stats.allOrders);
    this.renderRecentProducts();
  },

  renderRevenueChart(orders) {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const days = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      days[key] = 0;
    }
    (orders || getOrders()).forEach(o => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (days[key] !== undefined) days[key] += o.total;
    });

    if (this.revenueChart) this.revenueChart.destroy();
    this.revenueChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: Object.keys(days).filter((_, i) => i % 5 === 0),
        datasets: [{
          label: 'Sales Overview',
          data: Object.values(days).filter((_, i) => i % 5 === 0),
          borderColor: '#8B0000',
          backgroundColor: 'rgba(139,0,0,0.08)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#D4AF37',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  },

  renderRecentOrders(orders) {
    const list = (orders || getOrders()).slice(0, 5);
    const tbody = document.getElementById('recent-orders-body');
    if (!tbody) return;
    tbody.innerHTML = list.length
      ? list.map(o => `<tr><td>${o.id}</td><td>${o.name}</td><td>${formatCurrency(o.total)}</td><td><span class="status-badge ${o.status === 'paid' || o.status === 'completed' ? 'paid' : 'inactive'}">${o.status}</span></td><td>${new Date(o.createdAt).toLocaleDateString('en-IN')}</td></tr>`).join('')
      : '<tr><td colspan="5" class="empty-cell">No orders yet</td></tr>';
  },

  renderCustomersTable() {
    const customers = sdGet(SD_KEYS.customers, []).sort((a, b) => (b.lastOrder || 0) - (a.lastOrder || 0));
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    tbody.innerHTML = customers.length
      ? customers.map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${c.email || '—'}</td>
        <td>${c.orders || 0}</td>
        <td>${formatCurrency(c.totalSpent || 0)}</td>
        <td>${c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('en-IN') : '—'}</td>
      </tr>`).join('')
      : '<tr><td colspan="5" class="empty-cell">No customers yet</td></tr>';
    const summary = document.getElementById('customers-summary');
    if (summary) summary.textContent = `${customers.length} customers · ${formatCurrency(customers.reduce((s, c) => s + (c.totalSpent || 0), 0))} total spent`;
  },

  renderRecentProducts() {
    const products = getProducts().slice(0, 5);
    const tbody = document.getElementById('recent-products-body');
    tbody.innerHTML = products.map(p => {
      const np = normalizeProduct(p);
      const thumb = safeImg(np.mainImage || np.images[0]);
      return `<tr><td>${imgTag(thumb, np.name, 'table-thumb')}</td><td>${np.name}</td><td>${getCategoryLabel(np.category)}</td><td>${formatCurrency(np.offerPrice || np.price)}</td><td>${np.stock}</td></tr>`;
    }).join('');
    initImageFallbacks(tbody);
  },

  renderProductsTable(search = '', category = '', page = 1) {
    let products = getProducts().map(p => normalizeProduct(p));
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        getCategoryLabel(p.category).toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    if (category) products = products.filter(p => p.category === normalizeCategory(category));

    const perPage = 8;
    const total = products.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage) || 1);
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * perPage;
    const pageProducts = products.slice(start, start + perPage);

    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = pageProducts.map(p => {
      const thumb = safeImg(p.mainImage || p.images[0] || loadProductImages(p)[0]);
      const statusClass = p.stock <= 0 ? 'oos' : p.status === 'active' ? 'active' : 'inactive';
      const statusText = p.stock <= 0 ? 'Out of Stock' : p.status;
      return `
        <tr>
          <td>${imgTag(thumb, p.name, 'table-thumb')}</td>
          <td>${p.name}${p.signatureSaree ? ' <span class="mini-badge">Signature</span>' : ''}</td>
          <td>${getCategoryLabel(p.category)}</td>
          <td>${formatCurrency(p.offerPrice || p.price)}</td>
          <td>${p.stock}</td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td class="action-cell">
            <button class="btn-icon edit-product" data-id="${p.id}" title="Edit">✎</button>
            <button class="btn-icon delete-product" data-id="${p.id}" title="Delete">🗑</button>
            <button class="btn-icon toggle-featured ${p.featured ? 'active' : ''}" data-id="${p.id}" title="Featured">★</button>
          </td>
        </tr>`;
    }).join('');

    const footer = document.getElementById('products-table-footer');
    if (footer) {
      footer.textContent = `Showing ${total ? start + 1 : 0} to ${Math.min(start + perPage, total)} of ${total} products`;
    }

    renderPagination(document.getElementById('products-table-pagination'), safePage, totalPages);
    initImageFallbacks(tbody);

    tbody.querySelectorAll('.edit-product').forEach(btn => {
      btn.addEventListener('click', () => this.editProduct(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-product').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Delete this product?')) {
          try {
            await deleteProduct(btn.dataset.id);
            const remaining = getProducts().length;
            const maxPage = Math.max(1, Math.ceil(remaining / perPage));
            const nextPage = Math.min(safePage, maxPage);
            this.renderProductsTable(search, category, nextPage);
            showToast('Product deleted');
          } catch (err) {
            console.error(err);
            showToast('Failed to delete product', 'error');
          }
        }
      });
    });
    tbody.querySelectorAll('.toggle-featured').forEach(btn => {
      btn.addEventListener('click', async () => {
        const p = getProductById(btn.dataset.id);
        try {
          await updateProduct(btn.dataset.id, { featured: !p.featured });
          this.renderProductsTable(search, category, safePage);
          showToast(p.featured ? 'Removed from signature products' : 'Added to signature products');
        } catch (err) {
          console.error(err);
          showToast('Failed to update product', 'error');
        }
      });
    });

    this._productPage = safePage;
    this._productSearch = search;
    this._productCategory = category;
  },

  renderOrdersTable() {
    const stats = getAnalytics(this.dateFilter, this.customStart, this.customEnd);
    const orders = stats.orders;
    const tbody = document.getElementById('orders-table-body');
    const summary = document.getElementById('orders-period-summary');
    if (summary) summary.textContent = `${orders.length} orders · ${formatCurrency(stats.totalRevenue)} revenue in selected period`;
    tbody.innerHTML = orders.length
      ? orders.map(o => `
        <tr>
          <td>${o.id}</td>
          <td>${o.name}</td>
          <td>${o.email || '—'}</td>
          <td>${o.items?.length || 1} items</td>
          <td>${formatCurrency(o.total)}</td>
          <td>
            <select class="order-status-select" data-id="${o.id}" aria-label="Order status">
              ${['pending', 'paid', 'completed', 'cancelled'].map(s =>
                `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </td>
          <td>${new Date(o.createdAt).toLocaleString('en-IN')}</td>
        </tr>`).join('')
      : '<tr><td colspan="7" class="empty-cell">No orders in this period</td></tr>';

    tbody.querySelectorAll('.order-status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const prev = getOrderById(sel.dataset.id)?.status;
        try {
          updateOrderStatus(sel.dataset.id, sel.value);
          if (sel.value === 'cancelled' && prev !== 'cancelled') showToast('Order cancelled — stock restored');
          else if (prev === 'cancelled' && sel.value !== 'cancelled') showToast('Order reactivated — stock adjusted');
          else showToast('Order status updated');
          this.renderOrdersTable();
          if (this.currentView === 'dashboard') this.renderDashboard();
        } catch (err) {
          console.error(err);
          showToast('Failed to update order', 'error');
        }
      });
    });
  },

  renderReviewsTable() {
    const stats = getAnalytics(this.dateFilter, this.customStart, this.customEnd);
    const reviews = stats.allReviews;
    const tbody = document.getElementById('reviews-table-body');
    const summary = document.getElementById('reviews-period-summary');
    if (summary) summary.textContent = `${stats.totalReviews} total · ${stats.approvedReviews} approved · ${stats.reviews.length} in selected period`;
    tbody.innerHTML = reviews.length
      ? reviews.map(r => `
      <tr>
        <td>${r.name}</td>
        <td>${renderStars(r.rating)}</td>
        <td>${r.text.substring(0, 80)}${r.text.length > 80 ? '...' : ''}</td>
        <td>${new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
        <td>
          <span class="status-badge ${r.status === 'approved' || !r.status ? 'paid' : 'inactive'}">${r.status || 'approved'}</span>
          ${r.status === 'pending' ? `<button type="button" class="btn-icon approve-review" data-id="${r.id}" title="Approve">✓</button>` : ''}
          ${r.status === 'pending' ? `<button type="button" class="btn-icon reject-review" data-id="${r.id}" title="Reject">✕</button>` : ''}
          <button type="button" class="btn-icon delete-review" data-id="${r.id}" title="Delete">🗑</button>
        </td>
      </tr>`).join('')
      : '<tr><td colspan="5" class="empty-cell">No reviews yet</td></tr>';

    tbody.querySelectorAll('.approve-review').forEach(btn => {
      btn.addEventListener('click', () => {
        updateReviewStatus(btn.dataset.id, 'approved');
        this.renderReviewsTable();
        if (this.currentView === 'dashboard') this.renderDashboard();
        showToast('Review approved — visible on user site');
      });
    });
    tbody.querySelectorAll('.reject-review').forEach(btn => {
      btn.addEventListener('click', () => {
        updateReviewStatus(btn.dataset.id, 'rejected');
        this.renderReviewsTable();
        showToast('Review rejected');
      });
    });
    tbody.querySelectorAll('.delete-review').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteReview(btn.dataset.id);
        this.renderReviewsTable();
        if (this.currentView === 'dashboard') this.renderDashboard();
        showToast('Review deleted');
      });
    });
  },

  openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    form.reset();
    document.getElementById('product-modal-title').textContent = product ? 'Edit Product' : 'Add Product';
    this.variantDraft = [];

    if (product) {
      const p = normalizeProduct(product);
      form.name.value = p.name;
      form.category.value = normalizeCategory(p.category);
      form.price.value = p.price;
      form.offerPrice.value = p.offerPrice || '';
      form.stock.value = p.stock;
      form.description.value = p.description;
      form.badge.value = p.badge || '';
      form.status.value = p.status;
      form.fabric.value = p.attributes?.fabric || '';
      form.occasion.value = p.attributes?.occasion || '';
      this.variantDraft = JSON.parse(JSON.stringify(p.variants));
      const variantImgs = new Set(p.variants.flatMap(v => v.images || []));
      const extraGallery = (p.galleryImages || p.images || []).filter(img => !variantImgs.has(img));
      form.images.value = extraGallery.join('\n');
      this.renderVariantEditor();
      this.previewProductImages(extraGallery.length ? extraGallery : p.images);
    } else {
      document.getElementById('image-preview-grid').innerHTML = '';
      document.getElementById('variants-editor').innerHTML = '';
      this.addVariantRow('Red');
    }

    modal.classList.add('open');
  },

  addVariantRow(color = '') {
    this.variantDraft.push({
      color: color || `Color ${this.variantDraft.length + 1}`,
      images: [],
      sizes: [{ size: 'M', stock: 10, sku: '', priceAdjust: 0 }]
    });
    this.renderVariantEditor();
  },

  renderVariantEditor() {
    const container = document.getElementById('variants-editor');
    if (!container) return;
    container.innerHTML = this.variantDraft.map((v, vi) => `
      <div class="variant-block" data-vi="${vi}">
        <div class="variant-header">
          <input type="text" class="variant-color-input" value="${v.color}" placeholder="Color name" data-vi="${vi}">
          <button type="button" class="btn-icon remove-variant" data-vi="${vi}">🗑</button>
        </div>
        <div class="variant-images" id="variant-imgs-${vi}">${v.images.map((img, j) => `<div class="img-preview-item"><img src="${img}"><button type="button" class="remove-vimg" data-vi="${vi}" data-ji="${j}">✕</button></div>`).join('')}</div>
        <input type="file" accept="image/*" class="variant-file-input" data-vi="${vi}">
        <textarea class="variant-url-input" rows="2" placeholder="Or paste image URLs" data-vi="${vi}">${v.images.filter(i => !i.startsWith('data:')).join('\n')}</textarea>
        <div class="variant-sizes">${v.sizes.map((sz, si) => `
          <div class="size-row"><input value="${sz.size}" data-vi="${vi}" data-si="${si}" class="sz-name" placeholder="Size">
          <input type="number" value="${sz.stock}" class="sz-stock" data-vi="${vi}" data-si="${si}" placeholder="Stock">
          <input value="${sz.sku || ''}" class="sz-sku" data-vi="${vi}" data-si="${si}" placeholder="SKU"></div>`).join('')}
          <button type="button" class="btn btn-outline btn-sm add-size-row" data-vi="${vi}">+ Size</button>
        </div>
      </div>`).join('');

    container.querySelectorAll('.variant-file-input').forEach(inp => {
      inp.onchange = e => this.handleVariantImageUpload(e, Number(inp.dataset.vi));
    });
    container.querySelectorAll('.remove-variant').forEach(btn => {
      btn.onclick = () => { this.variantDraft.splice(Number(btn.dataset.vi), 1); this.renderVariantEditor(); };
    });
    container.querySelectorAll('.remove-vimg').forEach(btn => {
      btn.onclick = () => {
        const vi = Number(btn.dataset.vi), ji = Number(btn.dataset.ji);
        this.variantDraft[vi].images.splice(ji, 1);
        this.renderVariantEditor();
      };
    });
    container.querySelectorAll('.add-size-row').forEach(btn => {
      btn.onclick = () => {
        this.variantDraft[Number(btn.dataset.vi)].sizes.push({ size: 'L', stock: 5, sku: '', priceAdjust: 0 });
        this.renderVariantEditor();
      };
    });
  },

  async handleVariantImageUpload(e, vi) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImages = [];
    for (const file of files) {
      try {
        newImages.push(await compressImage(file));
      } catch {
        showToast('Image upload failed', 'error');
        return;
      }
    }
    this.variantDraft[vi].images = newImages;
    e.target.value = '';
    this.renderVariantEditor();
  },

  async handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    const urls = [];
    for (const file of files) {
      urls.push(await compressImage(file));
    }
    const ta = document.getElementById('product-form')?.images;
    if (ta) ta.value = (ta.value ? ta.value + '\n' : '') + urls.join('\n');
    this.previewProductImages(ta.value.split('\n').filter(Boolean));
  },

  collectVariantsFromEditor() {
    const container = document.getElementById('variants-editor');
    if (!container) return this.variantDraft;
    container.querySelectorAll('.variant-block').forEach(block => {
      const vi = Number(block.dataset.vi);
      const colorInp = block.querySelector('.variant-color-input');
      if (colorInp) this.variantDraft[vi].color = colorInp.value;

      const imgsContainer = block.querySelector('.variant-images');
      const domImages = imgsContainer
        ? [...imgsContainer.querySelectorAll('img')].map(img => img.getAttribute('src')).filter(Boolean)
        : [];
      const urlTa = block.querySelector('.variant-url-input');
      const urlImages = urlTa ? urlTa.value.split('\n').map(s => s.trim()).filter(Boolean) : [];
      if (urlImages.length) {
        this.variantDraft[vi].images = urlImages;
      } else if (domImages.length) {
        this.variantDraft[vi].images = domImages;
      }

      block.querySelectorAll('.size-row').forEach((row, si) => {
        const prev = this.variantDraft[vi].sizes[si] || {};
        this.variantDraft[vi].sizes[si] = {
          size: row.querySelector('.sz-name')?.value || 'M',
          stock: parseInt(row.querySelector('.sz-stock')?.value) || 0,
          sku: row.querySelector('.sz-sku')?.value || '',
          priceAdjust: prev.priceAdjust || 0
        };
      });
    });
    return this.variantDraft;
  },

  editProduct(id) {
    this.editingProductId = id;
    this.openProductModal(getProductById(id));
  },

  previewProductImages(urls) {
    const grid = document.getElementById('image-preview-grid');
    if (!grid) return;
    grid.innerHTML = (urls || []).map(u => `<div class="img-preview-item"><img src="${u}" alt=""></div>`).join('');
  },

  async saveProductForm(form) {
    const rawVariants = this.collectVariantsFromEditor();
    const variants = rawVariants.map((v, i) => {
      const images = (v.images || []).filter(Boolean).map(safeImg);
      const color = (v.color || '').trim() || `Color ${i + 1}`;
      const hex = getColorHex(color);
      return { ...v, color, images, hex };
    });
    const colorVariants = variants.map(v => ({
      name: v.color,
      hex: v.hex || getColorHex(v.color),
      image: safeImg(v.images[0]),
      images: v.images
    }));
    const galleryUrls = form.images.value.split('\n').map(s => s.trim()).filter(Boolean);
    const allImages = [...new Set([
      ...variants.flatMap(v => v.images),
      ...galleryUrls
    ])].map(safeImg);
    const allSizes = [...new Set(variants.flatMap(v => v.sizes.map(s => s.size)))];
    const totalStock = variants.reduce((s, v) => s + v.sizes.reduce((a, sz) => a + sz.stock, 0), 0);
    const badge = form.badge.value;
    let category = normalizeCategory(form.category.value);
    if (badge === 'signature') category = 'signature';

    const existing = this.editingProductId ? getProductById(this.editingProductId) : null;
    const product = {
      name: form.name.value,
      category,
      price: parseFloat(form.price.value),
      offerPrice: form.offerPrice.value ? parseFloat(form.offerPrice.value) : null,
      stock: totalStock || parseInt(form.stock.value) || 0,
      colors: colorVariants.map(c => c.name),
      colorVariants,
      sizes: allSizes,
      description: form.description.value,
      mainImage: safeImg(variants[0]?.images[0] || allImages[0]),
      galleryImages: allImages,
      images: allImages,
      variants,
      badge,
      featured: badge === 'featured',
      signatureSaree: badge === 'signature',
      status: form.status.value,
      createdAt: existing?.createdAt || Date.now(),
      attributes: {
        ...(existing?.attributes || {}),
        fabric: form.fabric?.value || existing?.attributes?.fabric || 'Premium Fabric',
        occasion: form.occasion?.value || existing?.attributes?.occasion || 'Festive',
        pattern: existing?.attributes?.pattern || 'Traditional',
        workType: existing?.attributes?.workType || 'Handcrafted',
        care: existing?.attributes?.care || 'Dry Clean Only',
        origin: existing?.attributes?.origin || 'India',
        brand: existing?.attributes?.brand || 'Sri Devi Textiles',
        dispatch: existing?.attributes?.dispatch || '2-4 Days',
        returns: existing?.attributes?.returns || '7 Days'
      }
    };

    if (this.editingProductId) {
      await updateProduct(this.editingProductId, product);
      showToast('Product updated — synced to user site');
    } else {
      await addProduct(product);
      showToast('Product added — synced to user site');
    }

    document.getElementById('product-modal').classList.remove('open');
    this.editingProductId = null;
    this.renderProductsTable(this._productSearch || '', this._productCategory || '', this._productPage || 1);
  }
};

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  initProductStore()
    .then(() => {
      UserApp.init();
      AdminApp.init();
    })
    .catch((err) => {
      console.error('[Sri Devi] Product store init failed:', err);
      productsCache = sdGet(SD_KEYS.products, []).map(normalizeProduct);
      UserApp.init();
      AdminApp.init();
      if (typeof showToast === 'function') showToast('Using local product cache', 'error');
    });
});
