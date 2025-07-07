// Главная страница - main.js
import { getAllProducts, categoryData, formatPriceCard } from './products-data.js'
import { initCommonComponents } from './common.js'

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
  if (!container) return;
  
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

// Функциональность баннер-слайдера
class BannerSlider {
  constructor() {
    this.slider = document.getElementById('bannerSlider');
    if (!this.slider) return;
    
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

// Инициализация главной страницы
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем общие компоненты
  initCommonComponents();
  
  // Инициализируем баннер-слайдер
  const slider = new BannerSlider();
  
  // Рендерим товары
  renderNewProducts();
  
  // Рендерим категории на главной странице
  renderCategories();
  
  // Обновляем позиционирование при изменении размера окна
  window.addEventListener('resize', () => {
    // Добавляем небольшую задержку для корректного пересчета размеров
    setTimeout(() => {
      if (slider && slider.centerActiveSlide) {
        slider.centerActiveSlide();
      }
    }, 100);
  });
});