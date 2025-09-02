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

export function initLazyImages() {
  if (io) return;
  io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        io.unobserve(el);
        observe(el);
      }
    });
  }, { rootMargin: '200px 0px' });
  scan();
}

export function scan(root = document) {
  const nodes = root.querySelectorAll(LAZY_SELECTOR);
  nodes.forEach((el) => io.observe(el));
}

export function observeWithin(root) {
  scan(root);
}

if (typeof window !== 'undefined') {
  window.__lazyImages = { initLazyImages, scan, observeWithin };
}


