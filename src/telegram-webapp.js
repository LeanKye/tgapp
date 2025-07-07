// Telegram Web App настройки
class TelegramWebApp {
  constructor() {
    this.lastPageState = null; // Для отслеживания изменений страницы
    this.init();
  }

  // Улучшенное определение главной страницы
  isMainPage() {
    const pathname = window.location.pathname;
    const href = window.location.href;
    
    // Проверяем различные варианты главной страницы
    return pathname === '/' || 
           pathname === '/index.html' || 
           pathname.endsWith('/index.html') ||
           pathname === '' ||
           href.includes('index.html') ||
           (!href.includes('product.html') && !href.includes('category.html'));
  }

  // Настройка навигации в зависимости от страницы
  setupNavigation(tg) {
    const isMain = this.isMainPage();
    
    // Отладочная информация
    console.log('🔍 Проверка страницы:', {
      pathname: window.location.pathname,
      href: window.location.href,
      isMain: isMain,
      lastState: this.lastPageState
    });
    
    // Запоминаем текущее состояние чтобы не дублировать операции
    if (this.lastPageState === isMain) {
      return;
    }
    
    this.lastPageState = isMain;
    
    if (isMain) {
      // На главной странице принудительно скрываем кнопку "Назад"
      tg.BackButton.hide();
      tg.MainButton.hide();
      
      // Отключаем все обработчики кнопки "Назад"
      tg.BackButton.offClick();
      
      // Дополнительная принудительная проверка для главной страницы
      setTimeout(() => {
        tg.BackButton.hide();
        tg.MainButton.hide();
        console.log('🔄 Повторная проверка: кнопка "Назад" скрыта на главной');
      }, 50);
      
      console.log('🏠 Главная страница: кнопка "Назад" скрыта, статус:', tg.BackButton.isVisible);
    } else {
      // На других страницах показываем кнопку "Назад"
      tg.MainButton.hide();
      tg.BackButton.show();
      
      // Очищаем предыдущие обработчики и добавляем новый
      tg.BackButton.offClick();
      tg.BackButton.onClick(() => {
        if (document.referrer && document.referrer.includes(window.location.origin)) {
          window.history.back();
        } else {
          window.location.href = 'index.html';
        }
      });
      
      console.log('📄 Внутренняя страница: кнопка "Назад" показана, статус:', tg.BackButton.isVisible);
    }
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
    
    console.log('🚀 Инициализация Telegram WebApp SDK');
    console.log('📱 Версия SDK:', tg.version);
    console.log('🎨 Цветовая схема:', tg.colorScheme);
    
    // Расширяем приложение на весь экран
    tg.expand();
    
    // Отключаем возможность сворачивания при свайпе вниз
    tg.disableVerticalSwipes();
    
    // Включаем подтверждение закрытия
    tg.enableClosingConfirmation();
    
    // Настройка цветовой схемы
    tg.setHeaderColor('#000000');
    
    // Настройка кнопки "Назад" или "Закрыть"
    this.setupNavigation(tg);
    
    // Дополнительная проверка через небольшие интервалы после инициализации
    setTimeout(() => this.setupNavigation(tg), 100);
    setTimeout(() => this.setupNavigation(tg), 300);
    setTimeout(() => this.setupNavigation(tg), 500);
    
    // Отслеживаем изменения в истории для обновления кнопок
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.setupNavigation(tg);
      }, 100);
    });

    // Дополнительная проверка при фокусе на окно
    window.addEventListener('focus', () => {
      setTimeout(() => {
        this.setupNavigation(tg);
      }, 100);
    });

    // Проверка при полной загрузке страницы
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.setupNavigation(tg);
      }, 200);
    });

    // Перехватываем изменения URL для SPA навигации
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => {
        this.setupNavigation(tg);
      }, 100);
    }.bind(this);
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => {
        this.setupNavigation(tg);
      }, 100);
    }.bind(this);

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
