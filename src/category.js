// Последняя выбранная конфигурация пользователя (per product) — для передачи в URL
function getLastConfigForProduct(productId) {
  try {
    const raw = sessionStorage.getItem('hooli_last_config_' + String(productId));
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return null;
    return {
      variantId: obj.variantId || null,
      periodId: obj.periodId || null,
      editionId: obj.editionId || null,
    };
  } catch { return null; }
}
function buildProductUrlWithConfig(productId) {
  const cfg = getLastConfigForProduct(productId);
  const params = new URLSearchParams({ product: String(productId) });
  if (cfg?.variantId) params.set('variant', cfg.variantId);
  if (cfg?.editionId) params.set('edition', cfg.editionId);
  return `product.html?${params.toString()}`;
}
import './style.css'
import { getProductsByCategory, categoryData, getAllProducts, formatPrice, formatPriceCard } from './products-data.js'
 
// Универсальная навигация: используем стек AppNav при наличии
function navigate(path) {
  if (window.AppNav && typeof window.AppNav.go === 'function') {
    return window.AppNav.go(path);
  }
  const basePath = window.location.pathname.replace(/[^/]*$/, '');
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  window.location.href = basePath + normalized;
}
 

function categoryTemplate() {
  return `
    <div class="catalog">
      <div class="header-container">
        <div class="search">
          <div class="search-container">
            <div class="input-container">
              <div class="search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <input id="search-input" placeholder="Поиск по категории">
            </div>
            <div class="search-dropdown" id="search-dropdown"></div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="category-title" id="category-title">Категория</div>
        <div class="category-products-grid" id="category-products"></div>
        <div class="no-products is-hidden" id="no-products">
          <h3>В этой категории пока пусто</h3>
          <p>Но скоро что-то появится!</p>
          <button class="back-to-main reset-Button" id="back-to-main-btn">Вернуться на главную</button>
        </div>
      </div>
      <div class="search-overlay" id="search-overlay"></div>
    </div>
  `;
}

class CategoryPage {
  constructor(categoryFromParams) {
    this.currentCategory = categoryFromParams || null;
    this.currentProducts = [];
    this.filteredProducts = [];
    this._edgeLockCleanup = null;
    this._docHandlers = [];
    this.init();
  }

  destroy() {
    try { this.disableEdgeScrollLock(); } catch {}
    try {
      (this._docHandlers || []).forEach(({ type, handler, options }) => {
        try { document.removeEventListener(type, handler, options); } catch {}
      });
    } catch {}
    this._docHandlers = [];
    this.isSearchActive = false;
  }

  init() {
    // Если категорию не передали — читаем из URL (fallback)
    if (!this.currentCategory) {
      const urlParams = new URLSearchParams(window.location.search);
      this.currentCategory = urlParams.get('category');
    }

    if (!this.currentCategory) {
      // Если категория не указана, перенаправляем на главную
      navigate('index.html');
      return;
    }

    // Инициализируем компоненты
    this.initSearch();
    this.loadCategoryData();
  }

  // initMenu удалён — меню больше нет



  onDocument(type, handler, options) {
    document.addEventListener(type, handler, options);
    this._docHandlers.push({ type, handler, options });
  }

  initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-dropdown');

    if (!searchInput) return;

