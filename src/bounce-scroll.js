// Улучшенный Bounce эффект с плавной анимацией
class BounceScroll {
  constructor() {
    this.maxBounceDistance = 180; // Уменьшили для более естественного вида
    this.isAnimating = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Определяем мобильное устройство
    this.isMobile = this.detectMobile();
    
    // Отключаем bounce на десктопе или при reduced motion
    if (!this.isMobile || this.reducedMotion) return;
    
    // Переменные для bounce
    this.currentBounceOffset = 0;
    this.targetBounceOffset = 0;
    this.isInBounce = false;
    this.lastInteraction = 0;
    
    // Переменные для velocity tracking
    this.velocityTracker = [];
    this.maxVelocityHistory = 3; // Уменьшили для стабильности
    this.momentumThreshold = 0.3;
    
    // Переменные для плавности
    this.rafId = null;
    this.isRafRunning = false;
    this.smoothingFactor = 0.15; // Увеличили для более плавного движения
    
    // Throttling
    this.touchMoveThrottled = this.throttle(this.handleTouchMove.bind(this), 16); // ~60fps
    this.scrollThrottled = this.throttle(this.handleScroll.bind(this), 16);
    
    this.init();
  }

  // Throttling функция
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
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
    // Добавляем обработчики событий
    window.addEventListener('scroll', this.scrollThrottled, { passive: true });
    window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    window.addEventListener('touchmove', this.touchMoveThrottled, { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Touch переменные
    this.touchStartY = 0;
    this.touchCurrentY = 0;
    this.isTouching = false;
    this.touchStartTime = 0;
    this.lastTouchTime = 0;
    this.lastTouchY = 0;
    
    // Запускаем основной цикл анимации
    this.startAnimationLoop();
  }

  // Основной цикл анимации
  startAnimationLoop() {
    if (this.isRafRunning) return;
    
    this.isRafRunning = true;
    
    const animate = () => {
      if (this.isInBounce || Math.abs(this.currentBounceOffset) > 0.1) {
        this.updateBounceAnimation();
        this.rafId = requestAnimationFrame(animate);
      } else {
        this.isRafRunning = false;
        this.resetTransform();
      }
    };
    
    this.rafId = requestAnimationFrame(animate);
  }

  // Обновление анимации bounce
  updateBounceAnimation() {
    // Плавная интерполяция к целевому значению
    const diff = this.targetBounceOffset - this.currentBounceOffset;
    this.currentBounceOffset += diff * this.smoothingFactor;
    
    // Применяем трансформацию
    const body = document.body;
    body.classList.add('bounce-scrolling');
    body.style.transform = `translateY(${this.currentBounceOffset}px)`;
    
    // Если достигли цели, останавливаем анимацию
    if (Math.abs(diff) < 0.1 && !this.isInBounce) {
      this.targetBounceOffset = 0;
      this.currentBounceOffset = 0;
    }
  }

  handleScroll(e) {
    if (this.isAnimating || this.isTouching) return;
    
    const now = performance.now();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Обновляем velocity tracker
    this.updateVelocityTracker(scrollTop, now);
    
    // Проверяем momentum bounce
    this.checkMomentumBounce(scrollTop);
  }

  // Обновляем трекер скорости
  updateVelocityTracker(position, time) {
    if (this.velocityTracker.length > 0) {
      const lastEntry = this.velocityTracker[this.velocityTracker.length - 1];
      const deltaTime = time - lastEntry.time;
      const deltaPosition = position - lastEntry.position;
      
      if (deltaTime > 0) {
        const velocity = Math.abs(deltaPosition / deltaTime);
        
        this.velocityTracker.push({
          velocity,
          time,
          position,
          direction: deltaPosition > 0 ? 'down' : 'up'
        });
        
        // Ограничиваем историю
        if (this.velocityTracker.length > this.maxVelocityHistory) {
          this.velocityTracker.shift();
        }
      }
    } else {
      this.velocityTracker.push({
        velocity: 0,
        time,
        position,
        direction: 'none'
      });
    }
  }

  // Проверка momentum bounce
  checkMomentumBounce(scrollTop) {
    if (this.velocityTracker.length < 2) return;
    
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    
    if (!isAtTop && !isAtBottom) return;
    
    const lastEntry = this.velocityTracker[this.velocityTracker.length - 1];
    const direction = lastEntry.direction;
    
    // Применяем momentum bounce
    if (lastEntry.velocity > this.momentumThreshold) {
      if ((isAtTop && direction === 'up') || (isAtBottom && direction === 'down')) {
        const bounceStrength = Math.min(lastEntry.velocity * 60, this.maxBounceDistance);
        const bounceDirection = isAtTop ? 1 : -1;
        
        this.applyMomentumBounce(bounceStrength * bounceDirection);
      }
    }
  }

  // Применяем momentum bounce
  applyMomentumBounce(offset) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.targetBounceOffset = offset;
    
    if (!this.isRafRunning) {
      this.startAnimationLoop();
    }
    
    // Автоматически возвращаемся к нулю
    setTimeout(() => {
      this.targetBounceOffset = 0;
      
      setTimeout(() => {
        this.isAnimating = false;
      }, 400);
    }, 200);
  }

