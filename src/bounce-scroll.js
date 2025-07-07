// Bounce эффект при прокрутке до упора
class BounceScroll {
  constructor() {
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.lastScrollTop = 0;
    this.velocityThreshold = 3; // Минимальная скорость для bounce (понижено для более чувствительного bounce)
    this.bounceDistance = 150; // Максимальное расстояние bounce в пикселях (увеличено для более заметного эффекта)
    this.isAnimating = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Определяем мобильное устройство
    this.isMobile = this.detectMobile();
    
    // Отключаем bounce на десктопе или при reduced motion
    if (!this.isMobile || this.reducedMotion) return;
    
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
    this.touchStartY = 0;
    this.touchCurrentY = 0;
    this.isTouching = false;
    this.touchVelocity = 0;
    this.lastTouchTime = 0;
  }

  handleScroll(e) {
    if (this.isAnimating || this.reducedMotion || !this.isMobile) {
      if (this.isAnimating) e.preventDefault();
      return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // Определяем скорость прокрутки
    const velocity = Math.abs(scrollTop - this.lastScrollTop);
    this.lastScrollTop = scrollTop;

    // Запускаем bounce если пользователь прокрутил до упора с достаточной скоростью
    if ((isAtTop || isAtBottom) && velocity > this.velocityThreshold && !this.isScrolling) {
      // Добавляем небольшую задержку для предотвращения множественных bounce
      this.isScrolling = true;
      this.triggerBounce(isAtTop ? 'top' : 'bottom', velocity);
      
      // Сбрасываем флаг через короткое время
      setTimeout(() => {
        this.isScrolling = false;
      }, 100);
    }
  }

  handleTouchStart(e) {
    this.isTouching = true;
    this.touchStartY = e.touches[0].clientY;
    this.touchCurrentY = this.touchStartY;
    this.lastTouchTime = Date.now();
  }

  handleTouchMove(e) {
    if (!this.isTouching || this.isAnimating || this.reducedMotion || !this.isMobile) return;

    this.touchCurrentY = e.touches[0].clientY;
    const now = Date.now();
    const deltaY = this.touchCurrentY - this.touchStartY;
    const deltaTime = now - this.lastTouchTime;
    
    // Вычисляем скорость
    this.touchVelocity = Math.abs(deltaY / deltaTime);
    this.lastTouchTime = now;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // Если пытаемся прокрутить за пределы
    if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
      // Создаем более плавный эффект сопротивления
      const resistance = Math.min(Math.abs(deltaY) / 80, 0.7); // Увеличиваем максимальное сопротивление
      if (resistance > 0.05) { // Понижаем порог для более чувствительной реакции
        e.preventDefault();
        this.applyResistance(deltaY > 0 ? 'top' : 'bottom', resistance);
      }
    }
  }

  handleTouchEnd(e) {
    if (!this.isTouching || this.reducedMotion || !this.isMobile) return;
    
    this.isTouching = false;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // Если была попытка прокрутки за пределы с достаточной скоростью
    if ((isAtTop || isAtBottom) && this.touchVelocity > 0.3) { // Понижаем порог для более чувствительного bounce
      this.triggerBounce(isAtTop ? 'top' : 'bottom', this.touchVelocity * 25); // Увеличиваем множитель для более выраженного эффекта
    }

    // Убираем эффект сопротивления
    this.resetTransform();
  }

  handleWheel(e) {
    // На десктопе полностью отключаем bounce эффект
    if (!this.isMobile || this.isAnimating || this.reducedMotion) {
      if (this.isAnimating) e.preventDefault();
      return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // Проверяем направление прокрутки колеса
    const deltaY = e.deltaY;
    const velocity = Math.abs(deltaY);

    if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
      if (velocity > 30) { // Понижаем пороговое значение для более чувствительного bounce
        e.preventDefault();
        this.triggerBounce(deltaY < 0 ? 'top' : 'bottom', velocity / 8); // Увеличиваем чувствительность
      }
    }
  }

  applyResistance(direction, intensity) {
    const body = document.body;
    
    // Применяем более плавную кривую сопротивления
    const smoothIntensity = Math.pow(intensity, 0.7); // Делаем кривую более плавной
    const translateY = direction === 'top' ? 
      Math.min(smoothIntensity * this.bounceDistance * 0.8, this.bounceDistance) : 
      -Math.min(smoothIntensity * this.bounceDistance * 0.8, this.bounceDistance);
    
    body.classList.add('bounce-scrolling');
    body.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)'; // Более плавный переход
    body.style.transform = `translateY(${translateY}px)`;
  }

  triggerBounce(direction, velocity) {
    if (this.isAnimating || this.reducedMotion || !this.isMobile) return;
    
    this.isAnimating = true;
    const body = document.body;
    
    // Добавляем класс для оптимизации
    body.classList.add('bounce-scrolling');
    
    // Вычисляем силу bounce на основе скорости с более плавной кривой
    const bounceIntensity = Math.min(Math.pow(velocity / 8, 0.8), 1);
    const maxBounce = this.bounceDistance * Math.max(bounceIntensity, 0.4); // Минимум 40% bounce
    
    const translateY = direction === 'top' ? maxBounce : -maxBounce;
    
    // Фаза 1: Bounce с более тягучей анимацией
    body.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Более тягучая easing
    body.style.transform = `translateY(${translateY}px)`;
    
    // Фаза 2: Медленный возврат с затуханием
    setTimeout(() => {
      body.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)'; // Более длинный и плавный возврат
      body.style.transform = 'translateY(0px)';
      
      // Финальная очистка
      setTimeout(() => {
        this.resetTransform();
        this.isAnimating = false;
      }, 600); // Увеличено время для завершения анимации
    }, 350); // Увеличено время bounce фазы
  }

  resetTransform() {
    const body = document.body;
    
    // Плавно убираем transform
    body.style.transition = 'transform 0.2s ease-out';
    body.style.transform = 'translateY(0px)';
    
    // Через небольшое время полностью очищаем стили
    setTimeout(() => {
      body.style.transition = '';
      body.style.transform = '';
      body.classList.remove('bounce-scrolling');
    }, 200);
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
      console.log('🎾 Bounce Scroll:', bounceScroll.isMobile ? 'включен (мобильное устройство)' : 'отключен (десктоп)');
    }
  }
});

// Экспортируем для возможности управления
window.BounceScroll = BounceScroll; 