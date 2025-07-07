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
    
    return result;
  }

  // Принудительная проверка и обновление состояния кнопки "Назад"
  forceBackButtonUpdate(tg) {
    const isMain = this.isMainPage();
    
    if (isMain) {
      // Множественные попытки скрытия
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          if (this.isMainPage()) {
            tg.BackButton.hide();
            tg.BackButton.offClick();
          }
        }, i * 10);
      }
    } else {
      tg.BackButton.show();
    }
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
    
    // Проверяем, нужно ли обновлять состояние
    if (!force && this.lastPageState === isMain) {
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
    // Принудительно скрываем кнопку "Назад"
    tg.BackButton.hide();
    tg.MainButton.hide();
    
    // Очищаем все обработчики кнопки "Назад"
    tg.BackButton.offClick();
    
    // Дополнительные проверки для полного скрытия кнопки "Назад"
    setTimeout(() => {
      if (this.isMainPage()) {
        tg.BackButton.hide();
      }
    }, 50);
    
    // Еще одна проверка через больший интервал
    setTimeout(() => {
      if (this.isMainPage()) {
        tg.BackButton.hide();
      }
    }, 200);
    
    // Дополнительная принудительная проверка через 500ms
    setTimeout(() => {
      this.forceBackButtonUpdate(tg);
    }, 500);
  }
  
  // Настройка навигации для внутренних страниц
  setupInnerPageNavigation(tg) {
    // Скрываем главную кнопку и показываем кнопку "Назад"
    tg.MainButton.hide();
    tg.BackButton.show();
    
    // Очищаем предыдущие обработчики
    tg.BackButton.offClick();
    
    // Добавляем обработчик кнопки "Назад"
    tg.BackButton.onClick(() => {
      // Проверяем, есть ли история для возврата
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Если истории нет, переходим на главную страницу
        window.location.href = '/index.html';
      }
    });
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
    
    // КРИТИЧЕСКИ ВАЖНО: Сначала скрываем кнопку "Назад" до всех проверок
    tg.BackButton.hide();
    tg.BackButton.offClick();
    
    // Расширяем приложение на весь экран
    tg.expand();
    
    // Отключаем возможность сворачивания при свайпе вниз
    tg.disableVerticalSwipes();
    
    // Включаем подтверждение закрытия (только для главной страницы)
    if (this.isMainPage()) {
      tg.enableClosingConfirmation();
    }
    
    // Настройка цветовой схемы
    tg.setHeaderColor('#000000');
    
    // Еще раз принудительно скрываем кнопку "Назад" перед настройкой навигации
    tg.BackButton.hide();
    tg.BackButton.offClick();
    
    // Первоначальная настройка навигации
    this.setupNavigation(tg, true);
    
    // Агрессивная серия проверок для главной страницы
    if (this.isMainPage()) {
      // Немедленно
      tg.BackButton.hide();
      tg.BackButton.offClick();
      
      // Через разные интервалы
      [50, 100, 200, 300, 500, 1000, 2000].forEach(delay => {
        setTimeout(() => {
          if (this.isMainPage()) {
            tg.BackButton.hide();
            tg.BackButton.offClick();
          }
        }, delay);
      });
    }
    
    // Дополнительная принудительная проверка кнопки "Назад"
    setTimeout(() => {
      this.forceBackButtonUpdate(tg);
    }, 100);
    
    // Еще одна проверка через большую задержку
    setTimeout(() => {
      this.forceBackButtonUpdate(tg);
    }, 1000);
    
    // Отслеживаем изменения в истории браузера
    window.addEventListener('popstate', (e) => {
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
      // Дополнительная проверка при возврате фокуса
      if (this.isMainPage()) {
        setTimeout(() => {
          this.forceBackButtonUpdate(tg);
        }, 100);
      }
    });

    window.addEventListener('load', () => {
      setTimeout(() => {
        this.setupNavigation(tg, true);
      }, 200);
    });
    
    // Отслеживаем изменения видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isMainPage()) {
        setTimeout(() => {
          this.forceBackButtonUpdate(tg);
        }, 100);
      }
    });
    
    // Отслеживаем изменения URL через hashchange
    window.addEventListener('hashchange', () => {
      this.setupNavigation(tg, true);
    });

    // Перехватываем изменения URL для SPA навигации
    this.interceptHistoryMethods(tg);

    // Настройки для улучшения UX
    this.setupUIBehavior();
    
    // Периодическая проверка состояния кнопки "Назад" для главной страницы
    this.startPeriodicBackButtonCheck(tg);
  }
  
  // Перехват методов истории для отслеживания навигации
  interceptHistoryMethods(tg) {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => {
        this.setupNavigation(tg, true);
      }, 100);
    }.bind(this);
    
    history.replaceState = function(...args) {
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
  
  // Периодическая проверка состояния кнопки "Назад"
  startPeriodicBackButtonCheck(tg) {
    // Проверяем каждые 2 секунды
    setInterval(() => {
      if (this.isMainPage() && tg.BackButton.isVisible) {
        tg.BackButton.hide();
        tg.BackButton.offClick();
        
        // Дополнительная агрессивная проверка
        setTimeout(() => {
          if (this.isMainPage() && tg.BackButton.isVisible) {
            tg.BackButton.hide();
            tg.BackButton.offClick();
          }
        }, 100);
      }
    }, 2000);
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
    window.telegramWebApp.setupNavigation(window.Telegram.WebApp, true);
  }
};

// Экспорт функции для принудительного обновления кнопки "Назад"
window.updateTelegramBackButton = function() {
  if (window.telegramWebApp && window.Telegram?.WebApp) {
    window.telegramWebApp.forceBackButtonUpdate(window.Telegram.WebApp);
  }
};

// Экспорт функции для АГРЕССИВНОГО скрытия кнопки "Назад" на главной странице
window.forceHideBackButton = function() {
  if (window.telegramWebApp && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Множественные попытки скрытия
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        tg.BackButton.hide();
        tg.BackButton.offClick();
      }, i * 50);
    }
  }
};


