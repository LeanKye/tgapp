import './style.css'
import { formatPrice } from './products-data.js'
import ModalManager from './modal-manager.js'

// Простое хранение корзины в localStorage
const STORAGE_KEY = 'hooli_cart';

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
            <div class="qty-value square">${item.qty || 1}</div>
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
  // Сохраняем выбранные элементы до перерендера
  const prevSelected = new Set(Array.from(document.querySelectorAll('.cart-select:checked')).map(cb => cb.getAttribute('data-id')));

  if (!items.length) {
    list.innerHTML = '';
    summary && (summary.style.display = 'none');
    checkout.style.display = 'none';
    empty.style.display = 'block';
    document.body.classList.remove('has-checkout-bar');
    const selectAllCheckbox = document.getElementById('bulk-select-all');
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    return;
  }

  empty.style.display = 'none';
  summary && (summary.style.display = '');
  checkout.style.display = '';
  document.body.classList.add('has-checkout-bar');

  list.innerHTML = items.map(createCartItemHTML).join('');

  // Восстанавливаем/устанавливаем выбор чекбоксов: по умолчанию выделяем все
  const checkboxes = list.querySelectorAll('.cart-select');
  if (prevSelected.size > 0) {
    checkboxes.forEach(cb => {
      const id = cb.getAttribute('data-id');
      cb.checked = prevSelected.has(id);
    });
  } else {
    checkboxes.forEach(cb => { cb.checked = true; });
  }

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

function attachEvents() {
  document.getElementById('to-main-btn')?.addEventListener('click', () => {
    const basePath = window.location.pathname.replace(/[^/]*$/, '');
    window.location.href = basePath + 'index.html';
  });

  document.getElementById('cart-list')?.addEventListener('click', (e) => {
    const itemEl = e.target.closest('.cart-item');
    if (!itemEl) return;
    const id = itemEl.getAttribute('data-id');
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const action = actionBtn.getAttribute('data-action');
    if (action === 'remove') removeItem(id);
    if (action === 'inc') updateQty(id, +1);
    if (action === 'dec') updateQty(id, -1);
    renderCart();
  });

  // Fast-tap: делегированный для кнопок действий в корзине
  const fastTap = (e) => {
    const actionBtn = e.target.closest('#cart-list [data-action], #bulk-select-all-btn, #bulk-delete-btn, #proceed-checkout-btn');
    if (!actionBtn) return;
    if (actionBtn.__fastTapLock) return;
    actionBtn.__fastTapLock = true;
    try {
      const clickEvent = new Event('click', { bubbles: true });
      actionBtn.dispatchEvent(clickEvent);
    } finally {
      setTimeout(() => { actionBtn.__fastTapLock = false; }, 250);
    }
  };
  document.body.addEventListener('pointerup', fastTap, { passive: true });
  document.body.addEventListener('touchend', fastTap, { passive: true });

  // Обновление суммы/счётчика и состояния "выбрать все" при смене любого чекбокса товара
  document.getElementById('cart-list')?.addEventListener('change', (e) => {
    const target = e.target;
    if (!target || !target.classList || !target.classList.contains('cart-select')) return;
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
  });

  document.getElementById('proceed-checkout-btn')?.addEventListener('click', () => {
    const items = readCart();
    if (!items.length) return;
    const { total, count } = calculateTotals(items);

    // Инициализируем модалку при необходимости
    if (!window.cartModalManager) {
      window.cartModalManager = new ModalManager();
    }

    // Берём первую позицию как основную для описания; модалка поддерживает один набор полей
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
  });

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

  selectAllBtn?.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.cart-select');
    const allChecked = Array.from(checkboxes).length > 0 && Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => { cb.checked = !allChecked; });
    if (selectAllCheckbox) selectAllCheckbox.checked = !allChecked;
    const items = readCart();
    const { total, count } = calculateTotals(items);
    const countEl = document.getElementById('checkout-count');
    const totalEl = document.getElementById('checkout-total');
    if (countEl) countEl.textContent = `${count} ${count === 1 ? 'товар' : (count >=2 && count <=4 ? 'товара' : 'товаров')}`;
    if (totalEl) totalEl.innerHTML = formatPrice(total);
  });

  selectAllCheckbox?.addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.cart-select');
    checkboxes.forEach(cb => { cb.checked = !!e.target.checked; });
    const items = readCart();
    const { total, count } = calculateTotals(items);
    const countEl = document.getElementById('checkout-count');
    const totalEl = document.getElementById('checkout-total');
    if (countEl) countEl.textContent = `${count} ${count === 1 ? 'товар' : (count >=2 && count <=4 ? 'товара' : 'товаров')}`;
    if (totalEl) totalEl.innerHTML = formatPrice(total);
  });

  deleteBtn?.addEventListener('click', () => {
    const selectedIds = new Set(getSelectedIds());
    if (selectedIds.size === 0) return;
    const items = readCart().filter(i => !selectedIds.has(String(i.id)));
    writeCart(items);
    renderCart();
    window.dispatchEvent(new Event('cart:updated'));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  attachEvents();
  renderCart();
});


