// Клиентский роутер: этап 2 — Home (SPA) + Category (SPA). Остальные пока full reload.

function readMs(val, fallback) {
  try {
    const s = String(val || '').trim();
    if (!s) return fallback;
    const n = parseInt(s.replace('ms', ''), 10);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

function getBasePath() {
  return window.location.pathname.replace(/[^/]*$/, '');
}

function getCurrentFile() {
  return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
}

function normalizePath(path) {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return normalized || 'index.html';
}

function isHome(path) {
  const file = normalizePath(path).split('?')[0];
  return file === '' || file === 'index.html';
}

function parsePath(path) {
  const base = getBasePath();
  const url = new URL(path.startsWith('http') ? path : (base + normalizePath(path)), location.origin);
  const file = (url.pathname.split('/').pop() || 'index.html').toLowerCase();
  const params = Object.fromEntries(url.searchParams.entries());
  const hash = (url.hash || '').replace(/^#/, '');
  return { file, params, hash };
}

function fadeOut(targetSel = '#app') {
  const body = document.body;
  const dur = readMs(getComputedStyle(body).getPropertyValue('--page-fade-out'), 160);
  body.classList.add('leaving');
  const el = document.querySelector(targetSel) || body;
  return new Promise((resolve) => {
    let done = false;
    const onEnd = (e) => {
      if (done) return;
      if (!e || (e.target === el && e.propertyName === 'opacity')) {
        done = true;
        try { el.removeEventListener('transitionend', onEnd); } catch {}
        resolve();
      }
    };
    try { el.addEventListener('transitionend', onEnd); } catch {}
    setTimeout(() => { onEnd(); }, dur + 80);
  });
}

function fadeIn() {
  const body = document.body;
  // page-fade.js сам настраивает --page-fade-in и снимает preload при загрузке,
  // здесь достаточно убрать класс leaving, чтобы выполнить fade-in.
  body.classList.remove('leaving');
}

async function renderHome({ replace = false } = {}) {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  } catch {}
  // Для этапа 1 DOM не меняем: главная уже отрисована сервером и инициализирована main.js.
  // Обновим активность нижнего меню и заголовок.
  try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
  if (replace) {
    history.replaceState(null, '', getBasePath() + 'index.html');
  } else {
    history.pushState(null, '', getBasePath() + 'index.html');
  }
}

let currentCleanup = null;

async function renderCategory(params, { replace = false } = {}) {
  const container = document.querySelector('#app');
  if (!container) throw new Error('App root not found');
  // Заменяем содержимое контейнера на разметку категории и инициализируем экран
  const mod = await import('./category.js');
  if (typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch {}
    currentCleanup = null;
  }
  await mod.mountCategory(container, params);
  currentCleanup = mod.unmountCategory || mod.unmount || null;
  // Активность нижнего меню и заголовок/кнопки Telegram
  const url = getBasePath() + 'category.html' + (params?.category ? `?category=${encodeURIComponent(params.category)}` : '');
  if (replace) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
  try { window.telegramWebApp?.updateTelegramHeader?.(); } catch {}
  try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
}

async function navigate(path, opts = {}) {
  const { file, params, hash } = parsePath(path);
  // SPA-маршруты
  if (file === 'index.html') {
    const container = document.querySelector('#app');
    await fadeOut('#app');
    const mod = await import('./main.js');
    if (typeof currentCleanup === 'function') {
      try { currentCleanup(); } catch {}
      currentCleanup = null;
    }
    await mod.mountHome(container);
    currentCleanup = mod.unmountHome || mod.unmount || null;
    const url = getBasePath() + 'index.html';
    if (opts.replace) history.replaceState(null, '', url);
    else history.pushState(null, '', url);
    try { window.telegramWebApp?.updateTelegramHeader?.(); } catch {}
    try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
    fadeIn();
    return;
  }
  if (file === 'category.html') {
    await fadeOut('#app');
    await renderCategory({ category: params.category }, { replace: !!opts.replace });
    fadeIn();
    return;
  }
  if (file === 'product.html') {
    const container = document.querySelector('#app');
    await fadeOut('#app');
    const mod = await import('./product.js');
    if (typeof currentCleanup === 'function') {
      try { currentCleanup(); } catch {}
      currentCleanup = null;
    }
    await mod.mountProduct(container, { product: params.product });
    currentCleanup = mod.unmountProduct || mod.unmount || null;
    const url = getBasePath() + 'product.html' + (params?.product ? `?product=${encodeURIComponent(params.product)}` : '');
    if (opts.replace) history.replaceState(null, '', url);
    else history.pushState(null, '', url);
    try { window.telegramWebApp?.updateTelegramHeader?.(); } catch {}
    try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
    fadeIn();
    return;
  }
  if (file === 'cart.html') {
    const container = document.querySelector('#app');
    await fadeOut('#app');
    const mod = await import('./cart.js');
    if (typeof currentCleanup === 'function') {
      try { currentCleanup(); } catch {}
      currentCleanup = null;
    }
    await mod.mountCart(container);
    currentCleanup = mod.unmountCart || mod.unmount || null;
    const url = getBasePath() + 'cart.html';
    if (opts.replace) history.replaceState(null, '', url);
    else history.pushState(null, '', url);
    try { window.telegramWebApp?.updateTelegramHeader?.(); } catch {}
    try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
    fadeIn();
    return;
  }
  if (file === 'profile.html') {
    const container = document.querySelector('#app');
    await fadeOut('#app');
    const mod = await import('./profile.js');
    if (typeof currentCleanup === 'function') {
      try { currentCleanup(); } catch {}
      currentCleanup = null;
    }
    await mod.mountProfile(container);
    currentCleanup = mod.unmountProfile || mod.unmount || null;
    const url = getBasePath() + 'profile.html';
    if (opts.replace) history.replaceState(null, '', url);
    else history.pushState(null, '', url);
    try { window.telegramWebApp?.updateTelegramHeader?.(); } catch {}
    try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
    fadeIn();
    return;
  }
  if (file === 'info.html') {
    const container = document.querySelector('#app');
    await fadeOut('#app');
    const mod = await import('./info.js');
    if (typeof currentCleanup === 'function') {
      try { currentCleanup(); } catch {}
      currentCleanup = null;
    }
    await mod.mountInfo(container, { hash });
    currentCleanup = mod.unmountInfo || mod.unmount || null;
    const url = getBasePath() + 'info.html' + (hash ? `#${hash}` : '');
    if (opts.replace) history.replaceState(null, '', url);
    else history.pushState(null, '', url);
    try { window.telegramWebApp?.updateTelegramHeader?.(); } catch {}
    try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
    fadeIn();
    return;
  }
  // Остальные маршруты — обычный переход (пока)
  const base = getBasePath();
  window.location.href = base + normalizePath(path);
}

function initPopstate() {
  window.addEventListener('popstate', () => {
    const { file, params, hash } = parsePath(location.pathname.split('/').pop() + location.search + location.hash);
    if (file === 'index.html') {
      fadeOut('#app').then(async () => {
        const container = document.querySelector('#app');
        const mod = await import('./main.js');
        if (typeof currentCleanup === 'function') {
          try { currentCleanup(); } catch {}
          currentCleanup = null;
        }
        await mod.mountHome(container);
        currentCleanup = mod.unmountHome || mod.unmount || null;
        try { window.telegramWebApp?.updateTelegramHeader?.(); } catch {}
        try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
        fadeIn();
      });
    } else if (file === 'category.html') {
      fadeOut('#app').then(() => {
        renderCategory({ category: params.category }, { replace: true }).then(() => fadeIn());
      });
    } else if (file === 'product.html') {
      fadeOut('#app').then(async () => {
        const container = document.querySelector('#app');
        const mod = await import('./product.js');
        if (typeof currentCleanup === 'function') {
          try { currentCleanup(); } catch {}
          currentCleanup = null;
        }
        await mod.mountProduct(container, { product: params.product });
        currentCleanup = mod.unmountProduct || mod.unmount || null;
        try { window.telegramWebApp?.updateTelegramHeader?.(); } catch {}
        try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
        fadeIn();
      });
    } else if (file === 'cart.html') {
      fadeOut('#app').then(async () => {
        const container = document.querySelector('#app');
        const mod = await import('./cart.js');
        if (typeof currentCleanup === 'function') {
          try { currentCleanup(); } catch {}
          currentCleanup = null;
        }
        await mod.mountCart(container);
        currentCleanup = mod.unmountCart || mod.unmount || null;
        try { window.telegramWebApp?.updateTelegramHeader?.(); } catch {}
        try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
        fadeIn();
      });
    } else if (file === 'profile.html') {
      fadeOut('#app').then(async () => {
        const container = document.querySelector('#app');
        const mod = await import('./profile.js');
        if (typeof currentCleanup === 'function') {
          try { currentCleanup(); } catch {}
          currentCleanup = null;
        }
        await mod.mountProfile(container);
        currentCleanup = mod.unmountProfile || mod.unmount || null;
        try { window.telegramWebApp?.updateTelegramHeader?.(); } catch {}
        try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
        fadeIn();
      });
    } else if (file === 'info.html') {
      fadeOut('#app').then(async () => {
        const container = document.querySelector('#app');
        const mod = await import('./info.js');
        if (typeof currentCleanup === 'function') {
          try { currentCleanup(); } catch {}
          currentCleanup = null;
        }
        await mod.mountInfo(container, { hash });
        currentCleanup = mod.unmountInfo || mod.unmount || null;
        try { window.telegramWebApp?.updateTelegramHeader?.(); } catch {}
        try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
        fadeIn();
      });
    } else {
      // Остальные страницы пока управляются браузером
    }
  });
}

function overrideAppNav() {
  // Если AppNav уже инициализирован в nav.js — мягко переопределим go/goHomeSmart
  if (!window.AppNav) {
    window.AppNav = {};
  }
  const originalGo = window.AppNav.go;
  const originalGoHome = window.AppNav.goHomeSmart;
  window.AppNav.go = (p) => navigate(p);
  window.AppNav.goHomeSmart = () => navigate('index.html');
  // Сохраним доступ к оригиналам на случай отладки
  window.AppNav.__go_original = originalGo;
  window.AppNav.__goHome_original = originalGoHome;
}

function initRouter() {
  try { overrideAppNav(); } catch {}
  try { initPopstate(); } catch {}
  // Первый рендер не трогаем — страница уже отрисована.
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRouter, { once: true });
} else {
  initRouter();
}

// Экспорт на будущее (этапы 2+)
export { navigate };


