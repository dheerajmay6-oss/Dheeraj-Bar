// ── State ──────────────────────────────────────────────────────────────────
let inventory = loadInventory();
let activeCategory = 'All';
let consumeTarget = null;  // { category, id, brand, remaining }
let consumePegs = 1;
let addSelectedCat = 'Whisky';
let removeTarget = null;   // { category, id, brand }

// ── Persistence ────────────────────────────────────────────────────────────
function loadInventory() {
  try {
    const saved = localStorage.getItem('dheeraj-bar-v1');
    return saved ? JSON.parse(saved) : deepClone(DEFAULT_INVENTORY);
  } catch { return deepClone(DEFAULT_INVENTORY); }
}

function saveInventory() {
  localStorage.setItem('dheeraj-bar-v1', JSON.stringify(inventory));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  saveInventory();
  renderBanners();
  renderInventory();
}

function renderBanners() {
  const lowItems = [];
  const emptyItems = [];

  Object.entries(inventory).forEach(([cat, bottles]) => {
    bottles.forEach(b => {
      if (b.remaining === 0) emptyItems.push({ ...b, category: cat });
      else if (b.remaining < LOW_STOCK_THRESHOLD) lowItems.push({ ...b, category: cat });
    });
  });

  // Low stock banner
  const banner = document.getElementById('low-stock-banner');
  const chips = document.getElementById('low-stock-chips');
  if (lowItems.length > 0) {
    chips.innerHTML = lowItems.map(item => {
      const ci = CATEGORIES[item.category];
      return `<span class="banner-chip" style="border-color:${ci.color};color:${ci.color}">
        ${ci.emoji} ${item.brand} — ${item.remaining} ml
      </span>`;
    }).join('');
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }

  // Empty banner
  const emptyBanner = document.getElementById('empty-banner');
  const emptyText = document.getElementById('empty-text');
  if (emptyItems.length > 0) {
    emptyText.textContent = `Empty bottles: ${emptyItems.map(b => b.brand).join(', ')} — time to restock!`;
    emptyBanner.classList.remove('hidden');
  } else {
    emptyBanner.classList.add('hidden');
  }
}

function renderInventory() {
  const main = document.getElementById('inventory-main');
  const cats = activeCategory === 'All' ? Object.keys(CATEGORIES) : [activeCategory];

  main.innerHTML = cats.map(cat => {
    const bottles = inventory[cat] || [];
    const ci = CATEGORIES[cat];
    return `
      <section class="cat-section">
        <div class="cat-section-header" style="border-color:${ci.border}">
          <span class="cat-section-emoji">${ci.emoji}</span>
          <h2 class="cat-section-title" style="color:${ci.color}">${cat}</h2>
          <span class="cat-section-count">${bottles.length} bottle${bottles.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="bottles-grid">
          ${bottles.map(b => renderBottleCard(b, cat, ci)).join('')}
          ${bottles.length === 0 ? `<div class="empty-cat">No bottles in this category. <button class="link-btn" onclick="openAddModal('${cat}')">Add one</button></div>` : ''}
        </div>
      </section>
    `;
  }).join('');
}

