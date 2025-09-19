// Улучшенный bounce scroll эффект как в блоке "Новинки"
class BounceScroll {
  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = this.detectMobile();
    
    if (!this.isMobile || this.reducedMotion) return;
    
    // Гард от двойного клика после синтетического
    this._lastSynthClickTs = 0;
    this._lastSynthClickPos = { x: 0, y: 0 };
    // Трекинг инерции
    this._lastScrollTime = performance.now();
    this._cancelMomentumOnTap = false;
    this._tapStartTarget = null;
    this._tapStartX = 0;
    this._tapStartY = 0;
    this._tapMoved = false;
    this._tapStartTs = 0;
    
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

    // Трекинг скролла (для детекции инерции/баунса)
    let isScrolling = false;
    let scrollTimeout;
    document.addEventListener('scroll', () => {
      this._lastScrollTime = performance.now();
      if (!isScrolling) {
        document.body.classList.add('is-scrolling');
        isScrolling = true;
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
        isScrolling = false;
      }, 150);
    }, { passive: true });

    // Управление тапом для остановки инерции и надёжного клика
    document.addEventListener('touchstart', (e) => {
      this._tapStartTs = Date.now();
      const t = e.touches && e.touches[0];
      this._tapStartX = t ? t.clientX : 0;
      this._tapStartY = t ? t.clientY : 0;
      this._tapMoved = false;
      this._tapStartTarget = document.elementFromPoint(this._tapStartX, this._tapStartY);

      // Если только что был скролл (инерция/баунс), останавливаем его и готовим синтетический клик
      const sinceScrollMs = performance.now() - this._lastScrollTime;
      if (sinceScrollMs < 220 || document.body.classList.contains('is-scrolling')) {
        this._cancelMomentumOnTap = true;
        try { e.preventDefault(); } catch {}
      } else {
        this._cancelMomentumOnTap = false;
      }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      const move = Math.hypot(t.clientX - this._tapStartX, t.clientY - this._tapStartY);
      if (move > 8) this._tapMoved = true;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const duration = Date.now() - this._tapStartTs;
      const changed = e.changedTouches && e.changedTouches[0];
      const endX = changed ? changed.clientX : this._tapStartX;
      const endY = changed ? changed.clientY : this._tapStartY;
      const totalMove = Math.hypot(endX - this._tapStartX, endY - this._tapStartY);

      const SHORT_TAP_MS = 260;
      const MOVE_THRESHOLD_PX = 10;

      const shouldSynthClick = (
        duration <= SHORT_TAP_MS && totalMove <= MOVE_THRESHOLD_PX && !this._tapMoved
      );

      if (this._cancelMomentumOnTap && shouldSynthClick) {
        try {
          e.preventDefault();
          e.stopPropagation();
        } catch {}
        const target = this._tapStartTarget || document.elementFromPoint(endX, endY);
        if (target) {
          try {
            const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: endX, clientY: endY });
            this._lastSynthClickTs = Date.now();
            this._lastSynthClickPos = { x: endX, y: endY };
            target.dispatchEvent(evt);
          } catch {}
        }
      }

      // Сброс флагов
      this._cancelMomentumOnTap = false;
      this._tapStartTarget = null;
      this._tapMoved = false;
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