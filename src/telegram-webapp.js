// Telegram Web App базовые настройки
import { withBase } from './base-url.js';
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

    // Следим за изменениями истории/URL, чтобы корректно переключать Back/Close
    window.addEventListener('popstate', () => this.handleNavigation());
    window.addEventListener('hashchange', () => this.handleNavigation());
    window.addEventListener('pageshow', () => this.handleNavigation());
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
      // На главной странице скрываем все кнопки
      this.tg.BackButton.hide();
      // На всякий случай снимаем обработчик, чтобы не было артефактов
      this.tg.BackButton.offClick();
      this.tg.MainButton.hide();
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
    }
  }

  // Обработка смены адреса/страницы
  handleNavigation() {
    this.currentPage = this.detectCurrentPage();
    this.updateTelegramHeader();
  }
}

// Глобальная переменная для доступа к экземпляру
window.telegramWebApp = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.telegramWebApp = new TelegramWebApp();
});


