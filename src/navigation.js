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
      
      // Скрываем главную кнопку по умолчанию на всех страницах
      // Она будет показана только на странице товара через product.js
      tg.MainButton.hide();

      // Определяем текущую страницу для навигации
      const path = window.location.pathname;
      const isProductPage = path.includes('product.html') || window.location.search.includes('product=');
      const isMainPage = path.includes('index.html') || path === '/' || path === '/tgapp/' || path === '/tgapp/index.html';

      // Настройка кнопки назад/закрыть
      // Сначала очищаем все предыдущие обработчики
      tg.BackButton.hide();
      
      if (isMainPage) {
        // На главной странице показываем кнопку, которая закрывает приложение
        tg.BackButton.onClick(() => {
          tg.close();
        });
        tg.BackButton.show();
      } else {
        // На внутренних страницах показываем кнопку назад
        tg.BackButton.onClick(() => {
          this.goBack();
        });
        tg.BackButton.show();
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
      
      // Дополнительная проверка - показываем кнопку только на странице товара
      const path = window.location.pathname;
      const isProductPage = path.includes('product.html') || window.location.search.includes('product=');
      
      if (isProductPage) {
        tg.MainButton.setText(text);
        tg.MainButton.onClick(callback);
        tg.MainButton.show();
      } else {
        // Если не на странице товара, скрываем кнопку
        tg.MainButton.hide();
      }
    }
  }
}

// Экспортируем для использования в других модулях
export default NavigationManager;

// Автоматическая инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  window.navigationManager = new NavigationManager();
}); 