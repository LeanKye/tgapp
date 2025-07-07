// Улучшенный Bounce эффект - простая и плавная версия
class BounceScroll {
  constructor() {
    this.maxBounceDistance = 150;
    this.isAnimating = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Определяем мобильное устройство
    this.isMobile = this.detectMobile();
    
    // Отключаем bounce на десктопе или при reduced motion
    if (!this.isMobile || this.reducedMotion) return;
    
    // Простые переменные для bounce
    this.isInBounce = false;
    this.velocityTracker = [];
    this.momentumThreshold = 0.8;
    
    this.init();
  }

  // Функция определения мобильного устройства
  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 1024;
    
    return mobileRegex.test(userAgent) || (hasTouch && isSmallScreen);
  }

  init() {
    // Простые обработчики событий
    window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Touch переменные
    this.touchStartY = 0;
    this.touchCurrentY = 0;
    this.isTouching = false;
    this.lastTouchTime = 0;
    this.lastTouchY = 0;
  }

  handleTouchStart(e) {
    this.isTouching = true;
    this.touchStartY = e.touches[0].clientY;
    this.touchCurrentY = this.touchStartY;
    this.lastTouchY = this.touchStartY;
    this.lastTouchTime = performance.now();
    
    // Очищаем velocity tracker
    this.velocityTracker = [];
    
    // Останавливаем любую текущую анимацию
    this.stopAnimation();
  }

  handleTouchMove(e) {
    if (!this.isTouching || this.reducedMotion || !this.isMobile) return;

    const now = performance.now();
    this.touchCurrentY = e.touches[0].clientY;
    const deltaY = this.touchCurrentY - this.touchStartY;
    const deltaTime = now - this.lastTouchTime;
    
    // Простое отслеживание скорости
    if (deltaTime > 5) { // Минимальный интервал для стабильности
      const touchDelta = this.touchCurrentY - this.lastTouchY;
      const velocity = Math.abs(touchDelta / deltaTime);
      
      this.velocityTracker.push({
        velocity,
        time: now,
        direction: touchDelta > 0 ? 'down' : 'up'
      });
      
      // Ограничиваем историю
      if (this.velocityTracker.length > 3) {
        this.velocityTracker.shift();
      }
      
      this.lastTouchY = this.touchCurrentY;
      this.lastTouchTime = now;
    }

    // Проверяем границы
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    const isScrollingUp = deltaY > 0;
    const isScrollingDown = deltaY < 0;

    // Применяем bounce если достигли границы
    if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
      e.preventDefault();
      
      this.isInBounce = true;
      
      // ПРЯМОЕ применение без интерполяции
      const rawOffset = Math.abs(deltaY);
      const bounceOffset = this.rubberBand(rawOffset);
      const finalOffset = isScrollingUp ? bounceOffset : -bounceOffset;
      
      // Применяем трансформацию НАПРЯМУЮ
      this.applyDirectTransform(finalOffset);
      
    } else if (this.isInBounce) {
      this.isInBounce = false;
      this.returnToZero();
    }
  }

  // Прямое применение трансформации без RAF
  applyDirectTransform(offset) {
    const body = document.body;
    body.style.transform = `translateY(${offset}px)`;
    body.classList.add('bounce-scrolling');
  }

  // Простая резиновая функция
  rubberBand(offset) {
    // Максимально простая формула
    const resistance = 0.6;
    return offset * resistance * (1 - offset / (this.maxBounceDistance * 2));
  }

  handleTouchEnd(e) {
    if (!this.isTouching || this.reducedMotion || !this.isMobile) return;
    
    this.isTouching = false;
    this.isInBounce = false;
    
    // Всегда возвращаемся к нулю
    this.returnToZero();
    
    // Проверяем momentum bounce
    if (this.velocityTracker.length >= 2) {
      const avgVelocity = this.velocityTracker.reduce((sum, item) => sum + item.velocity, 0) / this.velocityTracker.length;
      const lastDirection = this.velocityTracker[this.velocityTracker.length - 1].direction;
      
      if (avgVelocity > this.momentumThreshold) {
        setTimeout(() => {
          this.checkMomentumBounce(avgVelocity, lastDirection);
        }, 100);
      }
    }
  }

  // Проверка momentum bounce
  checkMomentumBounce(velocity, direction) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtTop = scrollTop <= 5;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
    
    if ((isAtTop && direction === 'down') || (isAtBottom && direction === 'up')) {
      const bounceStrength = Math.min(velocity * 50, this.maxBounceDistance * 0.7);
      const bounceDirection = isAtTop ? 1 : -1;
      
      this.applyMomentumBounce(bounceStrength * bounceDirection);
    }
  }

  // Momentum bounce с простой анимацией
  applyMomentumBounce(offset) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    const body = document.body;
    
    // Фаза 1: Быстрый bounce
    body.style.transition = 'transform 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    body.style.transform = `translateY(${offset}px)`;
    body.classList.add('bounce-scrolling');
    
    // Фаза 2: Возврат
    setTimeout(() => {
      body.style.transition = 'transform 300ms cubic-bezier(0.165, 0.84, 0.44, 1)';
      body.style.transform = 'translateY(0px)';
      
      setTimeout(() => {
        this.resetTransform();
        this.isAnimating = false;
      }, 300);
    }, 150);
  }

  // Простой возврат к нулю
  returnToZero() {
    if (this.isAnimating) return;
    
    const body = document.body;
    body.style.transition = 'transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    body.style.transform = 'translateY(0px)';
    
    setTimeout(() => {
      this.resetTransform();
    }, 250);
  }

  // Остановка анимации
  stopAnimation() {
    const body = document.body;
    body.style.transition = 'none';
    
    // Получаем текущую позицию
    const computedStyle = window.getComputedStyle(body);
    const matrix = computedStyle.transform;
    
    if (matrix && matrix !== 'none') {
      const values = matrix.match(/matrix.*\((.+)\)/);
      if (values) {
        const matrixValues = values[1].split(', ');
        const currentY = parseFloat(matrixValues[5]) || 0;
        body.style.transform = `translateY(${currentY}px)`;
      }
    }
    
    this.isAnimating = false;
  }

  // Сброс трансформации
  resetTransform() {
    const body = document.body;
    body.style.transition = '';
    body.style.transform = '';
    body.classList.remove('bounce-scrolling');
  }

  // Переключение bounce эффекта
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

  // Уничтожение экземпляра
  destroy() {
    this.resetTransform();
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  if (window.self === window.top) {
    window.bounceScroll = new BounceScroll();
  }
});

// Экспорт для управления
window.BounceScroll = BounceScroll; 