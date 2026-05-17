// ── State ──────────────────────────────────────────────────────────────────
let inventory    = loadInventory();
let activeCategory = 'All';
let consumeTarget  = null;
let consumePegs    = 1;
let addSelectedCat = 'Whisky';
let removeTarget   = null;

// ── Persistence ────────────────────────────────────────────────────────────
function loadInventory() {
  try {
    const saved = localStorage.getItem('dheeraj-bar-v2');
    return saved ? JSON.parse(saved) : deepClone(DEFAULT_INVENTORY);
  } catch { return deepClone(DEFAULT_INVENTORY); }
}
function saveInventory() {
  localStorage.setItem('dheeraj-bar-v2', JSON.stringify(inventory));
}
function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  saveInventory();
  renderHeaderStats();
  renderAlerts();
  renderInventory();
}

// ── Header Stats ───────────────────────────────────────────────────────────
function renderHeaderStats() {
  let totalBottles = 0, totalMl = 0, totalPegs = 0, lowCount = 0;
  Object.values(inventory).forEach(bottles => {
    bottles.forEach(b => {
      totalBottles++;
      totalMl += b.remaining;
      totalPegs += Math.floor(b.remaining / PEG_ML);
      if (b.remaining > 0 && b.remaining < LOW_STOCK_THRESHOLD) lowCount++;
    });
  });
  setText('hs-bottles', totalBottles);
  setText('hs-litres', (totalMl / 1000).toFixed(1) + 'L');
  setText('hs-pegs', totalPegs);
  setText('hs-low', lowCount);
  const lowEl = document.getElementById('hs-low');
  if (lowEl) lowEl.className = 'hstat-num' + (lowCount > 0 ? ' hstat-warn' : '');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Alerts ─────────────────────────────────────────────────────────────────
function renderAlerts() {
  const lowItems = [], emptyItems = [];
  Object.entries(inventory).forEach(([cat, bottles]) => {
    bottles.forEach(b => {
      if (b.remaining === 0) emptyItems.push({ ...b, category: cat });
      else if (b.remaining < LOW_STOCK_THRESHOLD) lowItems.push({ ...b, category: cat });
    });
  });

  const banner = document.getElementById('low-stock-banner');
  const chips  = document.getElementById('low-stock-chips');
  if (lowItems.length) {
    chips.innerHTML = lowItems.map(item => {
      const ci = CATEGORIES[item.category];
      return `<span class="alert-chip" style="color:${ci.color};border-color:${ci.color}40">
        ${ci.emoji} ${item.brand} · ${item.remaining} ml</span>`;
    }).join('');
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }

  const emptyBanner = document.getElementById('empty-banner');
  const emptyText   = document.getElementById('empty-text');
  if (emptyItems.length) {
    emptyText.textContent = `Empty: ${emptyItems.map(b => b.brand).join(', ')} — time to restock.`;
    emptyBanner.classList.remove('hidden');
  } else {
    emptyBanner.classList.add('hidden');
  }
}

// ── Inventory ──────────────────────────────────────────────────────────────
function renderInventory() {
  const main = document.getElementById('inventory-main');
  const cats = activeCategory === 'All' ? Object.keys(CATEGORIES) : [activeCategory];

  main.innerHTML = cats.map(cat => {
    const ci      = CATEGORIES[cat];
    const bottles = inventory[cat] || [];
    const totalMl = bottles.reduce((s, b) => s + b.remaining, 0);

    return `
      <section class="cat-section">
        <div class="cat-section-hd">
          <div class="cat-section-emoji-wrap" style="background:${ci.color}18">
            <span>${ci.emoji}</span>
          </div>
          <div class="cat-section-meta">
            <h2 class="cat-section-title" style="color:${ci.color}">${cat}</h2>
            <p class="cat-section-sub">${(totalMl/1000).toFixed(2)}L across ${bottles.length} bottle${bottles.length!==1?'s':''}</p>
          </div>
          <div class="cat-section-line"></div>
          <span class="cat-count-badge">${bottles.length}</span>
        </div>
        <div class="bottles-grid">
          ${bottles.map(b => renderCard(b, cat, ci)).join('')}
          ${bottles.length === 0 ? `<div class="empty-cat-msg">
            No bottles in this category.
            <button class="empty-cat-link" onclick="openAddModal('${cat}')">Add one →</button>
          </div>` : ''}
        </div>
      </section>`;
  }).join('');
}

// ── Card ───────────────────────────────────────────────────────────────────
function renderCard(bottle, category, ci) {
  const { id, brand, remaining, logo } = bottle;
  const fillPct  = Math.round((remaining / BOTTLE_ML) * 100);
  const pegsLeft = Math.floor(remaining / PEG_ML);
  const isLow    = remaining > 0 && remaining < LOW_STOCK_THRESHOLD;
  const isEmpty  = remaining === 0;

  const fillColor = isEmpty ? '#333' : isLow ? '#e84040' : ci.color;

  // SVG circular gauge
  const r     = 30;
  const circ  = +(2 * Math.PI * r).toFixed(2);
  const dashOffset = +(circ * (1 - fillPct / 100)).toFixed(2);
  const gauge = `
    <svg width="76" height="76" viewBox="0 0 76 76" style="transform:rotate(-90deg)">
      <circle cx="38" cy="38" r="${r}" fill="none" stroke="#1e1e1e" stroke-width="5"/>
      <circle cx="38" cy="38" r="${r}" fill="none"
        stroke="${fillColor}" stroke-width="5"
        stroke-dasharray="${circ}" stroke-dashoffset="${dashOffset}"
        stroke-linecap="round"
        style="transition:stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1),stroke 0.3s"/>
    </svg>
    <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:0.72rem;font-weight:700;color:${isEmpty?'#555':fillColor}">${fillPct}%</span>`;

  // Logo / fallback
  const initials = brand.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const logoHtml = logo
    ? `<img src="${logo}" alt="${brand}" class="card-logo-img"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
       <div class="card-logo-fallback" style="color:${ci.color};display:none">${initials}</div>`
    : `<div class="card-logo-fallback" style="color:${ci.color};display:flex">${initials}</div>`;

  const safeBrand = brand.replace(/'/g, "\\'");

  return `
    <div class="bottle-card ${isLow?'card-low':''} ${isEmpty?'card-empty':''}"
         style="--card-color:${ci.color};--card-glow:${ci.color}22">

      <div class="card-top-strip" style="background:${ci.color}"></div>

      ${isLow && !isEmpty ? `<div class="card-badge badge-low">Low</div>` : ''}
      ${isEmpty           ? `<div class="card-badge badge-empty">Empty</div>` : ''}

      <div class="card-logo-area">${logoHtml}</div>

      <div class="card-body">
        <div class="card-brand-name" style="color:${ci.color}" title="${brand}">${brand}</div>

        <div class="card-gauge-row">
          <div class="gauge-wrap" style="position:relative;width:76px;height:76px">
            ${gauge}
          </div>
          <div class="card-stats">
            <div class="cstat">
              <span class="cstat-num">${remaining}</span>
              <span class="cstat-lbl">ml left</span>
            </div>
            <div class="cstat">
              <span class="cstat-num">${pegsLeft}</span>
              <span class="cstat-lbl">pegs left</span>
            </div>
          </div>
        </div>

        <div class="card-divider"></div>

        <div class="card-actions">
          <button class="btn-consume"
            style="background:${isEmpty?'#1a1a1a':ci.color};color:${isEmpty?'#444':'#000'}"
            onclick="openConsumeModal('${category}','${id}','${safeBrand}',${remaining})"
            ${isEmpty?'disabled':''}>
            🥃 Consume
          </button>
          <button class="btn-remove"
            onclick="openRemoveModal('${category}','${id}','${safeBrand}')"
            title="Remove">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`;
}

// ── Category Filter ────────────────────────────────────────────────────────
function setCategory(btn, cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderInventory();
}

// ── Consume Modal ──────────────────────────────────────────────────────────
function openConsumeModal(category, id, brand, remaining) {
  consumeTarget = { category, id, brand, remaining };
  consumePegs   = 1;
  const ci = CATEGORIES[category];
  const bottle = inventory[category].find(b => b.id === id);

  const logoImg = document.getElementById('consume-logo-img');
  if (bottle.logo) {
    logoImg.src = bottle.logo;
    logoImg.alt = brand;
    logoImg.style.display = 'block';
  } else {
    logoImg.style.display = 'none';
  }

  setText('consume-cat-tag', `${ci.emoji} ${category}`);
  setText('consume-brand-name', brand);
  setText('consume-current-stock', `${remaining} ml`);

  const primary = document.getElementById('btn-confirm-consume');
  if (primary) primary.style.background = ci.color;

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
  const ml    = consumePegs * PEG_ML;
  const after = Math.max(0, consumeTarget.remaining - ml);
  const ci    = CATEGORIES[consumeTarget.category];

  setText('peg-value', consumePegs);
  setText('peg-ml-hint', `= ${ml} ml`);
  setText('calc-ml', `${ml} ml`);

  const afterEl = document.getElementById('calc-after');
  if (afterEl) {
    afterEl.textContent = `${after} ml`;
    afterEl.style.color = after < LOW_STOCK_THRESHOLD ? '#e84040' : ci.color;
  }

  const warn = document.getElementById('consume-warn');
  if (warn) {
    if (after === 0) {
      warn.textContent = '🚫 This will empty the bottle — consider restocking soon.';
      warn.classList.remove('hidden');
    } else if (after < LOW_STOCK_THRESHOLD) {
      warn.textContent = `⚠️ Stock will drop below ${LOW_STOCK_THRESHOLD} ml after this — running low.`;
      warn.classList.remove('hidden');
    } else {
      warn.classList.add('hidden');
    }
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
  document.querySelectorAll('.add-cat-chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === addSelectedCat);
  });
  updateAddChipStyles();
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
  document.querySelectorAll('.add-cat-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateAddChipStyles();
}

function updateAddChipStyles() {
  document.querySelectorAll('.add-cat-chip').forEach(btn => {
    const ci = CATEGORIES[btn.dataset.cat];
    if (btn.classList.contains('active')) {
      btn.style.background    = ci.color + '22';
      btn.style.borderColor   = ci.color + '66';
      btn.style.color         = ci.color;
    } else {
      btn.style.background  = '';
      btn.style.borderColor = '';
      btn.style.color       = '';
    }
  });
  const confirmBtn = document.getElementById('btn-confirm-add');
  if (confirmBtn) confirmBtn.style.background = `linear-gradient(135deg, ${CATEGORIES[addSelectedCat].color}, ${CATEGORIES[addSelectedCat].color}cc)`;
}

function confirmAdd() {
  const brand = document.getElementById('add-brand-input').value.trim();
  if (!brand) { document.getElementById('add-brand-input').focus(); return; }
  const newId = `${addSelectedCat[0].toLowerCase()}${Date.now()}`;
  inventory[addSelectedCat].push({ id: newId, brand, remaining: BOTTLE_ML, logo: '' });
  closeAddModal();
  if (activeCategory !== 'All' && activeCategory !== addSelectedCat) {
    const btn = document.querySelector(`.cat-pill[data-cat="${addSelectedCat}"]`);
    if (btn) setCategory(btn, addSelectedCat);
  }
  render();
}

// ── Remove Modal ───────────────────────────────────────────────────────────
function openRemoveModal(category, id, brand) {
  removeTarget = { category, id, brand };
  const el = document.getElementById('remove-confirm-text');
  if (el) el.textContent = `Remove "${brand}" from your collection? This can't be undone.`;
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
  inventory[removeTarget.category] = inventory[removeTarget.category].filter(b => b.id !== removeTarget.id);
  closeRemoveModal();
  render();
}

// ── Reset ──────────────────────────────────────────────────────────────────
function confirmReset() {
  if (window.confirm('Reset all stock to defaults? This will clear your current inventory.')) {
    inventory = deepClone(DEFAULT_INVENTORY);
    render();
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
render();
