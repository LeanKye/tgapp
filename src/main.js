import './style.css'
import { getAllProducts, categoryData, formatPrice, formatPriceCard, bannerData } from './products-data.js'
 
// Универсальная навигация: используем стек AppNav при наличии
function navigate(path) {
  if (window.AppNav && typeof window.AppNav.go === 'function') {
    return window.AppNav.go(path);
  }
  const basePath = window.location.pathname.replace(/[^/]*$/, '');
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  window.location.href = basePath + normalized;
}
 

// Функция для создания карточки товара
function createProductCard(product) {
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
  card.addEventListener('click', (e) => {
    const now = performance.now();
    const container = card.parentElement && card.parentElement.classList && card.parentElement.classList.contains('category-products-slider') ? card.parentElement : null;
    const recentGlobalBlock = window.__homeFastTapBlockClickUntil && now < window.__homeFastTapBlockClickUntil;
    const recentContainerScroll = container && container.__lastScrollTime && (now - container.__lastScrollTime) < 400;
    const recentPageScroll = window.__lastPageScrollTime && (now - window.__lastPageScrollTime) < 400;
    if (recentGlobalBlock || recentContainerScroll || recentPageScroll) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate(`product.html?product=${product.id}`);
  });
  // Fast-tap с защитой от скролла/удержания
  let ftStartX = 0, ftStartY = 0, ftStartTime = 0, ftScrollY = 0, ftScrollX = 0, ftScrollLeft = 0;
  const FT_MOVE = 8; const FT_HOLD = 300;
  const onPD = (e) => { const container = card.parentElement && card.parentElement.classList && card.parentElement.classList.contains('category-products-slider') ? card.parentElement : null; ftStartX = e.clientX; ftStartY = e.clientY; ftStartTime = performance.now(); ftScrollY = window.scrollY; ftScrollX = window.scrollX; ftScrollLeft = container && typeof container.scrollLeft === 'number' ? container.scrollLeft : 0; card.__ftMoved = false; };
  const onPM = (e) => {
    if (!ftStartTime) return;
    const container = card.parentElement && card.parentElement.classList && card.parentElement.classList.contains('category-products-slider') ? card.parentElement : null;
    const scrolledH = container && Math.abs(container.scrollLeft - ftScrollLeft) > 0;
    const scrolledV = Math.abs(window.scrollY - ftScrollY) > 0 || Math.abs(window.scrollX - ftScrollX) > 0;
    const scrolled = scrolledH || scrolledV;
    if (
      Math.abs(e.clientX - ftStartX) > FT_MOVE ||
      Math.abs(e.clientY - ftStartY) > FT_MOVE ||
      scrolled
    ) {
      card.__ftMoved = true;
      if (scrolled) {
        window.__homeFastTapBlockClickUntil = performance.now() + 400;
      }
    }
  };
  const onPU = () => {
    const hadDown = !!ftStartTime;
    const dur = performance.now() - (ftStartTime || performance.now());
    const container = card.parentElement && card.parentElement.classList && card.parentElement.classList.contains('category-products-slider') ? card.parentElement : null;
    const scrolledH = container && Math.abs(container.scrollLeft - ftScrollLeft) > 0;
    const scrolledV = Math.abs(window.scrollY - ftScrollY) > 0 || Math.abs(window.scrollX - ftScrollX) > 0;
    const scrolled = scrolledH || scrolledV;
    const shouldFire = hadDown && !card.__ftMoved && !scrolled && dur <= FT_HOLD;
    ftStartTime = 0;
    if (!shouldFire) {
      if (scrolled || dur > FT_HOLD) {
        window.__homeFastTapBlockClickUntil = performance.now() + 400;
      }
      return;
    }
    if (card.__fastTapLock) return;
    card.__fastTapLock = true;
    try { navigate(`product.html?product=${product.id}`); } finally { setTimeout(() => { card.__fastTapLock = false; }, 300); }
  };
  card.addEventListener('pointerdown', onPD, { passive: true });
  card.addEventListener('pointermove', onPM, { passive: true });
  card.addEventListener('pointerup', onPU, { passive: true });
  card.addEventListener('touchend', onPU, { passive: true });
  
  return card;
}

