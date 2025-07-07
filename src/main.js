import './style.css'
import { getAllProducts, categoryData, formatPrice, formatPriceCard } from './products-data.js'

const menuButton = document.getElementById('menu-button');
const closeMenuButton = document.getElementById('close-menu-button')
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
closeMenuButton.addEventListener('click', toggleMenu)
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

// Функциональность баннер-слайдера
class BannerSlider {
  constructor() {
    this.slider = document.getElementById('bannerSlider');
    this.originalBanners = Array.from(this.slider.querySelectorAll('.banner-item'));
    this.totalOriginalBanners = this.originalBanners.length;
    this.currentIndex = 1; // Начинаем с 1, так как 0 будет клоном последнего элемента
    this.gap = 0;
    this.isTransitioning = false;
    // Touch/swipe переменные
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.touchStartY = 0;
    this.touchEndY = 0;
    this.minSwipeDistance = 50; // Минимальное расстояние для срабатывания свайпа
    this.isSwipeInProgress = false;
    this.isMouseDown = false;
    // Автопрокрутка переменные
    this.autoSlideInterval = null;
    this.autoSlideDelay = 5000; // 5 секунд
    this.pauseDuration = 10000; // 10 секунд паузы при взаимодействии
    this.pauseTimer = null;
    this.init();
  }

  init() {
    // Создаем циклические клоны
    this.createCyclicClones();
    
    // Получаем обновленный список всех баннеров (включая клоны)
    this.allBanners = Array.from(this.slider.querySelectorAll('.banner-item'));
    
    // Устанавливаем начальное позиционирование
    this.setActiveWithoutTransition(this.currentIndex);
    
    // Добавляем обработчики событий только для оригинальных баннеров
    this.originalBanners.forEach((banner, index) => {
      banner.addEventListener('click', () => {
        this.setActive(index + 1, true); // +1 потому что первый клон сдвигает индексы, true - пользовательское взаимодействие
      });
    });

    // Автоматическое переключение каждые 5 секунд
    this.startAutoSlide();
    
    // Слушаем окончание транзишена для обработки циклических переходов
    this.slider.addEventListener('transitionend', (e) => {
      this.handleTransitionEnd(e);
    });

    // Добавляем поддержку touch/swipe жестов
    this.initTouchEvents();
  }

  createCyclicClones() {
    // Клонируем последний элемент и вставляем в начало
    const lastClone = this.originalBanners[this.totalOriginalBanners - 1].cloneNode(true);
    lastClone.classList.remove('active');
    this.slider.insertBefore(lastClone, this.slider.firstChild);
    
    // Клонируем первый элемент и добавляем в конец
    const firstClone = this.originalBanners[0].cloneNode(true);
    firstClone.classList.remove('active');
    this.slider.appendChild(firstClone);
  }

  setActive(index, isUserInteraction = false) {
    if (this.isTransitioning) return;
    
    // Проверяем, что индекс находится в допустимых границах
    if (index < 0 || index >= this.allBanners.length) {
      return;
    }
    
    // Если это тот же индекс, что уже активен, не делаем ничего
    if (index === this.currentIndex) {
      return;
    }
    
    this.isTransitioning = true;
    
    // Если это взаимодействие пользователя, приостанавливаем автопрокрутку
    if (isUserInteraction) {
      this.pauseAutoSlide();
    }
    
    // Убираем активный класс у всех баннеров
    this.allBanners.forEach(banner => {
      banner.classList.remove('active');
    });

    // Добавляем активный класс выбранному баннеру
    this.allBanners[index].classList.add('active');
    this.currentIndex = index;
    
    // Центрируем активный баннер
    this.centerActiveSlide();
  }

