// Telegram Web App базовые настройки
class TelegramWebApp {
  constructor() {
    this.init();
  }

  init() {
    // Ждем загрузки Telegram WebApp SDK
    if (window.Telegram?.WebApp) {
      this.setupTelegramWebApp();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.setupTelegramWebApp();
        }, 100);
      });
    }
  }

  setupTelegramWebApp() {
    const tg = window.Telegram.WebApp;
    
    // Полноэкранные настройки
    tg.expand();
    tg.disableVerticalSwipes();
    tg.setHeaderColor('#000000');
    
    // Отключаем стандартные свайпы Telegram, так как у нас есть свои жесты
    if (tg.disableSwipeDownToClose) {
      tg.disableSwipeDownToClose();
    }
    
    // Настройка полноэкранного режима
    this.setupFullscreen();
    
    // Настройки UI
    this.setupUIBehavior();
  }
  
  setupFullscreen() {
    // Принудительно убираем все отступы
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Устанавливаем правильную высоту
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Используем реальную высоту viewport
      document.body.style.height = `${window.innerHeight}px`;
      document.body.style.minHeight = `${window.innerHeight}px`;
    };
    
    setViewportHeight();
    
    // Обновляем при изменении размера
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100);
    });
    
    // Отключаем zoom на двойной тап
    this.disableDoubleTapZoom();
  }
  
  disableDoubleTapZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }
  
  // Настройка поведения UI
  setupUIBehavior() {
    // Отключаем контекстное меню
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Предотвращаем drag and drop
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    // Отключаем выделение текста при длительном нажатии
    document.addEventListener('selectstart', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    });
  }
}

// Глобальная переменная для доступа к экземпляру
window.telegramWebApp = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.telegramWebApp = new TelegramWebApp();
});


