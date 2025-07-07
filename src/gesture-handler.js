// Система управления жестами для iOS и Android
class GestureHandler {
  constructor() {
    this.isEnabled = true;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.touchStartTime = 0;
    this.minSwipeDistance = 80;
    this.maxSwipeTime = 500;
    this.isSwipeInProgress = false;
    
    // Настройки для различных типов жестов
    this.gestures = {
      swipeLeft: { enabled: true, threshold: 80 },
      swipeRight: { enabled: true, threshold: 80 },
      swipeUp: { enabled: false, threshold: 100 },
      swipeDown: { enabled: false, threshold: 100 },
      pullToRefresh: { enabled: false, threshold: 120 },
      edgeSwipe: { enabled: true, threshold: 20 } // Свайп с края экрана
    };
    
    this.init();
  }

  init() {
    if (!this.isMobile()) {
      return;
    }

    this.setupEventListeners();
    this.setupEdgeSwipe();
    this.setupVisualFeedback();
    this.showGestureInfo();
  }
  
  showGestureInfo() {
    console.log(`
🎯 Система жестов активирована!

📱 Доступные жесты:
  • Свайп вправо → Возврат назад
  • Свайп влево → Вперед (если доступно)
  • Edge swipe → Свайп с левого края экрана

⚙️ Управление:
  • enableGestures() - включить все жесты
  • disableGestures() - отключить все жесты
  • toggleGesture('swipeRight', true/false) - управление отдельными жестами

📍 Доступные жесты для toggleGesture:
  - swipeLeft, swipeRight, swipeUp, swipeDown, pullToRefresh, edgeSwipe
    `);
  }

  isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 1024 && 'ontouchstart' in window);
  }

  setupEventListeners() {
    // Основные touch события
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Отмена жестов при потере фокуса
    document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: true });
    window.addEventListener('blur', this.handleTouchCancel.bind(this));
  }

  handleTouchStart(e) {
    if (!this.isEnabled) return;
    
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
    this.isSwipeInProgress = false;
    
    // Определяем зону начала жеста
    this.startZone = this.getStartZone(touch.clientX, touch.clientY);
  }

  handleTouchMove(e) {
    if (!this.isEnabled) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    
    // Определяем направление движения
    const direction = this.getSwipeDirection(deltaX, deltaY);
    
    // Предотвращаем прокрутку для горизонтальных свайпов
    if (direction === 'horizontal' && Math.abs(deltaX) > 20) {
      e.preventDefault();
      this.isSwipeInProgress = true;
      
      // Показываем визуальный фидбек
      this.showSwipeFeedback(deltaX, direction);
    }
  }

  handleTouchEnd(e) {
    if (!this.isEnabled) return;
    
    const touch = e.changedTouches[0];
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
    
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const deltaTime = Date.now() - this.touchStartTime;
    
    // Скрываем визуальный фидбек
    this.hideSwipeFeedback();
    
    // Обрабатываем жест, если он соответствует критериям
    if (deltaTime <= this.maxSwipeTime) {
      this.processGesture(deltaX, deltaY);
    }
    
    // Сбрасываем состояние
    this.resetTouch();
  }

  handleTouchCancel() {
    this.hideSwipeFeedback();
    this.resetTouch();
  }

  resetTouch() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.touchStartTime = 0;
    this.isSwipeInProgress = false;
    this.startZone = null;
  }

  getStartZone(x, y) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const edgeThreshold = 20;
    
    return {
      isLeftEdge: x <= edgeThreshold,
      isRightEdge: x >= screenWidth - edgeThreshold,
      isTopEdge: y <= edgeThreshold,
      isBottomEdge: y >= screenHeight - edgeThreshold,
      x: x,
      y: y
    };
  }

  getSwipeDirection(deltaX, deltaY) {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    if (absDeltaX > absDeltaY) {
      return 'horizontal';
    } else if (absDeltaY > absDeltaX) {
      return 'vertical';
    }
    return 'diagonal';
  }

  processGesture(deltaX, deltaY) {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Горизонтальные свайпы для навигации
    if (absDeltaX > this.gestures.swipeLeft.threshold && absDeltaX > absDeltaY) {
      if (deltaX > 0 && this.gestures.swipeRight.enabled) {
        this.handleSwipeRight();
      } else if (deltaX < 0 && this.gestures.swipeLeft.enabled) {
        this.handleSwipeLeft();
      }
    }
    
    // Вертикальные свайпы
    if (absDeltaY > this.gestures.swipeUp.threshold && absDeltaY > absDeltaX) {
      if (deltaY < 0 && this.gestures.swipeUp.enabled) {
        this.handleSwipeUp();
      } else if (deltaY > 0 && this.gestures.swipeDown.enabled) {
        this.handleSwipeDown();
      }
    }
  }

  handleSwipeRight() {
    console.log('🔄 Свайп вправо - попытка вернуться назад');
    
    // Проверяем, можем ли вернуться назад
    if (window.history.length > 1 && !this.isMainPage()) {
      this.showNavigationFeedback('назад');
      window.history.back();
    } else {
      this.showNavigationFeedback('главная');
      window.location.href = '/tgapp/';
    }
  }

  handleSwipeLeft() {
    console.log('🔄 Свайп влево - вперед');
    // Можно добавить логику перехода вперед, если нужно
    this.showNavigationFeedback('вперед');
  }

  handleSwipeUp() {
    console.log('🔄 Свайп вверх');
    // Можно добавить логику для скрытия элементов интерфейса
  }

  handleSwipeDown() {
    console.log('🔄 Свайп вниз');
    // Можно добавить логику pull-to-refresh
  }

  // Проверка главной страницы
  isMainPage() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    const isMainPath = pathname === '/' || 
                      pathname === '/tgapp/' || 
                      pathname === '/tgapp' ||
                      pathname === '/index.html' ||
                      pathname === '/tgapp/index.html' ||
                      pathname.endsWith('/tgapp') ||
                      pathname.endsWith('/tgapp/');
    
    const hasNoParams = !search.includes('product=') && !search.includes('category=');
    
    return isMainPath && hasNoParams;
  }

  // Настройка свайпа с края экрана
  setupEdgeSwipe() {
    let edgeSwipeArea = document.createElement('div');
    edgeSwipeArea.className = 'edge-swipe-area';
    edgeSwipeArea.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 20px;
      height: 100vh;
      z-index: 9999;
      pointer-events: auto;
      background: transparent;
    `;
    
    document.body.appendChild(edgeSwipeArea);
    
    edgeSwipeArea.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      this.handleTouchStart(e);
    }, { passive: true });
  }

  // Визуальный фидбек для свайпов
  setupVisualFeedback() {
    // Создаем элемент для показа фидбека
    this.feedbackElement = document.createElement('div');
    this.feedbackElement.className = 'swipe-feedback';
    this.feedbackElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 12px 20px;
      font-size: 14px;
      color: white;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      white-space: nowrap;
    `;
    
    document.body.appendChild(this.feedbackElement);
  }

  showSwipeFeedback(deltaX, direction) {
    if (!this.feedbackElement) return;
    
    let text = '';
    let opacity = Math.min(Math.abs(deltaX) / 100, 1);
    
    if (direction === 'horizontal') {
      if (deltaX > 0) {
        text = '← Назад';
      } else {
        text = 'Вперед →';
      }
    }
    
    this.feedbackElement.textContent = text;
    this.feedbackElement.style.opacity = opacity * 0.8;
  }

  hideSwipeFeedback() {
    if (this.feedbackElement) {
      this.feedbackElement.style.opacity = '0';
    }
  }

  showNavigationFeedback(action) {
    if (!this.feedbackElement) return;
    
    const texts = {
      'назад': '← Переход назад',
      'вперед': 'Переход вперед →',
      'главная': '🏠 Главная страница'
    };
    
    this.feedbackElement.textContent = texts[action] || action;
    this.feedbackElement.style.opacity = '1';
    
    setTimeout(() => {
      this.hideSwipeFeedback();
    }, 1000);
  }

  // Управление жестами
  enableGesture(gestureName) {
    if (this.gestures[gestureName]) {
      this.gestures[gestureName].enabled = true;
    }
  }

  disableGesture(gestureName) {
    if (this.gestures[gestureName]) {
      this.gestures[gestureName].enabled = false;
    }
  }

  enableAllGestures() {
    this.isEnabled = true;
  }

  disableAllGestures() {
    this.isEnabled = false;
  }
}

// Глобальная переменная для доступа к жестам
window.gestureHandler = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.gestureHandler = new GestureHandler();
});

// Экспорт функций для управления жестами
window.enableGestures = function() {
  if (window.gestureHandler) {
    window.gestureHandler.enableAllGestures();
  }
};

window.disableGestures = function() {
  if (window.gestureHandler) {
    window.gestureHandler.disableAllGestures();
  }
};

window.toggleGesture = function(gestureName, enabled) {
  if (window.gestureHandler) {
    if (enabled) {
      window.gestureHandler.enableGesture(gestureName);
    } else {
      window.gestureHandler.disableGesture(gestureName);
    }
  }
}; 