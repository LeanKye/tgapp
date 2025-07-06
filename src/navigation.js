// Модуль для управления навигацией в Telegram мини-приложении
class NavigationManager {
  constructor() {
    this.backButton = document.getElementById('back-button');
    this.headerTitle = document.getElementById('header-title');
    this.init();
  }

  init() {
    // Добавляем обработчик для кнопки назад
    if (this.backButton) {
      this.backButton.addEventListener('click', () => {
        this.goBack();
      });
    }

    // Устанавливаем заголовок в зависимости от страницы
    this.setPageTitle();

    // Добавляем поддержку Telegram WebApp API
    this.initTelegramWebApp();
  }

  // Определение текущей страницы и установка заголовка
  setPageTitle() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (!this.headerTitle) return;

    if (path.includes('category.html')) {
      const categoryName = params.get('category');
      this.headerTitle.textContent = categoryName || 'Категория';
    } else if (path.includes('product.html')) {
      // Заголовок будет установлен динамически при загрузке товара
      this.headerTitle.textContent = 'Товар';
    } else {
      this.headerTitle.textContent = 'Каталог';
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

  // Установка заголовка товара (вызывается из product.js)
  setProductTitle(title) {
    if (this.headerTitle && title) {
      this.headerTitle.textContent = title;
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