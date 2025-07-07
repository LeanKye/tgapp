// Bounce эффект при прокрутке до упора
class BounceScroll {
  constructor() {
    this.maxBounceDistance = 150; // Максимальное расстояние bounce (как в нативных приложениях)
    this.isAnimating = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Определяем мобильное устройство
    this.isMobile = this.detectMobile();
    
    // Отключаем bounce на десктопе или при reduced motion
    if (!this.isMobile || this.reducedMotion) return;
    
    // Переменные для real-time bounce
    this.startScrollTop = 0;
    this.startTouchY = 0;
    this.currentBounceOffset = 0;
    this.isInBounce = false;
    this.touchStartTime = 0;
    
    this.init();
  }

  // Функция определения мобильного устройства
  detectMobile() {
    // Проверяем user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    
    // Проверяем touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Проверяем размер экрана (считаем планшеты мобильными)
    const isSmallScreen = window.innerWidth <= 1024;
    
    // Проверяем media query для hover (на мобильных обычно hover: none)
    const hasHover = window.matchMedia('(hover: hover)').matches;
    
    return mobileRegex.test(userAgent) || (hasTouch && isSmallScreen) || !hasHover;
  }

  init() {
    // Добавляем обработчики событий
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: false });
    window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    
    // Переменные для touch событий
    this.touchCurrentY = 0;
    this.isTouching = false;
    this.touchVelocity = 0;
    this.lastTouchTime = 0;
  }

  handleScroll(e) {
    // Теперь bounce работает только через touch события
    // Скролл нужен только для предотвращения конфликтов
    if (this.isAnimating) {
      e.preventDefault();
      return;
    }
  }

  handleTouchStart(e) {
    this.isTouching = true;
    this.touchStartY = e.touches[0].clientY;
    this.touchCurrentY = this.touchStartY;
    this.lastTouchTime = Date.now();
    this.touchStartTime = Date.now();
    
    // Запоминаем начальную позицию скролла
    this.startScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.startTouchY = this.touchStartY;
    this.currentBounceOffset = 0;
    
    // Останавливаем любую текущую анимацию bounce
    if (this.isAnimating) {
      this.stopBounceAnimation();
    }
  }

  handleTouchMove(e) {
    if (!this.isTouching || this.reducedMotion || !this.isMobile) return;

    this.touchCurrentY = e.touches[0].clientY;
    const now = Date.now();
    const deltaY = this.touchCurrentY - this.startTouchY;
    const deltaTime = now - this.lastTouchTime;
    
    // Вычисляем скорость
    this.touchVelocity = Math.abs(deltaY / deltaTime);
    this.lastTouchTime = now;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // Проверяем направление движения
    const isScrollingUp = deltaY > 0;
    const isScrollingDown = deltaY < 0;

    // Real-time bounce: если достигли границы и пытаемся прокрутить дальше
    if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
      e.preventDefault();
      
      // Входим в режим bounce
      this.isInBounce = true;
      
      // Вычисляем смещение с учетом сопротивления (как в iOS/Android)
      const rawOffset = Math.abs(deltaY);
      
      // Применяем резиновую функцию сопротивления (как в нативных приложениях)
      const rubberBandOffset = this.rubberBandClamp(rawOffset, this.maxBounceDistance);
      
      // Применяем bounce offset
      this.currentBounceOffset = isScrollingUp ? rubberBandOffset : -rubberBandOffset;
      this.applyBounceTransform(this.currentBounceOffset);
      
    } else if (this.isInBounce) {
      // Выходим из режима bounce если начали прокручивать обратно
      this.isInBounce = false;
      this.returnToNormal();
    }
  }

  handleTouchEnd(e) {
    if (!this.isTouching || this.reducedMotion || !this.isMobile) return;
    
    this.isTouching = false;
    
    // Если мы в режиме bounce, плавно возвращаемся в исходное положение
    if (this.isInBounce || Math.abs(this.currentBounceOffset) > 0) {
      this.returnToNormal();
    }
    
    this.isInBounce = false;
  }

  handleWheel(e) {
    // На десктопе bounce отключен, на мобильных bounce работает только через touch
    if (!this.isMobile || this.isAnimating || this.reducedMotion) {
      if (this.isAnimating) e.preventDefault();
      return;
    }
    
    // Предотвращаем wheel события во время touch bounce
    if (this.isInBounce) {
      e.preventDefault();
    }
  }

  // Функция резинового сопротивления как в iOS (rubber band effect)
  rubberBandClamp(offset, maxDistance) {
    // Используем функцию сопротивления как в UIScrollView (iOS)
    // f(x) = (1.0 - (1.0 / ((x * c / d) + 1.0))) * d
    // где c - коэффициент сопротивления, d - максимальная дистанция
    const c = 0.3; // Коэффициент сопротивления (0.55 как в iOS)
    const result = (1.0 - (1.0 / ((offset * c / maxDistance) + 1.0))) * maxDistance;
    return Math.min(result, maxDistance);
  }

  // Применяем bounce трансформацию к body
  applyBounceTransform(offset) {
    const body = document.body;
    body.classList.add('bounce-scrolling');
    
    // Убираем transition для real-time эффекта
    body.style.transition = 'none';
    body.style.transform = `translateY(${offset}px)`;
  }

  // Плавно возвращаемся в нормальное состояние
  returnToNormal() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    const body = document.body;
    
    // Плавный возврат с затуханием (как в нативных приложениях)
    body.style.transition = 'transform 0.45s cubic-bezier(0.165, 0.84, 0.44, 1)'; // Easing как в iOS
    body.style.transform = 'translateY(0px)';
    
    // Очистка после завершения анимации
    setTimeout(() => {
      this.resetTransform();
      this.isAnimating = false;
      this.currentBounceOffset = 0;
    }, 450);
  }

  // Останавливаем текущую анимацию bounce
  stopBounceAnimation() {
    const body = document.body;
    
    // Получаем текущую позицию трансформации
    const computedStyle = window.getComputedStyle(body);
    const matrix = computedStyle.transform;
    
    if (matrix && matrix !== 'none') {
      const values = matrix.match(/matrix.*\((.+)\)/);
      if (values) {
        const matrixValues = values[1].split(', ');
        this.currentBounceOffset = parseFloat(matrixValues[5]) || 0;
      }
    }
    
    // Убираем transition и фиксируем текущую позицию
    body.style.transition = 'none';
    body.style.transform = `translateY(${this.currentBounceOffset}px)`;
    
    this.isAnimating = false;
  }

  resetTransform() {
    const body = document.body;
    body.style.transition = '';
    body.style.transform = '';
    body.classList.remove('bounce-scrolling');
  }

  // Функция для включения/отключения bounce эффекта
  toggle(enabled = true) {
    if (enabled) {
      if (!this.enabled) {
        this.init();
        this.enabled = true;
      }
    } else {
      this.resetTransform();
      this.enabled = false;
    }
  }
}

// Инициализация bounce scroll
document.addEventListener('DOMContentLoaded', () => {
  // Создаем экземпляр только если это не в iframe (избегаем конфликтов)
  if (window.self === window.top) {
    window.bounceScroll = new BounceScroll();
    
    // Отладочная информация
    const bounceScroll = window.bounceScroll;
    if (bounceScroll && bounceScroll.isMobile !== undefined) {
      // Bounce scroll активен
      if (bounceScroll.isMobile) {
        // Real-time bounce режим
      }
    }
  }
});

// Экспортируем для возможности управления
window.BounceScroll = BounceScroll; 