// Telegram Web App настройки
class TelegramWebApp {
  constructor() {
    this.init();
  }

  // Определение главной страницы
  isMainPage() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    // Главная страница для GitHub Pages
    const isMainPath = pathname === '/' || 
                      pathname === '/tgapp/' || 
                      pathname === '/tgapp' ||
                      pathname === '/index.html' ||
                      pathname === '/tgapp/index.html' ||
                      pathname.endsWith('/tgapp') ||
                      pathname.endsWith('/tgapp/');
    
    // Проверяем, что нет параметров товаров или категорий
    const hasNoParams = !search.includes('product=') && !search.includes('category=');
    
    return isMainPath && hasNoParams;
  }

  // Настройка хедера
  setupHeader(tg) {
    if (this.isMainPage()) {
      // На главной странице - скрываем кнопку "Назад" и настраиваем закрытие
      tg.BackButton.hide();
      tg.BackButton.offClick();
      
      // Включаем подтверждение закрытия на главной странице
      tg.enableClosingConfirmation();
      
      // Скрываем главную кнопку
      tg.MainButton.hide();
    } else {
      // На всех остальных страницах - показываем кнопку "Назад"
      tg.BackButton.show();
      tg.BackButton.offClick();
      
      // Отключаем подтверждение закрытия на внутренних страницах
      tg.disableClosingConfirmation();
      
      // Добавляем обработчик для возврата
      tg.BackButton.onClick(() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/tgapp/';
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
    
    // Немедленная принудительная настройка для главной страницы
    if (this.isMainPage()) {
      tg.BackButton.hide();
      tg.BackButton.offClick();
      tg.enableClosingConfirmation();
      tg.MainButton.hide();
    }
    
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

// Функция диагностики для проверки состояния (показывает через MainButton)
window.showTelegramState = function() {
  if (window.telegramWebApp && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    const isMain = window.telegramWebApp.isMainPage();
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    const stateText = `Main: ${isMain}, Path: ${pathname}, Search: ${search}, BackBtn: ${tg.BackButton.isVisible}`;
    
    tg.MainButton.setText(stateText);
    tg.MainButton.show();
    
    // Скрываем через 5 секунд
    setTimeout(() => {
      tg.MainButton.hide();
    }, 5000);
  }
};


