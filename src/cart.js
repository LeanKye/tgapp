import './style.css'
import { formatPrice } from './products-data.js'
import ModalManager from './modal-manager.js'

function cartTemplate() {
  return `
    <div class="catalog">
      <div class="category-title" style="padding-left:16px; padding-right:16px; margin-top: calc(env(safe-area-inset-top) + 12px); font-size: 24px;">Корзина</div>
      <div class="cart-bulk">
        <div class="bulk-spacer"></div>
        <div class="bulk-actions">
          <button class="reset-Button bulk-btn" id="bulk-delete-btn">Удалить выбранные</button>
          <button class="reset-Button bulk-btn" id="bulk-select-all-btn">Выбрать все</button>
        </div>
        <label class="bulk-checkbox" title="Выбрать все">
          <input type="checkbox" id="bulk-select-all" />
          <span></span>
        </label>
      </div>
      <div id="cart-list"></div>
      <div class="no-products" id="cart-empty" style="display:none;">
        <h3>В вашей корзине пока пусто</h3>
        <p>Добавьте товары из каталога</p>
        <button class="back-to-main reset-Button" id="to-main-btn">Вернуться на главную</button>
      </div>
    </div>
    <div class="checkout-button-container cart-checkout" id="cart-checkout" style="display:none;">
      <button class="checkout-button" id="proceed-checkout-btn">
        <span class="left" id="checkout-count">0 товаров</span>
        <span class="center">К оформлению</span>
        <span class="right" id="checkout-total">0</span>
      </button>
    </div>
    <div class="bottom-actions-bg"></div>
  `;
}

// Простое хранение корзины в localStorage
const STORAGE_KEY = 'hooli_cart';

// Хранение выбранных позиций корзины (галочек) между переходами
const SELECTED_KEY = 'hooli_cart_selected';

function readSelected() {
  try {
    const raw = JSON.parse(localStorage.getItem(SELECTED_KEY) || '[]');
    if (Array.isArray(raw)) {
      return new Set(raw.map(String));
    }
    return new Set();
  } catch {
    return new Set();
  }
}

function writeSelected(idsSet) {
  const arr = Array.from(idsSet || []);
  localStorage.setItem(SELECTED_KEY, JSON.stringify(arr));
}

function initializeSelection(items) {
  const validIds = new Set(items.map(i => String(i.id)));
  const saved = readSelected();
  // Пересекаем сохранённые id с актуальными товарами
  const intersect = new Set([...saved].filter(id => validIds.has(id)));
  // Если сохранённого выбора нет — по умолчанию выбираем все
  if (intersect.size === 0 && items.length > 0) {
    items.forEach(i => intersect.add(String(i.id)));
  }
  writeSelected(intersect);
  return intersect;
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart:updated'));
}

function updateQty(productId, delta) {
  const items = readCart();
  const idx = items.findIndex(i => i.id === productId);
  if (idx !== -1) {
    items[idx].qty = Math.max(1, (items[idx].qty || 1) + delta);
    writeCart(items);
  }
}

function removeItem(productId) {
  const items = readCart().filter(i => i.id !== productId);
  writeCart(items);
}

function calculateTotals(items) {
  const selected = Array.from(document.querySelectorAll('.cart-select:checked')).map(cb => cb.getAttribute('data-id'));
  const src = items.filter(i => selected.includes(String(i.id)));
  const total = src.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);
  const count = src.reduce((sum, i) => sum + (i.qty || 1), 0);
  return { total, count };
}

function createCartItemHTML(item) {
  const priceHTML = formatPrice(item.price || 0);
  const sub = [item.variantName, item.periodName, item.editionName].filter(Boolean).join(' / ');
  return `
    <div class="container cart-item" data-id="${item.id}">
      <div class="card-check"><label class="bulk-checkbox"><input type="checkbox" class="cart-select" data-id="${item.id}" /><span></span></label></div>
      <div class="cart-row">
      <div class="cart-left">
        <img class="cart-item-cover" src="${item.image || ''}" alt="" />
        <div class="cart-left-actions">
          <button class="reset-Button icon-btn remove" data-action="remove" title="Удалить">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18M9 6v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1M8 10l.6 8m6.8-8-.6 8M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="btn-text">Удалить</span>
          </button>
          <button class="reset-Button cart-buy">
            <span class="icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" fill="currentColor"/></svg>
            </span>
            <span class="btn-text">Купить</span>
          </button>
        </div>
      </div>
      <div class="cart-right">
        <div class="cart-price">
          <span class="cart-price-current">${priceHTML}</span>
          <span class="cart-price-old">${''}</span>
        </div>
        <div class="cart-item-title">${item.title || 'Товар'}</div>
        ${sub ? `<div class="cart-item-sub">${sub}</div>` : ''}
        <div class="cart-right-footer">
          <div class="qty-control">
            <button class="reset-Button qty-btn square" data-action="dec">−</button>
            <div class="qty-value square"><span class="qty-text">${item.qty || 1}</span></div>
            <button class="reset-Button qty-btn square" data-action="inc">+</button>
          </div>
        </div>
      </div>
      </div>
    </div>
  `;
}

