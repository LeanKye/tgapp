// Простая и надежная система управления Telegram WebApp хедером
class TelegramWebApp {
  constructor() {
    this.tg = null;
    this.currentPage = null;
    this.init();
  }

  // Определение типа страницы
  getCurrentPageType() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    // Главная страница - index.html или корень
    if (pathname === '/' || pathname === '' || pathname.endsWith('/index.html')) {
      return 'main';
    }
    
    // Страница товара
    if (pathname.includes('product.html') || search.includes('product=')) {
      return 'product';
    }
    
    // Страница категории
    if (pathname.includes('category.html') || search.includes('category=')) {
      return 'category';
    }
    
    // По умолчанию считаем внутренней страницей
    return 'inner';
  }

  // Проверка и обновление хедера при необходимости
  checkAndUpdateHeader() {
    const newPageType = this.getCurrentPageType();
    
    // Обновляем только если страница изменилась
    if (this.currentPage !== newPageType) {
      this.setupHeader();
    }
  }

  init() {
    // Ждем загрузки Telegram WebApp SDK
    if (window.Telegram?.WebApp) {
      this.initTelegramWebApp();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.initTelegramWebApp();
        }, 100);
      });
    }
  }

  initTelegramWebApp() {
    this.tg = window.Telegram.WebApp;
    
    if (!this.tg) return;
    
    // Базовые настройки
    this.tg.expand();
    this.tg.disableVerticalSwipes();
    this.tg.setHeaderColor('#000000');
    
    // Включаем подтверждение закрытия только на главной странице
    if (this.getCurrentPageType() === 'main') {
      this.tg.enableClosingConfirmation();
    }
    
    // Первоначальная настройка хедера
    this.setupHeader();
    
    // Отслеживаем навигацию браузера
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.setupHeader();
      }, 100);
    });
    
    // Отслеживаем изменения видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          this.setupHeader();
        }, 100);
      }
    });
    
    // Периодическая проверка (каждые 2 секунды)
    setInterval(() => {
      this.checkAndUpdateHeader();
    }, 2000);
  }
}

// Создаем экземпляр
window.telegramWebApp = new TelegramWebApp();

// Функция для принудительного обновления хедера
window.updateTelegramHeader = function() {
  if (window.telegramWebApp) {
    window.telegramWebApp.setupHeader();
  }
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.telegramWebApp) {
      window.telegramWebApp.setupHeader();
    }
  }, 200);
});

// Дополнительная инициализация при полной загрузке
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.telegramWebApp) {
      window.telegramWebApp.setupHeader();
    }
  }, 300);
});