// Функция для рендеринга товаров в секции "Новинки"
function renderNewProducts() {
  const container = document.querySelector('.category-products-slider');
  const products = getAllProducts();
  
  // Очищаем контейнер
  container.innerHTML = '';
  
  // Добавляем карточки товаров
  products.forEach(product => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
  
  // Принудительно сбрасываем позицию прокрутки в начало
  setTimeout(() => {
    container.scrollLeft = 0;
  }, 0);

  // Ленивая загрузка отключена — изображения грузятся сразу
  // Отслеживаем горизонтальный скролл контейнера, чтобы блокировать клики во время инерции
  const markScroll = () => { container.__lastScrollTime = performance.now(); };
  container.addEventListener('scroll', markScroll, { passive: true });
}

// Функция для рендеринга категорий
function renderCategories() {
  const container = document.getElementById('categories-grid');
  if (!container) return;
  
  // Очищаем контейнер
  container.innerHTML = '';
  
  // Фиксированный порядок и ширина последней
  const order = ['Дизайн', 'Нейросети', 'Microsoft', 'Игры', 'Подписки'];
  order.forEach((name, index) => {
    const category = categoryData[name];
    if (!category) return;
    const card = createCategoryCard(category, index);
    // Последняя карточка шире на 2 колонки
    if (index === order.length - 1) {
      card.style.gridColumn = 'span 2';
    }
    container.appendChild(card);
  });

  // Ленивая загрузка отключена — фоны категорий выставляются сразу
}

// Функция для создания карточки категории
function createCategoryCard(category, index) {
  const card = document.createElement('div');
  card.className = 'category-card';
  
  // Устанавливаем фоновое изображение сразу
  card.style.backgroundImage = `url("${category.image}")`;
  
  // Для последней карточки делаем её на 2 колонки (как в оригинальном дизайне)
  if (index === Object.keys(categoryData).length - 1) {
    card.style.gridColumn = 'span 2';
  }
  
  card.innerHTML = `
    <div class="category-card-content">
      <div class="category-card-title">${category.name}</div>
    </div>
  `;
  
  // Добавляем обработчик клика для перехода на страницу категории
  card.addEventListener('click', (e) => {
    const now = performance.now();
    const recentGlobalBlock = window.__homeFastTapBlockClickUntil && now < window.__homeFastTapBlockClickUntil;
    const recentPageScroll = window.__lastPageScrollTime && (now - window.__lastPageScrollTime) < 400;
    if (recentGlobalBlock || recentPageScroll) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate(`category.html?category=${encodeURIComponent(category.name)}`);
  });
  // Fast-tap с защитой от скролла/удержания (такая же логика, как у карточек товаров)
  let ftStartX2 = 0, ftStartY2 = 0, ftStartTime2 = 0, ftScrollY2 = 0, ftScrollX2 = 0;
  const FT_MOVE = 8; const FT_HOLD = 300;
  const onPD2 = (e) => {
    ftStartX2 = e.clientX; ftStartY2 = e.clientY; ftStartTime2 = performance.now();
    ftScrollY2 = window.scrollY; ftScrollX2 = window.scrollX; card.__ftMoved2 = false;
  };
  const onPM2 = (e) => {
    if (!ftStartTime2) return;
    const scrolled = Math.abs(window.scrollY - ftScrollY2) > 0 || Math.abs(window.scrollX - ftScrollX2) > 0;
    if (
      Math.abs(e.clientX - ftStartX2) > FT_MOVE ||
      Math.abs(e.clientY - ftStartY2) > FT_MOVE ||
      scrolled
    ) {
      card.__ftMoved2 = true;
      if (scrolled) {
        window.__homeFastTapBlockClickUntil = performance.now() + 400;
      }
    }
  };
  const onPU2 = () => {
    const hadDown = !!ftStartTime2;
    const dur = performance.now() - (ftStartTime2 || performance.now());
    const scrolled = Math.abs(window.scrollY - ftScrollY2) > 0 || Math.abs(window.scrollX - ftScrollX2) > 0;
    const shouldFire = hadDown && !card.__ftMoved2 && !scrolled && dur <= FT_HOLD;
    ftStartTime2 = 0;
    if (!shouldFire) {
      if (scrolled || dur > FT_HOLD) {
        window.__homeFastTapBlockClickUntil = performance.now() + 400;
      }
      return;
    }
    if (card.__fastTapLock2) return;
    card.__fastTapLock2 = true;
    try { navigate(`category.html?category=${encodeURIComponent(category.name)}`); } finally { setTimeout(() => { card.__fastTapLock2 = false; }, 300); }
  };
  card.addEventListener('pointerdown', onPD2, { passive: true });
  card.addEventListener('pointermove', onPM2, { passive: true });
  card.addEventListener('pointerup', onPU2, { passive: true });
  card.addEventListener('touchend', onPU2, { passive: true });
  
  return card;
}



// Функциональность баннер-слайдера с бесконечным loop и перетягиванием (как у Я.Маркета)
class BannerSlider {
  constructor() {
    this.slider = document.getElementById('bannerSlider');
    this.bannerData = bannerData;
    this.totalBanners = this.bannerData.length;

    // Данные для loop: [clone(last), ...originals..., clone(first)]
    this.extendedData = this.createExtendedData();
    this.totalExtendedBanners = this.extendedData.length; // = totalBanners + 2
    // Начинаем на первом реальном слайде (index = 1)
    this.startIndex = 1;
    this.currentIndex = this.startIndex;
    
    this.gap = 0;
    this.isTransitioning = false;
    
    // Pointer/drag переменные
    this.isDragging = false;
    this.pointerId = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragLastX = 0;
    this.dragLastTime = 0;
    this.startTranslateX = 0;
    this.currentTranslateX = 0;
    this.velocityX = 0;
    this.dragDirection = null; // 'horizontal' | 'vertical' | null
    this.dragThreshold = 8; // px
    this.minDragToChange = 0.2; // доля ширины слайда для переключения при медленном перетягивании
    this.wasDraggedRecently = false;

    // Флаги не нужны для loop
    
    // Автопрокрутка переменные
    this.autoSlideInterval = null;
    this.autoSlideDelay = 5000;
    this.pauseDuration = 10000;
    this.pauseTimer = null;
    
    this.init();
  }

  init() {
    // Рендерим баннеры из расширенных данных (с клонами)
    this.renderBanners();
    
    // Получаем все баннеры
    this.allBanners = Array.from(this.slider.querySelectorAll('.banner-item'));
    
    // Создаем пагинацию
    this.createPagination();

    // Устанавливаем начальное позиционирование без анимации
    this.setPositionWithoutTransition(this.currentIndex);
    
    // Добавляем обработчики событий
    this.addEventListeners();

    // Автоматическое переключение
    this.startAutoSlide();
    
    // Добавляем поддержку перетягивания мышью и тачем через Pointer Events
    this.initPointerEvents();
  }

  // Создаём расширенный массив данных для бесконечного цикла
  createExtendedData() {
    const first = this.bannerData[0];
    const last = this.bannerData[this.totalBanners - 1];
    return [
      { ...last, __cloned: true },
      ...this.bannerData.map(b => ({ ...b })),
      { ...first, __cloned: true }
    ];
  }

  // Рендеринг баннеров
  renderBanners() {
    this.slider.innerHTML = '';
    
    this.extendedData.forEach((banner, index) => {
      const bannerElement = this.createBannerElement(banner, index);
      this.slider.appendChild(bannerElement);
    });
  }

  // Создаем пагинацию-точки
  createPagination() {
    const container = this.slider.parentElement;
    // Удаляем старую пагинацию, если есть
    const old = container.querySelector('.banner-pagination');
    if (old) old.remove();
    const pagination = document.createElement('div');
    pagination.className = 'banner-pagination';
    
    for (let i = 0; i < this.totalBanners; i += 1) {
      const dot = document.createElement('div');
      dot.className = 'banner-dot' + (i === this.currentIndex ? ' active' : '');
      dot.dataset.index = String(i);
      dot.addEventListener('click', () => {
        this.setActive(i, true);
      });
      // Fast-tap для точек пагинации с защитой от скролла/удержания
      let dSX = 0, dSY = 0, dST = 0, dScrollY = 0, dScrollX = 0; const MOVE=8, HOLD=300;
      const pd = (e) => { dSX=e.clientX; dSY=e.clientY; dST=performance.now(); dScrollY=window.scrollY; dScrollX=window.scrollX; dot.__moved=false; };
      const pm = (e) => { if (!dST) return; if (Math.abs(e.clientX-dSX)>MOVE || Math.abs(e.clientY-dSY)>MOVE || Math.abs(window.scrollY-dScrollY)>0 || Math.abs(window.scrollX-dScrollX)>0) dot.__moved=true; };
      const pu = () => { const dur=performance.now()-(dST||performance.now()); const ok=!dot.__moved && dur<=HOLD; dST=0; if(!ok) return; if (dot.__fastTapLock) return; dot.__fastTapLock=true; try{ this.setActive(i, true);}finally{ setTimeout(()=>{dot.__fastTapLock=false;},250);} };
      dot.addEventListener('pointerdown', pd, { passive: true });
      dot.addEventListener('pointermove', pm, { passive: true });
      dot.addEventListener('pointerup', pu, { passive: true });
      dot.addEventListener('touchend', pu, { passive: true });
      pagination.appendChild(dot);
    }
    container.appendChild(pagination);
    this.paginationEl = pagination;
  }

  updatePaginationActive(activeIndex) {
    if (!this.paginationEl) return;
    const dots = this.paginationEl.querySelectorAll('.banner-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  // Создание элемента баннера
  createBannerElement(banner, index) {
    const bannerItem = document.createElement('div');
    bannerItem.className = 'banner-item';
    bannerItem.dataset.bannerId = banner.id;
    
    // Определяем оригинальный индекс для активации (без учёта клонов)
    const originalIndex = this.normalizeOriginalIndex(index);
    bannerItem.dataset.originalIndex = originalIndex;
    
    // Устанавливаем цвет фона
    bannerItem.style.backgroundColor = banner.backgroundColor;
    
    bannerItem.innerHTML = `
      <div class="banner-content">
        <h3>${banner.title}</h3>
        <p>${banner.subtitle}</p>
      </div>
    `;
    
    return bannerItem;
  }

  // Добавление обработчиков событий
  addEventListeners() {
    this.allBanners.forEach((banner, index) => {
      banner.addEventListener('click', () => {
        const isActive = banner.classList.contains('active');
        const originalIndex = parseInt(banner.dataset.originalIndex);
        
        if (isActive) {
          // Если баннер уже активен - переходим на страницу
          this.handleBannerClick(originalIndex);
        } else {
          // Если баннер неактивен - активируем его
          this.setActive(index, true);
        }
      });
    });
  }

  // Обработка клика по баннеру
  handleBannerClick(originalIndex) {
    const banner = this.bannerData[originalIndex];
    if (!banner) return;
    
    switch (banner.action) {
      case 'category':
        navigate(`category.html?category=${encodeURIComponent(banner.actionParams.category)}`);
        break;
      case 'product':
        navigate(`product.html?product=${banner.actionParams.productId}`);
        break;
      case 'url':
        window.location.href = banner.actionParams.url;
        break;
      default:
        console.log('Неизвестное действие баннера:', banner.action);
    }
  }

  // Установка активного баннера с анимацией
  setActive(index, isUserInteraction = false) {
    if (this.isTransitioning) return;
    
    // Нормализуем индекс
    if (index < 0) index = 0;
    if (index >= this.totalExtendedBanners) index = this.totalExtendedBanners - 1;
    
    if (index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    if (isUserInteraction) {
      this.pauseAutoSlide();
    }
    
    // Обновляем активные классы
    this.updateActiveClasses(index);
    this.updatePaginationActive(this.normalizeOriginalIndex(index));
    
    // Анимируем переход
    this.animateToPosition(index);
    this.currentIndex = index;

    // После завершения анимации проверяем и выполняем незаметную перемотку с клонов
    const onEnd = () => {
      this.slider.removeEventListener('transitionend', onEnd);
      this.checkAndRewind();
      this.isTransitioning = false;
    };
    // Fallback таймер на случай отсутствия события
    const fallback = setTimeout(() => {
      this.slider.removeEventListener('transitionend', onEnd);
      this.checkAndRewind();
      this.isTransitioning = false;
    }, 400);
    this.slider.addEventListener('transitionend', () => {
      clearTimeout(fallback);
      onEnd();
    }, { once: true });
  }

  // Установка позиции без анимации
  setPositionWithoutTransition(index) {
    this.slider.style.transition = 'none';
    this.updateActiveClasses(index);
    this.updateSliderPosition(index);
    this.currentIndex = index;
    // Сохраняем текущий translateX
    this.currentTranslateX = this.computeTranslateForIndex(index);
    this.updatePaginationActive(this.normalizeOriginalIndex(index));
    
    // Возвращаем анимацию
    requestAnimationFrame(() => {
      this.slider.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
  }

  // Обновление активных классов
  updateActiveClasses(activeIndex) {
    this.allBanners.forEach((banner, index) => {
      banner.classList.toggle('active', index === activeIndex);
    });
  }

  // Анимация перехода к позиции
  animateToPosition(index) {
    // Смягчаем wrap-переходы между клонами и реальными слайдами
    const isWrap = (this.currentIndex === 1 && index === this.totalExtendedBanners - 1) ||
                   (this.currentIndex === this.totalExtendedBanners - 2 && index === 0);
    const duration = isWrap ? 450 : 300;
    this.slider.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    this.updateSliderPosition(index);
  }

  // Обновление позиции слайдера
  updateSliderPosition(index) {
    const containerWidth = this.slider.parentElement.offsetWidth;
    const bannerWidth = this.getBannerWidth();
    
    // Базовое смещение для центрирования
    const baseCenterOffset = (containerWidth - bannerWidth) / 2;
    
    // Смещение для текущего активного элемента
    const activeSlideOffset = index * (bannerWidth + this.gap);
    
    // Итоговое смещение
    const finalOffset = baseCenterOffset - activeSlideOffset;
    
    this.slider.style.transform = `translateX(${finalOffset}px)`;
    this.currentTranslateX = finalOffset;
  }

  // Вычисление translateX для индекса
  computeTranslateForIndex(index) {
    const containerWidth = this.slider.parentElement.offsetWidth;
    const bannerWidth = this.getBannerWidth();
    const baseCenterOffset = (containerWidth - bannerWidth) / 2;
    const activeSlideOffset = index * (bannerWidth + this.gap);
    return baseCenterOffset - activeSlideOffset;
  }

  // Возвращает оригинальный индекс [0..totalBanners-1] для расширенного индекса
  normalizeOriginalIndex(extendedIndex) {
    if (extendedIndex === 0) return this.totalBanners - 1;
    if (extendedIndex === this.totalExtendedBanners - 1) return 0;
    return extendedIndex - 1;
  }

  // Невидимая перемотка с клонов на реальные элементы
  checkAndRewind() {
    if (this.currentIndex === 0) {
      // были на левом клоне — перематываем на последний реальный
      this.setPositionWithoutTransition(this.totalBanners);
    } else if (this.currentIndex === this.totalExtendedBanners - 1) {
      // были на правом клоне — перематываем на первый реальный
      this.setPositionWithoutTransition(1);
    }
  }

  // Получение ширины баннера
  getBannerWidth() {
    // Привязываем шаг к ширине контейнера, чтобы центральный слайд занимал всё место
    const container = this.slider?.parentElement;
    if (container) {
      return container.offsetWidth;
    }
    return window.innerWidth;
  }

  // Следующий слайд
  nextSlide(isUserInteraction = false) {
    this.setActive(this.currentIndex + 1, isUserInteraction);
  }

  // Предыдущий слайд
  prevSlide(isUserInteraction = false) {
    this.setActive(this.currentIndex - 1, isUserInteraction);
  }

  // Инициализация Pointer Events для перетягивания
  initPointerEvents() {
    const container = this.slider.parentElement;
    let originalTouchAction = container.style.touchAction || '';
    const onPointerDown = (e) => {
      // Инициализируем перетягивание
      // Если стоим на клоне — мгновенно перематываем к реальному, чтобы избежать "залипаний"
      this.ensureRealIndexOnInteraction();
      // Прерываем текущую анимацию
      this.isTransitioning = false;
      this.isDragging = true;
      this.pointerId = e.pointerId;
      container.setPointerCapture(this.pointerId);
      // Разрешаем вертикальный скролл до определения направления
      originalTouchAction = container.style.touchAction || '';
      container.style.touchAction = 'pan-y';
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.dragLastX = e.clientX;
      this.dragLastTime = performance.now();
      // Берём фактическую текущую позицию translateX, а не вычисляемую — это устойчиво при быстрых свайпах
      this.currentTranslateX = this.getCurrentTranslateX();
      this.startTranslateX = this.currentTranslateX;
      this.velocityX = 0;
      this.wasDraggedRecently = false;
      this.dragDirection = null;
      // Отключаем анимацию на время драга
      this.slider.style.transition = 'none';
      // Приостанавливаем автопрокрутку
      this.pauseAutoSlide();
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || e.pointerId !== this.pointerId) return;
      const now = performance.now();

      // Определяем направление жеста один раз после преодоления порога
      if (this.dragDirection === null) {
        const absDx = Math.abs(e.clientX - this.dragStartX);
        const absDy = Math.abs(e.clientY - this.dragStartY);
        if (absDx > this.dragThreshold || absDy > this.dragThreshold) {
          if (absDx > absDy) {
            this.dragDirection = 'horizontal';
            // Блокируем нативный скролл страницы при горизонтальном драге (iOS Safari)
            container.style.touchAction = 'none';
          } else {
            this.dragDirection = 'vertical';
            // Прерываем перетягивание для вертикального свайпа — отдаём скролл странице
            container.releasePointerCapture(this.pointerId);
            this.isDragging = false;
            this.pointerId = null;
            // Возвращаем анимацию, если отключали
            this.slider.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            // Восстанавливаем touch-action
            container.style.touchAction = originalTouchAction || 'pan-y';
            return;
          }
        } else {
          // Порог не пройден — ничего не делаем
          return;
        }
      }

      // Обрабатываем только горизонтальное перетягивание
      if (this.dragDirection !== 'horizontal') return;

      const deltaX = e.clientX - this.dragStartX;

      // Резинка на краях (только за пределы клонов)
      const bannerWidth = this.getBannerWidth();
      const step = bannerWidth + this.gap;
      const minTranslate = this.computeTranslateForIndex(this.totalExtendedBanners - 1);
      const maxTranslate = this.computeTranslateForIndex(0);
      let nextTranslate = this.startTranslateX + deltaX;
      if (nextTranslate > maxTranslate) {
        const over = nextTranslate - maxTranslate;
        nextTranslate = maxTranslate + over * 0.35;
      } else if (nextTranslate < minTranslate) {
        const over = minTranslate - nextTranslate;
        nextTranslate = minTranslate - over * 0.35;
      }
      this.currentTranslateX = nextTranslate;
      this.slider.style.transform = `translateX(${nextTranslate}px)`;

      // Скорость
      const dx = e.clientX - this.dragLastX;
      const dt = Math.max(1, now - this.dragLastTime);
      this.velocityX = dx / dt; // px/ms
      this.dragLastX = e.clientX;
      this.dragLastTime = now;

      if (Math.abs(e.clientX - this.dragStartX) > 5) {
        this.wasDraggedRecently = true;
      }
      // Явно предотвращаем скролл страницы при горизонтальном драге (особенно для iOS)
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const onPointerUpOrCancel = (e) => {
      if (e.pointerId !== this.pointerId) return;
      container.releasePointerCapture(this.pointerId);

      // Если перетягивание не началось горизонтально — просто сброс состояний
      if (!this.isDragging || this.dragDirection !== 'horizontal') {
        this.isDragging = false;
        this.pointerId = null;
        this.dragDirection = null;
        this.slider.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        // Восстанавливаем touch-action
        container.style.touchAction = originalTouchAction || 'pan-y';
        return;
      }

      this.isDragging = false;
      this.pointerId = null;

      // Рассчитываем целевой индекс
      const containerWidth = this.slider.parentElement.offsetWidth;
      const bannerWidth = this.getBannerWidth();
      const step = bannerWidth + this.gap;
      const baseCenterOffset = (containerWidth - bannerWidth) / 2;
      const theoreticalIndex = (baseCenterOffset - this.currentTranslateX) / step;
      let targetIndex = Math.round(theoreticalIndex);

      // Учитываем скорость для "быстрого флика"
      const flickSpeed = 0.5; // px/ms
      const draggedDistance = this.dragLastX - this.dragStartX;
      const isFlick = Math.abs(this.velocityX) > flickSpeed;
      if (isFlick) {
        targetIndex = this.currentIndex + (this.velocityX < 0 ? 1 : -1);
      } else {
        // Медленное перетягивание — переключаем, если пройден порог
        const passedSlides = (Math.abs(draggedDistance) / step);
        if (passedSlides >= this.minDragToChange) {
          targetIndex = this.currentIndex + (draggedDistance < 0 ? 1 : -1);
        }
      }

      // Ограничиваем диапазон
      targetIndex = Math.max(0, Math.min(this.totalExtendedBanners - 1, targetIndex));

      // Возвращаем анимацию
      this.slider.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

      // Если остались на том же слайде — просто вернём в центр
      if (targetIndex === this.currentIndex) {
        this.animateToPosition(this.currentIndex);
      } else {
        this.setActive(targetIndex, true);
      }

      // Сброс временных значений
      this.velocityX = 0;
      this.dragStartX = 0;
      this.dragLastX = 0;
      this.dragDirection = null;
      // Восстанавливаем touch-action после завершения взаимодействия
      container.style.touchAction = originalTouchAction || 'pan-y';
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUpOrCancel);
    container.addEventListener('pointercancel', onPointerUpOrCancel);

    // Блокируем клики по баннерам после перетягивания
    this.allBanners.forEach((banner) => {
      banner.addEventListener('click', (e) => {
        if (this.wasDraggedRecently) {
          e.preventDefault();
          e.stopPropagation();
          this.wasDraggedRecently = false;
        }
      }, { capture: true });
    });
  }

  // Если пользователь начал взаимодействие на клоне, мгновенно переносим на реальный индекс
  ensureRealIndexOnInteraction() {
    if (this.currentIndex === 0) {
      this.setPositionWithoutTransition(this.totalBanners);
    } else if (this.currentIndex === this.totalExtendedBanners - 1) {
      this.setPositionWithoutTransition(1);
    }
  }

  // Считываем текущий translateX из style/computedStyle
  getCurrentTranslateX() {
    const style = window.getComputedStyle(this.slider);
    const transform = style.transform || style.webkitTransform;
    if (!transform || transform === 'none') return 0;
    // matrix(a, b, c, d, tx, ty)
    const match = transform.match(/matrix\(([^)]+)\)/);
    if (match) {
      const parts = match[1].split(',');
      const tx = parseFloat(parts[4]);
      return isNaN(tx) ? 0 : tx;
    }
    // translateX(px)
    const match2 = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
    if (match2) return parseFloat(match2[1]);
    return 0;
  }

  // Методы для jump больше не нужны при loop

  // Запуск автопрокрутки
  startAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    
    this.autoSlideInterval = setInterval(() => {
      if (!this.isTransitioning) {
        this.nextSlide(false);
      }
    }, this.autoSlideDelay);
  }

  // Остановка автопрокрутки
  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  // Приостановка автопрокрутки при взаимодействии пользователя
  pauseAutoSlide() {
    this.stopAutoSlide();
    
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
    }
    
    this.pauseTimer = setTimeout(() => {
      this.startAutoSlide();
    }, this.pauseDuration);
  }

  // Обновление позиции при изменении размера экрана
  updateOnResize() {
    this.updateSliderPosition(this.currentIndex);
  }

  // Очистка ресурсов при уничтожении
  destroy() {
    this.stopAutoSlide();
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
    }
  }
}

// Функциональность поиска
class SearchManager {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.searchDropdown = document.getElementById('search-dropdown');
    this.products = getAllProducts();
    this.selectedIndex = -1;
    this.currentResults = [];
    this.searchTimeout = null;
    this.isSearchActive = false;
    this._edgeLockCleanup = null;
    this.isFirstTimeOpen = true; // Флаг для первого открытия
    
    this.init();
  }

  init() {
    // Обработчик ввода в поисковую строку
    this.searchInput.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });

    // Обработчик клавиш для навигации
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });

    // Скрываем dropdown при клике вне его
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container') && !e.target.closest('.header-container')) {
        this.hideDropdown();
        if (this.isSearchActive) {
          this.deactivateSearch();
        }
      }
    });

    // Показываем dropdown при фокусе всегда
    this.searchInput.addEventListener('focus', () => {
      this.activateSearch();
      if (this.searchInput.value.trim()) {
        this.handleInput(this.searchInput.value);
      } else {
        this.showNoResults();
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
        const input = this.searchInput;
        if (input) {
          input.focus({ preventScroll: true });
          const len = input.value.length;
          if (typeof input.setSelectionRange === 'function') {
            input.setSelectionRange(len, len);
          }
        }
      } catch {}
    };
    this.searchInput.addEventListener('pointerdown', ensureTopAndFocus, { passive: false });
    this.searchInput.addEventListener('touchstart', ensureTopAndFocus, { passive: false });
    
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
      // Разрешаем клики внутри header
      if (e.target.closest('.header-container')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this.deactivateSearch();
    }
  }, { capture: true });
  }

  handleInput(query) {
    // Очищаем предыдущий таймер
    clearTimeout(this.searchTimeout);
    
    // Устанавливаем новый таймер для задержки поиска
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 0);
  }

  performSearch(query) {
    const trimmedQuery = query.trim().toLowerCase();
    
    if (trimmedQuery.length === 0) {
      // Показываем "Ничего не найдено" даже при пустом запросе
      this.showNoResults();
      return;
    }

    // Поиск по товарам
    this.currentResults = this.products.filter(product => {
      return product.title.toLowerCase().includes(trimmedQuery) ||
             product.category.toLowerCase().includes(trimmedQuery);
    });

    this.selectedIndex = -1;
    this.showResults();
  }

  showResults() {
    if (this.currentResults.length === 0) {
      this.showNoResults();
      return;
    }

    // Анимируем изменение высоты при появлении результатов
    this.animateDropdownHeight(() => {
      this.searchDropdown.innerHTML = '';
      this.currentResults.forEach((product, index) => {
        const suggestion = this.createSuggestion(product, index);
        this.searchDropdown.appendChild(suggestion);
      });
    });
  }

  createSuggestion(product, index) {
    const suggestion = document.createElement('div');
    suggestion.className = 'search-suggestion';
    suggestion.dataset.index = index;
    
    suggestion.innerHTML = `
      <img src="${product.images[0]}" alt="${product.title}" />
      <div class="search-suggestion-content">
        <div class="search-suggestion-title">${product.title}</div>
        <div class="search-suggestion-category">${product.category}</div>
      </div>
      <div class="search-suggestion-price">${formatPriceCard(product.price)}</div>
    `;

    // Обработчик клика по предложению с анимацией
    suggestion.addEventListener('click', () => {
      // Добавляем класс анимации
      suggestion.classList.add('clicked');
      
      // Небольшая задержка перед переходом для показа анимации
      setTimeout(() => {
        this.selectProduct(product);
      }, 120);
    });

  // Fast-tap с защитой от скролла/удержания
  let sSX=0,sSY=0,sST=0,sScrollY=0,sScrollX=0; const S_MOVE=8,S_HOLD=300;
  const sPD=(e)=>{ sSX=e.clientX; sSY=e.clientY; sST=performance.now(); sScrollY=window.scrollY; sScrollX=window.scrollX; suggestion.__moved=false; };
  const sPM=(e)=>{ if(!sST) return; if (Math.abs(e.clientX-sSX)>S_MOVE || Math.abs(e.clientY-sSY)>S_MOVE || Math.abs(window.scrollY-sScrollY)>0 || Math.abs(window.scrollX-sScrollX)>0) suggestion.__moved=true; };
  const sPU=()=>{ const dur=performance.now()-(sST||performance.now()); const ok=!suggestion.__moved && dur<=S_HOLD; sST=0; if(!ok) return; if (suggestion.__fastTapLock) return; suggestion.__fastTapLock = true; try { this.selectProduct(product); } finally { setTimeout(()=>{ suggestion.__fastTapLock=false; }, 250);} };
  suggestion.addEventListener('pointerdown', sPD, { passive: true });
  suggestion.addEventListener('pointermove', sPM, { passive: true });
  suggestion.addEventListener('pointerup', sPU, { passive: true });
  suggestion.addEventListener('touchend', sPU, { passive: true });

    return suggestion;
  }

  showNoResults() {
    const wasShown = this.searchDropdown.classList.contains('show');
    const hadSuggestions = !!this.searchDropdown.querySelector('.search-suggestion');

    const updateContent = () => {
      this.searchDropdown.innerHTML = '<div class="no-results">Ничего не найдено</div>';
    };

    if (wasShown && hadSuggestions) {
      // Анимируем сжатие до состояния "Ничего не найдено"
      this.animateDropdownHeight(updateContent);
    } else {
      updateContent();
      this.showDropdown();
    }

    // Добавляем обработчик клика для сброса поиска
    const noResultsElement = this.searchDropdown.querySelector('.no-results');
    if (noResultsElement) {
      noResultsElement.addEventListener('click', () => {
        this.deactivateSearch();
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
    const dropdown = this.searchDropdown;
    if (!dropdown) return;

    const wasHidden = !dropdown.classList.contains('show');
    const startHeight = wasHidden ? 0 : dropdown.offsetHeight;

    // Обновляем контент
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
      // Без анимации для первого показа или если высота не меняется
      this.showDropdown();
      return;
    }

    // Анимируем высоту
    const originalOverflow = dropdown.style.overflow;
    dropdown.style.overflow = 'hidden';
    dropdown.style.height = `${startHeight}px`;
    dropdown.style.transition = 'height 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    // Старт анимации в следующем кадре
    requestAnimationFrame(() => {
      dropdown.style.height = `${targetHeight}px`;
    });

    const cleanup = () => {
      dropdown.style.transition = '';
      dropdown.style.height = '';
      dropdown.style.overflow = originalOverflow;
      this.showDropdown();
    };

    let done = false;
    const onEnd = (e) => {
      if (done) return;
      if (!e || e.propertyName === 'height') {
        done = true;
        dropdown.removeEventListener('transitionend', onEnd);
        cleanup();
      }
    };
    dropdown.addEventListener('transitionend', onEnd);
    setTimeout(() => onEnd(), 260);
  }

  selectProduct(product) {
    // Очищаем поисковую строку
    this.searchInput.value = '';
    this.hideDropdown();
    
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
    
    // Переходим на страницу товара
    navigate(`product.html?product=${product.id}`);
  }

  handleKeydown(e) {
    if (this.currentResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.currentResults.length - 1);
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
          this.selectProduct(this.currentResults[this.selectedIndex]);
        }
        break;
        
      case 'Escape':
        this.deactivateSearch();
        break;
    }
  }

  updateSelection() {
    const suggestions = this.searchDropdown.querySelectorAll('.search-suggestion');
    
    suggestions.forEach((suggestion, index) => {
      suggestion.classList.toggle('selected', index === this.selectedIndex);
    });

    // Прокручиваем к выбранному элементу
    if (this.selectedIndex >= 0) {
      const selectedSuggestion = suggestions[this.selectedIndex];
      if (selectedSuggestion) {
        selectedSuggestion.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }

  showDropdown() {
    this.searchDropdown.classList.add('show');
    
    // Если показывается "Товары не найдены", блокируем скролл для всего dropdown
    const noResultsElement = this.searchDropdown.querySelector('.no-results');
    if (noResultsElement) {
      this.searchDropdown.style.overflow = 'hidden';
      this.searchDropdown.style.touchAction = 'none';
      this.searchDropdown.style.webkitOverflowScrolling = 'auto';
      this.searchDropdown.style.overscrollBehavior = 'none';
      return;
    }

    // Делаем поведение как у страницы: нативный bounce при наличии контента
    const isScrollable = this.searchDropdown.scrollHeight > this.searchDropdown.clientHeight + 1;
    if (isScrollable) {
      // Всегда показываем полосу прокрутки, чтобы было понятно, что контента больше
      this.searchDropdown.style.overflowY = 'scroll';
      this.searchDropdown.style.touchAction = 'pan-y';
      this.searchDropdown.style.webkitOverflowScrolling = 'touch';
      // allow-y включает нативную резинку на верхней границе dropdown
      this.searchDropdown.style.overscrollBehaviorY = 'contain';
      this.searchDropdown.style.overscrollBehaviorX = 'contain';
      this.disableEdgeScrollLock();
    } else {
      // Если контента мало — скрываем скролл, чтобы не было фантомного bounce
      this.searchDropdown.style.overflow = 'hidden';
      this.searchDropdown.style.touchAction = 'none';
      this.searchDropdown.style.webkitOverflowScrolling = 'auto';
      this.searchDropdown.style.overscrollBehavior = 'none';
      this.disableEdgeScrollLock();
    }
  }

  hideDropdown() {
    this.searchDropdown.classList.remove('show');
    this.selectedIndex = -1;
    
    // Сбрасываем стили блокировки скролла
    this.searchDropdown.style.overflow = '';
    this.searchDropdown.style.touchAction = '';
    this.searchDropdown.style.webkitOverflowScrolling = '';
    this.searchDropdown.style.overscrollBehavior = '';
    this.disableEdgeScrollLock();
  }

  // Блокировка резинки iOS на границах внутреннего скролла
  enableEdgeScrollLock(container) {
    this.disableEdgeScrollLock();
    let startY = 0;
    let startTop = 0;
    const onTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        startY = e.touches[0].clientY;
        startTop = container.scrollTop;
      }
    };
    const onTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const atTop = container.scrollTop <= 0;
      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
      // Если на верхней границе тянем вниз или на нижней — вверх, предотвращаем
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
    this.hideDropdown();
    this.searchInput.value = '';
    this.searchInput.blur();
    
    // Сбрасываем флаг для анимации при следующем открытии
    this.isFirstTimeOpen = true;
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

// Класс для управления подписками PS Plus
class PSPlusManager {
  constructor() {
    this.switchesContainer = document.getElementById('ps-plus-switches');
    this.productsContainer = document.getElementById('ps-plus-products-container');
    if (!this.switchesContainer || !this.productsContainer) return;
    
    this.slider = this.switchesContainer.querySelector('.toggle-switch-slider');
    this.inputs = this.switchesContainer.querySelectorAll('input[type="radio"]');
    
    // Данные подписок PS Plus
    this.psPlus = {
      essential: {
        name: 'Essential',
        image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&h=400&fit=crop&crop=center',
        prices: {
          '1-month': 960,
          '2-months': 1800,
          '3-months': 2600
        }
      },
      extra: {
        name: 'Extra',
        image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop&crop=center',
        prices: {
          '1-month': 1350,
          '2-months': 2500,
          '3-months': 3600
        }
      },
      premium: {
        name: 'Premium',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop&crop=center',
        prices: {
          '1-month': 1700,
          '2-months': 3200,
          '3-months': 4600
        }
      }
    };
    
    this.init();
  }
  
  init() {
    // Добавляем обработчики событий для всех переключателей
    this.inputs.forEach((input, index) => {
      input.addEventListener('change', () => {
        if (input.checked) {
          this.moveSlider(index);
          this.updateProductPrices(input.value);
        }
      });
    });
    
    // Устанавливаем начальную позицию слайдера
    const checkedInput = this.switchesContainer.querySelector('input[type="radio"]:checked');
    if (checkedInput) {
      const index = Array.from(this.inputs).indexOf(checkedInput);
      this.moveSlider(index);
      this.updateProductPrices(checkedInput.value);
    }
    
    // Рендерим карточки товаров
    this.renderProducts();
    
    // Обновляем позицию при изменении размера окна
    window.addEventListener('resize', () => {
      const checkedInput = this.switchesContainer.querySelector('input[type="radio"]:checked');
      if (checkedInput) {
        const index = Array.from(this.inputs).indexOf(checkedInput);
        this.moveSlider(index);
      }
    });
  }
  
  moveSlider(index) {
    // Получаем реальные размеры для точного позиционирования
    const containerWidth = this.switchesContainer.offsetWidth;
    const padding = 6; // 3px с каждой стороны
    const availableWidth = containerWidth - padding;
    const buttonWidth = availableWidth / 3;
    
    // Рассчитываем позицию в пикселях относительно левого края контейнера
    const translateXPx = index * buttonWidth;
    
    // Применяем плавную анимацию перекатывания
    this.slider.style.transform = `translateX(${translateXPx}px)`;
    
    // Добавляем небольшую анимацию отскока через CSS
    this.slider.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  }
  
  renderProducts() {
    this.productsContainer.innerHTML = '';
    
    Object.entries(this.psPlus).forEach(([key, product]) => {
      const productElement = this.createProductCard(product, key);
      this.productsContainer.appendChild(productElement);
    });
  }
  
  createProductCard(product, key) {
    const card = document.createElement('div');
    card.className = 'container product-sub';
    card.dataset.productKey = key;
    
    const checkedInput = this.switchesContainer.querySelector('input[type="radio"]:checked');
    const currentPeriod = checkedInput ? checkedInput.value : '1-month';
    const price = product.prices[currentPeriod];
    
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div>
        <div>${product.name}</div>
        <div class="product-price">${formatPrice(price)}</div>
      </div>
    `;
    
    return card;
  }
  
  updateProductPrices(period) {
    const productCards = this.productsContainer.querySelectorAll('.product-sub');
    
    productCards.forEach(card => {
      const productKey = card.dataset.productKey;
      const product = this.psPlus[productKey];
      if (product) {
        const priceElement = card.querySelector('.product-price');
        if (priceElement) {
          const newPrice = product.prices[period];
          priceElement.innerHTML = formatPrice(newPrice);
        }
      }
    });
  }
}

// Класс для управления переключателями на главной странице (устаревший)
class ToggleSwitches {
  constructor() {
    // Пустой конструктор, функциональность перенесена в PSPlusManager
  }
}

// Инициализация слайдера после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  const slider = new BannerSlider();
  const searchManager = new SearchManager();
  // Сохраняем экземпляр SearchManager в глобальной переменной для доступа из других функций
  window.searchManager = searchManager;
  const psPlusManager = new PSPlusManager();
  const clickBlocker = new ClickBlocker();
  
  // Рендерим товары
  renderNewProducts();
  
  // Рендерим категории на главной странице
  renderCategories();
  
  // Меню удалено

  

  // Обработчик для кнопки поддержки проекта удалён

  // Дополнительная проверка позиции слайдера товаров после полной загрузки
  setTimeout(() => {
    const productsSlider = document.querySelector('.category-products-slider');
    if (productsSlider) {
      productsSlider.scrollLeft = 0;
    }
  }, 100);

  // Обновляем позиционирование при изменении размера окна
  window.addEventListener('resize', () => {
    setTimeout(() => {
      slider.updateOnResize();
    }, 100);
  });

  // Глобально помечаем время последнего вертикального скролла страницы
  const markPageScroll = () => { window.__lastPageScrollTime = performance.now(); };
  window.addEventListener('scroll', markPageScroll, { passive: true });

});