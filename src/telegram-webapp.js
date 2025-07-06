// Telegram Web App настройки
class TelegramWebApp {
  constructor() {
    this.isMainPage = window.location.pathname === '/' || window.location.pathname.includes('index.html');
    this.init();
  }

  init() {
    // Ждем загрузки Telegram WebApp SDK
    if (window.Telegram?.WebApp) {
      this.setupTelegramWebApp();
    } else {
      // Если SDK еще не загружен, ждем
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.setupTelegramWebApp();
        }, 100);
      });
    }
  }

  setupTelegramWebApp() {
    const tg = window.Telegram.WebApp;
    
    // Расширяем приложение на весь экран
    tg.expand();
    
    // Отключаем возможность сворачивания при свайпе вниз
    tg.disableVerticalSwipes();
    
    // Включаем подтверждение закрытия
    tg.enableClosingConfirmation();
    
    // Настройка цветовой схемы
    tg.setHeaderColor('#000000');
    
    // Настройка кнопки "Назад" или "Закрыть"
    if (this.isMainPage) {
      // На главной странице используем заголовок с кнопкой "Закрыть"
      tg.MainButton.hide();
      tg.BackButton.hide();
      // В Web App заголовок автоматически показывает кнопку закрытия
    } else {
      // На других страницах показываем кнопку "Назад"
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        if (document.referrer && document.referrer.includes(window.location.origin)) {
          window.history.back();
        } else {
          window.location.href = 'index.html';
        }
      });
    }

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

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  new TelegramWebApp();
});
