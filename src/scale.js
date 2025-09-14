// Global scaler to render the app exactly as on iPhone 16 Pro Max (base 430x932)
// Ignoring usability on smaller screens per requirements

const BASE_WIDTH = 430;   // iPhone 16 Pro Max logical CSS width in portrait
const BASE_HEIGHT = 932;  // Fallback baseline height (used only as hint)

// Cache to avoid reflows and jitter while scrolling
let lastApplied = { vw: 0, vh: 0, scale: 0, topInset: 0, offsetX: 0, bottomNavHeight: 0, spacerHeight: 0 };
let isApplying = false;
function nearlyEqual(a, b, eps) { return Math.abs(a - b) <= (eps || 0.5); }
let stableTopInset = null; // keep stable header inset to avoid jitter

/**
 * Create a wrapper for all non-script body children and apply transform scale.
 * We avoid moving <script> tags to keep script loading/execution order intact.
 */
function ensureScaledRoot() {
  let root = document.getElementById('scaled-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'scaled-root';
    root.style.position = 'absolute';
    root.style.top = '0';
    root.style.left = '0';
    root.style.width = BASE_WIDTH + 'px';
    root.style.transformOrigin = 'top left';
    root.style.willChange = 'transform';

    // Insert as the first child of body
    document.body.insertBefore(root, document.body.firstChild);

    // Move all non-script nodes into the root
    const nodesToMove = Array.from(document.body.childNodes).filter((node) => {
      if (node === root) return false;
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const tag = node.tagName;
      return tag !== 'SCRIPT';
    });
    nodesToMove.forEach((node) => root.appendChild(node));

    // Ensure page can scroll normally; just normalize margins
    document.body.style.margin = '0';
    document.body.style.backgroundColor = getComputedStyle(document.body).backgroundColor || '#000';

    // Fixed layers (under/over bottom nav) to host fixed controls outside transformed context
    const under = document.createElement('div');
    under.id = 'scaled-fixed-under';
    under.style.position = 'fixed';
    under.style.top = '0';
    under.style.left = '0';
    under.style.width = BASE_WIDTH + 'px';
    under.style.transformOrigin = 'top left';
    under.style.pointerEvents = 'none';
    under.style.zIndex = '600'; // below bottom-nav (800)
    document.body.appendChild(under);

    const over = document.createElement('div');
    over.id = 'scaled-fixed-over';
    over.style.position = 'fixed';
    over.style.top = '0';
    over.style.left = '0';
    over.style.width = BASE_WIDTH + 'px';
    over.style.transformOrigin = 'top left';
    over.style.pointerEvents = 'none';
    over.style.zIndex = '1200'; // above bottom-nav (800)
    document.body.appendChild(over);

    // Add spacer to define scrollable height based on scaled content
    let spacer = document.getElementById('scaled-spacer');
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.id = 'scaled-spacer';
      spacer.style.width = '100%';
      spacer.style.pointerEvents = 'none';
      document.body.appendChild(spacer);
    }
  }
  return root;
}

