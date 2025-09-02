// Нижняя навигация для всех страниц

function buildBottomNav() {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <button class="nav-item" data-target="index.html" data-key="home" aria-label="Главная">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-icon">
        <path class="icon-outline" d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5h-4v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path class="icon-solid" d="M12 2.25c.2 0 .4.06.57.18l8.93 6.86c.32.25.5.63.5 1.03V20c0 1.66-1.34 3-3 3h-3.5c-.83 0-1.5-.67-1.5-1.5V16h-3v5.5c0 .83-.67 1.5-1.5 1.5H5c-1.66 0-3-1.34-3-3V10.32c0-.4.18-.78.5-1.03l8.93-6.86c.17-.12.37-.18.57-.18Z" fill="currentColor"/>
      </svg>
      <span>Главная</span>
    </button>
    <button class="nav-item" data-target="category.html" data-key="categories" aria-label="Категории">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-icon">
        <!-- 4 квадратика -->
        <g class="icon-outline" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round">
          <rect x="4" y="4" width="6" height="6" rx="1"/>
          <rect x="14" y="4" width="6" height="6" rx="1"/>
          <rect x="4" y="14" width="6" height="6" rx="1"/>
          <rect x="14" y="14" width="6" height="6" rx="1"/>
        </g>
        <g class="icon-solid" fill="currentColor">
          <rect x="4" y="4" width="6" height="6" rx="1"/>
          <rect x="14" y="4" width="6" height="6" rx="1"/>
          <rect x="4" y="14" width="6" height="6" rx="1"/>
          <rect x="14" y="14" width="6" height="6" rx="1"/>
        </g>
      </svg>
      <span>Категории</span>
    </button>
    <button class="nav-item" data-key="cart" aria-label="Корзина">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-icon">
        <path class="icon-outline" d="M6 6h.6a1 1 0 0 1 .97.75L8.7 10h8.9a1 1 0 0 1 .98 1.2l-1 5a1 1 0 0 1-.98.8H9.2a1 1 0 0 1-.97-.76L6.3 5.4A1 1 0 0 0 5.34 4.6H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="icon-solid" d="M3 3.25c.414 0 .75.336.75.75S3.414 4.75 3 4.75 2.25 4.414 2.25 4 2.586 3.25 3 3.25Zm3.3 1.35c.47 0 .88.32.99.77l.95 3.73h9.36c.73 0 1.27.67 1.12 1.38l-1.02 5a1.25 1.25 0 0 1-1.22 1H9.21c-.57 0-1.06-.4-1.2-.96L5.36 5.73a.75.75 0 0 1 .94-.13Z" fill="currentColor"/>
        <circle class="icon-outline" cx="10" cy="20" r="1.5" stroke="currentColor" stroke-width="2"/>
        <circle class="icon-outline" cx="17" cy="20" r="1.5" stroke="currentColor" stroke-width="2"/>
        <circle class="icon-solid" cx="10" cy="20" r="1.5" fill="currentColor"/>
        <circle class="icon-solid" cx="17" cy="20" r="1.5" fill="currentColor"/>
      </svg>
      <span class="cart-badge" id="cart-badge" hidden>0</span>
      <span>Корзина</span>
    </button>
    <button class="nav-item" data-key="profile" aria-label="Профиль">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-icon">
        <g class="icon-outline" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="3.25"/>
          <path d="M5 19c0-3.3137 3.134-5 7-5s7 1.6863 7 5"/>
        </g>
        <path class="icon-solid" d="M12 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 8.5c4.418 0 8 2.015 8 5.25 0 .966-.784 1.75-1.75 1.75H5.75A1.75 1.75 0 0 1 4 18.25C4 15.015 7.582 13 12 13Z" fill="currentColor"/>
      </svg>
      <span>Профиль</span>
    </button>
  `;

  document.body.appendChild(nav);
}

function setActiveItem() {
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const key = file.includes('profile') ? 'profile'
            : file.includes('cart') ? 'cart'
            : file.includes('category') ? 'categories'
            : file.includes('index') ? 'home'
            : file.includes('product') ? ''
            : file.includes('info') ? ''
            : '';
  document.querySelectorAll('.bottom-nav .nav-item').forEach((btn) => {
    const isActive = btn.dataset.key === key;
    btn.classList.toggle('active', Boolean(isActive));
  });
}

function initNav() {
  if (document.querySelector('.bottom-nav')) return;
  document.body.classList.add('has-bottom-nav');
  buildBottomNav();
  setActiveItem();

  const basePath = window.location.pathname.replace(/[^/]*$/, '');
  const go = (path) => {
    const normalized = path.startsWith('/') ? path.slice(1) : path;
    window.location.href = basePath + normalized;
  };

  document.querySelectorAll('.bottom-nav .nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      if (key === 'home') return go('index.html');
      if (key === 'categories') return go('category.html');
      if (key === 'cart') return go('cart.html');
      if (key === 'profile') return go('profile.html');
      // Для корзины и профиля пока заглушка
    });
  });
  updateCartBadge();
  window.addEventListener('storage', (e) => {
    if (e.key === 'hooli_cart') updateCartBadge();
  });
  window.addEventListener('cart:updated', () => updateCartBadge());

  // iOS клавиатура: удерживаем нижнюю навигацию у нижнего края экрана
  const setKeyboardOffset = () => {
    try {
      const vv = window.visualViewport;
      // Полностью отключаем любое смещение навбара
      document.documentElement.style.setProperty('--keyboard-offset', '0px');

      // Определяем состояние открытой клавиатуры и скрываем нижнюю навигацию
      let keyboardOpen = false;
      if (vv) {
        const viewportBottom = vv.height + vv.offsetTop;
        const windowBottom = window.innerHeight;
        const overlap = windowBottom - viewportBottom;
        const KEYBOARD_THRESHOLD = 80; // заметная высота
        keyboardOpen = overlap > KEYBOARD_THRESHOLD;
      }

      // Дополнительно: если фокус на текстовом поле, считаем, что клавиатура открыта
      if (!keyboardOpen) {
        const el = document.activeElement;
        const tag = (el && el.tagName ? el.tagName.toLowerCase() : '');
        if ((tag === 'input' || tag === 'textarea') && !el.readOnly && !el.disabled) {
          keyboardOpen = true;
        }
      }

      document.body.classList.toggle('keyboard-open', keyboardOpen);
    } catch {
      document.documentElement.style.setProperty('--keyboard-offset', '0px');
      document.body.classList.remove('keyboard-open');
    }
  };

  // Привязываемся к событиям visualViewport (iOS Safari)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setKeyboardOffset);
    window.visualViewport.addEventListener('scroll', setKeyboardOffset);
    setKeyboardOffset();
  }

  // Также реагируем на фокус/расфокус инпутов, чтобы сразу убирать смещение
  // Поддерживаем значение 0 вне зависимости от фокуса
  window.addEventListener('focusin', setKeyboardOffset, { capture: true });
  window.addEventListener('focusout', () => setTimeout(setKeyboardOffset, 0), { capture: true });
}

document.addEventListener('DOMContentLoaded', initNav);

// Для SPA-навигации или динамических переходов можно вызывать повторно
window.refreshBottomNavActive = setActiveItem;

function getCartCount() {
  try {
    const data = JSON.parse(localStorage.getItem('hooli_cart') || '[]');
    return data.reduce((acc, i) => acc + (i.qty || 1), 0);
  } catch {
    return 0;
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = getCartCount();
  if (count > 0) {
    badge.textContent = String(Math.min(count, 99));
    badge.hidden = false;
  } else {
    badge.textContent = '';
    badge.hidden = true;
  }
}


