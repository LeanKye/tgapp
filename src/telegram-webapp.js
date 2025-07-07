// Telegram Web App с управлением кнопкой "Назад"
class TelegramWebApp {
  constructor() {
    this.init();
  }

  // Определение главной страницы
  isMainPage() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    // Главная страница - это корень или index.html без параметров товаров/категорий
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

  // Настройка кнопки "Назад"
  setupBackButton(tg) {
    if (this.isMainPage()) {
      // На главной странице - скрываем кнопку "Назад"
      tg.BackButton.hide();
      tg.BackButton.offClick();
    } else {
      // На всех остальных страницах - показываем кнопку "Назад"
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        window.history.back();
      });
      
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

    // Настройка кнопки "Назад"
    this.setupBackButton(tg);

    // Отслеживание навигации
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.setupBackButton(tg);
      }, 100);
    });

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

// Экспорт функции для обновления кнопки "Назад"
window.updateTelegramBackButton = function() {
  if (window.telegramWebApp && window.Telegram?.WebApp) {
    window.telegramWebApp.setupBackButton(window.Telegram.WebApp);
  }
};


