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
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isTelegram = window.Telegram && window.Telegram.WebApp;
    
    console.log(`
🎯 Система жестов активирована!

📱 Доступные жесты:
  • Свайп вправо → Возврат назад
  • Свайп влево → Вперед (если доступно)
  • Edge swipe → Свайп с левого края экрана (${isIOS || isTelegram ? '50px' : '30px'} зона)

${isIOS ? '🍎 iOS оптимизация активна - увеличенная чувствительность edge swipe' : ''}
${isTelegram ? '🔗 Telegram WebApp интеграция активна' : ''}

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
    
    // Более агрессивная обработка для iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Предотвращаем прокрутку для горизонтальных свайпов
    if (direction === 'horizontal' && Math.abs(deltaX) > 10) {
      e.preventDefault();
      e.stopPropagation();
      this.isSwipeInProgress = true;
      
      // Показываем визуальный фидбек
      this.showSwipeFeedback(deltaX, direction);
    }
    
    // Дополнительная обработка для iOS - предотвращаем системные жесты
    if (isIOS && Math.abs(deltaX) > 20) {
      e.preventDefault();
      e.stopPropagation();
      
      // Принудительно отключаем системные жесты
      document.body.style.touchAction = 'none';
      document.body.style.overscrollBehavior = 'none';
    }
    
    // Если начинаем от левого края - это потенциальный edge swipe
    if (this.startZone && this.startZone.isLeftEdge) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isTelegram = window.Telegram && window.Telegram.WebApp;
      const threshold = isIOS || isTelegram ? 20 : 30; // Меньший порог для начала фидбека
      
      if (deltaX > threshold) {
        e.preventDefault();
        e.stopPropagation();
        this.showSwipeFeedback(deltaX, 'horizontal');
        
        // Дополнительная защита от системных жестов на iOS
        if (isIOS) {
          document.body.style.touchAction = 'none';
          document.body.style.overscrollBehavior = 'none';
        }
      }
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
    
    // Восстанавливаем стили после жеста
    setTimeout(() => {
      document.body.style.touchAction = 'none';
      document.body.style.overscrollBehavior = 'none';
    }, 50);
    
    // Обрабатываем жест, если он соответствует критериям
    if (deltaTime <= this.maxSwipeTime) {
      // Специальная обработка для edge swipe
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isTelegram = window.Telegram && window.Telegram.WebApp;
      const edgeThreshold = isIOS || isTelegram ? 40 : 50; // Меньший порог для iOS/Telegram
      
      if (this.startZone && this.startZone.isLeftEdge && deltaX > edgeThreshold) {
        console.log('🔄 Edge swipe detected - возврат назад');
        this.handleSwipeRight();
      } else {
        this.processGesture(deltaX, deltaY);
      }
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
    
    // Увеличиваем зону edge для iOS и Telegram WebApp
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isTelegram = window.Telegram && window.Telegram.WebApp;
    const edgeThreshold = isIOS || isTelegram ? 50 : 30;
    
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
    
    // Специальная обработка для Telegram WebApp
    const isTelegram = window.Telegram && window.Telegram.WebApp;
    
    if (isTelegram) {
      // В Telegram WebApp используем Telegram API для навигации если доступно
      try {
        if (window.Telegram.WebApp.BackButton) {
          this.showNavigationFeedback('назад');
          window.Telegram.WebApp.BackButton.onClick(() => {
            if (!this.isMainPage()) {
              window.history.back();
            } else {
              window.location.href = window.location.origin + '/tgapp/';
            }
          });
          return;
        }
      } catch (e) {
        console.log('Telegram BackButton API недоступен, используем стандартную навигацию');
      }
    }
    
    // Проверяем, можем ли вернуться назад
    if (window.history.length > 1 && !this.isMainPage()) {
      this.showNavigationFeedback('назад');
      window.history.back();
    } else {
      this.showNavigationFeedback('главная');
      // Более надёжный способ перехода на главную для разных окружений
      const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
      window.location.href = baseUrl.endsWith('/tgapp') ? baseUrl + '/' : baseUrl + '/tgapp/';
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
    // Создаем более широкую зону для edge swipe на iOS и в Telegram WebApp
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isTelegram = window.Telegram && window.Telegram.WebApp;
    const edgeWidth = isIOS || isTelegram ? 50 : 30; // Увеличили зону для лучшей работы
    
    let edgeSwipeArea = document.createElement('div');
    edgeSwipeArea.className = 'edge-swipe-area';
    edgeSwipeArea.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: ${edgeWidth}px;
      height: 100vh;
      height: calc(var(--vh, 1vh) * 100);
      z-index: 9999;
      pointer-events: auto;
      background: transparent;
      touch-action: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      overscroll-behavior: none;
      -webkit-overflow-scrolling: auto;
      ${isIOS || isTelegram ? 'transform: translateZ(0);' : ''}
      ${isIOS || isTelegram ? '-webkit-transform: translateZ(0);' : ''}
    `;
    
    document.body.appendChild(edgeSwipeArea);
    
    // Более агрессивная обработка для iOS и Telegram WebApp
    const handleEdgeTouch = (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      const touch = e.touches[0];
      
      // Для iOS и Telegram WebApp - принудительно обрабатываем жест
      if (isIOS || isTelegram) {
        if (touch.clientX <= edgeWidth) {
          // Дополнительная проверка для предотвращения системных жестов
          document.body.style.touchAction = 'none';
          document.body.style.overscrollBehavior = 'none';
          this.handleTouchStart(e);
        }
      } else {
        this.handleTouchStart(e);
      }
    };
    
    edgeSwipeArea.addEventListener('touchstart', handleEdgeTouch, { passive: false });
    edgeSwipeArea.addEventListener('touchmove', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.handleTouchMove(e);
    }, { passive: false });
    edgeSwipeArea.addEventListener('touchend', (e) => {
      e.stopPropagation();
      this.handleTouchEnd(e);
    }, { passive: false });
    
    // Добавляем визуальный индикатор для отладки (только в dev режиме)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      edgeSwipeArea.style.background = 'rgba(255, 0, 0, 0.1)';
      console.log(`🔄 Edge swipe area created: ${edgeWidth}px width (iOS: ${isIOS}, Telegram: ${isTelegram})`);
    } else {
      console.log(`🔄 Edge swipe активирован для навигации назад (зона: ${edgeWidth}px)`);
    }
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