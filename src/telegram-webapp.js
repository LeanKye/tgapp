// Telegram Web App настройки
class TelegramWebApp {
  constructor() {
    this.lastPageState = null; // Для отслеживания изменений страницы
    this.navigationUpdateTimeout = null; // Для debounce
    this.init();
  }

  // Точное определение главной страницы
  isMainPage() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    
    // Простая и надежная логика - главная это только index.html или корень
    const isIndexPage = pathname === '/' || 
                       pathname === '/index.html' || 
                       pathname.endsWith('/index.html') ||
                       (pathname === '' && !search && !hash);
    
    // Дополнительно проверяем, что это не product или category страница
    const isNotProductPage = !pathname.includes('product.html') && !search.includes('product=');
    const isNotCategoryPage = !pathname.includes('category.html') && !search.includes('category=');
    
    const result = isIndexPage && isNotProductPage && isNotCategoryPage;
    
    console.log('🔍 Анализ страницы:', {
      pathname,
      search,
      hash,
      isIndexPage,
      isNotProductPage,
      isNotCategoryPage,
      result
    });
    
    return result;
  }

  // Настройка навигации в зависимости от страницы с debounce
  setupNavigation(tg, force = false) {
    // Очищаем предыдущий таймер
    if (this.navigationUpdateTimeout) {
      clearTimeout(this.navigationUpdateTimeout);
    }
    
    // Используем debounce для предотвращения частых обновлений
    this.navigationUpdateTimeout = setTimeout(() => {
      this.updateNavigationState(tg, force);
    }, force ? 0 : 100);
  }
  
  // Основная логика обновления состояния навигации
  updateNavigationState(tg, force = false) {
    const isMain = this.isMainPage();
    const currentUrl = window.location.href;
    
    console.log('🔄 Обновление навигации:', {
      isMain,
      lastState: this.lastPageState,
      currentUrl,
      force,
      backButtonVisible: tg.BackButton.isVisible
    });
    
    // Проверяем, нужно ли обновлять состояние
    if (!force && this.lastPageState === isMain) {
      console.log('⏭️ Состояние не изменилось, пропускаем обновление');
      return;
    }
    
    // Сохраняем новое состояние
    this.lastPageState = isMain;
    
    if (isMain) {
      this.setupMainPageNavigation(tg);
    } else {
      this.setupInnerPageNavigation(tg);
    }
  }
  
  // Настройка навигации для главной страницы
  setupMainPageNavigation(tg) {
    console.log('🏠 Настройка главной страницы');
    
    // Принудительно скрываем кнопку "Назад"
    tg.BackButton.hide();
    tg.MainButton.hide();
    
    // Очищаем все обработчики
    tg.BackButton.offClick();
    
    // Дополнительная проверка через короткий интервал
    setTimeout(() => {
      if (this.isMainPage()) { // Еще раз проверяем что мы на главной
        tg.BackButton.hide();
        console.log('✅ Главная страница: кнопка "Назад" скрыта');
      }
    }, 50);
  }
  
  // Настройка навигации для внутренних страниц
  setupInnerPageNavigation(tg) {
    console.log('📄 Настройка внутренней страницы');
    
    // Скрываем главную кнопку и показываем кнопку "Назад"
    tg.MainButton.hide();
    tg.BackButton.show();
    
    // Очищаем предыдущие обработчики
    tg.BackButton.offClick();
    
    // Добавляем обработчик кнопки "Назад"
    tg.BackButton.onClick(() => {
      console.log('⬅️ Нажата кнопка "Назад"');
      
      // Переходим на главную страницу
      window.location.href = '/index.html';
      
      // Дополнительно обновляем навигацию через небольшую задержку
      setTimeout(() => {
        this.setupNavigation(tg, true);
      }, 200);
    });
    
    console.log('✅ Внутренняя страница: кнопка "Назад" показана');
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
    
    // Первоначальная настройка навигации
    this.setupNavigation(tg, true);
    
    // Отслеживаем изменения в истории браузера
    window.addEventListener('popstate', (e) => {
      console.log('📍 Событие popstate, обновляем навигацию');
      setTimeout(() => {
        this.setupNavigation(tg, true);
      }, 150);
    });

    // Отслеживаем изменения в DOM для SPA навигации
    const observer = new MutationObserver((mutations) => {
      const urlChanged = mutations.some(mutation => 
        mutation.type === 'childList' && 
        (mutation.target === document.head || mutation.target === document.body)
      );
      
      if (urlChanged) {
        this.setupNavigation(tg);
      }
    });
    
    observer.observe(document, {
      childList: true,
      subtree: true
    });

    // Отслеживаем события фокуса и загрузки
    window.addEventListener('focus', () => {
      this.setupNavigation(tg);
    });

    window.addEventListener('load', () => {
      setTimeout(() => {
        this.setupNavigation(tg, true);
      }, 200);
    });
    
    // Отслеживаем изменения URL через hashchange
    window.addEventListener('hashchange', () => {
      console.log('🔗 Изменился hash, обновляем навигацию');
      this.setupNavigation(tg, true);
    });

    // Перехватываем изменения URL для SPA навигации
    this.interceptHistoryMethods(tg);

    // Настройки для улучшения UX
    this.setupUIBehavior();
  }
  
  // Перехват методов истории для отслеживания навигации
  interceptHistoryMethods(tg) {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      console.log('📝 history.pushState вызван:', args[2]);
      originalPushState.apply(history, args);
      setTimeout(() => {
        this.setupNavigation(tg, true);
      }, 100);
    }.bind(this);
    
    history.replaceState = function(...args) {
      console.log('🔄 history.replaceState вызван:', args[2]);
      originalReplaceState.apply(history, args);
      setTimeout(() => {
        this.setupNavigation(tg, true);
      }, 100);
    }.bind(this);
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
}

// Глобальная переменная для доступа к экземпляру
window.telegramWebApp = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.telegramWebApp = new TelegramWebApp();
});

// Дополнительная инициализация при полной загрузке
window.addEventListener('load', () => {
  if (window.telegramWebApp) {
    // Принудительно обновляем навигацию после полной загрузки
    setTimeout(() => {
      if (window.Telegram?.WebApp) {
        window.telegramWebApp.setupNavigation(window.Telegram.WebApp, true);
      }
    }, 300);
  }
});

// Экспорт функции для принудительного обновления навигации
window.updateTelegramNavigation = function() {
  if (window.telegramWebApp && window.Telegram?.WebApp) {
    console.log('🔄 Принудительное обновление навигации');
    window.telegramWebApp.setupNavigation(window.Telegram.WebApp, true);
  }
};
