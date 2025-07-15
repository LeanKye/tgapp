// Telegram Web App базовые настройки
class TelegramWebApp {
  constructor() {
    this.tg = null;
    this.currentPage = this.detectCurrentPage();
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
    this.tg = window.Telegram.WebApp;
    
    // Базовые настройки
    this.tg.ready();
    this.tg.expand();
    this.tg.disableVerticalSwipes();
    this.tg.setHeaderColor('#000000');

    // Настройки UI
    this.setupUIBehavior();
    
    // Управление кнопками
    this.updateTelegramHeader();
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

    // Обработка навигации в Telegram WebView
    window.addEventListener('popstate', () => {
      this.currentPage = this.detectCurrentPage();
      this.updateTelegramHeader();
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
      
      // Добавляем обработчик для закрытия WebView при долгом нажатии
      let backButtonTimer = null;
      this.tg.BackButton.onClick(() => {
        if (backButtonTimer) {
          clearTimeout(backButtonTimer);
          backButtonTimer = null;
          // Долгое нажатие - закрываем WebView
          this.tg.close();
        } else {
          backButtonTimer = setTimeout(() => {
            backButtonTimer = null;
            // Короткое нажатие - возвращаемся назад
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = './';
            }
          }, 200);
        }
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