  setActiveWithoutTransition(index) {
    // Временно отключаем транзишн
    this.slider.style.transition = 'none';
    
    this.allBanners.forEach(banner => {
      banner.classList.remove('active');
    });
    
    this.allBanners[index].classList.add('active');
    this.currentIndex = index;
    this.centerActiveSlide();
    
    // Возвращаем транзишн после следующего кадра рендеринга
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.slider.style.transition = 'transform 0.3s ease';
        this.isTransitioning = false;
      });
    });
  }

  // Получение текущей ширины баннера
  getBannerWidth() {
    if (this.allBanners && this.allBanners.length > 0) {
      return this.allBanners[0].offsetWidth;
    }
    // Fallback значения в зависимости от размера экрана
    const screenWidth = window.innerWidth;
    if (screenWidth <= 375) return Math.min(screenWidth - 60, 300);
    if (screenWidth <= 768) return Math.min(screenWidth - 70, 400);
    if (screenWidth >= 1024) return 400;
    return Math.min(screenWidth - 80, 350);
  }

  centerActiveSlide() {
    const containerWidth = this.slider.parentElement.offsetWidth;
    const bannerWidth = this.getBannerWidth();
    
    // Базовое смещение для центрирования первого элемента
    const baseCenterOffset = (containerWidth - bannerWidth) / 2;
    
    // Смещение для текущего активного элемента
    const activeSlideOffset = this.currentIndex * (bannerWidth + this.gap);
    
    // Итоговое смещение
    const finalOffset = baseCenterOffset - activeSlideOffset;
    
    this.slider.style.transform = `translateX(${finalOffset}px)`;
  }

  handleTransitionEnd(e) {
    // Убеждаемся, что событие произошло именно на слайдере, а не на дочерних элементах
    if (e && e.target !== this.slider) return;
    
    // Дополнительная защита от множественных вызовов
    if (!this.isTransitioning) return;
    
    this.isTransitioning = false;
    
    // Если мы на первом клоне (индекс 0), перепрыгиваем на последний оригинальный
    if (this.currentIndex === 0) {
      this.setActiveWithoutTransition(this.totalOriginalBanners);
    }
    // Если мы на последнем клоне, перепрыгиваем на первый оригинальный
    else if (this.currentIndex === this.totalOriginalBanners + 1) {
      this.setActiveWithoutTransition(1);
    }
  }

  nextSlide(isUserInteraction = false) {
    let nextIndex = this.currentIndex + 1;
    
    // Если достигли конца всех слайдов (включая клоны), начинаем сначала
    if (nextIndex >= this.allBanners.length) {
      nextIndex = 0;
    }
    
    this.setActive(nextIndex, isUserInteraction);
  }

  prevSlide(isUserInteraction = false) {
    let prevIndex = this.currentIndex - 1;
    
    // Если ушли в начало (меньше 0), переходим к последнему слайду
    if (prevIndex < 0) {
      prevIndex = this.allBanners.length - 1;
    }
    
    this.setActive(prevIndex, isUserInteraction);
  }

  // Инициализация touch событий
  initTouchEvents() {
    const container = this.slider.parentElement;
    
    // Touch события на контейнере
    container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].clientX;
      this.touchEndY = e.changedTouches[0].clientY;
      this.handleSwipe();
    }, { passive: true });

    // Дополнительно добавляем touch события на каждый баннер
    this.allBanners.forEach(banner => {
      banner.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.isSwipeInProgress = false;
        // Не останавливаем propagation, чтобы события работали
      }, { passive: true });

      banner.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
        
        // Определяем, был ли это свайп
        const swipeDistanceX = Math.abs(this.touchStartX - this.touchEndX);
        const swipeDistanceY = Math.abs(this.touchStartY - this.touchEndY);
        const isHorizontalSwipe = swipeDistanceX > swipeDistanceY && swipeDistanceX > this.minSwipeDistance;
        
        if (isHorizontalSwipe) {
          this.isSwipeInProgress = true;
          // Предотвращаем клики на короткое время после свайпа
          setTimeout(() => {
            this.isSwipeInProgress = false;
          }, 100);
        }
        
        this.handleSwipe();
      }, { passive: true });

      // Предотвращаем стандартное поведение только для четко горизонтальных свайпов
      banner.addEventListener('touchmove', (e) => {
        if (!this.touchStartX || !this.touchStartY) return;
        
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - this.touchStartX);
        const deltaY = Math.abs(touch.clientY - this.touchStartY);
        
        // Предотвращаем поведение только если это явно горизонтальный жест
        // и есть достаточное смещение
        if (deltaX > deltaY && deltaX > 20 && deltaY < 10) {
          e.preventDefault();
        }
      }, { passive: false });

      // Предотвращаем случайные клики во время свайпа
      banner.addEventListener('click', (e) => {
        if (this.isSwipeInProgress) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, { capture: true });
    });

    // Mouse события для тестирования на десктопе
    container.addEventListener('mousedown', (e) => {
      this.touchStartX = e.clientX;
      this.isMouseDown = true;
      container.addEventListener('mousemove', this.handleMouseMove.bind(this));
    });

    container.addEventListener('mouseup', (e) => {
      this.touchEndX = e.clientX;
      this.isMouseDown = false;
      container.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      this.handleSwipe();
    });

    // Mouse события на баннерах
    this.allBanners.forEach(banner => {
      banner.addEventListener('mousedown', (e) => {
        this.touchStartX = e.clientX;
        this.isMouseDown = true;
      });

      banner.addEventListener('mouseup', (e) => {
        this.touchEndX = e.clientX;
        this.isMouseDown = false;
        this.handleSwipe();
      });
    });
  }

  handleMouseMove(e) {
    e.preventDefault();
  }

  // Обработка свайпа
  handleSwipe() {
    if (!this.touchStartX || !this.touchEndX) return;
    
    const swipeDistanceX = this.touchStartX - this.touchEndX;
    const swipeDistanceY = this.touchStartY - this.touchEndY;
    
    // Проверяем, что это действительно горизонтальный свайп
    const isHorizontalSwipe = Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY);
    
    // Если свайп достаточно длинный и горизонтальный
    if (isHorizontalSwipe && Math.abs(swipeDistanceX) > this.minSwipeDistance) {
      if (swipeDistanceX > 0) {
        // Свайп влево - следующий слайд
        this.nextSlide(true); // true - пользовательское взаимодействие
      } else {
        // Свайп вправо - предыдущий слайд
        this.prevSlide(true); // true - пользовательское взаимодействие
      }
    }
    
    // Сбрасываем координаты после обработки
    this.touchStartX = null;
    this.touchEndX = null;
    this.touchStartY = null;
    this.touchEndY = null;
  }

  // Запуск автопрокрутки
  startAutoSlide() {
    // Очищаем предыдущий интервал, если он есть
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    
    this.autoSlideInterval = setInterval(() => {
      // Проверяем, что не находимся в процессе переключения
      if (!this.isTransitioning) {
        this.nextSlide(false); // false - автоматическое переключение
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
    // Останавливаем текущую автопрокрутку
    this.stopAutoSlide();
    
    // Очищаем предыдущий таймер паузы, если он есть
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
    }
    
    // Возобновляем автопрокрутку через 10 секунд
    this.pauseTimer = setTimeout(() => {
      this.startAutoSlide();
    }, this.pauseDuration);
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

// Класс для управления переключателями на главной странице
class ToggleSwitches {
  constructor() {
    this.switchesContainer = document.getElementById('ps-plus-switches');
    if (!this.switchesContainer) return;
    
    this.slider = this.switchesContainer.querySelector('.toggle-switch-slider');
    this.inputs = this.switchesContainer.querySelectorAll('input[type="radio"]');
    
    this.init();
  }
  
  init() {
    // Добавляем обработчики событий для всех переключателей
    this.inputs.forEach((input, index) => {
      input.addEventListener('change', () => {
        if (input.checked) {
          this.moveSlider(index);
        }
      });
    });
    
    // Устанавливаем начальную позицию слайдера
    const checkedInput = this.switchesContainer.querySelector('input[type="radio"]:checked');
    if (checkedInput) {
      const index = Array.from(this.inputs).indexOf(checkedInput);
      this.moveSlider(index);
    }
    
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
}

// Инициализация слайдера после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  const slider = new BannerSlider();
  const searchManager = new SearchManager();
  const toggleSwitches = new ToggleSwitches();
  
  // Рендерим товары
  renderNewProducts();
  
  // Рендерим категории на главной странице
  renderCategories();
  
  // Инициализируем навигацию из бургер меню
  initMenuNavigation();
  
  // Обновляем Telegram навигацию для главной страницы
  setTimeout(() => {
    if (typeof window.updateTelegramNavigation === 'function') {
      window.updateTelegramNavigation();
    }
  }, 500);
  
  // Агрессивно скрываем кнопку "Назад" на главной странице
  setTimeout(() => {
    if (typeof window.forceHideBackButton === 'function') {
      window.forceHideBackButton();
    }
  }, 1000);
  
  // Дополнительная проверка и скрытие при возврате на главную
  setTimeout(() => {
    if (typeof window.checkAndHideBackButtonOnMainPage === 'function') {
      window.checkAndHideBackButtonOnMainPage();
    }
  }, 1200);
  
  // Периодическая проверка каждые 3 секунды
  setInterval(() => {
    if (typeof window.checkAndHideBackButtonOnMainPage === 'function') {
      window.checkAndHideBackButtonOnMainPage();
    }
  }, 3000);
  
  // Обновляем позиционирование при изменении размера окна
  window.addEventListener('resize', () => {
    // Добавляем небольшую задержку для корректного пересчета размеров
    setTimeout(() => {
      slider.centerActiveSlide();
    }, 100);
  });
});