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
    
    // Принудительно расширяем на весь экран
    this.tg.expand();
    
    // Отключаем вертикальные свайпы
    this.tg.disableVerticalSwipes();
    
    // Устанавливаем цвет заголовка в цвет фона приложения
    this.tg.setHeaderColor('#000000');
    this.tg.setBackgroundColor('#000000');
    
    // Дополнительные настройки для полноэкранного режима
    if (this.tg.platform === 'ios' || this.isIOS) {
      this.setupIOSFullScreen();
    }
    
    // Принудительно устанавливаем полноэкранный режим
    this.forceFullScreenMode();

    // Настройки UI
    this.setupUIBehavior();
    
    // Управление кнопками
    this.updateTelegramHeader();
  }

  // Принудительный полноэкранный режим
  forceFullScreenMode() {
    // Многократно вызываем expand для гарантии
    this.tg.expand();
    
    // Отслеживаем изменения viewport и принудительно расширяем
    const forceExpand = () => {
      this.tg.expand();
      this.tg.setHeaderColor('#000000');
      this.tg.setBackgroundColor('#000000');
    };
    
    // Вызываем expand несколько раз с задержкой
    setTimeout(forceExpand, 100);
    setTimeout(forceExpand, 300);
    setTimeout(forceExpand, 500);
    setTimeout(forceExpand, 1000);
    
    // Отслеживаем изменения размера окна
    window.addEventListener('resize', forceExpand);
    
    // Отслеживаем изменения видимости
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(forceExpand, 100);
      }
    });
    
    // Принудительно убираем заголовок Telegram
    this.hideHeader();
  }

  // Скрытие заголовка Telegram
  hideHeader() {
    // Получаем высоту заголовка Telegram (обычно около 56px на iOS)
    const headerHeight = this.detectTelegramHeaderHeight();
    
    // Добавляем стили для "выталкивания" контента за пределы заголовка
    const style = document.createElement('style');
    style.textContent = `
      /* Принудительно растягиваем приложение на весь экран включая заголовок */
      html, body {
        position: relative !important;
        top: -${headerHeight}px !important;
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        height: calc(100vh + ${headerHeight}px) !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        background: #000000 !important;
      }
      
      /* Основной контейнер должен занимать весь экран включая заголовок */
      .catalog, .product {
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        height: calc(100vh + ${headerHeight}px) !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
        background: #000000 !important;
        padding-top: ${headerHeight}px !important;
        box-sizing: border-box !important;
      }
      
      /* Header контейнер позиционируем в верхней части */
      .header-container {
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 1000 !important;
        margin: 0 !important;
        padding: 16px !important;
        background: #1f1f1f !important;
      }
      
      /* Убираем дополнительные отступы у контента */
      .catalog > :not(.header-container) {
        margin-top: 0 !important;
      }
      
      /* Специальные стили для iOS */
      @supports (-webkit-touch-callout: none) {
        html, body {
          position: relative !important;
          top: -${headerHeight + 20}px !important;
          height: calc(100vh + ${headerHeight + 20}px) !important;
        }
        
        .catalog, .product {
          height: calc(100vh + ${headerHeight + 20}px) !important;
          padding-top: ${headerHeight + 20}px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Определение высоты заголовка Telegram
  detectTelegramHeaderHeight() {
    // Для разных платформ разная высота заголовка
    if (this.tg.platform === 'ios' || this.isIOS) {
      return 56; // iOS обычно 56px
    } else if (this.tg.platform === 'android') {
      return 56; // Android тоже около 56px
    } else {
      return 60; // Fallback для других платформ
    }
  }

  // Настройка полноэкранного режима для iOS
  setupIOSFullScreen() {
    // Принудительно растягиваем viewport на весь экран
    this.tg.expand();
    
    // Добавляем CSS класс для iOS
    document.body.classList.add('telegram-ios-fullscreen');
    
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
    
    // Дополнительные настройки для мини-приложений
    this.setupTelegramViewport();
  }

  // Настройка viewport специально для Telegram
  setupTelegramViewport() {
    // Используем специальные методы Telegram Web App
    if (this.tg.isExpanded !== undefined) {
      if (!this.tg.isExpanded) {
        this.tg.expand();
      }
    }
    
    // Принудительно устанавливаем CSS переменные для Telegram
    if (this.tg.viewportHeight) {
      document.documentElement.style.setProperty('--tg-viewport-height', `${this.tg.viewportHeight}px`);
    }
    
    if (this.tg.viewportStableHeight) {
      document.documentElement.style.setProperty('--tg-viewport-stable-height', `${this.tg.viewportStableHeight}px`);
    }
    
    // Отслеживаем изменения viewport в Telegram
    this.tg.onEvent('viewportChanged', () => {
      this.tg.expand();
      if (this.tg.viewportHeight) {
        document.documentElement.style.setProperty('--tg-viewport-height', `${this.tg.viewportHeight}px`);
      }
      if (this.tg.viewportStableHeight) {
        document.documentElement.style.setProperty('--tg-viewport-stable-height', `${this.tg.viewportStableHeight}px`);
      }
    });
    
    // Принудительно скрываем заголовок
    this.tg.setHeaderColor('#000000');
    this.tg.setBackgroundColor('#000000');
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


