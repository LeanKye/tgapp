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
    
    // Авто-переключение режима скролла (контейнер/тело) для сохранения bounce при коротком контенте
    this.installAutoScrollModeSwitcher();
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

  // Определение активного скролл-контейнера на странице
  getPrimaryScrollContainer() {
    // Приоритет: catalog, product, info main
    const catalog = document.querySelector('.catalog');
    if (catalog) return catalog;
    const product = document.querySelector('.product');
    if (product) return product;
    if (document.body.classList.contains('info-page')) {
      const infoMain = document.querySelector('main');
      if (infoMain) return infoMain;
    }
    return null;
  }

  // Переключатель: если контента мало — включаем скролл body для нативного bounce
  updateScrollMode() {
    try {
      const container = this.getPrimaryScrollContainer();
      // По умолчанию — используем скролл контейнера (класс не нужен)
      let useBody = false;
      if (container) {
        const scrollable = (container.scrollHeight - container.clientHeight) > 1;
        useBody = !scrollable; // если не скроллится — переключаемся на body
      } else {
        // Нет явного контейнера — отдаём скролл body
        useBody = true;
      }
      document.body.classList.toggle('use-body-scroll', Boolean(useBody));
    } catch {}
  }

  installAutoScrollModeSwitcher() {
    const debounced = (() => {
      let raf = 0;
      return () => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => this.updateScrollMode());
      };
    })();

    // Первичная настройка после рендера
    debounced();
    setTimeout(debounced, 100);
    setTimeout(debounced, 300);

    // Реагируем на resize/orientation
    window.addEventListener('resize', debounced);
    window.addEventListener('orientationchange', () => setTimeout(debounced, 100));

    // Наблюдаем за изменениями DOM, которые могут влиять на высоту
    try {
      const obs = new MutationObserver(() => debounced());
      obs.observe(document.body, { childList: true, subtree: true, attributes: false });
      // Сохраняем для возможного отключения в destroy (опционально)
      this._domObserver = obs;
    } catch {}

    // Экспорт в глобальную область для ручного вызова из других модулей при необходимости
    window.requestBounceRecalc = debounced;
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