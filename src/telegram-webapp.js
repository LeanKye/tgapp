// Telegram Web App с управлением кнопкой "Назад"
class TelegramWebApp {
  constructor() {
    this.isIOSMacOS = this.detectIOSMacOS();
    this.lastPath = window.location.pathname + window.location.search;
    this.init();
  }

  // Более точное определение iOS/MacOS устройств
  detectIOSMacOS() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // Проверка на iOS
    const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
                  (platform.includes('mac') && 'ontouchend' in document);
    
    // Проверка на MacOS
    const isMacOS = platform.includes('mac') && !('ontouchend' in document);
    
    // Дополнительные проверки
    const isAppleWebKit = /webkit/.test(userAgent) && /apple/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    
    return isIOS || isMacOS || (isAppleWebKit && isSafari);
  }

  // Определение главной страницы
  isMainPath() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    // Главная страница - это корень или index.html без параметров товаров/категорий
    const isMainPath = pathname === '/' || 
                      pathname === '/tgapp/' || 
                      pathname === '/tgapp' ||
                      pathname === '/index.html' ||
                      pathname === '/tgapp/index.html' ||
                      pathname.endsWith('/tgapp') ||
                      pathname.endsWith('/tgapp/');
    
    const hasNoParams = !search.includes('product=') && !search.includes('category=');
    
    return isMainPath && hasNoParams;
  }

  // Проверка нужно ли обновлять главную страницу
  shouldRefreshMainPage() {
    const currentPath = window.location.pathname + window.location.search;
    const wasOnSubPage = !this.isMainPathFromUrl(this.lastPath);
    const nowOnMainPage = this.isMainPath();
    
    return wasOnSubPage && nowOnMainPage;
  }

  // Определение главной страницы по URL
  isMainPathFromUrl(url) {
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname;
    const search = urlObj.search;
    
    const isMainPath = pathname === '/' || 
                      pathname === '/tgapp/' || 
                      pathname === '/tgapp' ||
                      pathname === '/index.html' ||
                      pathname === '/tgapp/index.html' ||
                      pathname.endsWith('/tgapp') ||
                      pathname.endsWith('/tgapp/');
    
    const hasNoParams = !search.includes('product=') && !search.includes('category=');
    
    return isMainPath && hasNoParams;
  }

  // Принудительное обновление главной страницы для iOS/MacOS
  forceRefreshMainPage() {
    if (this.isIOSMacOS && this.shouldRefreshMainPage()) {
      // Проверяем, не была ли страница уже обновлена недавно
      const lastRefresh = sessionStorage.getItem('lastMainPageRefresh');
      const now = Date.now();
      
      if (!lastRefresh || (now - parseInt(lastRefresh)) > 2000) {
        sessionStorage.setItem('lastMainPageRefresh', now.toString());
        setTimeout(() => {
          window.location.reload();
        }, 100);
        return true;
      }
    }
    return false;
  }

  // Принудительное скрытие кнопки для iOS/MacOS
  forceHideBackButton(tg) {
    // Множественные попытки скрытия
    const hideAttempts = [0, 50, 100, 200, 300, 500, 800, 1000];
    
    hideAttempts.forEach(delay => {
      setTimeout(() => {
        try {
          tg.BackButton.hide();
          tg.BackButton.offClick();
          
          // Дополнительное принудительное скрытие
          if (tg.BackButton.isVisible) {
            tg.BackButton.hide();
          }
        } catch (error) {
          console.log('Ошибка при скрытии кнопки:', error);
        }
      }, delay);
    });

    // Постоянная проверка и скрытие
    const intervalId = setInterval(() => {
      if (this.isMainPath()) {
        try {
          if (tg.BackButton.isVisible) {
            tg.BackButton.hide();
          }
        } catch (error) {
          console.log('Ошибка в интервале:', error);
        }
      } else {
        clearInterval(intervalId);
      }
    }, 100);

    // Очистка интервала через 5 секунд
    setTimeout(() => {
      clearInterval(intervalId);
    }, 5000);
  }

  // Настройка кнопки "Назад" для iOS/MacOS
  setupBackButtonIOS(tg) {
    if (this.isMainPath()) {
      // На главной странице - принудительно скрываем кнопку "Назад"
      this.forceHideBackButton(tg);
    } else {
      // На всех остальных страницах - показываем кнопку "Назад"
      tg.BackButton.offClick(); // Очищаем предыдущие обработчики
      
      // Показываем кнопку с задержкой
      setTimeout(() => {
        tg.BackButton.show();
        
        tg.BackButton.onClick(() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = '/';
          }
        });
      }, 100);
    }
  }

  // Настройка кнопки "Назад" для обычных устройств
  setupBackButtonDefault(tg) {
    if (this.isMainPath()) {
      // На главной странице - скрываем кнопку "Назад"
      tg.BackButton.hide();
      tg.BackButton.offClick();
    } else {
      // На всех остальных страницах - показываем кнопку "Назад"
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        window.history.back();
      });
      
      // Добавляем обработчик для возврата
      tg.BackButton.onClick(() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/';
        }
      });
    }
  }

  // Универсальная настройка кнопки "Назад"
  setupBackButton(tg) {
    if (this.isIOSMacOS) {
      this.setupBackButtonIOS(tg);
    } else {
      this.setupBackButtonDefault(tg);
    }
  }

  // Обработка навигации
  handleNavigation(tg) {
    // Проверяем нужно ли обновить главную страницу
    if (this.forceRefreshMainPage()) {
      return; // Страница будет обновлена, не продолжаем
    }

    // Обновляем состояние кнопки
    this.setupBackButton(tg);
    
    // Обновляем последний путь
    this.lastPath = window.location.pathname + window.location.search;
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
    const tg = window.Telegram.WebApp;
    
    // Базовые настройки
    tg.expand();
    tg.disableVerticalSwipes();
    tg.setHeaderColor('#000000');

    // Настройка кнопки "Назад"
    this.setupBackButton(tg);

    // Отслеживание навигации с учетом платформы
    window.addEventListener('popstate', () => {
      if (this.isIOSMacOS) {
        // Для iOS - проверяем нужно ли обновить главную страницу
        setTimeout(() => {
          this.handleNavigation(tg);
        }, 50);
      } else {
        setTimeout(() => {
          this.setupBackButton(tg);
        }, 100);
      }
    });

    // Дополнительное отслеживание для iOS/MacOS
    if (this.isIOSMacOS) {
      // Отслеживание изменений в истории
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(() => {
          window.telegramWebApp.handleNavigation(tg);
        }, 200);
      };
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(() => {
          window.telegramWebApp.handleNavigation(tg);
        }, 200);
      };

      // Отслеживание изменений URL
      let currentURL = window.location.href;
      setInterval(() => {
        if (currentURL !== window.location.href) {
          currentURL = window.location.href;
          setTimeout(() => {
            this.handleNavigation(tg);
          }, 100);
        }
      }, 100);

      // Отслеживание focus события для надежности
      window.addEventListener('focus', () => {
        setTimeout(() => {
          this.handleNavigation(tg);
        }, 200);
      });

      // Отслеживание видимости страницы
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          setTimeout(() => {
            this.handleNavigation(tg);
          }, 300);
        }
      });
    }

    // Настройки UI
    this.setupUIBehavior();
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

// Экспорт функции для обновления кнопки "Назад"
window.updateTelegramBackButton = function() {
  if (window.telegramWebApp && window.Telegram?.WebApp) {
    window.telegramWebApp.setupBackButton(window.Telegram.WebApp);
  }
};


