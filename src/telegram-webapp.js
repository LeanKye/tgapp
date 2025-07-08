// Telegram Web App базовые настройки
class TelegramWebApp {
  constructor() {
    this.tg = null;
    this.currentPage = this.detectCurrentPage();
    this.isIOS = this.detectIOS();
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

  // Определение iOS устройства
  detectIOS() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    return /iphone|ipad|ipod/.test(userAgent) || 
           /iphone|ipad|ipod/.test(platform) ||
           (platform === 'macintel' && navigator.maxTouchPoints > 1) ||
           window.navigator.standalone !== undefined;
  }

  setupTelegramWebApp() {
    this.tg = window.Telegram.WebApp;
    
    // Базовые настройки
    this.tg.ready();
    this.tg.expand();
    this.tg.disableVerticalSwipes();
    this.tg.setHeaderColor('#000000');

    // Специальные настройки для iOS - принудительно убираем все отступы
    if (this.isIOS) {
      this.setupIOSFullScreen();
    }

    // Настройки UI
    this.setupUIBehavior();
    
    // Управление кнопками
    this.updateTelegramHeader();
  }

  // Настройка полноэкранного режима для iOS
  setupIOSFullScreen() {
    // Принудительно растягиваем viewport на весь экран
    this.tg.expand();
    
    // Добавляем CSS класс для iOS
    document.body.classList.add('telegram-ios-fullscreen');
    
    // Принудительно убираем все системные отступы
    const style = document.createElement('style');
    style.textContent = `
      .telegram-ios-fullscreen {
        padding-top: 0 !important;
        margin-top: 0 !important;
        top: 0 !important;
        position: relative !important;
      }
      
      .telegram-ios-fullscreen .header-container {
        padding-top: 0 !important;
        margin-top: 0 !important;
      }
      
      .telegram-ios-fullscreen .catalog {
        padding-top: 0 !important;
        margin-top: 0 !important;
      }
      
      /* Принудительно убираем безопасную зону сверху */
      @supports (padding-top: env(safe-area-inset-top)) {
        .telegram-ios-fullscreen {
          padding-top: 0 !important;
        }
        
        .telegram-ios-fullscreen::before {
          display: none !important;
        }
        
        .telegram-ios-fullscreen .header-container {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        
        .telegram-ios-fullscreen .menu {
          padding-top: 60px !important;
        }
        
        .telegram-ios-fullscreen .modal-overlay {
          padding-top: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Дополнительные настройки viewport для iOS
    this.setupIOSViewport();
  }
  
  // Настройка viewport для iOS
  setupIOSViewport() {
    // Обновляем viewport meta tag для более агрессивного полноэкранного режима
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no';
    }
    
    // Принудительно убираем все отступы от системы
    document.documentElement.style.setProperty('--safe-area-inset-top', '0px');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', '0px');
    document.documentElement.style.setProperty('--safe-area-inset-left', '0px');
    document.documentElement.style.setProperty('--safe-area-inset-right', '0px');
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

  // Определение текущей страницы по URL
  detectCurrentPage() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path.includes('category.html')) {
      return 'categories';
    } else if (path.includes('product.html')) {
      return 'product';
    } else {
      return 'home';
    }
  }

  // Управление кнопками Telegram
  updateTelegramHeader() {
    if (!this.tg) return;

    if (this.currentPage === "home") {
      // На главной странице скрываем все кнопки
      this.tg.BackButton.hide();
      this.tg.MainButton.hide();
    } else {
      // На остальных страницах показываем кнопку "Назад"
      this.tg.MainButton.hide();
      this.tg.BackButton.show();
      
      // Удаляем предыдущие обработчики
      this.tg.BackButton.offClick();
      this.tg.BackButton.onClick(() => {
        window.location.href = './';
      });
    }
  }
}

// Глобальная переменная для доступа к экземпляру
window.telegramWebApp = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.telegramWebApp = new TelegramWebApp();
});


