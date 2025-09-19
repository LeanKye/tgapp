// Улучшенный bounce scroll эффект как в блоке "Новинки"
class BounceScroll {
  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = this.detectMobile();
    
    if (!this.isMobile || this.reducedMotion) return;
    
    this.init();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window && window.innerWidth <= 1024);
  }

  init() {
    // Добавляем CSS для естественного bounce эффекта
    this.addStyles();
    
    // Настраиваем поведение скролла для страниц
    this.setupScrollBehavior();
  }

  addStyles() {
    if (document.getElementById('bounce-scroll-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'bounce-scroll-styles';
    style.textContent = `
      /* Естественный bounce эффект для страниц */
      html, body {
        /* Включаем нативный bounce только для вертикального скролла */
        overscroll-behavior-x: none;
        overscroll-behavior-y: auto;
        /* Включаем плавный скролл на мобильных */
        -webkit-overflow-scrolling: touch;
      }
      
      /* Для iOS - включаем momentum scrolling */
      @supports (-webkit-overflow-scrolling: touch) {
        html, body {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: auto;
        }
      }
      
      /* Улучшенная производительность для bounce анимаций */
      @media (max-width: 1024px) and (hover: none) {
        /* Убираем will-change для body чтобы не блокировать клики */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Гарантируем что кнопки всегда кликабельны */
        button, 
        .nav-item, 
        .button-group label,
        .button-group input,
        .add-to-cart,
        .go-to-cart,
        .counter-btn,
        .checkout-toggle,
        .cart-controls,
        .cart-controls button,
        [data-action="decrease"],
        [data-action="increase"],
        .tabs .tab,
        #more-info-btn,
        #checkout-toggle,
        .checkout-button {
          pointer-events: auto !important;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        
        /* Убедимся что формы ввода работают */
        input[type="radio"],
        input[type="checkbox"] {
          pointer-events: auto !important;
        }
      }
      
      /* Дополнительная защита для навигационной панели */
      .bottom-nav {
        pointer-events: auto !important;
        z-index: 9999;
      }
      
      .bottom-nav .nav-item {
        pointer-events: auto !important;
      }
      
      /* Убедимся что кнопки на странице товара работают */
      body.is-scrolling button,
      body.is-scrolling .button-group,
      body.is-scrolling .add-to-cart,
      body.is-scrolling .cart-controls {
        pointer-events: auto !important;
      }
      
      /* Убираем системные эффекты только там где нужно */
      .no-bounce {
        overscroll-behavior: none;
        -webkit-overflow-scrolling: auto;
      }
      

      
      /* Исключаем конфликты с горизонтальными слайдерами */
      .category-products-slider {
        overscroll-behavior-x: contain;
        touch-action: pan-x pan-y;
      }
      
      .banner-slider {
        overscroll-behavior-x: contain;
        touch-action: pan-y;
      }
    `;
    document.head.appendChild(style);
  }

  setupScrollBehavior() {
    // Убеждаемся что страницы имеют правильные CSS классы
    document.documentElement.classList.add('bounce-enabled');
    document.body.classList.add('bounce-enabled');
    
    // Оптимизируем touch поведение
    this.optimizeTouchBehavior();
  }

  setupModalBehavior() {
    // Модальные окна удалены
  }

  optimizeTouchBehavior() {
    // Предотвращаем двойное срабатывание на некоторых устройствах
    let touchStartTime = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      
      // Если нажали на кнопку - сразу убираем класс is-scrolling
      const target = e.target;
      if (target.matches('button, .nav-item, input, label, .add-to-cart, .go-to-cart, [data-action]') || 
          target.closest('button, .nav-item, .button-group, .add-to-cart, .cart-controls, .bottom-nav')) {
        document.body.classList.remove('is-scrolling');
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      
      // Оптимизируем короткие касания
      if (touchDuration < 150) {
        // Короткое касание - оставляем как есть
        return;
      }
    }, { passive: true });

    // Также обрабатываем обычные клики (для устройств с мышью)
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target.matches('button, .nav-item, input, label, .add-to-cart, .go-to-cart, [data-action]') || 
          target.closest('button, .nav-item, .button-group, .add-to-cart, .cart-controls, .bottom-nav')) {
        document.body.classList.remove('is-scrolling');
      }
    }, { passive: true });

    // Улучшаем поведение на границах скролла
    let isScrolling = false;
    let scrollTimeout;

    document.addEventListener('scroll', () => {
      if (!isScrolling) {
        // Начало скролла
        document.body.classList.add('is-scrolling');
        isScrolling = true;
      }

      // Очищаем предыдущий таймаут
      clearTimeout(scrollTimeout);

      // Устанавливаем новый таймаут для окончания скролла
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
        isScrolling = false;
      }, 50); // Уменьшаем таймаут для быстрой разблокировки
    }, { passive: true });
  }

  // Метод для отключения bounce на конкретном элементе
  disableBounce(element) {
    if (element) {
      element.classList.add('no-bounce');
    }
  }

  // Метод для включения bounce на конкретном элементе
  enableBounce(element) {
    if (element) {
      element.classList.remove('no-bounce');
    }
  }

  // Управление bounce для всей страницы
  disablePageBounce() {
    document.documentElement.classList.add('no-bounce');
    document.body.classList.add('no-bounce');
  }

  enablePageBounce() {
    document.documentElement.classList.remove('no-bounce');
    document.body.classList.remove('no-bounce');
  }

  // Уничтожение
  destroy() {
    const styles = document.getElementById('bounce-scroll-styles');
    if (styles) styles.remove();
    
    document.documentElement.classList.remove('bounce-enabled');
    document.body.classList.remove('bounce-enabled', 'is-scrolling');
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  if (window.self === window.top) {
    window.bounceScroll = new BounceScroll();
  }
});

window.BounceScroll = BounceScroll; 