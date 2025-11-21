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
    // Вызываем отключение вертикальных свайпов только если поддерживается текущей версией API
    if (typeof this.tg.isVersionAtLeast === 'function' && this.tg.isVersionAtLeast('6.1') && typeof this.tg.disableVerticalSwipes === 'function') {
      this.tg.disableVerticalSwipes();
    }
    // Устанавливаем цвет заголовка только если поддерживается
    if (typeof this.tg.isVersionAtLeast === 'function' && this.tg.isVersionAtLeast('6.1') && typeof this.tg.setHeaderColor === 'function') {
      this.tg.setHeaderColor('#000000');
    }

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

    // Определяем текущую страницу динамически, чтобы корректно показывать кнопку Назад в SPA
    try {
      this.currentPage = this.detectCurrentPage();
    } catch {}

    const hasMainButton = !!(this.tg.MainButton && typeof this.tg.MainButton.hide === 'function');
    const backBtn = this.tg.BackButton;
    const hasBackButton = !!(backBtn && typeof backBtn.show === 'function' && typeof backBtn.hide === 'function' && typeof backBtn.onClick === 'function' && typeof backBtn.offClick === 'function' && typeof this.tg.isVersionAtLeast === 'function' && this.tg.isVersionAtLeast('6.1'));

    if (this.currentPage === "home") {
      // На главной странице скрываем все кнопки
      if (hasBackButton) backBtn.hide();
      if (hasMainButton) this.tg.MainButton.hide();
    } else {
      // На остальных страницах показываем кнопку "Назад" и ведем на главную
      if (hasMainButton) this.tg.MainButton.hide();
      if (hasBackButton) backBtn.show();

      // Удаляем предыдущий обработчик, если был
      if (this._backHandler && hasBackButton) {
        try { backBtn.offClick(this._backHandler); } catch (_) {}
      }

      if (typeof this._lastBackAt !== 'number') this._lastBackAt = 0;
      this._backHandler = () => {
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (now - this._lastBackAt < 300) return; // антидребезг ~300мс
        this._lastBackAt = now;
        try {
          // Опираемся на внутреннюю глубину SPA, а не на history.length WebView
          if ((window.__spaDepth || 0) > 0) {
            window.history.back();
          } else if (window.AppNav && typeof window.AppNav.go === 'function') {
            window.AppNav.go('index.html');
          } else {
            window.location.replace(this.resolveHomeUrl());
          }
        } catch {
          window.location.replace(this.resolveHomeUrl());
        }
      };
      if (hasBackButton) backBtn.onClick(this._backHandler);
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


