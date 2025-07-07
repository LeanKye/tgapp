// Telegram Web App с управлением кнопкой "Назад"
class TelegramWebApp {
  constructor() {
    this.init();
  }

  // Определение главной страницы
  isMainPath() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    // Упрощенная логика - главная страница это любая без параметров продукта или категории
    const hasNoParams = !search.includes('product=') && !search.includes('category=');
    
    return hasNoParams;
  }

  // Настройка кнопки "Назад"
  setupBackButton(tg) {
    // Очищаем предыдущие обработчики
    tg.BackButton.offClick();
    
    const isMain = this.isMainPath();
    
    if (isMain) {
      // На главной странице - скрываем кнопку "Назад" и показываем кнопку "Закрыть"
      tg.BackButton.hide();
      this.setupCloseButton(tg);
    } else {
      // На внутренних страницах - скрываем кнопку "Закрыть" и показываем кнопку "Назад"
      this.hideCloseButton(tg);
      
      // Показываем кнопку "Назад" и делаем её активной
      tg.BackButton.show();
      
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

  // Настройка кнопки "Закрыть"
  setupCloseButton(tg) {
    // Проверяем различные возможные названия для кнопки "Закрыть"
    const closeButtonVariants = [
      'CloseButton',
      'closeButton', 
      'Close',
      'close',
      'ExitButton',
      'exitButton',
      'DismissButton',
      'dismissButton'
    ];
    
    let closeButton = null;
    
    // Ищем кнопку "Закрыть" в API
    closeButtonVariants.forEach(variant => {
      if (tg[variant] && typeof tg[variant] === 'object') {
        closeButton = tg[variant];
      }
    });
    
    if (closeButton) {
      // Если нашли кнопку "Закрыть"
      try {
        closeButton.show();
        
        // Очищаем предыдущие обработчики
        if (closeButton.offClick) {
          closeButton.offClick();
        }
        
        // Добавляем обработчик для закрытия приложения
        if (closeButton.onClick) {
          closeButton.onClick(() => {
            if (tg.close) {
              tg.close();
            } else {
              window.close();
            }
          });
        }
        
      } catch (e) {
        // Если ошибка, пробуем альтернативные методы
        this.tryAlternativeCloseMethods(tg);
      }
    } else {
      // Если кнопки "Закрыть" нет, попробуем альтернативные методы
      this.tryAlternativeCloseMethods(tg);
    }
  }

  // Скрытие кнопки "Закрыть"
  hideCloseButton(tg) {
    const closeButtonVariants = [
      'CloseButton',
      'closeButton', 
      'Close',
      'close',
      'ExitButton',
      'exitButton',
      'DismissButton',
      'dismissButton'
    ];
    
    closeButtonVariants.forEach(variant => {
      if (tg[variant] && typeof tg[variant] === 'object') {
        try {
          if (tg[variant].hide) {
            tg[variant].hide();
          }
          if (tg[variant].offClick) {
            tg[variant].offClick();
          }
        } catch (e) {
          // Игнорируем ошибки
        }
      }
    });
  }

  // Альтернативные методы создания кнопки "Закрыть"
  tryAlternativeCloseMethods(tg) {
    // Попытка 1: Использовать MainButton как кнопку "Закрыть"
    if (tg.MainButton) {
      try {
        tg.MainButton.setText('Закрыть');
        tg.MainButton.show();
        tg.MainButton.onClick(() => {
          if (tg.close) {
            tg.close();
          } else {
            window.close();
          }
        });
        return;
      } catch (e) {
        // Продолжаем к следующему методу
      }
    }
    
    // Попытка 2: Создать кнопку "Закрыть" через SecondaryButton
    if (tg.SecondaryButton) {
      try {
        tg.SecondaryButton.setText('Закрыть');
        tg.SecondaryButton.show();
        tg.SecondaryButton.onClick(() => {
          if (tg.close) {
            tg.close();
          } else {
            window.close();
          }
        });
        return;
      } catch (e) {
        // Игнорируем ошибку
      }
    }
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

    // Отслеживание навигации
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.setupBackButton(tg);
      }, 50);
    });

    // Отслеживание изменений в URL
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      setTimeout(() => {
        window.telegramWebApp.setupBackButton(tg);
      }, 50);
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      setTimeout(() => {
        window.telegramWebApp.setupBackButton(tg);
      }, 50);
    };

    // Периодическая проверка
    setInterval(() => {
      this.setupBackButton(tg);
    }, 2000);

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


