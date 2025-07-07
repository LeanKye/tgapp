// Telegram Web App настройки
class TelegramWebApp {
  constructor() {
    this.init();
  }

  // Определение главной страницы
  isMainPage() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    // Главная страница - это только корень или index.html без параметров
    return (pathname === '/' || pathname === '/index.html' || pathname.endsWith('/index.html')) && 
           !search.includes('product=') && 
           !search.includes('category=');
  }

  // Настройка хедера
  setupHeader(tg) {
    if (this.isMainPage()) {
      // На главной странице - скрываем кнопку "Назад"
      tg.BackButton.hide();
      tg.BackButton.offClick();
    } else {
      // На всех остальных страницах - показываем кнопку "Назад"
      tg.BackButton.show();
      tg.BackButton.offClick();
      
      // Добавляем обработчик для возврата
      tg.BackButton.onClick(() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/';
        }
      });
    }
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
    
    // Базовые настройки
    tg.expand();
    tg.disableVerticalSwipes();
    tg.setHeaderColor('#000000');
    
    // Настройка хедера
    this.setupHeader(tg);
    
    // Отслеживание навигации
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.setupHeader(tg);
      }, 100);
    });
    
    // Отслеживание изменений URL
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      setTimeout(() => {
        this.setupHeader(tg);
      }, 100);
    };
    
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      setTimeout(() => {
        this.setupHeader(tg);
      }, 100);
    };
    
    // Отслеживание фокуса
    window.addEventListener('focus', () => {
      setTimeout(() => {
        this.setupHeader(tg);
      }, 100);
    });
    
    // Отслеживание видимости
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          this.setupHeader(tg);
        }, 100);
      }
    });
    
    // Дополнительные проверки через интервалы
    setTimeout(() => {
      this.setupHeader(tg);
    }, 500);
    
    setTimeout(() => {
      this.setupHeader(tg);
    }, 1000);
    
    // Периодическая проверка каждые 3 секунды
    setInterval(() => {
      this.setupHeader(tg);
    }, 3000);

    // Настройки UI
    this.setupUIBehavior();
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

// Дополнительная инициализация при полной загрузке
window.addEventListener('load', () => {
  if (window.telegramWebApp && window.Telegram?.WebApp) {
    setTimeout(() => {
      window.telegramWebApp.setupHeader(window.Telegram.WebApp);
    }, 300);
  }
});

// Экспорт функций для принудительного обновления
window.updateTelegramHeader = function() {
  if (window.telegramWebApp && window.Telegram?.WebApp) {
    window.telegramWebApp.setupHeader(window.Telegram.WebApp);
  }
};


