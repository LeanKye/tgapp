// Telegram Web App базовые настройки
import { withBase } from './base-url.js';
class TelegramWebApp {
  constructor() {
    this.tg = null;
    this.currentPage = this.detectCurrentPage();
    this.closeBtn = null;
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

    // На случай гонок готовности SDK — несколько попыток синхронизации заголовка в начале
    let attempts = 0;
    const maxAttempts = 10;
    const syncTimer = setInterval(() => {
      attempts += 1;
      try {
        if (!this.tg && window.Telegram?.WebApp) {
          this.setupTelegramWebApp();
        }
        if (this.tg) {
          this.updateTelegramHeader();
        }
      } catch (_) {}
      if (attempts >= maxAttempts) clearInterval(syncTimer);
    }, 150);
  }



  setupTelegramWebApp() {
    this.tg = window.Telegram.WebApp;
    
    // Базовые настройки
    try { this.tg.ready(); } catch (_) {}
    try { typeof this.tg.expand === 'function' && this.tg.expand(); } catch (_) {}
    try { typeof this.tg.disableVerticalSwipes === 'function' && this.tg.disableVerticalSwipes(); } catch (_) {}
    try { typeof this.tg.setHeaderColor === 'function' && this.tg.setHeaderColor('#000000'); } catch (_) {}

    // Настройки UI
    this.setupUIBehavior();
    
    // Управление кнопками
    this.updateTelegramHeader();

    // Повторное обновление чуть позже — на случай, если Telegram применяет заголовок не сразу
    setTimeout(() => this.updateTelegramHeader(), 150);

    // Следим за изменениями истории/URL, чтобы корректно переключать Back/Close
    window.addEventListener('popstate', () => this.handleNavigation());
    window.addEventListener('hashchange', () => this.handleNavigation());
    window.addEventListener('pageshow', () => this.handleNavigation());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.handleNavigation();
    });
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
    } else {
      return 'home';
    }
  }

  // Управление кнопками Telegram
  updateTelegramHeader() {
    if (!this.tg) return;

    // Пересчитываем текущую страницу на всякий случай
    this.currentPage = this.detectCurrentPage();

    if (this.currentPage === "home") {
      // На главной странице скрываем кнопку "Назад" и основной MainButton
      this.tg.MainButton.hide();
      try { this.tg.BackButton.offClick(); } catch (_) {}
      try { this.tg.BackButton.hide(); } catch (_) {}
      // Делаем несколько повторных попыток скрытия — на случай лагов применения UI в Telegram
      setTimeout(() => { try { this.tg.BackButton.hide(); } catch (_) {} }, 0);
      setTimeout(() => { try { this.tg.BackButton.hide(); } catch (_) {} }, 200);
      setTimeout(() => { try { this.tg.BackButton.hide(); } catch (_) {} }, 400);

      // Показываем собственную кнопку "Закрыть" как надёжный фолбэк
      this.showCloseFallback();
    } else {
      // На остальных страницах показываем кнопку "Назад"
      this.tg.MainButton.hide();
      this.tg.BackButton.show();
      
      // Удаляем предыдущие обработчики
      this.tg.BackButton.offClick();
      this.tg.BackButton.onClick(() => {
        // Возвращаем по истории, если есть куда идти, иначе на главную
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = withBase('index.html');
        }
      });

      // Скрываем фолбэк закрытия на вложенных страницах
      this.hideCloseFallback();
    }
  }

  // Обработка смены адреса/страницы
  handleNavigation() {
    this.currentPage = this.detectCurrentPage();
    this.updateTelegramHeader();
  }

  // Показ собственной кнопки закрытия как фолбэк для случаев, когда Telegram не показывает "X"
  showCloseFallback() {
    if (!this.tg) return;
    if (!this.closeBtn) {
      const style = document.createElement('style');
      style.textContent = 
        `.tg-close-fallback{position:fixed;top:14px;right:12px;z-index:9999;`+
        `background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:10px;`+
        `padding:8px 12px;font-size:14px;line-height:16px;}`;
      document.head.appendChild(style);

      this.closeBtn = document.createElement('button');
      this.closeBtn.className = 'tg-close-fallback';
      this.closeBtn.type = 'button';
      this.closeBtn.textContent = 'Закрыть';
      this.closeBtn.addEventListener('click', () => {
        try { this.tg.close(); } catch (_) { window.close(); }
      });
    }
    if (!document.body.contains(this.closeBtn)) {
      document.body.appendChild(this.closeBtn);
    }
    this.closeBtn.style.display = 'block';
  }

  // Скрытие собственной кнопки закрытия
  hideCloseFallback() {
    if (this.closeBtn) {
      this.closeBtn.style.display = 'none';
    }
  }
}

// Глобальная переменная для доступа к экземпляру
window.telegramWebApp = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.telegramWebApp = new TelegramWebApp();
});


