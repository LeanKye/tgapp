// Улучшенный Bounce эффект с инерционным скроллингом
class BounceScroll {
  constructor() {
    this.maxBounceDistance = 120; // Максимальное расстояние bounce
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
    
    // Переменные для инерционного скролла
    this.velocityTracker = [];
    this.maxVelocityHistory = 5;
    this.momentumThreshold = 0.5; // Минимальная скорость для momentum bounce
    this.lastScrollTime = 0;
    this.lastScrollPosition = 0;
    this.scrollVelocity = 0;
    this.momentumTimer = null;
    
    // Переменные для плавности
    this.rafId = null;
    this.lastFrameTime = 0;
    this.smoothingFactor = 0.85; // Фактор сглаживания для более плавного эффекта
    
    this.init();
  }

  // Функция определения мобильного устройства
  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 1024;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    
    return mobileRegex.test(userAgent) || (hasTouch && isSmallScreen) || !hasHover;
  }

  init() {
    // Добавляем обработчики событий
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: false });
    window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Переменные для touch событий
    this.touchCurrentY = 0;
    this.isTouching = false;
    this.touchVelocity = 0;
    this.lastTouchTime = 0;
    
    // Инициализируем отслеживание скорости скролла
    this.initScrollVelocityTracking();
  }

  // Инициализация отслеживания скорости скролла для инерционного bounce
  initScrollVelocityTracking() {
    let lastKnownScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    let ticking = false;

    const updateScrollVelocity = () => {
      const currentTime = performance.now();
      const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
      const deltaTime = currentTime - this.lastScrollTime;
      const deltaPosition = currentPosition - this.lastScrollPosition;
      
      if (deltaTime > 0) {
        // Вычисляем скорость (пикселей в миллисекунду)
        const newVelocity = Math.abs(deltaPosition / deltaTime);
        
        // Добавляем в трекер скорости с временной меткой
        this.velocityTracker.push({
          velocity: newVelocity,
          time: currentTime,
          position: currentPosition,
          direction: deltaPosition > 0 ? 'down' : 'up'
        });
        
        // Ограничиваем историю скорости
        if (this.velocityTracker.length > this.maxVelocityHistory) {
          this.velocityTracker.shift();
        }
        
        // Обновляем последние значения
        this.lastScrollTime = currentTime;
        this.lastScrollPosition = currentPosition;
        this.scrollVelocity = newVelocity;
        
        // Проверяем, нужно ли применить momentum bounce
        this.checkMomentumBounce(currentPosition, newVelocity, deltaPosition > 0 ? 'down' : 'up');
      }
      
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking && !this.isTouching) {
        requestAnimationFrame(updateScrollVelocity);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Инициализируем начальные значения
    this.lastScrollTime = performance.now();
    this.lastScrollPosition = lastKnownScrollPosition;
  }

  // Проверка и применение momentum bounce
  checkMomentumBounce(currentPosition, velocity, direction) {
    if (this.isAnimating || this.isTouching || velocity < this.momentumThreshold) return;
    
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtTop = currentPosition <= 0;
    const isAtBottom = currentPosition + clientHeight >= scrollHeight - 1;
    
    // Применяем momentum bounce если достигли границы с достаточной скоростью
    if ((isAtTop && direction === 'up') || (isAtBottom && direction === 'down')) {
      // Вычисляем силу bounce на основе скорости
      const bounceStrength = Math.min(velocity * 50, this.maxBounceDistance);
      const bounceDirection = isAtTop ? 1 : -1;
      
      this.applyMomentumBounce(bounceStrength * bounceDirection, velocity);
    }
  }

  // Применение momentum bounce с динамической силой
  applyMomentumBounce(offset, velocity) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    const body = document.body;
    
    // Добавляем класс для bounce состояния
    body.classList.add('bounce-scrolling');
    
    // Фаза 1: Bounce с динамической силой
    const bounceDistance = Math.abs(offset);
    const bounceDuration = Math.min(200 + velocity * 50, 400); // Динамическая длительность
    
    // Применяем начальный bounce
    body.style.transition = `transform ${bounceDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    body.style.transform = `translateY(${offset}px)`;
    
    // Фаза 2: Возврат с затуханием
    setTimeout(() => {
      const returnDuration = Math.max(300, bounceDuration * 1.2);
      body.style.transition = `transform ${returnDuration}ms cubic-bezier(0.165, 0.84, 0.44, 1)`;
      body.style.transform = 'translateY(0px)';
      
      // Очистка после завершения
      setTimeout(() => {
        this.resetTransform();
        this.isAnimating = false;
      }, returnDuration);
    }, bounceDuration);
  }

  handleScroll(e) {
    // Теперь scroll используется для momentum detection
    if (this.isAnimating && this.isTouching) {
      e.preventDefault();
      return;
    }
  }

  handleTouchStart(e) {
    this.isTouching = true;
    this.touchStartY = e.touches[0].clientY;
    this.touchCurrentY = this.touchStartY;
    this.lastTouchTime = performance.now();
    this.touchStartTime = performance.now();
    
    // Очищаем velocity tracker для новой touch сессии
    this.velocityTracker = [];
    
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
    const now = performance.now();
    const deltaY = this.touchCurrentY - this.startTouchY;
    const deltaTime = now - this.lastTouchTime;
    
    // Вычисляем скорость touch движения
    if (deltaTime > 0) {
      this.touchVelocity = Math.abs(deltaY / deltaTime);
      
      // Добавляем в velocity tracker
      this.velocityTracker.push({
        velocity: this.touchVelocity,
        time: now,
        delta: deltaY,
        direction: deltaY > 0 ? 'down' : 'up'
      });
      
      if (this.velocityTracker.length > this.maxVelocityHistory) {
        this.velocityTracker.shift();
      }
    }
    
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
      
      // Вычисляем смещение с улучшенной резиновой функцией
      const rawOffset = Math.abs(deltaY);
      const rubberBandOffset = this.improvedRubberBand(rawOffset, this.maxBounceDistance);
      
      // Применяем bounce offset с сглаживанием
      this.currentBounceOffset = isScrollingUp ? rubberBandOffset : -rubberBandOffset;
      this.applySmoothBounceTransform(this.currentBounceOffset);
      
    } else if (this.isInBounce) {
      // Выходим из режима bounce если начали прокручивать обратно
      this.isInBounce = false;
      this.returnToNormalSmooth();
    }
  }

  handleTouchEnd(e) {
    if (!this.isTouching || this.reducedMotion || !this.isMobile) return;
    
    this.isTouching = false;
    
    // Если мы в режиме bounce, плавно возвращаемся в исходное положение
    if (this.isInBounce || Math.abs(this.currentBounceOffset) > 0) {
      this.returnToNormalSmooth();
    } else {
      // Проверяем, нужно ли применить momentum bounce после отпускания
      this.checkTouchEndMomentum();
    }
    
    this.isInBounce = false;
  }

  // Проверка momentum bounce при окончании touch
  checkTouchEndMomentum() {
    if (this.velocityTracker.length < 2) return;
    
    // Берем последние замеры скорости для более точного определения
    const recentVelocities = this.velocityTracker.slice(-3);
    const avgVelocity = recentVelocities.reduce((sum, item) => sum + item.velocity, 0) / recentVelocities.length;
    const lastDirection = recentVelocities[recentVelocities.length - 1].direction;
    
    // Проверяем границы
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtTop = scrollTop <= 5; // Небольшой буфер
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
    
    // Применяем momentum bounce если скорость достаточна и мы у границы
    if (avgVelocity > this.momentumThreshold) {
      if ((isAtTop && lastDirection === 'down') || (isAtBottom && lastDirection === 'up')) {
        const bounceStrength = Math.min(avgVelocity * 80, this.maxBounceDistance);
        const bounceDirection = isAtTop ? 1 : -1;
        
        setTimeout(() => {
          this.applyMomentumBounce(bounceStrength * bounceDirection, avgVelocity);
        }, 50); // Небольшая задержка для естественности
      }
    }
  }

  // Улучшенная функция резинового сопротивления
  improvedRubberBand(offset, maxDistance) {
    // Используем более плавную функцию с лучшим ощущением сопротивления
    const c = 0.4; // Коэффициент сопротивления
    const normalizedOffset = offset / maxDistance;
    
    // Комбинируем экспоненциальную и линейную функции для лучшего ощущения
    const exponentialPart = (1 - Math.exp(-normalizedOffset * c)) * maxDistance;
    const linearPart = normalizedOffset * maxDistance * 0.1;
    
    const result = exponentialPart + linearPart;
    return Math.min(result, maxDistance);
  }

  // Применяем плавную bounce трансформацию
  applySmoothBounceTransform(offset) {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    this.rafId = requestAnimationFrame(() => {
      const body = document.body;
      body.classList.add('bounce-scrolling');
      
      // Убираем transition для real-time эффекта
      body.style.transition = 'none';
      body.style.transform = `translateY(${offset}px)`;
      
      // Добавляем subtle scale эффект для большей реалистичности
      const scaleValue = 1 + Math.abs(offset) / (this.maxBounceDistance * 10);
      body.style.transformOrigin = offset > 0 ? 'top center' : 'bottom center';
      body.style.transform = `translateY(${offset}px) scaleY(${Math.min(scaleValue, 1.02)})`;
    });
  }

  // Плавный возврат в нормальное состояние
  returnToNormalSmooth() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    const body = document.body;
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    // Плавный возврат с улучшенным easing
    const returnDuration = Math.abs(this.currentBounceOffset) > 50 ? 500 : 350;
    body.style.transition = `transform ${returnDuration}ms cubic-bezier(0.175, 0.885, 0.32, 1.1)`;
    body.style.transform = 'translateY(0px) scaleY(1)';
    body.style.transformOrigin = 'center center';
    
    // Очистка после завершения анимации
    setTimeout(() => {
      this.resetTransform();
      this.isAnimating = false;
      this.currentBounceOffset = 0;
    }, returnDuration);
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
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    body.style.transition = '';
    body.style.transform = '';
    body.style.transformOrigin = '';
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

// Инициализация улучшенного bounce scroll
document.addEventListener('DOMContentLoaded', () => {
  // Создаем экземпляр только если это не в iframe
  if (window.self === window.top) {
    window.bounceScroll = new BounceScroll();
  }
});

// Экспортируем для возможности управления
window.BounceScroll = BounceScroll; 