function renderCart() {
  const list = document.getElementById('cart-list');
  const summary = document.getElementById('cart-summary');
  const empty = document.getElementById('cart-empty');
  const checkout = document.getElementById('cart-checkout');
  const items = readCart();

  if (!items.length) {
    list.innerHTML = '';
    summary && (summary.style.display = 'none');
    checkout.style.display = 'none';
    empty.style.display = 'block';
    document.body.classList.remove('has-checkout-bar');
    const selectAllCheckbox = document.getElementById('bulk-select-all');
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    // Корзина пуста — очищаем сохранённый выбор
    localStorage.removeItem(SELECTED_KEY);
    return;
  }

  empty.style.display = 'none';
  summary && (summary.style.display = '');
  checkout.style.display = '';
  document.body.classList.add('has-checkout-bar');

  list.innerHTML = items.map(createCartItemHTML).join('');

  // Восстанавливаем выбор чекбоксов из сохранённого состояния
  const savedSelected = initializeSelection(items);
  const checkboxes = list.querySelectorAll('.cart-select');
  checkboxes.forEach(cb => {
    const id = cb.getAttribute('data-id');
    cb.checked = savedSelected.has(id);
  });

  // Синхронизируем чекбокс "выбрать все"
  const selectAllCheckbox = document.getElementById('bulk-select-all');
  if (selectAllCheckbox) {
    const allChecked = Array.from(checkboxes).length > 0 && Array.from(checkboxes).every(cb => cb.checked);
    selectAllCheckbox.checked = allChecked;
  }

  const { total, count } = calculateTotals(items);
  const countEl = document.getElementById('checkout-count');
  const totalEl = document.getElementById('checkout-total');
  if (countEl) countEl.textContent = `${count} ${count === 1 ? 'товар' : (count >=2 && count <=4 ? 'товара' : 'товаров')}`;
  if (totalEl) totalEl.innerHTML = formatPrice(total);
}

// Map для отслеживания блокировки по товарам (предотвращение двойных нажатий)
const qtyButtonLocks = new Map();

const CART_CLEANUPS = [];

