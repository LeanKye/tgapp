// Модуль для управления навигацией в Telegram мини-приложении
class NavigationManager {
  constructor() {
    // Убираем все ссылки на наши кнопки и элементы, используем только Telegram API
    this.init();
  }

  init() {
    // Инициализируем только Telegram WebApp API
    this.initTelegramWebApp();
  }

  // Определение текущей страницы и установка заголовка через Telegram API
  setPageTitle(title) {
    // Устанавливаем заголовок только через Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp) {
      // Заголовок устанавливается автоматически Telegram
      // Но мы можем сохранить функциональность для использования в других местах
    }
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

  // Логика закрытия приложения
  closeApp() {
    // Проверяем, доступен ли Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp) {
      // Закрываем мини-приложение
      window.Telegram.WebApp.close();
    } else {
      // Fallback для браузера - просто закрываем окно
      window.close();
    }
  }

  // Установка заголовка товара через Telegram API
  setProductTitle(title) {
    // Заголовок устанавливается автоматически через Telegram WebApp
    // Эта функция оставлена для совместимости, но не используется
  }

  // Инициализация Telegram WebApp API
  initTelegramWebApp() {
    // Проверяем, доступен ли Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      
      // Настраиваем тему
      tg.setHeaderColor('#1f1f1f');
      tg.setBackgroundColor('#000000');
      
      // Устанавливаем заголовки
      if (path.includes('category.html')) {
        const categoryName = params.get('category');
        tg.setHeaderText(categoryName || 'Категория');
      } else if (path.includes('product.html')) {
        tg.setHeaderText('Товар');
      } else {
        tg.setHeaderText('Каталог');
      }
      
      // Показываем главную кнопку только на страницах товаров
      if (path.includes('product.html')) {
        // Главная кнопка будет настроена в product.js
        tg.MainButton.show();
      } else {
        tg.MainButton.hide();
      }

      // Включаем кнопку назад Telegram для внутренних страниц
      if (!path.includes('index.html') && path !== '/') {
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
          this.goBack();
        });
      } else {
        tg.BackButton.hide();
      }

      // Расширяем приложение
      tg.expand();
      
      // Отключаем вертикальные свайпы для предотвращения закрытия
      tg.disableVerticalSwipes();
      
      // Устанавливаем настройки для мини-приложения
      tg.enableClosingConfirmation();
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