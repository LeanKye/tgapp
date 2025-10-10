// Telegram Web App базовые настройки
class TelegramWebApp {
  constructor() {
    this.tg = null;
    this.currentPage = this.detectCurrentPage();
    this._backHandler = null;
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

    // Предзагрузка страниц отключена — прогружаем только по факту перехода
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
    } else if (path.includes('info.html')) {
      return 'info';
    } else if (path.includes('cart.html')) {
      return 'cart';
    } else if (path.includes('profile.html')) {
      return 'profile';
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
      // На остальных страницах показываем кнопку "Назад" и ведем на главную
      this.tg.MainButton.hide();
      this.tg.BackButton.show();

      // Удаляем предыдущий обработчик, если был
      if (this._backHandler) {
        try { this.tg.BackButton.offClick(this._backHandler); } catch (_) {}
      }

      this._backHandler = () => {
        // Жесткий переход на домашнюю
        const homeUrl = this.resolveHomeUrl();
        window.location.replace(homeUrl);
      };
      this.tg.BackButton.onClick(this._backHandler);
    }
  }

  // Определяем URL домашней страницы
  resolveHomeUrl() {
    // Надежно ведем на index.html в текущей директории
    const basePath = window.location.pathname.replace(/[^/]*$/, '');
    return basePath + 'index.html';
  }

  // Предзагрузка отключена — оставляем заглушку, чтобы не ломать вызовы, если появятся в будущем
  schedulePrefetch() {}
}

// Глобальная переменная для доступа к экземпляру
window.telegramWebApp = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.telegramWebApp = new TelegramWebApp();
});


