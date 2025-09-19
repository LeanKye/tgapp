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

    // Разрешаем нажатия по ключевым кнопкам во время bounce/скролла
    this.setupTapDuringBounce();
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
        body {
          will-change: scroll-position;
        }
        
        /* Оптимизация для плавности */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
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
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      
      // Оптимизируем короткие касания
      if (touchDuration < 150) {
        // Короткое касание - оставляем как есть
        return;
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
      }, 150);
    }, { passive: true });
  }

  // Разрешаем нажатия по кнопкам во время bounce/скролла (исключая изображения товара)
  setupTapDuringBounce() {
    // Разрешённые интерактивные элементы (на странице товара и в нижней навигации)
    const allowedSelectors = [
      '.bottom-nav .nav-item',
      '.product .add-to-cart',
      '.product .product-cart-controls .qty-btn',
      '.product .product-cart-controls .go-to-cart',
      '.product .button-group label',
      '.product .period-buttons label',
      '.product .variant-group label',
      '.product .edition-group label',
      '.product .tabs .tab',
      '.product .checkout-arrow',
      '#checkout-header-text'
    ];

    const disallowedWithin = ['.product-cover', '.swiper', '.swiper-slide'];

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let startTarget = null;

    document.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startTime = Date.now();
      startTarget = e.target;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      // Разрешаем тапы если страница прокручивается ИЛИ находимся у границы (эффект резинки)
      const docEl = document.documentElement;
      const atTop = (window.scrollY || docEl.scrollTop || 0) <= 0;
      const docHeight = Math.max(docEl.scrollHeight, document.body.scrollHeight || 0);
      const viewBottom = (window.innerHeight || docEl.clientHeight || 0) + (window.scrollY || docEl.scrollTop || 0);
      const atBottom = viewBottom >= docHeight - 1;
      const isBounceContext = document.body.classList.contains('is-scrolling') || atTop || atBottom;
      if (!isBounceContext) return;

      const dx = (e.changedTouches?.[0]?.clientX || 0) - startX;
      const dy = (e.changedTouches?.[0]?.clientY || 0) - startY;
      const moved = Math.hypot(dx, dy);
      const duration = Date.now() - startTime;

      // Считаем «тапом» только короткие неподвижные касания
      if (moved > 12 || duration > 500) return;

      const target = (e.target instanceof Element) ? e.target : null;
      if (!target) return;

      // Исключаем касания внутри области изображений товара
      for (const sel of disallowedWithin) {
        if (target.closest(sel)) return;
      }

      // Ищем ближайший разрешённый интерактивный элемент
      const selector = allowedSelectors.join(',');
      const clickable = target.closest(selector);
      if (!clickable) return;

      // Предотвращаем синтетический click от браузера и выполняем действие сразу
      try { e.preventDefault(); } catch {}
      e.stopPropagation();

      // Особая обработка label[for]: явно переключаем input и генерируем change
      const forId = clickable.getAttribute && (clickable.getAttribute('for') || clickable.htmlFor);
      if (forId) {
        const input = document.getElementById(forId);
        if (input && (input.type === 'radio' || input.type === 'checkbox')) {
          if (!input.checked) input.checked = true;
          try { input.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
          return;
        }
      }

      // Иначе — обычный клик по кнопке/элементу
      if (typeof clickable.click === 'function') {
        clickable.click();
      }
    }, { passive: false });
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