  handleTouchStart(e) {
    this.isTouching = true;
    this.touchStartY = e.touches[0].clientY;
    this.touchCurrentY = this.touchStartY;
    this.lastTouchY = this.touchStartY;
    this.touchStartTime = performance.now();
    this.lastTouchTime = this.touchStartTime;
    
    // Очищаем velocity tracker
    this.velocityTracker = [];
    
    // Останавливаем текущую анимацию
    this.isAnimating = false;
    this.isInBounce = false;
  }

  handleTouchMove(e) {
    if (!this.isTouching || this.reducedMotion || !this.isMobile) return;

    const now = performance.now();
    this.touchCurrentY = e.touches[0].clientY;
    const deltaY = this.touchCurrentY - this.touchStartY;
    const deltaTime = now - this.lastTouchTime;
    
    // Обновляем velocity tracker для touch
    if (deltaTime > 0) {
      const touchDelta = this.touchCurrentY - this.lastTouchY;
      const velocity = Math.abs(touchDelta / deltaTime);
      
      this.velocityTracker.push({
        velocity,
        time: now,
        delta: touchDelta,
        direction: touchDelta > 0 ? 'down' : 'up'
      });
      
      if (this.velocityTracker.length > this.maxVelocityHistory) {
        this.velocityTracker.shift();
      }
    }
    
    this.lastTouchY = this.touchCurrentY;
    this.lastTouchTime = now;

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
      
      // Улучшенная резиновая функция
      const rawOffset = Math.abs(deltaY);
      const rubberBandOffset = this.rubberBand(rawOffset);
      
      this.targetBounceOffset = isScrollingUp ? rubberBandOffset : -rubberBandOffset;
      
      if (!this.isRafRunning) {
        this.startAnimationLoop();
      }
    } else if (this.isInBounce) {
      this.isInBounce = false;
      this.targetBounceOffset = 0;
    }
  }

  // Улучшенная резиновая функция (более простая и плавная)
  rubberBand(offset) {
    // Используем простую логарифмическую функцию для плавного сопротивления
    const resistance = 0.5;
    const normalized = offset / this.maxBounceDistance;
    
    return this.maxBounceDistance * (1 - Math.exp(-normalized * resistance));
  }

  handleTouchEnd(e) {
    if (!this.isTouching || this.reducedMotion || !this.isMobile) return;
    
    this.isTouching = false;
    
    // Всегда возвращаемся к нулю
    this.targetBounceOffset = 0;
    this.isInBounce = false;
    
    // Проверяем momentum bounce
    if (this.velocityTracker.length >= 2) {
      const avgVelocity = this.velocityTracker.reduce((sum, item) => sum + item.velocity, 0) / this.velocityTracker.length;
      const lastDirection = this.velocityTracker[this.velocityTracker.length - 1].direction;
      
      if (avgVelocity > this.momentumThreshold) {
        setTimeout(() => {
          this.checkTouchEndMomentum(avgVelocity, lastDirection);
        }, 50);
      }
    }
  }

  // Проверка momentum bounce при окончании касания
  checkTouchEndMomentum(velocity, direction) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtTop = scrollTop <= 5;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
    
    if ((isAtTop && direction === 'down') || (isAtBottom && direction === 'up')) {
      const bounceStrength = Math.min(velocity * 70, this.maxBounceDistance);
      const bounceDirection = isAtTop ? 1 : -1;
      
      this.applyMomentumBounce(bounceStrength * bounceDirection);
    }
  }

  // Сброс трансформации
  resetTransform() {
    const body = document.body;
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    body.style.transform = '';
    body.classList.remove('bounce-scrolling');
    
    this.currentBounceOffset = 0;
    this.targetBounceOffset = 0;
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
    window.removeEventListener('scroll', this.scrollThrottled);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.touchMoveThrottled);
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