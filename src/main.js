import './style.css'
import { getAllProducts, categoryData, formatPrice, formatPriceCard, bannerData } from './products-data.js'

const menuButton = document.getElementById('menu-button');
const menu = document.getElementById('menu')
const menuOverlay = document.getElementById('menu-overlay')

const toggleMenu = () => {
  const isClosing = !menu.classList.contains('menu-closed');
  
  menu.classList.toggle('menu-closed');
  menuOverlay.classList.toggle('menu-closed');
  
  // Управление прокруткой страницы
  if (isClosing) {
    // Закрываем меню - включаем прокрутку
    document.body.style.overflow = '';
  } else {
    // Открываем меню - отключаем прокрутку
    document.body.style.overflow = 'hidden';
  }
}

const closeMenu = () => {
  menu.classList.add('menu-closed');
  menuOverlay.classList.add('menu-closed');
  // Включаем прокрутку при закрытии
  document.body.style.overflow = '';
}

menuButton.addEventListener('click', toggleMenu)
// Закрытие меню при клике на overlay
menuOverlay.addEventListener('click', closeMenu)

// Закрытие меню клавишей Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menu.classList.contains('menu-closed')) {
    closeMenu();
  }
})

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
  card.addEventListener('click', () => {
    window.location.href = `product.html?product=${product.id}`;
  });
  
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
}

// Функция для рендеринга категорий
function renderCategories() {
  const container = document.getElementById('categories-grid');
  if (!container) return;
  
  // Очищаем контейнер
  container.innerHTML = '';
  
  // Добавляем карточки категорий
  Object.values(categoryData).forEach((category, index) => {
    const card = createCategoryCard(category, index);
    container.appendChild(card);
  });
}

// Функция для создания карточки категории
function createCategoryCard(category, index) {
  const card = document.createElement('div');
  card.className = 'category-card';
  
  // Устанавливаем фоновое изображение
  card.style.backgroundImage = `url(${category.image})`;
  
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
  card.addEventListener('click', () => {
    window.location.href = `category.html?category=${encodeURIComponent(category.name)}`;
  });
  
  return card;
}

// Навигация из бургер меню
function initMenuNavigation() {
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const categoryName = item.textContent.trim();
      window.location.href = `category.html?category=${encodeURIComponent(categoryName)}`;
    });
  });
}

// Функциональность баннер-слайдера с виртуальной циклической прокруткой
class BannerSlider {
  constructor() {
    this.slider = document.getElementById('bannerSlider');
    this.bannerData = bannerData;
    this.totalOriginalBanners = this.bannerData.length;
    
    // Виртуальная циклическая прокрутка - расширяем данные для бесконечности
    this.extendedData = this.createExtendedData();
    this.totalExtendedBanners = this.extendedData.length;
    
    // Начинаем с середины расширенного массива
    this.startIndex = this.totalOriginalBanners;
    this.currentIndex = this.startIndex;
    
    this.gap = 0;
    this.isTransitioning = false;
    
    // Touch/swipe переменные
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.touchStartY = 0;
    this.touchEndY = 0;
    this.minSwipeDistance = 50;
    this.isSwipeInProgress = false;
    this.isMouseDown = false;
    
    // Автопрокрутка переменные
    this.autoSlideInterval = null;
    this.autoSlideDelay = 5000;
    this.pauseDuration = 10000;
    this.pauseTimer = null;
    
    this.init();
  }

  // Создаем расширенный массив данных для виртуальной циклической прокрутки
  createExtendedData() {
    // Создаем массив: [данные, данные, данные] - 3 копии для плавной прокрутки
    return [
      ...this.bannerData,
      ...this.bannerData,
      ...this.bannerData
    ];
  }

  init() {
    // Рендерим баннеры из расширенных данных
    this.renderBanners();
    
    // Получаем все баннеры
    this.allBanners = Array.from(this.slider.querySelectorAll('.banner-item'));
    
    // Устанавливаем начальное позиционирование без анимации
    this.setPositionWithoutTransition(this.currentIndex);
    
    // Добавляем обработчики событий
    this.addEventListeners();

    // Автоматическое переключение
    this.startAutoSlide();
    
    // Добавляем поддержку touch/swipe жестов
    this.initTouchEvents();
  }

