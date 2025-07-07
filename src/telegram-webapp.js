// Telegram Web App с управлением кнопкой "Назад"
class TelegramWebApp {
  constructor() {
    this.init();
  }

  // Отладочная функция для показа информации
  showDebugInfo(message) {
    // Создаем элемент для отладки если его нет
    let debugElement = document.getElementById('telegram-debug');
    if (!debugElement) {
      debugElement = document.createElement('div');
      debugElement.id = 'telegram-debug';
      debugElement.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 9999;
        max-width: 300px;
        white-space: pre-wrap;
      `;
      document.body.appendChild(debugElement);
    }
    
    const timestamp = new Date().toLocaleTimeString();
    debugElement.innerHTML = `[${timestamp}] ${message}`;
    
    // Автоматически скрываем через 10 секунд
    setTimeout(() => {
      if (debugElement) {
        debugElement.remove();
      }
    }, 10000);
  }

  // Определение главной страницы (упрощенная версия)
  isMainPath() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    // Упрощенная логика - главная страница это любая без параметров продукта или категории
    const hasNoParams = !search.includes('product=') && !search.includes('category=');
    
    // Считаем главной любую страницу без параметров товаров/категорий
    const isMain = hasNoParams;
    
    this.showDebugInfo(`URL: ${pathname}${search}
Параметры: ${search || 'нет'}
Главная: ${isMain ? 'ДА' : 'НЕТ'}
hasNoParams: ${hasNoParams}`);
    
    return isMain;
  }

  // Настройка кнопки "Назад"
  setupBackButton(tg) {
    // Очищаем предыдущие обработчики
    tg.BackButton.offClick();
    
    const isMain = this.isMainPath();
    
    if (isMain) {
      // На главной странице - скрываем кнопку "Назад" и показываем кнопку "Закрыть"
      tg.BackButton.hide();
      this.showDebugInfo('Главная страница: скрыта кнопка "Назад"');
      
      // Проверяем доступность CloseButton
      this.setupCloseButton(tg);
      
    } else {
      // На внутренних страницах - скрываем кнопку "Закрыть" и показываем кнопку "Назад"
      this.hideCloseButton(tg);
      
      // Показываем кнопку "Назад" и делаем её активной
      tg.BackButton.show();
      this.showDebugInfo('Внутренняя страница: кнопка "Назад" активна');
      
      // Добавляем обработчик для возврата
      tg.BackButton.onClick(() => {
        this.showDebugInfo('Клик по кнопке "Назад" - возврат назад');
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
        this.showDebugInfo(`Найдена кнопка: tg.${variant}`);
      }
    });
    
    if (closeButton) {
      // Если нашли кнопку "Закрыть"
      try {
        closeButton.show();
        this.showDebugInfo('Кнопка "Закрыть" показана');
        
        // Очищаем предыдущие обработчики
        if (closeButton.offClick) {
          closeButton.offClick();
        }
        
        // Добавляем обработчик для закрытия приложения
        if (closeButton.onClick) {
          closeButton.onClick(() => {
            this.showDebugInfo('Клик по кнопке "Закрыть"');
            if (tg.close) {
              tg.close();
            } else {
              // Альтернативные способы закрытия
              window.close();
            }
          });
        }
        
      } catch (e) {
        this.showDebugInfo(`Ошибка настройки кнопки "Закрыть": ${e.message}`);
      }
    } else {
      // Если кнопки "Закрыть" нет, попробуем альтернативные методы
      this.showDebugInfo('Кнопка "Закрыть" не найдена, пробуем альтернативы');
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
            this.showDebugInfo(`Скрыта кнопка: tg.${variant}`);
          }
          if (tg[variant].offClick) {
            tg[variant].offClick();
          }
        } catch (e) {
          this.showDebugInfo(`Ошибка скрытия ${variant}: ${e.message}`);
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
          this.showDebugInfo('Клик по MainButton "Закрыть"');
          if (tg.close) {
            tg.close();
          } else {
            window.close();
          }
        });
        this.showDebugInfo('MainButton настроена как кнопка "Закрыть"');
        return;
      } catch (e) {
        this.showDebugInfo(`Ошибка настройки MainButton: ${e.message}`);
      }
    }
    
    // Попытка 2: Создать кнопку "Закрыть" через SecondaryButton
    if (tg.SecondaryButton) {
      try {
        tg.SecondaryButton.setText('Закрыть');
        tg.SecondaryButton.show();
        tg.SecondaryButton.onClick(() => {
          this.showDebugInfo('Клик по SecondaryButton "Закрыть"');
          if (tg.close) {
            tg.close();
          } else {
            window.close();
          }
        });
        this.showDebugInfo('SecondaryButton настроена как кнопка "Закрыть"');
        return;
      } catch (e) {
        this.showDebugInfo(`Ошибка настройки SecondaryButton: ${e.message}`);
      }
    }
    
    // Попытка 3: Просто использовать метод close() на главной странице
    this.showDebugInfo('Кнопки "Закрыть" не найдены, используем только tg.close()');
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

    // Отслеживание навигации (popstate срабатывает при history.back())
    window.addEventListener('popstate', () => {
      // Используем setTimeout чтобы дать время браузеру обновить URL
      setTimeout(() => {
        this.showDebugInfo('Событие: popstate');
        this.setupBackButton(tg);
      }, 50);
    });

    // Отслеживание изменений в URL (для случаев с pushState)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      setTimeout(() => {
        window.telegramWebApp.showDebugInfo('Событие: pushState');
        window.telegramWebApp.setupBackButton(tg);
      }, 50);
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      setTimeout(() => {
        window.telegramWebApp.showDebugInfo('Событие: replaceState');
        window.telegramWebApp.setupBackButton(tg);
      }, 50);
    };

    // Дополнительная проверка каждые 2 секунды (для отладки)
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


