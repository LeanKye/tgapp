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
      }
      
      /* Для iOS - не принудительно включаем momentum scrolling на корневом скроллере */
      
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
      try { window.__lastTouchStartTs = performance.now(); } catch {}
    }, { passive: true });

    // Глобальный подавитель «призрачных» кликов после инерции на iOS
    let suppressClickUntilTs = 0;
    const CLICK_SUPPRESS_WINDOW_MS = 500; // окно гашения клика
    const SCROLL_RECENT_MS = 800; // считаем скролл «недавним»
    const SHORT_TAP_MS = 220; // короткий тап — вероятнее гашение инерции

    document.addEventListener('touchend', (e) => {
      const now = performance.now();
      const touchDuration = Date.now() - touchStartTime;
      const lastScrollTs = window.__lastScrollActivityTs || 0;
      const sinceScroll = now - lastScrollTs;
      // Если короткий тап вскоре после скролла — подавим следующий click на карточках
      if (sinceScroll < SCROLL_RECENT_MS && touchDuration < SHORT_TAP_MS) {
        suppressClickUntilTs = now + CLICK_SUPPRESS_WINDOW_MS;
      }
    }, { passive: true });

    document.addEventListener('click', (e) => {
      const now = performance.now();
      if (now <= suppressClickUntilTs) {
        const target = e.target;
        if (target && (target.closest && (target.closest('.category-product-card') || target.closest('.category-card')))) {
          try { e.preventDefault(); } catch {}
          try { e.stopPropagation(); } catch {}
          try { if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation(); } catch {}
          // Сбрасываем окно подавления после блокировки
          suppressClickUntilTs = 0;
        }
      }
    }, { capture: true, passive: false });

    // Улучшаем поведение на границах скролла
    let isScrolling = false;
    let scrollTimeout;

    document.addEventListener('scroll', () => {
      // Обновляем глобальную метку активности скролла (для распознавания гашения инерции)
      try { window.__lastScrollActivityTs = performance.now(); } catch {}
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
      }, 350);
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