  // Рендеринг баннеров из расширенных данных
  renderBanners() {
    this.slider.innerHTML = '';
    
    this.extendedData.forEach((banner, index) => {
      const bannerElement = this.createBannerElement(banner, index);
      this.slider.appendChild(bannerElement);
    });
  }

  // Создание элемента баннера
  createBannerElement(banner, index) {
    const bannerItem = document.createElement('div');
    bannerItem.className = 'banner-item';
    bannerItem.dataset.bannerId = banner.id;
    bannerItem.dataset.extendedIndex = index;
    
    // Определяем оригинальный индекс для активации
    const originalIndex = index % this.totalOriginalBanners;
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
        window.location.href = `category.html?category=${encodeURIComponent(banner.actionParams.category)}`;
        break;
      case 'product':
        window.location.href = `product.html?product=${banner.actionParams.productId}`;
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
    
    // Анимируем переход
    this.animateToPosition(index);
    
    this.currentIndex = index;
    
    // Проверяем необходимость "перемотки" после завершения анимации
    setTimeout(() => {
      this.checkAndRewind();
      this.isTransitioning = false;
    }, 350); // Немного больше времени анимации
  }

  // Установка позиции без анимации
  setPositionWithoutTransition(index) {
    this.slider.style.transition = 'none';
    this.updateActiveClasses(index);
    this.updateSliderPosition(index);
    this.currentIndex = index;
    
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
    this.slider.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
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
  }

  // Проверка и "перемотка" для бесконечности
  checkAndRewind() {
    const needsRewind = this.currentIndex <= this.totalOriginalBanners * 0.5 || 
                       this.currentIndex >= this.totalOriginalBanners * 2.5;
    
    if (needsRewind) {
      // Вычисляем эквивалентную позицию в средней секции
      const originalIndex = this.currentIndex % this.totalOriginalBanners;
      const newIndex = this.startIndex + originalIndex;
      
      // Мгновенно перемещаемся в среднюю секцию
      this.setPositionWithoutTransition(newIndex);
    }
  }

  // Получение ширины баннера
  getBannerWidth() {
    if (this.allBanners && this.allBanners.length > 0) {
      return this.allBanners[0].offsetWidth;
    }
    
    const screenWidth = window.innerWidth;
    if (screenWidth <= 375) return Math.min(screenWidth - 60, 300);
    if (screenWidth <= 768) return Math.min(screenWidth - 70, 400);
    if (screenWidth >= 1024) return 400;
    return Math.min(screenWidth - 80, 350);
  }

  // Следующий слайд
  nextSlide(isUserInteraction = false) {
    this.setActive(this.currentIndex + 1, isUserInteraction);
  }

  // Предыдущий слайд
  prevSlide(isUserInteraction = false) {
    this.setActive(this.currentIndex - 1, isUserInteraction);
  }

  // Инициализация touch событий
  initTouchEvents() {
    const container = this.slider.parentElement;
    let swipeDirection = null; // 'horizontal', 'vertical', null
    let swipeStarted = false;
    
    // Touch события на контейнере
    container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      swipeDirection = null;
      swipeStarted = false;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].clientX;
      this.touchEndY = e.changedTouches[0].clientY;
      
      // Обрабатываем свайп только если было горизонтальное движение
      if (swipeDirection === 'horizontal') {
        this.handleSwipe();
      }
      
