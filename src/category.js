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
 

class CategoryPage {
  constructor() {
    this.currentCategory = null;
    this.currentProducts = [];
    this.filteredProducts = [];
    this._edgeLockCleanup = null;
    this.init();
  }

  init() {
    // Получаем категорию из URL
    const urlParams = new URLSearchParams(window.location.search);
    this.currentCategory = urlParams.get('category');
    
    console.log('DEBUG CATEGORY: window.location.search:', window.location.search);
    console.log('DEBUG CATEGORY: currentCategory:', this.currentCategory);
    console.log('DEBUG CATEGORY: window.location.href:', window.location.href);
    
    if (!this.currentCategory) {
      // Если категория не указана, перенаправляем на главную
      console.log('DEBUG CATEGORY: No category found, redirecting to main');
      navigate('index.html');
      return;
    }

    // Инициализируем компоненты
    this.initSearch();
    this.loadCategoryData();
  }

  // initMenu удалён — меню больше нет



  initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-dropdown');

    if (!searchInput) return;

    let searchTimeout;
    this.isSearchActive = false;
    this.isFirstTimeOpen = true; // Флаг для первого открытия

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
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container') && !e.target.closest('.header-container')) {
        this.hideSearchDropdown();
        if (this.isSearchActive) {
          this.deactivateSearch();
        }
      }
    });
    
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
    document.addEventListener('wheel', (e) => {
      if (this.isSearchActive) {
        // Разрешаем скролл внутри search-dropdown
        if (e.target.closest('.search-dropdown')) {
          return;
        }
        e.preventDefault();
        this.deactivateSearch();
      }
    }, { passive: false });
    
    // Обработчик для touch событий на мобильных устройствах
    document.addEventListener('touchmove', (e) => {
      if (this.isSearchActive) {
        // Разрешаем скролл внутри search-dropdown
        if (e.target.closest('.search-dropdown')) {
          return;
        }
        e.preventDefault();
        this.deactivateSearch();
      }
    }, { passive: false });
  
  // Обработчик для блокировки всех кликов при активном поиске
  document.addEventListener('click', (e) => {
    if (this.isSearchActive) {
      // Разрешаем клики только в зоне поиска и в меню (если оно есть)
      if (e.target.closest('.search-container') || e.target.closest('#menu')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this.deactivateSearch();
    }
  }, { capture: true });

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
        if (dMoved || dRecent) { try { e.preventDefault(); } catch {} try { e.stopPropagation(); } catch {} dMoved = false; dRecent = false; }
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

    if (searchResults.length > 0) {
      this.showSearchDropdown(searchResults.slice(0, 5)); // Показываем до 5 результатов
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
      products.forEach(product => {
        const suggestion = this.createSearchSuggestion(product);
        dropdown.appendChild(suggestion);
      });
      dropdown.classList.add('show');
    });

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

  createSearchSuggestion(product) {
    const suggestion = document.createElement('div');
    suggestion.className = 'search-suggestion';
    
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

    // Обработчик клика по предложению с анимацией
    suggestion.addEventListener('click', (e) => {
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
        navigate(`product.html?product=${product.id}`);
      }, 120);
    });

    // Fast-tap с защитой от скролла/удержания + учёт прокрутки дропдауна
    let sX=0,sY=0,sT=0,sScY=0,sScX=0,sDDTop=0; const S_MOVE=8,S_HOLD=300;
    const sPD=(e)=>{ sX=e.clientX; sY=e.clientY; sT=performance.now(); sScY=window.scrollY; sScX=window.scrollX; sDDTop = (document.getElementById('search-dropdown')?.scrollTop)||0; suggestion.__moved=false; };
    const sPM=(e)=>{ if(!sT) return; const ddTop=(document.getElementById('search-dropdown')?.scrollTop)||0; if (Math.abs(e.clientX-sX)>S_MOVE || Math.abs(e.clientY-sY)>S_MOVE || Math.abs(window.scrollY-sScY)>0 || Math.abs(window.scrollX-sScX)>0 || Math.abs(ddTop - sDDTop)>0) suggestion.__moved=true; };
    const sPC=()=>{ suggestion.__moved=true; sT=0; };
    const sPU=(e)=>{ const dur=performance.now()-(sT||performance.now()); const ddTop=(document.getElementById('search-dropdown')?.scrollTop)||0; const scrolled=Math.abs(ddTop - sDDTop)>0; const ok=!suggestion.__moved && !scrolled && dur<=S_HOLD; sT=0; if(!ok) return; if (suggestion.__fastTapLock) return; suggestion.__fastTapLock=true; try { try { e && e.preventDefault && e.preventDefault(); } catch {} try { e && e.stopPropagation && e.stopPropagation(); } catch {} this.deactivateSearch(); navigate(`product.html?product=${product.id}`);} finally { setTimeout(()=>{ suggestion.__fastTapLock=false; }, 250);} };
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
    dropdown.style.transition = 'height 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';

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
        noProductsElement.style.display = 'block';
      }
      return;
    }

    // Скрываем сообщение об отсутствии товаров
    if (noProductsElement) {
      noProductsElement.style.display = 'none';
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
      navigate(`product.html?product=${product.id}`);
    });
    // Fast-tap с защитой от скролла/удержания
    let ftX=0, ftY=0, ftT=0, scY=0, scX=0; const MOVE=8, HOLD=300;
    const pd=(e)=>{ ftX=e.clientX; ftY=e.clientY; ftT=performance.now(); scY=window.scrollY; scX=window.scrollX; card.__moved=false; };
    const pm=(e)=>{ if(!ftT) return; if(Math.abs(e.clientX-ftX)>MOVE || Math.abs(e.clientY-ftY)>MOVE || Math.abs(window.scrollY-scY)>0 || Math.abs(window.scrollX-scX)>0) card.__moved=true; };
    const pu=()=>{ const dur=performance.now()-(ftT||performance.now()); const ok=!card.__moved && dur<=HOLD; ftT=0; if(!ok) return; if(card.__fastTapLock) return; card.__fastTapLock=true; try{ navigate(`product.html?product=${product.id}`);} finally { setTimeout(()=>{ card.__fastTapLock=false; },300);} };
    card.addEventListener('pointerdown', pd, { passive: true });
    card.addEventListener('pointermove', pm, { passive: true });
    card.addEventListener('pointerup', pu, { passive: true });
    card.addEventListener('touchend', pu, { passive: true });
    
    return card;
  }
}

