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

    // Гарантируем минимальное пространство для запуска нативного bounce на коротких страницах
    this._onResize = () => this.ensureBounceRoom();
    window.addEventListener('resize', this._onResize, { passive: true });

    // Переоценка после первоначального рендера
    this.ensureBounceRoom();
    setTimeout(() => this.ensureBounceRoom(), 0);
    setTimeout(() => this.ensureBounceRoom(), 800);

    // Отслеживаем изменения размеров контента (если поддерживается)
    try {
      if ('ResizeObserver' in window) {
        this._resizeObserver = new ResizeObserver(() => this.ensureBounceRoom());
        const container = this.resolveScrollContainer();
        if (container) this._resizeObserver.observe(container);
      }
    } catch (_) {
      // Молча игнорируем, если ResizeObserver недоступен
    }
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

  // Добавляет/удаляет невидимый 1px-спейсер, чтобы запускать bounce на коротких страницах
  ensureBounceRoom() {
    const container = this.resolveScrollContainer();
    const viewportHeight = window.visualViewport ? Math.round(window.visualViewport.height) : window.innerHeight;

    if (!container) return;

    // Измеряем размеры целевого скролл-контейнера
    const contentHeight = container.scrollHeight || container.offsetHeight || 0;
    const containerHeight = container.clientHeight || viewportHeight;
    const needsSpacer = contentHeight <= containerHeight;

    // Если наблюдатель смотрит не на тот контейнер — перевешиваем
    if (this._resizeObserver && this._observedContainer !== container) {
      try { if (this._observedContainer) this._resizeObserver.unobserve(this._observedContainer); } catch (_) {}
      try { this._resizeObserver.observe(container); } catch (_) {}
      this._observedContainer = container;
    }

    // Ленивая инициализация ссылки на спейсер
    if (!this._bounceSpacer || this._bounceSpacer.parentElement !== container) {
      // Если спейсер был добавлен в другой контейнер — удалим его
      if (this._bounceSpacer && this._bounceSpacer.parentElement) {
        try { this._bounceSpacer.parentElement.removeChild(this._bounceSpacer); } catch (_) {}
      }
      this._bounceSpacer = null;
    }

    if (needsSpacer) {
      if (!this._bounceSpacer) {
        const spacer = document.createElement('div');
        spacer.id = 'bounce-spacer';
        spacer.style.cssText = 'height:1px; pointer-events:none;';
        container.appendChild(spacer);
        this._bounceSpacer = spacer;
      }
    } else if (this._bounceSpacer) {
      try { this._bounceSpacer.remove(); } catch (_) {}
      this._bounceSpacer = null;
    }
  }

  // Определяет актуальный вертикальный скролл-контейнер страницы
  resolveScrollContainer() {
    const body = document.body;
    const html = document.documentElement;

    // Если на странице перенесён скролл в конкретный контейнер (iOS фиксы)
    // Приоритет: info → product → catalog
    const infoMain = body.classList.contains('info-page') ? document.querySelector('body.info-page main') : null;
    const product = document.querySelector('.product');
    const catalog = document.querySelector('.catalog');

    // Если body не скроллится — пробуем внутренние контейнеры
    const bodyOverflowY = getComputedStyle(body).overflowY;
    if (bodyOverflowY === 'hidden') {
      if (infoMain) return infoMain;
      if (product) return product;
      if (catalog) return catalog;
    }

    // В противном случае используем стандартный скроллер документа
    // (в разных браузерах это либо html, либо body)
    return document.scrollingElement || html || body;
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

    // Снимаем слушатели и наблюдатели
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      this._onResize = null;
    }
    if (this._resizeObserver) {
      try { this._resizeObserver.disconnect(); } catch (_) {}
      this._resizeObserver = null;
    }
    // Удаляем спейсер, если остался
    if (this._bounceSpacer) {
      try { this._bounceSpacer.remove(); } catch (_) {}
      this._bounceSpacer = null;
    }
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  if (window.self === window.top) {
    window.bounceScroll = new BounceScroll();
  }
});

window.BounceScroll = BounceScroll; 