    let searchTimeout;
    this.isSearchActive = false;
    this.isFirstTimeOpen = true; // Флаг для первого открытия
    this.filteredProducts = [];
    this.selectedIndex = -1;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      searchTimeout = setTimeout(() => {
        if (query.length === 0) {
          // Показываем "Товары не найдены" даже при пустом запросе
          this.showNoSearchResults();
        } else {
          this.performSearch(query);
        }
      }, 0);
    });

    // Активируем поиск при фокусе
    searchInput.addEventListener('focus', () => {
      this.activateSearch();
      
      // Если пустое поле или есть текст - показываем соответствующий dropdown
      if (searchInput.value.trim()) {
        this.performSearch(searchInput.value);
      } else {
        this.showNoSearchResults();
      }
    });

    // Навигация клавиатурой
    searchInput.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });

    // Синхронно поднимаем страницу и фокусируем инпут в рамках жеста пользователя
    const ensureTopAndFocus = (e) => {
      try { if (e && e.cancelable) e.preventDefault(); } catch {}
      try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch {}
      try { document.documentElement.scrollTop = 0; } catch {}
      try { document.body.scrollTop = 0; } catch {}
      try {
        const catalog = document.querySelector('.catalog');
        if (catalog) {
          catalog.scrollTop = 0;
          if (typeof catalog.scrollTo === 'function') {
            catalog.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          }
        }
      } catch {}
      try {
        if (searchInput) {
          searchInput.focus({ preventScroll: true });
          const len = searchInput.value.length;
          if (typeof searchInput.setSelectionRange === 'function') {
            searchInput.setSelectionRange(len, len);
          }
        }
      } catch {}
    };
    // Fast-tap: фокус только по короткому тапу (не при свайпе)
    let tSX = 0, tSY = 0, tST = 0, tScY = 0, tScX = 0; const T_MOVE = 8, T_HOLD = 300; let tMoved = false;
    const onTapPD = (e) => { tSX = e.clientX; tSY = e.clientY; tST = performance.now(); tScY = window.scrollY; tScX = window.scrollX; tMoved = false; };
    const onTapPM = (e) => { if (!tST) return; if (Math.abs(e.clientX - tSX) > T_MOVE || Math.abs(e.clientY - tSY) > T_MOVE || Math.abs(window.scrollY - tScY) > 0 || Math.abs(window.scrollX - tScX) > 0) tMoved = true; };
    const onTapPU = (e) => { const dur = performance.now() - (tST || performance.now()); const ok = !tMoved && dur <= T_HOLD; tST = 0; if (!ok) return; ensureTopAndFocus(e); };
    searchInput.addEventListener('pointerdown', onTapPD, { passive: true });
    searchInput.addEventListener('pointermove', onTapPM, { passive: true });
    searchInput.addEventListener('pointerup', onTapPU, { passive: false });
    searchInput.addEventListener('touchend', onTapPU, { passive: false });

    // Скрываем dropdown при клике вне поиска
    const onDocClick = (e) => {
      if (!e.target.closest('.search-container') && !e.target.closest('.header-container')) {
        this.hideSearchDropdown();
        if (this.isSearchActive) {
          this.deactivateSearch();
        }
      }
    };
    this.onDocument('click', onDocClick);
    
    // Обработчик для закрытия поиска при клике на оверлей
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay) {
      searchOverlay.addEventListener('click', () => {
        this.deactivateSearch();
      });
    }
    
    // Обработчик для закрытия поиска при клике на хедер (кроме самого поисковика)
    const headerContainer = document.querySelector('.header-container');
    if (headerContainer) {
      headerContainer.addEventListener('click', (e) => {
        // Если клик не на сам поисковик и поиск активен
        if (!e.target.closest('.search-container') && this.isSearchActive) {
          this.deactivateSearch();
        }
      });
    }
    
    // Обработчик для скролла - если пользователь пытается скроллить, закрываем поиск
    const onWheel = (e) => {
      if (this.isSearchActive) {
        // Разрешаем скролл внутри search-dropdown
        if (e.target.closest('.search-dropdown')) {
          return;
        }
        e.preventDefault();
        this.deactivateSearch();
      }
    };
    this.onDocument('wheel', onWheel, { passive: false });
    
    // Обработчик для touch событий на мобильных устройствах
    const onTouchMove = (e) => {
      if (this.isSearchActive) {
        // Разрешаем скролл внутри search-dropdown
        if (e.target.closest('.search-dropdown')) {
          return;
        }
        e.preventDefault();
        this.deactivateSearch();
      }
    };
    this.onDocument('touchmove', onTouchMove, { passive: false });
  
  // Обработчик для блокировки всех кликов при активном поиске
  const onDocCaptureClick = (e) => {
    if (this.isSearchActive) {
      // Разрешаем клики только в зоне поиска и в меню (если оно есть)
      if (e.target.closest('.search-container') || e.target.closest('#menu')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this.deactivateSearch();
    }
  };
  this.onDocument('click', onDocCaptureClick, { capture: true });

  // Предотвращаем "проклик" при скролле внутри dropdown (iOS/Android ghost click)
  try {
    const dd = searchDropdown;
    if (dd) {
      let dSX = 0, dSY = 0, dMoved = false, dRecent = false, dTimer = null; const TH = 6;
      const getXY = (e) => {
        if (typeof e.clientX === 'number') return { x: e.clientX, y: e.clientY };
        const t = e.touches && e.touches[0];
        return { x: t ? t.clientX : 0, y: t ? t.clientY : 0 };
      };
      const start = (e) => { const p = getXY(e); dSX = p.x; dSY = p.y; dMoved = false; };
      const move = (e) => { const p = getXY(e); if (Math.abs(p.x - dSX) > TH || Math.abs(p.y - dSY) > TH) dMoved = true; };
      const end = (e) => {
        if (dMoved) {
          try { if (e && e.cancelable) e.preventDefault(); } catch {}
          try { e.stopPropagation(); } catch {}
          // Гасим следующий click на документе
          try {
            const blocker = (ev) => { try { ev.preventDefault(); } catch {} try { ev.stopPropagation(); } catch {}; document.removeEventListener('click', blocker, true); };
            document.addEventListener('click', blocker, true);
            setTimeout(() => { document.removeEventListener('click', blocker, true); }, 250);
          } catch {}
          dRecent = true; clearTimeout(dTimer); dTimer = setTimeout(() => { dRecent = false; }, 250);
        }
      };
      dd.addEventListener('pointerdown', start, { passive: true });
      dd.addEventListener('pointermove', move, { passive: true });
      dd.addEventListener('pointerup', end, { passive: false });
      dd.addEventListener('touchstart', start, { passive: true });
      dd.addEventListener('touchmove', move, { passive: true });
      dd.addEventListener('touchend', end, { passive: false });
      // Страхуем: если вдруг прилетит click после скролла — гасим его в capture
      dd.addEventListener('click', (e) => {
        // Не блокируем клики по элементам подсказок даже сразу после скролла
        if ((dMoved || dRecent) && !e.target.closest('.search-suggestion')) {
          try { e.preventDefault(); } catch {}
          try { e.stopPropagation(); } catch {}
        }
        dMoved = false; dRecent = false;
      }, true);
    }
  } catch {}
  }

  performSearch(query) {
    const searchResults = this.currentProducts.filter(product =>
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );

    this.filteredProducts = searchResults;
    this.selectedIndex = -1;

    if (searchResults.length > 0) {
      this.showSearchDropdown(searchResults);
    } else {
      this.showNoSearchResults();
    }
  }

  showSearchDropdown(products) {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;

    // Анимируем изменение высоты при появлении результатов
    this.animateDropdownHeight(() => {
      dropdown.innerHTML = '';
      products.forEach((product, index) => {
        const suggestion = this.createSearchSuggestion(product, index);
        dropdown.appendChild(suggestion);
      });
      dropdown.classList.add('show');
    });
    this.selectedIndex = -1;

    // Поведение как у страницы: нативный bounce при наличии контента
    const isScrollable = dropdown.scrollHeight > dropdown.clientHeight + 1;
    if (isScrollable) {
      // Всегда показываем полосу прокрутки, чтобы было понятно, что контента больше
      dropdown.style.overflowY = 'scroll';
      dropdown.style.touchAction = 'pan-y';
      dropdown.style.webkitOverflowScrolling = 'touch';
      dropdown.style.overscrollBehaviorY = 'contain';
      dropdown.style.overscrollBehaviorX = 'contain';
      this.disableEdgeScrollLock();
    } else {
      dropdown.style.overflow = 'hidden';
      dropdown.style.touchAction = 'none';
      dropdown.style.webkitOverflowScrolling = 'auto';
      dropdown.style.overscrollBehavior = 'none';
      this.disableEdgeScrollLock();
    }
  }

  createSearchSuggestion(product, index) {
    const suggestion = document.createElement('div');
    suggestion.className = 'search-suggestion';
    suggestion.dataset.index = index;
    
    let priceHTML = `<span class="search-suggestion-price">${formatPriceCard(product.price)}</span>`;
    if (product.oldPrice) {
      priceHTML = `<span class="search-suggestion-price">${formatPriceCard(product.price)} <span class="category-product-price-old">${formatPriceCard(product.oldPrice, '₽', true)}</span></span>`;
    }

    suggestion.innerHTML = `
      <img src="${product.images[0]}" alt="${product.title}" />
      <div class="search-suggestion-content">
        <div class="search-suggestion-title">${product.title}</div>
        <div class="search-suggestion-category">${product.category}</div>
        ${priceHTML}
      </div>
    `;

    // Tracking scroll and momentum state
    let isScrolling = false;
    let scrollTimer = null;
    let lastScrollTop = 0;
    let momentumActive = false;
    const searchDropdown = document.getElementById('search-dropdown');
    
    // Monitor scrolling state of dropdown
    const trackScrolling = () => {
      if (!searchDropdown) return;
      
      const currentScrollTop = searchDropdown.scrollTop;
      
      // Detect if there's scrolling momentum
      if (Math.abs(currentScrollTop - lastScrollTop) > 1) {
        isScrolling = true;
        momentumActive = true;
      }
      
      lastScrollTop = currentScrollTop;
      
      // Clear previous timer
      clearTimeout(scrollTimer);
      
      // Set timer to detect scroll end
      scrollTimer = setTimeout(() => {
        isScrolling = false;
        // Keep momentum flag for a bit longer to catch tap-to-stop
        setTimeout(() => {
          momentumActive = false;
        }, 100);
      }, 150);
    };
    
    // Start tracking when dropdown is shown
    if (searchDropdown) {
      searchDropdown.addEventListener('scroll', trackScrolling, { passive: true });
    }

    // Обработчик клика по предложению с анимацией
    suggestion.addEventListener('click', (e) => {
      // Don't navigate if we're stopping scroll momentum
      if (momentumActive || isScrolling) {
        try { e.preventDefault(); } catch {}
        try { e.stopPropagation(); } catch {}
        // Stop the momentum
        if (searchDropdown) {
          const currentPos = searchDropdown.scrollTop;
          searchDropdown.scrollTop = currentPos;
        }
        momentumActive = false;
        isScrolling = false;
        return;
      }
      
      try { e.preventDefault(); } catch {}
      try { e.stopPropagation(); } catch {}
      try { if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation(); } catch {}
      // Добавляем класс анимации
      suggestion.classList.add('clicked');
      // Мгновенно скрываем overlay/поиск до навигации
      this.deactivateSearch();
      
      // Небольшая задержка перед переходом для показа анимации
      setTimeout(() => {
        // Перед навигацией поднимаем страницу вверх, чтобы не было видно «просвета»
        try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch {}
        try { document.documentElement.scrollTop = 0; } catch {}
        try { document.body.scrollTop = 0; } catch {}
        try {
          const catalog = document.querySelector('.catalog');
          if (catalog) {
            catalog.scrollTop = 0;
            if (typeof catalog.scrollTo === 'function') {
              catalog.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            }
          }
        } catch {}
        navigate(buildProductUrlWithConfig(product.id));
      }, 120);
    });

    // Fast-tap с защитой от скролла/удержания + учёт прокрутки дропдауна
    let sX=0,sY=0,sT=0,sScY=0,sScX=0,sDDTop=0; const S_MOVE=8,S_HOLD=300;
    const sPD=(e)=>{ 
      // Check for momentum first
      if (momentumActive || isScrolling) {
        suggestion.__moved=true;
        return;
      }
      sX=e.clientX; sY=e.clientY; sT=performance.now(); sScY=window.scrollY; sScX=window.scrollX; sDDTop = (document.getElementById('search-dropdown')?.scrollTop)||0; suggestion.__moved=false; 
    };
    const sPM=(e)=>{ if(!sT) return; const ddTop=(document.getElementById('search-dropdown')?.scrollTop)||0; if (Math.abs(e.clientX-sX)>S_MOVE || Math.abs(e.clientY-sY)>S_MOVE || Math.abs(window.scrollY-sScY)>0 || Math.abs(window.scrollX-sScX)>0 || Math.abs(ddTop - sDDTop)>0) suggestion.__moved=true; };
    const sPC=()=>{ suggestion.__moved=true; sT=0; };
    const sPU=(e)=>{ 
      // Don't navigate if momentum was active
      if (momentumActive || isScrolling) {
        try { e && e.preventDefault && e.preventDefault(); } catch {} 
        try { e && e.stopPropagation && e.stopPropagation(); } catch {}
        return;
      }
      const dur=performance.now()-(sT||performance.now()); 
      const ddTop=(document.getElementById('search-dropdown')?.scrollTop)||0; 
      const scrolled=Math.abs(ddTop - sDDTop)>0; 
      const ok=!suggestion.__moved && !scrolled && dur<=S_HOLD; 
      sT=0; 
      if(!ok) return; 
      if (suggestion.__fastTapLock) return; 
      suggestion.__fastTapLock=true; 
      try { 
        try { e && e.preventDefault && e.preventDefault(); } catch {} 
        try { e && e.stopPropagation && e.stopPropagation(); } catch {} 
        this.deactivateSearch(); 
        navigate(buildProductUrlWithConfig(product.id));  
      } finally { 
        setTimeout(()=>{ suggestion.__fastTapLock=false; }, 250);
      } 
    };
    suggestion.addEventListener('pointerdown', sPD, { passive: true });
    suggestion.addEventListener('pointermove', sPM, { passive: true });
    suggestion.addEventListener('pointercancel', sPC, { passive: true });
    suggestion.addEventListener('pointerup', sPU, { passive: false });
    suggestion.addEventListener('touchend', sPU, { passive: false });

    return suggestion;
  }

  showNoSearchResults() {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;

    const wasShown = dropdown.classList.contains('show');
    const hadSuggestions = !!dropdown.querySelector('.search-suggestion');

    const updateContent = () => {
      dropdown.innerHTML = '<div class="no-results">Ничего не найдено</div>';
      dropdown.classList.add('show');
    };

    if (wasShown && hadSuggestions) {
      // Анимируем сжатие до состояния "Ничего не найдено"
      this.animateDropdownHeight(updateContent);
    } else {
      updateContent();
    }
    
    // Блокируем скролл для dropdown когда показывается "Ничего не найдено"
    dropdown.style.overflow = 'hidden';
    dropdown.style.touchAction = 'none';
    dropdown.style.webkitOverflowScrolling = 'auto';
    dropdown.style.overscrollBehavior = 'none';
    
    // Добавляем обработчик клика для сброса поиска
    const noResultsElement = dropdown.querySelector('.no-results');
    if (noResultsElement) {
      noResultsElement.addEventListener('click', () => {
        this.deactivateSearch(); // Полностью закрываем поиск с затемнением
      });
      
      // Блокируем скролл для элемента "Ничего не найдено" на мобильных устройствах
      noResultsElement.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
      
      noResultsElement.addEventListener('touchmove', (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
      
      noResultsElement.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
    }
  }

  // Навигация по результатам с клавиатуры
  handleKeydown(e) {
    if (!this.filteredProducts || this.filteredProducts.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredProducts.length - 1);
        this.updateSelection();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection();
        break;
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0) {
          const product = this.filteredProducts[this.selectedIndex];
          // Мгновенно закрываем поиск и переходим
          this.deactivateSearch();
          navigate(buildProductUrlWithConfig(product.id));
        }
        break;
      case 'Escape':
        this.deactivateSearch();
        break;
    }
  }

  updateSelection() {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;
    const suggestions = dropdown.querySelectorAll('.search-suggestion');
    suggestions.forEach((el, idx) => {
      el.classList.toggle('selected', idx === this.selectedIndex);
      if (idx === this.selectedIndex) {
        try {
          el.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
          });
        } catch {}
      }
    });
  }

  // Универсальная анимация изменения высоты dropdown при смене контента
  animateDropdownHeight(updateContentFn) {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;

    const wasHidden = !dropdown.classList.contains('show');
    const startHeight = wasHidden ? 0 : dropdown.offsetHeight;

    // Обновляем контент и гарантируем видимость
    updateContentFn();
    dropdown.classList.add('show');

    // Вычисляем целевую высоту с учётом max-height
    const computed = window.getComputedStyle(dropdown);
    const maxH = parseFloat(computed.maxHeight);
    let targetHeight = dropdown.scrollHeight;
    if (!isNaN(maxH)) {
      targetHeight = Math.min(targetHeight, maxH);
    }

    if (wasHidden || Math.abs(targetHeight - startHeight) < 1) {
      // Первый показ или без изменения — не анимируем
      return;
    }

    dropdown.style.overflow = 'hidden';
    dropdown.style.height = `${startHeight}px`;
    dropdown.style.transition = 'height 200ms var(--ease-emphasized)';

    requestAnimationFrame(() => {
      dropdown.style.height = `${targetHeight}px`;
    });

    const onEnd = (e) => {
      if (e && e.propertyName !== 'height') return;
      dropdown.removeEventListener('transitionend', onEnd);
      dropdown.style.transition = '';
      dropdown.style.height = '';
    };
    dropdown.addEventListener('transitionend', onEnd);
    setTimeout(() => {
      dropdown.removeEventListener('transitionend', onEnd);
      dropdown.style.transition = '';
      dropdown.style.height = '';
    }, 260);
  }

  hideSearchDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
      
      // Сбрасываем стили блокировки скролла
      dropdown.style.overflow = '';
      dropdown.style.touchAction = '';
      dropdown.style.webkitOverflowScrolling = '';
      dropdown.style.overscrollBehavior = '';
      this.disableEdgeScrollLock();
    }
  }

  // Блокировка iOS bounce на границах внутреннего скролла dropdown
  enableEdgeScrollLock(container) {
    this.disableEdgeScrollLock();
    let startY = 0;
    const onTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        startY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const atTop = container.scrollTop <= 0;
      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
      if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    this._edgeLockCleanup = () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      this._edgeLockCleanup = null;
    };
  }

  disableEdgeScrollLock() {
    if (this._edgeLockCleanup) {
      this._edgeLockCleanup();
    }
  }

  activateSearch() {
    // Закрываем меню если оно открыто
    if (this.menu && !this.menu.classList.contains('menu-closed')) {
      this.closeMenu();
    }
    
    this.isSearchActive = true;
    document.body.classList.add('search-active');
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay) {
      searchOverlay.classList.add('show');
    }
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
      searchContainer.classList.add('search-active');
    }
  }

  deactivateSearch() {
    this.isSearchActive = false;
    document.body.classList.remove('search-active');
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay) {
      searchOverlay.classList.remove('show');
    }
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
      searchContainer.classList.remove('search-active');
    }
    this.hideSearchDropdown();
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = '';
      searchInput.blur();
    }
    // Убеждаемся, что все товары категории отображаются
    this.displayProducts(this.currentProducts);
    
    // Сбрасываем флаг для анимации при следующем открытии
    this.isFirstTimeOpen = true;
  }

  showAllProducts() {
    this.displayProducts(this.currentProducts);
  }

  loadCategoryData() {
    // Получаем данные категории
    const category = categoryData[this.currentCategory];
    if (!category) {
      // Если категория не найдена, перенаправляем на главную
      navigate('index.html');
      return;
    }

    // Обновляем заголовок страницы
    document.title = `${category.name} - App`;
    
    // Обновляем заголовок категории
    const titleElement = document.getElementById('category-title');
    
    if (titleElement) {
      titleElement.textContent = category.name;
    }

    // Загружаем товары категории
    this.currentProducts = getProductsByCategory(this.currentCategory);
    this.displayProducts(this.currentProducts);
  }

  displayProducts(products) {
    const container = document.getElementById('category-products');
    const noProductsElement = document.getElementById('no-products');
    
    if (!container) return;

    // Очищаем контейнер
    container.innerHTML = '';

    if (products.length === 0) {
      // Показываем сообщение об отсутствии товаров
      if (noProductsElement) {
        noProductsElement.classList.remove('is-hidden');
      }
      return;
    }

    // Скрываем сообщение об отсутствии товаров
    if (noProductsElement) {
      noProductsElement.classList.add('is-hidden');
    }

    // Создаем карточки товаров
    products.forEach(product => {
      const card = this.createProductCard(product);
      container.appendChild(card);
    });
  }

  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'category-product-card';
    
    let priceHTML = `<span class="category-product-price-current">${formatPriceCard(product.price)}</span>`;
    if (product.oldPrice) {
      priceHTML += `<span class="category-product-price-old">${formatPriceCard(product.oldPrice, '₽', true)}</span>`;
    }
    
    card.innerHTML = `
      <img src="${product.images[0]}" alt="${product.title}" />
      <div class="category-product-title">${product.title}</div>
      <div class="category-product-category">${product.category}</div>
      <div class="category-product-price">${priceHTML}</div>
    `;
    
    // Добавляем обработчик клика для перехода на страницу товара
    card.addEventListener('click', () => {
      navigate(buildProductUrlWithConfig(product.id));
    });
    // Fast-tap с защитой от скролла/удержания
    let ftX=0, ftY=0, ftT=0, scY=0, scX=0; const MOVE=8, HOLD=300;
    const pd=(e)=>{ ftX=e.clientX; ftY=e.clientY; ftT=performance.now(); scY=window.scrollY; scX=window.scrollX; card.__moved=false; };
    const pm=(e)=>{ if(!ftT) return; if(Math.abs(e.clientX-ftX)>MOVE || Math.abs(e.clientY-ftY)>MOVE || Math.abs(window.scrollY-scY)>0 || Math.abs(window.scrollX-scX)>0) card.__moved=true; };
    const pu=()=>{ const dur=performance.now()-(ftT||performance.now()); const ok=!card.__moved && dur<=HOLD; ftT=0; if(!ok) return; if(card.__fastTapLock) return; card.__fastTapLock=true; try{ navigate(buildProductUrlWithConfig(product.id));} finally { setTimeout(()=>{ card.__fastTapLock=false; },300);} };
    card.addEventListener('pointerdown', pd, { passive: true });
    card.addEventListener('pointermove', pm, { passive: true });
    card.addEventListener('pointerup', pu, { passive: true });
    card.addEventListener('touchend', pu, { passive: true });
    
    return card;
  }
}

let currentInstance = null;

export async function mountCategory(appContainer, params = {}) {
  // Вставляем разметку категории
  appContainer.innerHTML = categoryTemplate();
  // Кнопка "Вернуться на главную"
  const backBtn = document.getElementById('back-to-main-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      navigate('index.html');
    });
  }
  // Инициализируем страницу с категорией из params
  currentInstance = new CategoryPage(params?.category);
}

export function unmountCategory() {
  if (currentInstance) {
    try {
      currentInstance.destroy?.();
    } catch {}
    currentInstance = null;
  }
  const app = document.querySelector('#app');
  if (app) app.innerHTML = '';
}