// Класс для управления блокировкой кликов при открытом меню или поиске
class ClickBlocker {
  constructor() {
    this.isMenuOpen = false;
    this.isSearchOpen = false;
    this.blockedElements = new Set();
    this.init();
  }

  init() {
    // Отслеживаем изменения в меню
    const menu = document.getElementById('menu');
    if (menu) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            this.isMenuOpen = !menu.classList.contains('menu-closed');
            this.updateBlockState();
          }
        });
      });
      observer.observe(menu, { attributes: true });
    }

    // Отслеживаем изменения в поиске
    const searchDropdown = document.getElementById('search-dropdown');
    if (searchDropdown) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            this.isSearchOpen = searchDropdown.classList.contains('show');
            this.updateBlockState();
          }
        });
      });
      observer.observe(searchDropdown, { attributes: true });
    }
  }

  updateBlockState() {
    const shouldBlock = this.isMenuOpen || this.isSearchOpen;
    
    if (shouldBlock) {
      this.blockClicks();
    } else {
      this.unblockClicks();
    }
  }

  blockClicks() {
    // Блокируем клики по карточкам товаров
    const productCards = document.querySelectorAll('.category-product-card, .category-card');
    productCards.forEach(card => {
      if (!this.blockedElements.has(card)) {
        card.style.pointerEvents = 'none';
        this.blockedElements.add(card);
      }
    });
  }

  unblockClicks() {
    // Разблокируем клики по карточкам товаров
    this.blockedElements.forEach(card => {
      card.style.pointerEvents = '';
    });
    this.blockedElements.clear();
  }
}

// Инициализируем страницу категории
document.addEventListener('DOMContentLoaded', () => {
  new CategoryPage();
  const clickBlocker = new ClickBlocker();
});