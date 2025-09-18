// Global scaler to render the app exactly as on iPhone 16 Pro Max (base 430x932)
// Ignoring usability on smaller screens per requirements

const BASE_WIDTH = 430;   // iPhone 16 Pro Max logical CSS width in portrait
const BASE_HEIGHT = 932;  // Fallback baseline height (used only as hint)

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

function applyScale() {
  const root = ensureScaledRoot();
  const { width: vw, height: vh } = getViewportSize();

  // Account for fixed bottom navigation
  const bottomNav = document.querySelector('.bottom-nav');
  const bottomNavHeightPx = bottomNav ? bottomNav.offsetHeight : 0; // includes safe area
  const availableHeight = Math.max(0, vh - bottomNavHeightPx);

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

  root.style.transform = `translate(${offsetX}px, 0) scale(${scale})`;

  // Mirror transform to fixed layers so their children remain pixel-perfect but fixed to viewport
  const under = document.getElementById('scaled-fixed-under');
  const over = document.getElementById('scaled-fixed-over');
  if (under) {
    under.style.transform = `translate(${offsetX}px, 0) scale(${scale})`;
    // Height so that children with bottom: X are anchored to viewport bottom in base coords
    under.style.height = `${Math.ceil(vh / scale)}px`;
  }
  if (over) {
    over.style.transform = `translate(${offsetX}px, 0) scale(${scale})`;
    over.style.height = `${Math.ceil(vh / scale)}px`;
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
  spacer.style.height = `${baseHeight * scale}px`;
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

  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedule);
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
        // Переносим нижнюю навигацию в трансформированный фикс-слой,
        // чтобы избежать «оторвания» на iOS при rubber-bounce
        '.bottom-nav',
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
          // If bottom-nav appeared or content changed significantly, rescale
          if ([...m.addedNodes].some((n) => n.nodeType === 1 && (n.classList?.contains('bottom-nav') || n.id === 'scaled-root' || n.classList?.contains('add-to-cart') || n.classList?.contains('product-cart-controls') || n.classList?.contains('cart-checkout') || n.classList?.contains('bottom-actions-bg')))) {
            moveFixedIntoLayers();
            schedule();
            return;
          }
        }
        if (m.type === 'attributes') {
          if (m.target && m.target.classList && (m.target.classList.contains('bottom-nav') || m.target.classList.contains('add-to-cart') || m.target.classList.contains('product-cart-controls') || m.target.classList.contains('cart-checkout') || m.target.classList.contains('bottom-actions-bg'))) {
            moveFixedIntoLayers();
            schedule();
            return;
          }
        }
      }
      // Fallback debounce for generic content changes
      schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  } catch {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScale, { once: true });
} else {
  initScale();
}


