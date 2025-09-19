// Улучшенный bounce scroll эффект как в блоке "Новинки"
class BounceScroll {
  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = this.detectMobile();
    
    if (!this.isMobile || this.reducedMotion) return;
    
    // Гард от двойного клика после синтетического
    this._lastSynthClickTs = 0;
    this._lastSynthClickPos = { x: 0, y: 0 };
    
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
    // Предотвращаем двойное срабатывание на некоторых устройствах + помощь тапу
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;
    let touchStartTarget = null;

    // Глобальный гард: если только что отправляли синтетический клик — гасим ближайший нативный
    window.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - this._lastSynthClickTs < 220) {
        const dx = Math.abs(e.clientX - this._lastSynthClickPos.x);
        const dy = Math.abs(e.clientY - this._lastSynthClickPos.y);
        if (dx <= 12 && dy <= 12) {
          try {
            e.preventDefault();
            e.stopPropagation();
          } catch {}
        }
      }
    }, { capture: true });

    document.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      const t = e.touches && e.touches[0];
      touchStartX = t ? t.clientX : 0;
      touchStartY = t ? t.clientY : 0;
      touchMoved = false;
      // Запоминаем исходную цель тапа
      touchStartTarget = document.elementFromPoint(touchStartX, touchStartY);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      const move = Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY);
      if (move > 8) touchMoved = true;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      const changed = e.changedTouches && e.changedTouches[0];
      const endX = changed ? changed.clientX : 0;
      const endY = changed ? changed.clientY : 0;
      const totalMove = Math.hypot(endX - touchStartX, endY - touchStartY);

      // Эвристика «быстрый тап»: коротко и без смещения — всегда пробрасываем клик сами
      const SHORT_TAP_MS = 220;
      const MOVE_THRESHOLD_PX = 8;
      if (touchDuration <= SHORT_TAP_MS && totalMove <= MOVE_THRESHOLD_PX && !touchMoved) {
        // Блокируем нативный клик, который может прийти позже/не прийти из-за инерции
        try {
          e.preventDefault();
          e.stopPropagation();
        } catch {}

        // Целимся в исходную цель тапа (стабильнее на баунсе)
        const target = touchStartTarget || document.elementFromPoint(endX, endY);
        if (target) {
          try {
            const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: endX, clientY: endY });
            // Гард от двойного срабатывания
            this._lastSynthClickTs = Date.now();
            this._lastSynthClickPos = { x: endX, y: endY };
            target.dispatchEvent(evt);
          } catch {}
        }
      }
    }, { passive: false });

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