function renderBottleCard(bottle, category, ci) {
  const { id, brand, remaining, logo } = bottle;
  const fillPct = Math.round((remaining / BOTTLE_ML) * 100);
  const pegsLeft = Math.floor(remaining / PEG_ML);
  const isLow = remaining > 0 && remaining < LOW_STOCK_THRESHOLD;
  const isEmpty = remaining === 0;

  const initials = brand.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const fillColor = isEmpty ? '#333' : isLow ? '#ff4444' : ci.color;
  const fillGlow = isEmpty ? '' : isLow ? '0 0 8px #ff444466' : `0 0 8px ${ci.fillGlow}`;

  const logoHtml = logo
    ? `<img
         src="${logo}"
         alt="${brand}"
         class="brand-logo-img"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
       />
       <div class="brand-logo-fallback" style="color:${ci.color};display:none">${initials}</div>`
    : `<div class="brand-logo-fallback" style="color:${ci.color};display:flex">${ci.emoji}<span style="font-size:0.9rem;margin-left:6px">${initials}</span></div>`;

  return `
    <div class="bottle-card ${isLow ? 'card-low' : ''} ${isEmpty ? 'card-empty' : ''}"
         style="--cat-color:${ci.color};--cat-border:${ci.border};--cat-bg:${ci.cardBg}">

      ${isLow && !isEmpty ? `<div class="card-badge badge-low">⚠️ Low</div>` : ''}
      ${isEmpty ? `<div class="card-badge badge-empty">🚫 Empty</div>` : ''}

      <div class="brand-logo-wrap">
        ${logoHtml}
      </div>

      <div class="fill-bar-wrap">
        <div class="fill-bar-track">
          <div class="fill-bar-fill" style="width:${fillPct}%;background:${fillColor};box-shadow:${fillGlow}"></div>
        </div>
        <span class="fill-bar-pct" style="color:${isLow ? '#ff4444' : ci.color}">${fillPct}%</span>
      </div>

      <div class="card-info">
        <h3 class="card-brand" style="color:${ci.color}" title="${brand}">${brand}</h3>
        <div class="card-stats">
          <div class="card-stat">
            <span class="stat-num">${remaining}</span>
            <span class="stat-lbl">ml left</span>
          </div>
          <div class="stat-div"></div>
          <div class="card-stat">
            <span class="stat-num">${pegsLeft}</span>
            <span class="stat-lbl">pegs left</span>
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button class="btn-consume"
                style="background:${isEmpty ? '#333' : ci.color};color:${isEmpty ? '#666' : '#000'}"
                onclick="openConsumeModal('${category}','${id}','${brand.replace(/'/g, "\\'")}',${remaining})"
                ${isEmpty ? 'disabled' : ''}>
          🥃 Consume
        </button>
        <button class="btn-remove"
                onclick="openRemoveModal('${category}','${id}','${brand.replace(/'/g, "\\'")}')"
                title="Remove bottle">✕</button>
      </div>
    </div>
  `;
}

// ── Category Filter ────────────────────────────────────────────────────────
function setCategory(btn, cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.remove('active');
    b.style.borderColor = '';
    b.style.color = '';
    b.style.background = '';
  });
  btn.classList.add('active');
  if (cat !== 'All') {
    const ci = CATEGORIES[cat];
    btn.style.borderColor = ci.color;
    btn.style.color = ci.color;
    btn.style.background = ci.darkBg;
  }
  renderInventory();
}

