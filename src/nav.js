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

// --- Стековая навигация как в маркетплейсах ---
const NAV_STACK_KEY = 'hooli_nav_stack_v1';

function getBasePath() {
  return window.location.pathname.replace(/[^/]*$/, '');
}

function normalizeEntry(path) {
  const p = (path || '').replace(/^\//, '').toLowerCase();
  return p || 'index.html';
}

function getCurrentEntry() {
  const file = (location.pathname.split('/').pop() || 'index.html');
  const qs = location.search || '';
  return normalizeEntry(file + qs);
}

function readNavStack() {
  try { return JSON.parse(sessionStorage.getItem(NAV_STACK_KEY) || '[]'); } catch { return []; }
}

function writeNavStack(stack) {
  try { sessionStorage.setItem(NAV_STACK_KEY, JSON.stringify(stack)); } catch {}
}

function getLastProductFromStack() {
  const stack = readNavStack();
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const entry = String(stack[i] || '').toLowerCase();
    if (entry.startsWith('product.html')) return stack[i];
  }
  return null;
}

function recordPageLoad() {
  const current = getCurrentEntry();
  let stack = readNavStack();
  if (stack.length === 0) {
    writeNavStack([current]);
    // Сохраняем последний просмотренный товар (одно значение)
    if (current.includes('product.html')) {
      try { sessionStorage.setItem('hooli_last_product', current); } catch {}
    }
    return;
  }
  const top = stack[stack.length - 1];
  if (top === current) return;
  const existingIdx = stack.lastIndexOf(current);
  if (existingIdx >= 0) {
    // Навигация назад/вперёд — обрежем стек до текущей страницы
    stack = stack.slice(0, existingIdx + 1);
    writeNavStack(stack);
    // Обновим последний товар
    if (current.includes('product.html')) {
      try { sessionStorage.setItem('hooli_last_product', current); } catch {}
    }
    return;
  }
  // Внешний переход — добавляем текущую страницу в стек
  stack.push(current);
  writeNavStack(stack);
  if (current.includes('product.html')) {
    try { sessionStorage.setItem('hooli_last_product', current); } catch {}
  }
}

function go(path) {
  const entry = normalizeEntry(path);
  const stack = readNavStack();
  // Если идём на карточку товара — сразу запомним её как последнюю
  if (entry.startsWith('product.html')) {
    try { sessionStorage.setItem('hooli_last_product', entry); } catch {}
  }
  if (stack[stack.length - 1] !== entry) {
    stack.push(entry);
    writeNavStack(stack);
  }
  const basePath = getBasePath();
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  window.location.href = basePath + normalized;
}