function attachEvents() {
  const toMainBtn = document.getElementById('to-main-btn');
  const toMainHandler = () => {
    if (window.AppNav && typeof window.AppNav.go === 'function') {
      window.AppNav.go('index.html');
    } else {
      const basePath = window.location.pathname.replace(/[^/]*$/, '');
      window.location.href = basePath + 'index.html';
    }
  };
  if (toMainBtn) {
    toMainBtn.addEventListener('click', toMainHandler);
    CART_CLEANUPS.push(() => { try { toMainBtn.removeEventListener('click', toMainHandler); } catch {} });
  }

  const cartList = document.getElementById('cart-list');
  const onCartClick = (e) => {
    // Пропускаем обычные клики, если они заблокированы после fast-tap
    if (window.__cartFastTapBlockClickUntil && performance.now() < window.__cartFastTapBlockClickUntil && !e.__fastTapSynthetic) {
      return;
    }
    
    const itemEl = e.target.closest('.cart-item');
    if (!itemEl) return;
    const id = itemEl.getAttribute('data-id');
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const action = actionBtn.getAttribute('data-action');
    
    if (action === 'remove') {
      // Показываем модалку подтверждения
      const items = readCart();
      const item = items.find(i => String(i.id) === String(id));
      if (!item) return;
      
      // Инициализируем модалку при необходимости
      if (!window.cartModalManager) {
        window.cartModalManager = new ModalManager();
      }
      
      window.cartModalManager.openModal('delete-confirm-modal', {
        productName: item.title || 'товар',
        onConfirm: () => {
          removeItem(id);
          // Удаляем id из сохранённого выбора
          const sel = readSelected();
          sel.delete(String(id));
          writeSelected(sel);
          renderCart();
        },
        onCancel: () => {
          // Ничего не делаем
        }
      });
      return;
    }
    
    if (action === 'inc' || action === 'dec') {
      // Предотвращаем двойные нажатия на конкретный товар (100ms достаточно для предотвращения двойного tap)
      if (qtyButtonLocks.get(id)) return;
      qtyButtonLocks.set(id, true);
      
      // Обновляем количество в localStorage
      if (action === 'inc') updateQty(id, +1);
      if (action === 'dec') updateQty(id, -1);
      
      // Получаем обновленное значение
      const items = readCart();
      const updatedItem = items.find(i => i.id === id);
      if (!updatedItem) {
        qtyButtonLocks.delete(id);
        return;
      }
      
      // Обновляем только текст количества с анимацией (без перерисовки всего элемента)
      const qtyTextEl = itemEl.querySelector('.qty-text');
      if (qtyTextEl) {
        qtyTextEl.classList.add('qty-bounce');
        qtyTextEl.textContent = String(updatedItem.qty);
        setTimeout(() => qtyTextEl.classList.remove('qty-bounce'), 200);
      }
      
      // Обновляем только сумму и счётчик
      const allItems = readCart();
      const { total, count } = calculateTotals(allItems);
      const countEl = document.getElementById('checkout-count');
      const totalEl = document.getElementById('checkout-total');
      if (countEl) countEl.textContent = `${count} ${count === 1 ? 'товар' : (count >=2 && count <=4 ? 'товара' : 'товаров')}`;
      if (totalEl) totalEl.innerHTML = formatPrice(total);
      
      window.dispatchEvent(new Event('cart:updated'));
      
      // Разблокируем через короткое время (100ms - достаточно чтобы избежать двойного срабатывания, но быстро разрешить новые нажатия)
      setTimeout(() => {
        qtyButtonLocks.delete(id);
      }, 100);
    }
  };
  cartList?.addEventListener('click', onCartClick);
  if (cartList) CART_CLEANUPS.push(() => { try { cartList.removeEventListener('click', onCartClick); } catch {} });

  // Fast-tap: делегированный с защитой от скролла/удержания
  let dSX=0,dSY=0,dST=0,dScrollY=0,dScrollX=0; const MOVE=3,HOLD=300;
  const onPD=(e)=>{ const t=e.target.closest('#cart-list [data-action], #bulk-select-all-btn, #bulk-delete-btn'); if(!t) return; const pt=(e.touches&&e.touches[0])||e; dSX=pt.clientX||0; dSY=pt.clientY||0; dST=performance.now(); dScrollY=window.scrollY; dScrollX=window.scrollX; };
  const onPM=(e)=>{ if(!dST) return; const pt=(e.touches&&e.touches[0])||e; const moved = Math.abs((pt.clientX||0)-dSX)>MOVE || Math.abs((pt.clientY||0)-dSY)>MOVE; if(moved){ window.__cartFastTapBlockClickUntil = performance.now() + 400; } };
  const onPU=(e)=>{ const actionBtn = e.target.closest('#cart-list [data-action], #bulk-select-all-btn, #bulk-delete-btn'); const pt=(e.changedTouches&&e.changedTouches[0])||e; const moved = Math.abs((pt.clientX||0)-dSX)>MOVE || Math.abs((pt.clientY||0)-dSY)>MOVE || Math.abs(window.scrollY-dScrollY)>0 || Math.abs(window.scrollX-dScrollX)>0; const dur=performance.now()-(dST||performance.now()); const hadDown = !!dST; dST=0; if(!hadDown || !actionBtn) { return; } if(moved || dur>HOLD){ window.__cartFastTapBlockClickUntil = performance.now() + 400; return; } if(actionBtn.__fastTapLock) return; actionBtn.__fastTapLock=true; try { const ev = new Event('click', { bubbles:true }); ev.__fastTapSynthetic = true; actionBtn.dispatchEvent(ev); } finally { setTimeout(()=>{ actionBtn.__fastTapLock=false; }, 250);} };
  document.body.addEventListener('pointerdown', onPD, { passive: true });
  document.body.addEventListener('pointermove', onPM, { passive: true });
  document.body.addEventListener('pointerup', onPU, { passive: true });
  document.body.addEventListener('touchstart', onPD, { passive: true });
  document.body.addEventListener('touchmove', onPM, { passive: true });
  document.body.addEventListener('touchend', onPU, { passive: true });
  const onPCancel = ()=>{ dST=0; };
  const onTCancel = ()=>{ dST=0; };
  document.body.addEventListener('pointercancel', onPCancel, { passive: true });
  document.body.addEventListener('touchcancel', onTCancel, { passive: true });
  CART_CLEANUPS.push(() => {
    try { document.body.removeEventListener('pointerdown', onPD); } catch {}
    try { document.body.removeEventListener('pointermove', onPM); } catch {}
    try { document.body.removeEventListener('pointerup', onPU); } catch {}
    try { document.body.removeEventListener('touchstart', onPD); } catch {}
    try { document.body.removeEventListener('touchmove', onPM); } catch {}
    try { document.body.removeEventListener('touchend', onPU); } catch {}
    try { document.body.removeEventListener('pointercancel', onPCancel); } catch {}
    try { document.body.removeEventListener('touchcancel', onTCancel); } catch {}
  });

  // Глобальный клик-блокер после свайпа/перемещения
  const clickBlocker = (e) => {
    if (e.__fastTapSynthetic) return;
    if (window.__cartFastTapBlockClickUntil && performance.now() < window.__cartFastTapBlockClickUntil) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };
  document.addEventListener('click', clickBlocker, true);
  CART_CLEANUPS.push(() => { try { document.removeEventListener('click', clickBlocker, true); } catch {} });

  // Обновление суммы/счётчика и состояния "выбрать все" при смене любого чекбокса товара
  const onCartChange = (e) => {
    const target = e.target;
    if (!target || !target.classList || !target.classList.contains('cart-select')) return;
    // Сохраняем изменение выбора в хранилище
    const id = target.getAttribute('data-id');
    const selected = readSelected();
    if (target.checked) selected.add(String(id)); else selected.delete(String(id));
    writeSelected(selected);

    const items = readCart();
    const { total, count } = calculateTotals(items);
    const countEl = document.getElementById('checkout-count');
    const totalEl = document.getElementById('checkout-total');
    if (countEl) countEl.textContent = `${count} ${count === 1 ? 'товар' : (count >=2 && count <=4 ? 'товара' : 'товаров')}`;
    if (totalEl) totalEl.innerHTML = formatPrice(total);

    const selectAllCheckbox = document.getElementById('bulk-select-all');
    if (selectAllCheckbox) {
      const checkboxes = document.querySelectorAll('.cart-select');
      const allChecked = Array.from(checkboxes).length > 0 && Array.from(checkboxes).every(cb => cb.checked);
      selectAllCheckbox.checked = allChecked;
    }
  };
  cartList?.addEventListener('change', onCartChange);
  if (cartList) CART_CLEANUPS.push(() => { try { cartList.removeEventListener('change', onCartChange); } catch {} });

  // К оформлению: удержание с требованием отпускания внутри кнопки
  const proceedBtn = document.getElementById('proceed-checkout-btn');
  if (proceedBtn) {
    const openCheckout = () => {
      const items = readCart();
      if (!items.length) return;
      const { total, count } = calculateTotals(items);
      if (!window.cartModalManager) {
        window.cartModalManager = new ModalManager();
      }
      const first = items[0] || {};
      const paymentData = {
        productTitle: first.title ? `${first.title}${items.length > 1 ? ` и ещё ${items.length - 1}` : ''}` : `Корзина — ${count} шт.`,
        variant: first.variantName || '-',
        period: first.periodName || '-',
        edition: first.editionName || '-',
        price: formatPrice(total),
        amount: total
      };
      window.cartModalManager.openModal('checkout-modal', { paymentData });
    };
    let down=false, startInside=false;
    const pd = (e) => {
      down=true;
      const r=proceedBtn.getBoundingClientRect();
      const x=e.clientX, y=e.clientY;
      startInside = x>=r.left && x<=r.right && y>=r.top && y<=r.bottom;
    };
    const pu = (e) => {
      if(!down) return;
      down=false;
      const r=proceedBtn.getBoundingClientRect();
      const x=e.clientX, y=e.clientY;
      const endInside = x>=r.left && x<=r.right && y>=r.top && y<=r.bottom;
      if (startInside && endInside) openCheckout();
    };
    const pc = () => { down=false; };
    proceedBtn.addEventListener('pointerdown', pd, { passive: true });
    proceedBtn.addEventListener('pointerup', pu, { passive: true });
    proceedBtn.addEventListener('pointercancel', pc, { passive: true });
    CART_CLEANUPS.push(() => {
      try { proceedBtn.removeEventListener('pointerdown', pd); } catch {}
      try { proceedBtn.removeEventListener('pointerup', pu); } catch {}
      try { proceedBtn.removeEventListener('pointercancel', pc); } catch {}
    });
  }

  // Массовые действия (визуальные)
  const selectAllBtn = document.getElementById('bulk-select-all-btn');
  const selectAllCheckbox = document.getElementById('bulk-select-all');
  const deleteBtn = document.getElementById('bulk-delete-btn');

  function getSelectedIds() {
    return Array.from(document.querySelectorAll('.cart-select:checked')).map(i => i.getAttribute('data-id'));
  }

  function selectAll(state) {
    document.querySelectorAll('.cart-select').forEach(cb => { cb.checked = !!state; });
    if (selectAllCheckbox) selectAllCheckbox.checked = !!state;
  }

  const onSelectAllBtn = () => {
    const checkboxes = document.querySelectorAll('.cart-select');
    const allChecked = Array.from(checkboxes).length > 0 && Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => { cb.checked = !allChecked; });
    if (selectAllCheckbox) selectAllCheckbox.checked = !allChecked;
    // Сохраняем текущее состояние выбранных
    const selected = new Set();
    document.querySelectorAll('.cart-select:checked').forEach(cb => selected.add(cb.getAttribute('data-id')));
    writeSelected(selected);
    const items = readCart();
    const { total, count } = calculateTotals(items);
    const countEl = document.getElementById('checkout-count');
    const totalEl = document.getElementById('checkout-total');
    if (countEl) countEl.textContent = `${count} ${count === 1 ? 'товар' : (count >=2 && count <=4 ? 'товара' : 'товаров')}`;
    if (totalEl) totalEl.innerHTML = formatPrice(total);
  };
  selectAllBtn?.addEventListener('click', onSelectAllBtn);
  if (selectAllBtn) CART_CLEANUPS.push(() => { try { selectAllBtn.removeEventListener('click', onSelectAllBtn); } catch {} });

  const onSelectAllChange = (e) => {
    const checkboxes = document.querySelectorAll('.cart-select');
    checkboxes.forEach(cb => { cb.checked = !!e.target.checked; });
    // Сохраняем текущее состояние выбранных
    const selected = new Set();
    document.querySelectorAll('.cart-select:checked').forEach(cb => selected.add(cb.getAttribute('data-id')));
    writeSelected(selected);
    const items = readCart();
    const { total, count } = calculateTotals(items);
    const countEl = document.getElementById('checkout-count');
    const totalEl = document.getElementById('checkout-total');
    if (countEl) countEl.textContent = `${count} ${count === 1 ? 'товар' : (count >=2 && count <=4 ? 'товара' : 'товаров')}`;
    if (totalEl) totalEl.innerHTML = formatPrice(total);
  };
  selectAllCheckbox?.addEventListener('change', onSelectAllChange);
  if (selectAllCheckbox) CART_CLEANUPS.push(() => { try { selectAllCheckbox.removeEventListener('change', onSelectAllChange); } catch {} });

  const onDeleteBtn = () => {
    const selectedIds = new Set(getSelectedIds());
    if (selectedIds.size === 0) return;
    
    // Инициализируем модалку при необходимости
    if (!window.cartModalManager) {
      window.cartModalManager = new ModalManager();
    }
    
    const count = selectedIds.size;
    const productName = count === 1 ? 'этот товар' : `${count} ${count === 1 ? 'товар' : (count >= 2 && count <= 4 ? 'товара' : 'товаров')}`;
    
    window.cartModalManager.openModal('delete-confirm-modal', {
      productName: productName,
      onConfirm: () => {
        const items = readCart().filter(i => !selectedIds.has(String(i.id)));
        writeCart(items);
        // Удаляем выбранные id из сохранённого набора
        const sel = readSelected();
        selectedIds.forEach(id => sel.delete(String(id)));
        writeSelected(sel);
        renderCart();
        window.dispatchEvent(new Event('cart:updated'));
      },
      onCancel: () => {
        // Ничего не делаем
      }
    });
  };
  deleteBtn?.addEventListener('click', onDeleteBtn);
  if (deleteBtn) CART_CLEANUPS.push(() => { try { deleteBtn.removeEventListener('click', onDeleteBtn); } catch {} });
}

export async function mountCart(appContainer) {
  appContainer.innerHTML = cartTemplate();
  attachEvents();
  renderCart();
  try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
}

export function unmountCart() {
  CART_CLEANUPS.splice(0).forEach(fn => { try { fn(); } catch {} });
  const app = document.querySelector('#app');
  if (app) app.innerHTML = '';
}