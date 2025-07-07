// Нативный Bounce Scroll как в Telegram/Яндекс.Маркете
class BounceScroll {
  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = this.detectMobile();
    
    if (!this.isMobile || this.reducedMotion) return;
    
    // Параметры физики (как в нативных приложениях)
    this.maxBounceDistance = 120;
    this.friction = 0.95;
    this.snapBackForce = 0.15;
    this.momentumVelocityThreshold = 0.1;
    
    // Состояние
    this.isActive = false;
    this.isTouching = false;
    this.velocity = 0;
    this.currentOffset = 0;
    this.targetOffset = 0;
    
    // Touch tracking
    this.touchStartY = 0;
    this.touchLastY = 0;
    this.touchStartTime = 0;
    this.touchLastTime = 0;
    this.touchHistory = [];
    
    // Animation
    this.animationId = null;
    
    this.init();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window && window.innerWidth <= 1024);
  }

  init() {
    // Добавляем CSS для плавности
    this.addStyles();
    
    // Touch события
    document.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
    
    // Предотвращаем системный bounce
    document.addEventListener('touchmove', (e) => {
      if (this.isActive) e.preventDefault();
    }, { passive: false });
    
    // Начинаем анимационный цикл
    this.startAnimationLoop();
  }

  addStyles() {
    if (document.getElementById('bounce-scroll-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'bounce-scroll-styles';
    style.textContent = `
      .bounce-scroll-active {
        overflow: hidden;
        position: relative;
      }
      .bounce-scroll-content {
        will-change: transform;
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `;
    document.head.appendChild(style);
  }

  onTouchStart(e) {
    this.isTouching = true;
    this.touchStartY = e.touches[0].clientY;
    this.touchLastY = this.touchStartY;
    this.touchStartTime = Date.now();
    this.touchLastTime = this.touchStartTime;
    this.touchHistory = [];
    
    // Останавливаем текущую анимацию
    this.velocity = 0;
    this.stopAnimation();
  }

  onTouchMove(e) {
    if (!this.isTouching) return;
    
    const currentY = e.touches[0].clientY;
    const currentTime = Date.now();
    const deltaY = currentY - this.touchStartY;
    const deltaTime = currentTime - this.touchLastTime;
    
    // Обновляем историю касаний для momentum
    if (deltaTime > 0) {
      const instantVelocity = (currentY - this.touchLastY) / deltaTime;
      this.touchHistory.push({
        time: currentTime,
        velocity: instantVelocity,
        position: currentY
      });
      
      // Ограничиваем историю
      if (this.touchHistory.length > 5) {
        this.touchHistory.shift();
      }
    }
    
    // Проверяем границы скролла
    const scrollTop = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + windowHeight >= scrollHeight - 1;
    
    // Определяем направление
    const isScrollingUp = deltaY > 0;
    const isScrollingDown = deltaY < 0;
    
    // Активируем bounce только на границах
    if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
      e.preventDefault();
      
      if (!this.isActive) {
        this.isActive = true;
        document.body.classList.add('bounce-scroll-active');
        document.body.classList.add('bounce-scroll-content');
      }
      
      // Применяем rubber band эффект
      const rubberBandOffset = this.calculateRubberBand(Math.abs(deltaY));
      this.currentOffset = isScrollingUp ? rubberBandOffset : -rubberBandOffset;
      this.updateTransform();
      
    } else if (this.isActive) {
      // Выходим из bounce режима
      this.deactivate();
    }
    
    this.touchLastY = currentY;
    this.touchLastTime = currentTime;
  }

  onTouchEnd(e) {
    if (!this.isTouching) return;
    
    this.isTouching = false;
    
    if (this.isActive) {
      // Запускаем snap-back анимацию
      this.startSnapBack();
    } else {
      // Проверяем momentum bounce
      this.checkMomentumBounce();
    }
  }

  calculateRubberBand(distance) {
    // Формула как в iOS (более естественная)
    const resistance = 0.5;
    const maxDistance = this.maxBounceDistance;
    
    if (distance <= 0) return 0;
    
    // Используем формулу rubber band из iOS
    const result = maxDistance * (1 - (1 / ((distance * resistance / maxDistance) + 1)));
    return Math.min(result, maxDistance);
  }

  updateTransform() {
    // Применяем transform с аппаратным ускорением
    const transform = `translate3d(0, ${this.currentOffset}px, 0)`;
    document.body.style.transform = transform;
  }

  startSnapBack() {
    this.targetOffset = 0;
    this.velocity = 0;
    
    // Используем плавную анимацию возврата
    const duration = 300;
    const startOffset = this.currentOffset;
    const startTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Используем easing функцию как в iOS
      const easeProgress = this.easeOutCubic(progress);
      this.currentOffset = startOffset * (1 - easeProgress);
      
      this.updateTransform();
      
      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.deactivate();
      }
    };
    
    animate();
  }

  checkMomentumBounce() {
    if (this.touchHistory.length < 2) return;
    
    // Вычисляем среднюю скорость из последних касаний
    const recentHistory = this.touchHistory.slice(-3);
    const avgVelocity = recentHistory.reduce((sum, item) => sum + item.velocity, 0) / recentHistory.length;
    
    if (Math.abs(avgVelocity) < this.momentumVelocityThreshold) return;
    
    // Проверяем границы
    const scrollTop = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const isAtTop = scrollTop <= 5;
    const isAtBottom = scrollTop + windowHeight >= scrollHeight - 5;
    
    const isMovingUp = avgVelocity > 0;
    const isMovingDown = avgVelocity < 0;
    
    if ((isAtTop && isMovingUp) || (isAtBottom && isMovingDown)) {
      // Запускаем momentum bounce
      this.startMomentumBounce(avgVelocity);
    }
  }

  startMomentumBounce(initialVelocity) {
    this.isActive = true;
    document.body.classList.add('bounce-scroll-active');
    document.body.classList.add('bounce-scroll-content');
    
    this.velocity = initialVelocity;
    this.currentOffset = 0;
    
    // Запускаем физическую анимацию
    this.startPhysicsAnimation();
  }

  startPhysicsAnimation() {
    const animate = () => {
      if (!this.isActive) return;
      
      // Обновляем позицию на основе скорости
      this.currentOffset += this.velocity * 16; // 16ms frame time
      
      // Применяем rubber band resistance
      const maxOffset = this.maxBounceDistance;
      if (Math.abs(this.currentOffset) > maxOffset) {
        this.currentOffset = Math.sign(this.currentOffset) * maxOffset;
        this.velocity *= -0.5; // Отскок
      }
      
      // Применяем трение
      this.velocity *= this.friction;
      
      // Применяем возвращающую силу
      if (this.currentOffset !== 0) {
        const snapForce = -this.currentOffset * this.snapBackForce;
        this.velocity += snapForce;
      }
      
      this.updateTransform();
      
      // Проверяем остановку
      if (Math.abs(this.velocity) < 0.01 && Math.abs(this.currentOffset) < 0.5) {
        this.deactivate();
        return;
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  startAnimationLoop() {
    // Основной цикл обновления (для плавности)
    const loop = () => {
      if (this.isActive && !this.isTouching) {
        // Дополнительная логика если нужна
      }
      requestAnimationFrame(loop);
    };
    
    loop();
  }

  deactivate() {
    this.isActive = false;
    this.currentOffset = 0;
    this.velocity = 0;
    this.stopAnimation();
    
    document.body.classList.remove('bounce-scroll-active');
    document.body.classList.remove('bounce-scroll-content');
    document.body.style.transform = '';
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Easing функции как в нативных приложениях
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  // Управление
  destroy() {
    this.stopAnimation();
    this.deactivate();
    
    document.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
    
    const styles = document.getElementById('bounce-scroll-styles');
    if (styles) styles.remove();
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  if (window.self === window.top) {
    window.bounceScroll = new BounceScroll();
  }
});

window.BounceScroll = BounceScroll; 