// ── Consume Modal ──────────────────────────────────────────────────────────
function openConsumeModal(category, id, brand, remaining) {
  consumeTarget = { category, id, brand, remaining };
  consumePegs = 1;

  const ci = CATEGORIES[category];
  document.getElementById('consume-emoji').textContent = ci.emoji;
  document.getElementById('consume-title').textContent = brand;
  document.getElementById('consume-header').style.borderColor = ci.border;
  document.getElementById('consume-current').textContent = `${remaining} ml`;
  document.getElementById('consume-current').style.color = ci.color;
  document.getElementById('btn-confirm-consume').style.background = ci.color;

  updateConsumeCalc();
  document.getElementById('consume-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeConsumeModal() {
  document.getElementById('consume-modal').classList.add('hidden');
  document.body.style.overflow = '';
  consumeTarget = null;
}

function changePegs(delta) {
  if (!consumeTarget) return;
  const maxPegs = Math.floor(consumeTarget.remaining / PEG_ML);
  consumePegs = Math.max(1, Math.min(maxPegs, consumePegs + delta));
  updateConsumeCalc();
}

function updateConsumeCalc() {
  if (!consumeTarget) return;
  const ml = consumePegs * PEG_ML;
  const after = Math.max(0, consumeTarget.remaining - ml);
  const ci = CATEGORIES[consumeTarget.category];

  document.getElementById('peg-value').textContent = consumePegs;
  document.getElementById('calc-ml').textContent = `${ml} ml`;

  const afterEl = document.getElementById('calc-after');
  afterEl.textContent = `${after} ml`;
  afterEl.style.color = after < LOW_STOCK_THRESHOLD ? '#ff4444' : ci.color;

  const warn = document.getElementById('consume-warn');
  if (after === 0) {
    warn.textContent = '🚫 This will empty the bottle!';
    warn.classList.remove('hidden');
  } else if (after < LOW_STOCK_THRESHOLD) {
    warn.textContent = `⚠️ This will bring stock below ${LOW_STOCK_THRESHOLD} ml — running low!`;
    warn.classList.remove('hidden');
  } else {
    warn.classList.add('hidden');
  }
}

function confirmConsume() {
  if (!consumeTarget) return;
  const ml = consumePegs * PEG_ML;
  const { category, id } = consumeTarget;

  inventory[category] = inventory[category].map(b =>
    b.id === id ? { ...b, remaining: Math.max(0, b.remaining - ml) } : b
  );

  closeConsumeModal();
  render();
}

// ── Add Bottle Modal ───────────────────────────────────────────────────────
function openAddModal(preselect) {
  addSelectedCat = preselect || 'Whisky';
  document.querySelectorAll('.cat-chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === addSelectedCat);
  });
  updateAddModalStyle();
  document.getElementById('add-brand-input').value = '';
  document.getElementById('add-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('add-brand-input').focus(), 50);
}

function closeAddModal() {
  document.getElementById('add-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function selectAddCat(btn, cat) {
  addSelectedCat = cat;
  document.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateAddModalStyle();
}

function updateAddModalStyle() {
  const ci = CATEGORIES[addSelectedCat];
  document.getElementById('add-emoji').textContent = ci.emoji;
  document.getElementById('add-header').style.borderColor = ci.border;
  document.getElementById('btn-confirm-add').style.background = ci.color;

  document.querySelectorAll('.cat-chip').forEach(btn => {
    const bCat = btn.dataset.cat;
    const bci = CATEGORIES[bCat];
    if (btn.classList.contains('active')) {
      btn.style.background = bci.color;
      btn.style.color = '#000';
      btn.style.borderColor = bci.color;
    } else {
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  });
}

function confirmAdd() {
  const brand = document.getElementById('add-brand-input').value.trim();
  if (!brand) { document.getElementById('add-brand-input').focus(); return; }

  const newId = `${addSelectedCat[0].toLowerCase()}${Date.now()}`;
  inventory[addSelectedCat].push({ id: newId, brand, remaining: BOTTLE_ML });

  closeAddModal();
  if (activeCategory !== 'All' && activeCategory !== addSelectedCat) {
    setCategory(document.querySelector(`.cat-btn[data-cat="${addSelectedCat}"]`), addSelectedCat);
  }
  render();
}

// ── Remove Modal ───────────────────────────────────────────────────────────
function openRemoveModal(category, id, brand) {
  removeTarget = { category, id, brand };
  document.getElementById('remove-confirm-text').textContent =
    `Remove "${brand}" from your bar? This cannot be undone.`;
  document.getElementById('remove-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeRemoveModal() {
  document.getElementById('remove-modal').classList.add('hidden');
  document.body.style.overflow = '';
  removeTarget = null;
}

function confirmRemove() {
  if (!removeTarget) return;
  const { category, id } = removeTarget;
  inventory[category] = inventory[category].filter(b => b.id !== id);
  closeRemoveModal();
  render();
}

// ── Reset ──────────────────────────────────────────────────────────────────
function confirmReset() {
  if (window.confirm('Reset ALL stock to defaults? This will clear all your current inventory data.')) {
    inventory = deepClone(DEFAULT_INVENTORY);
    render();
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
render();
