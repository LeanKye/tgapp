const LAZY_SELECTOR = 'img[data-src], [data-bg-src]';

let io;

function onLoadImg(img) {
  img.classList.add('is-loaded');
  img.classList.remove('img-skeleton');
}

function loadImg(img) {
  if (!img || img.__loaded) return;
  const src = img.getAttribute('data-src');
  if (src) {
    img.decoding = 'async';
    if (!img.getAttribute('loading')) img.loading = 'lazy';
    img.addEventListener('load', () => onLoadImg(img), { once: true });
    img.addEventListener('error', () => img.classList.remove('img-skeleton'), { once: true });
    img.src = src;
    img.__loaded = true;
  }
}

function loadBg(el) {
  if (!el || el.__bgLoaded) return;
  const src = el.getAttribute('data-bg-src');
  if (src) {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      el.style.backgroundImage = `url("${src}")`;
      el.classList.add('bg-loaded');
      el.__bgLoaded = true;
    };
    img.onerror = () => { el.classList.add('bg-loaded'); };
    img.src = src;
  }
}

function observe(el) {
  if (el.tagName === 'IMG') loadImg(el); else loadBg(el);
}

function ensureObserver() {
  if (io) return io;
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          io.unobserve(el);
          observe(el);
        }
      });
    }, { rootMargin: '200px 0px' });
    return io;
  }
  return null;
}

export function initLazyImages() {
  if (!ensureObserver()) {
    // Фолбэк: если IntersectionObserver не поддерживается — грузим сразу
    scan(document, true);
    return;
  }
  scan();
}

export function scan(root = document, forceImmediate = false) {
  const nodes = root.querySelectorAll(LAZY_SELECTOR);
  const observer = forceImmediate ? null : ensureObserver();
  nodes.forEach((el) => {
    if (observer) {
      observer.observe(el);
    } else {
      // Нет observer — загружаем мгновенно
      observe(el);
    }
  });
}

export function observeWithin(root) {
  scan(root);
}

if (typeof window !== 'undefined') {
  window.__lazyImages = { initLazyImages, scan, observeWithin };
}


