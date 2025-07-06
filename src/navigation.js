// Модуль для управления навигацией в Telegram мини-приложении
class NavigationManager {
  constructor() {
    this.init();
  }

  init() {
    // Добавляем поддержку Telegram WebApp API
    this.initTelegramWebApp();
  }

  // Логика возврата назад
  goBack() {
    // Проверяем, есть ли история браузера
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Если истории нет, переходим на главную
      window.location.href = '/';
    }
  }

  // Установка заголовка товара (вызывается из product.js)
  setProductTitle(title) {
    // Устанавливаем заголовок в Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp && title) {
      window.Telegram.WebApp.setHeaderColor('#1f1f1f');
    }
  }

  // Инициализация Telegram WebApp API
  initTelegramWebApp() {
    // Проверяем, доступен ли Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Настраиваем тему
      tg.setHeaderColor('#1f1f1f');
      tg.setBackgroundColor('#000000');
      
      // Показываем главную кнопку только на страницах товаров
      const path = window.location.pathname;
      if (path.includes('product.html')) {
        // Главная кнопка будет настроена в product.js
        tg.MainButton.show();
      } else {
        tg.MainButton.hide();
      }

      // Включаем кнопку назад Telegram для внутренних страниц
      // На главной странице показываем кнопку "Закрыть" (через BackButton)
      if (!path.includes('index.html') && path !== '/') {
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
          this.goBack();
        });
      } else {
        // На главной странице тоже показываем кнопку, но она будет работать как "Закрыть"
        tg.BackButton.hide();
        // Включаем кнопку закрытия для главной страницы
        tg.enableClosingConfirmation();
      }

      // Расширяем приложение на весь экран
      tg.expand();
      
      // Разрешаем вертикальные свайпы для нормального скролла
      tg.enableVerticalSwipes();
    }
  }

  // Обновление главной кнопки Telegram (для страницы товара)
  updateMainButton(text, callback) {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.MainButton.setText(text);
      tg.MainButton.onClick(callback);
      tg.MainButton.show();
    }
  }
}

// Экспортируем для использования в других модулях
export default NavigationManager;

// Автоматическая инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  window.navigationManager = new NavigationManager();
}); 