function goHomeSmart() {
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  // Если уже на главной — ничего не делаем (никаких переходов/перезагрузок)
  if (file.includes('index')) {
    return; 
  }
  // Если мы на карточке товара — кнопка «Главная» ведёт на главную, и сбрасываем «последний товар»
  if (file.includes('product')) {
    try { sessionStorage.removeItem('hooli_last_product'); } catch {}
    // Чистим из стека все product.html, чтобы исключить повторные возвраты
    try {
      const stack = readNavStack();
      const cleaned = Array.isArray(stack) ? stack.filter(e => !String(e || '').toLowerCase().startsWith('product.html')) : [];
      writeNavStack(cleaned.length ? cleaned : ['index.html']);
    } catch {}
    return go('index.html');
  }
  // Если есть последний просмотренный товар — сначала ведём на него
  const lastProduct = sessionStorage.getItem('hooli_last_product');
  if (lastProduct && normalizeEntry(lastProduct) !== normalizeEntry(file + (location.search || ''))) {
    const basePath = getBasePath();
    window.location.href = basePath + lastProduct.replace(/^\//, '');
    return;
  }
  // Иначе сразу на главную
  return go('index.html');
}

// Глобальный объект для использования из других модулей
window.AppNav = {
  go,
  goHomeSmart,
  recordPageLoad,
};

function setActiveItem() {
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const key = file.includes('profile') ? 'profile'
            : file.includes('cart') ? 'cart'
            : file.includes('category') ? 'categories'
            : file.includes('index') ? 'home'
            : file.includes('product') ? 'home' // На карточке товара визуально остаёмся на «Главной»
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
  // Фиксируем загрузку страницы в стек навигации
  try { window.AppNav && window.AppNav.recordPageLoad(); } catch {}
  buildBottomNav();
  setActiveItem();

  const basePath = window.location.pathname.replace(/[^/]*$/, '');
  const go = (path) => {
    const normalized = path.startsWith('/') ? path.slice(1) : path;
    window.location.href = basePath + normalized;
  };

  const activateNav = (btn) => {
    const key = btn.dataset.key;
    // Если уже на соответствующей странице — ничего не делаем
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const currentKey = file.includes('profile') ? 'profile'
                  : file.includes('cart') ? 'cart'
                  : file.includes('category') ? 'categories'
                  : file.includes('index') ? 'home'
                  : '';
    if (key && key === currentKey) {
      return; // no-op
    }
    if (key === 'home') {
      return (window.AppNav ? window.AppNav.goHomeSmart() : (window.location.href = getBasePath() + 'index.html'));
    }
    if (key === 'categories') return (window.AppNav ? window.AppNav.go('category.html') : go('category.html'));
    if (key === 'cart') return (window.AppNav ? window.AppNav.go('cart.html') : go('cart.html'));
    if (key === 'profile') return (window.AppNav ? window.AppNav.go('profile.html') : go('profile.html'));
  };

  const addFastTap = (btn) => {
    const handler = (e) => {
      // Защита от двойных срабатываний (pointerup/touchend/click)
      if (btn.__activated) return;
      btn.__activated = true;
      try { activateNav(btn); } finally {
        setTimeout(() => { btn.__activated = false; }, 350);
      }
    };
    // Мгновенная активация при окончании тача/поинтера во время инерционного скролла
    btn.addEventListener('pointerup', handler, { passive: true });
    btn.addEventListener('touchend', handler, { passive: true });
    // Резерв на случай отсутствия pointer событий
    btn.addEventListener('click', handler);
  };

  document.querySelectorAll('.bottom-nav .nav-item').forEach((btn) => {
    addFastTap(btn);
  });

  // Делегированный fast-tap для любых элементов с классом .fast-tap-nav (если появятся)
  const root = document.body;
  // Делегированный fast-tap с защитой от скролла/удержания
  let nx=0,ny=0,nt=0,nsy=0,nsx=0; const MOVE=8,HOLD=300;
  const nd=(e)=>{ const target=e.target.closest('.fast-tap-nav,.bottom-nav .nav-item'); if(!target) return; nx=e.clientX; ny=e.clientY; nt=performance.now(); nsy=window.scrollY; nsx=window.scrollX; target.__moved=false; target.__ftNav=true; };
  const nu=(e)=>{ const target=e.target.closest('.fast-tap-nav,.bottom-nav .nav-item'); if(!target) return; const moved=Math.abs(e.clientX-nx)>MOVE||Math.abs(e.clientY-ny)>MOVE||Math.abs(window.scrollY-nsy)>0||Math.abs(window.scrollX-nsx)>0; const dur=performance.now()-(nt||performance.now()); nt=0; if(moved||dur>HOLD) return; if(target.__activated) return; target.__activated=true; try { const to=target.getAttribute('data-target'); if (to) { if (window.AppNav) window.AppNav.go(to); else go(to); } else { activateNav && activateNav(target); } } finally { setTimeout(()=>{ target.__activated=false; },350);} };
  root.addEventListener('pointerdown', nd, { passive: true });
  root.addEventListener('pointerup', nu, { passive: true });
  root.addEventListener('touchend', nu, { passive: true });
  updateCartBadge();
  window.addEventListener('storage', (e) => {
    if (e.key === 'hooli_cart') updateCartBadge();
  });
  window.addEventListener('cart:updated', () => updateCartBadge());

  // Упрощение поведения с клавиатурой: панель не скрываем и не смещаем.
  // Если ранее был установлен CSS-переменная для смещений — сбрасываем.
  try {
    document.documentElement.style.setProperty('--keyboard-offset', '0px');
    document.body.classList.remove('keyboard-open');
  } catch {}

  // Детектор открытия клавиатуры: iOS/Android (visualViewport + фокусы)
  try {
    const setKeyboardState = (isOpen) => {
      document.body.classList.toggle('keyboard-open', Boolean(isOpen));
    };

    const vv = window.visualViewport;
    if (vv && typeof vv.addEventListener === 'function') {
      // Базовая высота для сравнения (после загрузки страницы)
      const baseHeight = vv.height;
      const updateFromViewport = () => {
        const shrunkBy = Math.max(0, baseHeight - vv.height);
        // Порог ~80px — более чувствительный порог для быстрого реагирования
        setKeyboardState(shrunkBy > 80);
      };
      vv.addEventListener('resize', updateFromViewport);
      vv.addEventListener('scroll', updateFromViewport);
    }

    // Независимо от visualViewport — мгновенная реакция по фокусу
    const isEditable = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    };
    window.addEventListener('focusin', (e) => {
      if (isEditable(e.target)) setKeyboardState(true);
    });
    window.addEventListener('focusout', () => {
      // Ждём, пока DOM обновит activeElement, затем проверяем
      setTimeout(() => {
        setKeyboardState(isEditable(document.activeElement));
      }, 0);
    });
  } catch {}
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


