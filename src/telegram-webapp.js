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
      // На главной странице - блокируем кнопку "Назад" и показываем кнопку "Закрыть"
      tg.BackButton.show(); // Показываем кнопку
      this.showDebugInfo('Главная страница: кнопка "Назад" отключена');
      
      // Добавляем пустой обработчик - кнопка не будет ничего делать
      tg.BackButton.onClick(() => {
        this.showDebugInfo('Клик по кнопке "Назад" заблокирован на главной странице');
        // Ничего не делаем - блокируем действие
        return false;
      });
      
      // Показываем кнопку "Закрыть"
      this.showCloseButton(tg);
      
      // Дополнительно пытаемся заблокировать нативные действия
      this.blockNativeBackButton();
      
    } else {
      // На всех остальных страницах - показываем кнопку "Назад" и скрываем кнопку "Закрыть"
      tg.BackButton.show();
      this.showDebugInfo('Внутренняя страница: кнопка "Назад" активна');
      
      // Скрываем кнопку "Закрыть"
      this.hideCloseButton(tg);
      
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

  // Показать кнопку "Закрыть" на главной странице
  showCloseButton(tg) {
    try {
      // Метод 1: Используем MainButton как кнопку "Закрыть"
      if (tg.MainButton) {
        tg.MainButton.setText('Закрыть');
        tg.MainButton.setParams({
          color: '#ff4444',
          textColor: '#ffffff',
          is_visible: true,
          is_active: true
        });
        tg.MainButton.show();
        
        // Очищаем предыдущие обработчики
        tg.MainButton.offClick();
        
        // Добавляем обработчик для закрытия
        tg.MainButton.onClick(() => {
          this.showDebugInfo('Клик по кнопке "Закрыть"');
          tg.close();
        });
        
        this.showDebugInfo('Показана кнопка "Закрыть" через MainButton');
      }
      
      // Метод 2: Попытка создать кнопку "Закрыть" в интерфейсе
      if (tg.SettingsButton) {
        tg.SettingsButton.show();
        tg.SettingsButton.onClick(() => {
          this.showDebugInfo('Клик по кнопке настроек - закрытие');
          tg.close();
        });
        this.showDebugInfo('Показана кнопка настроек как "Закрыть"');
      }
      
      // Метод 3: Попытка через методы управления заголовком
      if (tg.HeaderButton) {
        tg.HeaderButton.show();
        tg.HeaderButton.setText('Закрыть');
        tg.HeaderButton.onClick(() => {
          this.showDebugInfo('Клик по кнопке заголовка - закрытие');
          tg.close();
        });
        this.showDebugInfo('Показана кнопка в заголовке');
      }
      
      // Метод 4: Создаем собственную кнопку "Закрыть"
      this.createCustomCloseButton();
      
    } catch (e) {
      this.showDebugInfo(`Ошибка показа кнопки "Закрыть": ${e.message}`);
    }
  }

  // Скрыть кнопку "Закрыть" на внутренних страницах
  hideCloseButton(tg) {
    try {
      if (tg.MainButton) {
        tg.MainButton.hide();
        this.showDebugInfo('Скрыта кнопка "Закрыть" (MainButton)');
      }
      
      if (tg.SettingsButton) {
        tg.SettingsButton.hide();
        this.showDebugInfo('Скрыта кнопка настроек');
      }
      
      if (tg.HeaderButton) {
        tg.HeaderButton.hide();
        this.showDebugInfo('Скрыта кнопка заголовка');
      }
      
      // Скрываем собственную кнопку
      this.hideCustomCloseButton();
      
    } catch (e) {
      this.showDebugInfo(`Ошибка скрытия кнопки "Закрыть": ${e.message}`);
    }
  }

  // Создать собственную кнопку "Закрыть"
  createCustomCloseButton() {
    // Удаляем предыдущую кнопку если есть
    this.hideCustomCloseButton();
    
    const closeButton = document.createElement('button');
    closeButton.id = 'telegram-close-button';
    closeButton.innerHTML = '✕ Закрыть';
    closeButton.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #ff4444;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      z-index: 10000;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    
    closeButton.onclick = () => {
      this.showDebugInfo('Клик по собственной кнопке "Закрыть"');
      const tg = window.Telegram.WebApp;
      tg.close();
    };
    
    document.body.appendChild(closeButton);
    this.showDebugInfo('Создана собственная кнопка "Закрыть"');
  }

  // Скрыть собственную кнопку "Закрыть"
  hideCustomCloseButton() {
    const existingButton = document.getElementById('telegram-close-button');
    if (existingButton) {
      existingButton.remove();
      this.showDebugInfo('Удалена собственная кнопка "Закрыть"');
    }
  }

  // Блокировка нативных действий кнопки "Назад"
  blockNativeBackButton() {
    // Блокируем стандартные события браузера
    const blockBackNavigation = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.showDebugInfo('Заблокировано нативное действие "Назад"');
      return false;
    };
    
    // Блокируем различные события
    window.addEventListener('popstate', blockBackNavigation, { capture: true });
    window.addEventListener('beforeunload', blockBackNavigation, { capture: true });
    window.addEventListener('unload', blockBackNavigation, { capture: true });
    
    // Блокируем клавиши
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        this.showDebugInfo('Заблокирована клавиша: ' + e.key);
        return false;
      }
    }, { capture: true });
    
    // Попытка заблокировать через историю
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', (e) => {
      if (this.isMainPath()) {
        history.pushState(null, null, location.href);
        this.showDebugInfo('Заблокирован возврат через историю');
      }
    });
    
    // Дополнительная блокировка через Telegram API
    try {
      const tg = window.Telegram.WebApp;
      
      // Попытка переопределить методы
      if (tg.close) {
        const originalClose = tg.close;
        tg.close = () => {
          this.showDebugInfo('Заблокирован tg.close()');
          return false;
        };
      }
      
      // Попытка блокировать через события Telegram
      if (tg.onEvent) {
        tg.onEvent('backButtonClicked', () => {
          this.showDebugInfo('Заблокировано событие backButtonClicked');
          return false;
        });
      }
      
    } catch (e) {
      this.showDebugInfo(`Ошибка блокировки Telegram API: ${e.message}`);
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