      // Сбрасываем состояние
      swipeDirection = null;
      swipeStarted = false;
    }, { passive: true });

    // Touch события на баннерах
    this.allBanners.forEach(banner => {
      banner.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.isSwipeInProgress = false;
        swipeDirection = null;
        swipeStarted = false;
      }, { passive: true });

      banner.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
        
        // Обрабатываем свайп только если было горизонтальное движение
        if (swipeDirection === 'horizontal') {
          const swipeDistanceX = Math.abs(this.touchStartX - this.touchEndX);
          const swipeDistanceY = Math.abs(this.touchStartY - this.touchEndY);
          const isHorizontalSwipe = swipeDistanceX > swipeDistanceY && swipeDistanceX > this.minSwipeDistance;
          
          if (isHorizontalSwipe) {
            this.isSwipeInProgress = true;
            setTimeout(() => {
              this.isSwipeInProgress = false;
            }, 100);
          }
          
          this.handleSwipe();
        }
        
        // Сбрасываем состояние
        swipeDirection = null;
        swipeStarted = false;
      }, { passive: true });

      banner.addEventListener('touchmove', (e) => {
        if (!this.touchStartX || !this.touchStartY) return;
        
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - this.touchStartX);
        const deltaY = Math.abs(touch.clientY - this.touchStartY);
        
        // Определяем направление свайпа только один раз
        if (!swipeStarted && (deltaX > 10 || deltaY > 10)) {
          swipeStarted = true;
          
          // Определяем преобладающее направление движения
          if (deltaX > deltaY * 1.5) {
            swipeDirection = 'horizontal';
          } else if (deltaY > deltaX * 1.5) {
            swipeDirection = 'vertical';
          }
        }
        
        // Блокируем событие только для горизонтальных свайпов
        if (swipeDirection === 'horizontal') {
          e.preventDefault();
        }
        // Для вертикальных свайпов позволяем браузеру обрабатывать событие нормально
      }, { passive: false });

      banner.addEventListener('click', (e) => {
        if (this.isSwipeInProgress) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, { capture: true });
    });

    // Mouse события для десктопа
    container.addEventListener('mousedown', (e) => {
      this.touchStartX = e.clientX;
      this.isMouseDown = true;
    });

    container.addEventListener('mouseup', (e) => {
      this.touchEndX = e.clientX;
      this.isMouseDown = false;
      this.handleSwipe();
    });
  }

  // Обработка свайпа
  handleSwipe() {
    if (!this.touchStartX || !this.touchEndX) return;
    
    const swipeDistanceX = this.touchStartX - this.touchEndX;
    const swipeDistanceY = this.touchStartY - this.touchEndY;
    
    const isHorizontalSwipe = Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY);
    
    if (isHorizontalSwipe && Math.abs(swipeDistanceX) > this.minSwipeDistance) {
      if (swipeDistanceX > 0) {
        this.nextSlide(true);
      } else {
        this.prevSlide(true);
      }
    }
    
    // Сбрасываем координаты
    this.touchStartX = null;
    this.touchEndX = null;
    this.touchStartY = null;
    this.touchEndY = null;
  }

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
      if (!e.target.closest('.search-container')) {
        this.hideDropdown();
      }
    });

    // Показываем dropdown при фокусе, если есть текст
    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.trim()) {
        this.handleInput(this.searchInput.value);
      }
    });
  }

  handleInput(query) {
    // Очищаем предыдущий таймер
    clearTimeout(this.searchTimeout);
    
    // Устанавливаем новый таймер для задержки поиска
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 200);
  }

  performSearch(query) {
    const trimmedQuery = query.trim().toLowerCase();
    
    if (trimmedQuery.length === 0) {
      this.hideDropdown();
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

    this.searchDropdown.innerHTML = '';
    
    this.currentResults.forEach((product, index) => {
      const suggestion = this.createSuggestion(product, index);
      this.searchDropdown.appendChild(suggestion);
    });

    this.showDropdown();
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

    // Обработчик клика по предложению
    suggestion.addEventListener('click', () => {
      this.selectProduct(product);
    });

    return suggestion;
  }

  showNoResults() {
    this.searchDropdown.innerHTML = '<div class="no-results">Товары не найдены</div>';
    this.showDropdown();
  }

  selectProduct(product) {
    // Очищаем поисковую строку
    this.searchInput.value = '';
    this.hideDropdown();
    
    // Переходим на страницу товара
    window.location.href = `product.html?product=${product.id}`;
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
        this.hideDropdown();
        this.searchInput.blur();
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
  }

  hideDropdown() {
    this.searchDropdown.classList.remove('show');
    this.selectedIndex = -1;
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
        <div class="product-price">${price} ₽</div>
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
          priceElement.textContent = `${newPrice} ₽`;
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
  const psPlusManager = new PSPlusManager();
  const clickBlocker = new ClickBlocker();
  
  // Рендерим товары
  renderNewProducts();
  
  // Рендерим категории на главной странице
  renderCategories();
  
    // Инициализируем навигацию из бургер меню
  initMenuNavigation();

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
});