function getViewportSize() {
  // Prefer visualViewport for more accurate dimensions in mobile webviews
  if (window.visualViewport) {
    return { width: window.visualViewport.width, height: window.visualViewport.height };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

function getTopInset() {
  try {
    // Telegram WebApp header compensation (fullsize mode)
    const wa = window.Telegram && window.Telegram.WebApp;
    if (wa && typeof wa.viewportHeight === 'number') {
      // innerHeight may include area under Telegram header; viewportHeight — видимая часть WebApp
      const diff = Math.max(0, window.innerHeight - wa.viewportHeight);
      // viewportStableHeight иногда точнее
      const stable = typeof wa.viewportStableHeight === 'number' ? Math.max(0, window.innerHeight - wa.viewportStableHeight) : 0;
      const maxWa = Math.max(diff, stable);
      if (maxWa > 0) return Math.ceil(maxWa);
    }
    if (window.visualViewport) {
      const vv = window.visualViewport;
      const vvTop = Math.max(0, (vv.offsetTop || 0), (vv.pageTop || 0));
      if (vvTop > 0) return Math.ceil(vvTop);
    }
  } catch {}
  // Fallback via CSS env probe
  let probe = document.getElementById('safe-area-top-probe');
  if (!probe) {
    probe = document.createElement('div');
    probe.id = 'safe-area-top-probe';
    probe.style.position = 'fixed';
    probe.style.top = '0';
    probe.style.left = '0';
    probe.style.width = '0';
    probe.style.height = 'env(safe-area-inset-top)';
    probe.style.pointerEvents = 'none';
    probe.style.opacity = '0';
    document.body.appendChild(probe);
  }
  const envTop = probe.offsetHeight || 0;
  if (envTop > 0) return envTop;

  // Last resort: conservative constant for iOS Telegram header
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isTG = !!(window.Telegram && window.Telegram.WebApp);
  if (isIOS && isTG) return 64; // приблизительно высота шапки TG + статус-бара
  return 0;
}

function applyScale() {
  if (isApplying) return; // prevent recursive thrashing
  isApplying = true;
  const root = ensureScaledRoot();
  const { width: vw, height: vh } = getViewportSize();
  const measuredTop = Math.round(getTopInset());
  if (stableTopInset == null) stableTopInset = measuredTop;
  // Update only on significant change (>6px) to avoid micro-jumps when scrolling
  if (!nearlyEqual(measuredTop, stableTopInset, 6)) stableTopInset = measuredTop;
  let topInsetPx = stableTopInset;
  // Чуть больший отступ на главной (есть .logo)
  try {
    const isHome = !!document.querySelector('.logo');
    if (isHome) topInsetPx += 8; // добавляем 8px пространства сверху только на главной
  } catch {}
  // Expose state for CSS overrides (e.g., disable env-safe-area duplication)
  try {
    document.body.classList.toggle('scaled-safe', topInsetPx > 0);
  } catch {}

  // Account for fixed bottom navigation
  const bottomNav = document.querySelector('.bottom-nav');
  const bottomNavHeightPx = bottomNav ? bottomNav.offsetHeight : 0; // includes safe area
  const availableHeight = Math.max(0, vh - bottomNavHeightPx - topInsetPx);

  // Two candidate scales
  const scaleWidth = vw / BASE_WIDTH;
  const scaleHeight = availableHeight / BASE_HEIGHT;

  // Default: fit both (may cause side letterbox). If that produces side gaps,
  // switch to width-based scale to remove lateral gaps and allow extra vertical scroll.
  let scale = Math.min(scaleWidth, scaleHeight);
  const sideGapPx = (vw - BASE_WIDTH * scale);
  if (sideGapPx > 8) {
    scale = scaleWidth;
  }
  if (scale > 1) scale = 1; // never upscale

  // Add unscaled padding so scrollable content never hides behind bottom nav
  const extraPaddingUnscaled = bottomNavHeightPx > 0 ? Math.ceil(bottomNavHeightPx / scale) : 0;
  root.style.paddingBottom = extraPaddingUnscaled ? `${extraPaddingUnscaled}px` : '0px';

  // Measure base content height (unscaled) after padding applied
  root.style.height = 'auto';
  const baseHeight = Math.max(root.scrollHeight, BASE_HEIGHT);

  // Horizontal centering
  const scaledWidth = BASE_WIDTH * scale;
  const offsetX = Math.max(0, (vw - scaledWidth) / 2);

  // Skip re-apply if metrics effectively unchanged
  if (
    nearlyEqual(vw, lastApplied.vw, 1) &&
    nearlyEqual(vh, lastApplied.vh, 1) &&
    nearlyEqual(scale, lastApplied.scale, 0.002) &&
    nearlyEqual(topInsetPx, lastApplied.topInset, 1) &&
    nearlyEqual(offsetX, lastApplied.offsetX, 1) &&
    nearlyEqual(bottomNavHeightPx, lastApplied.bottomNavHeight, 1)
  ) {
    isApplying = false;
    return;
  }

  root.style.transform = `translate(${offsetX}px, ${topInsetPx}px) scale(${scale})`;

  // Mirror transform to fixed layers so their children remain pixel-perfect but fixed to viewport
  const under = document.getElementById('scaled-fixed-under');
  const over = document.getElementById('scaled-fixed-over');
  if (under) {
    under.style.transform = `translate(${offsetX}px, ${topInsetPx}px) scale(${scale})`;
    // Height so that children with bottom: X are anchored to viewport bottom in base coords
    under.style.height = `${Math.ceil((vh - topInsetPx) / Math.max(scale, 0.0001))}px`;
  }
  if (over) {
    over.style.transform = `translate(${offsetX}px, ${topInsetPx}px) scale(${scale})`;
    over.style.height = `${Math.ceil((vh - topInsetPx) / Math.max(scale, 0.0001))}px`;
  }

  // Update spacer height so the document scroll height matches scaled content
  let spacer = document.getElementById('scaled-spacer');
  if (!spacer) {
    spacer = document.createElement('div');
    spacer.id = 'scaled-spacer';
    spacer.style.width = '100%';
    spacer.style.pointerEvents = 'none';
    document.body.appendChild(spacer);
  }
  let newSpacerHeight = Math.ceil(baseHeight * scale);
  // Никогда не уменьшаем spacer во время сессии, чтобы не выбивать текущую позицию скролла
  if (lastApplied.spacerHeight && newSpacerHeight < lastApplied.spacerHeight) {
    newSpacerHeight = lastApplied.spacerHeight;
  }
  if (!nearlyEqual(newSpacerHeight, lastApplied.spacerHeight, 1)) {
    spacer.style.height = `${newSpacerHeight}px`;
  }

  lastApplied = { vw, vh, scale, topInset: topInsetPx, offsetX, bottomNavHeight: bottomNavHeightPx, spacerHeight: newSpacerHeight };
  isApplying = false;
}

// Apply on load and on changes that can affect viewport size
function initScale() {
  applyScale();
  let resizeRaf = 0;
  const schedule = () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      applyScale();
    });
  };

  // Не слушаем window.resize на iOS Telegram — он стреляет при резиновой прокрутке и даёт дёргания
  window.addEventListener('orientationchange', schedule);
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const onVvResize = () => {
      const w = Math.round(vv.width);
      const h = Math.round(vv.height);
      if (!nearlyEqual(w, lastApplied.vw, 1) || !nearlyEqual(h, lastApplied.vh, 1)) schedule();
    };
    vv.addEventListener('resize', onVvResize, { passive: true });
    // Не слушаем scroll, это источник дребезга на iOS
  }

  // Re-apply once window fully loaded (images/fonts)
  window.addEventListener('load', schedule);

  // Observe DOM changes to catch late insertion of bottom nav or dynamic content
  try {
    const moveFixedIntoLayers = () => {
      const over = document.getElementById('scaled-fixed-over');
      const under = document.getElementById('scaled-fixed-under');
      if (!over || !under) return;
      const toOver = [
        '.add-to-cart',
        '.product-cart-controls',
        '.cart-checkout',
        '.info-header',
      ];
      const toUnder = [
        '.bottom-actions-bg',
      ];
      toOver.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          if (el.parentElement !== over) {
            el.style.pointerEvents = 'auto';
            over.appendChild(el);
          }
        });
      });
      toUnder.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          if (el.parentElement !== under) {
            el.style.pointerEvents = 'none';
            under.appendChild(el);
          }
        });
      });
    };

    // Initial move
    moveFixedIntoLayers();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          if ([...m.addedNodes].some((n) => n.nodeType === 1 && n.classList?.contains('bottom-nav'))) {
            moveFixedIntoLayers();
            schedule();
            return;
          }
        }
      }
    });
    // Наблюдаем только верхний уровень body — без subtree и без attributes
    observer.observe(document.body, { childList: true, subtree: false });
  } catch {}

  // Дополнительная одноразовая проверка через 300мс — на случай поздней вставки навбара
  setTimeout(() => applyScale(), 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScale, { once: true });
} else {
  initScale();
}


