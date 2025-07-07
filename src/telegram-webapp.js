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
      // На главной странице - скрываем кнопку "Назад"
      this.hideBackButtonForced(tg);
    } else {
      // На всех остальных страницах - показываем кнопку "Назад"
      tg.BackButton.show();
      this.showDebugInfo('Действие: ПОКАЗАТЬ кнопку "Назад"');
      
      // Добавляем один обработчик для возврата
      tg.BackButton.onClick(() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/';
        }
      });
    }
  }

  // Принудительное скрытие кнопки "Назад"
  hideBackButtonForced(tg) {
    const attempts = [
      () => {
        tg.BackButton.hide();
        this.showDebugInfo('Попытка 1: tg.BackButton.hide()');
      },
      () => {
        tg.BackButton.isVisible = false;
        this.showDebugInfo('Попытка 2: установка isVisible = false');
      },
      () => {
        if (tg.BackButton.element) {
          tg.BackButton.element.style.display = 'none';
        }
        this.showDebugInfo('Попытка 3: style.display = none');
      },
      () => {
        // Попытка через внутренние методы Telegram
        if (tg.BackButton._hide) {
          tg.BackButton._hide();
        }
        this.showDebugInfo('Попытка 4: _hide()');
      }
    ];

    // Выполняем все попытки с интервалами
    attempts.forEach((attempt, index) => {
      setTimeout(() => {
        try {
          attempt();
        } catch (e) {
          this.showDebugInfo(`Ошибка в попытке ${index + 1}: ${e.message}`);
        }
      }, index * 100);
    });

    // Агрессивный поиск кнопки "Назад" в DOM
    setTimeout(() => {
      this.hideBackButtonInDOM();
    }, 500);

    // Финальная проверка через 1 секунду
    setTimeout(() => {
      const isVisible = tg.BackButton.isVisible;
      this.showDebugInfo(`Финальная проверка: кнопка видима = ${isVisible}`);
      
      // Повторный поиск в DOM
      this.hideBackButtonInDOM();
    }, 1000);
  }

  // Поиск и скрытие кнопки "Назад" в DOM
  hideBackButtonInDOM() {
    const selectors = [
      // Общие селекторы для кнопок "Назад"
      'button[aria-label*="ack"]',
      'button[aria-label*="азад"]',
      'button[title*="ack"]',
      'button[title*="азад"]',
      '[data-testid="back-button"]',
      '.back-button',
      '.tg-back-button',
      
      // Селекторы для Telegram Web App
      '.tgme_head_button',
      '.tgme_head_button_back',
      '.tg-header-back',
      '.header-back',
      
      // Селекторы для элементов с иконками "назад"
      'button svg[viewBox*="24"]',
      'button [d*="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"]',
      'button [d*="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"]',
      
      // Поиск по тексту
      'button:contains("Назад")',
      'button:contains("Back")',
      'a:contains("Назад")',
      'a:contains("Back")',
      
      // Поиск по классам
      '.btn-back',
      '.navigation-back',
      '.nav-back',
      
      // Поиск в заголовке
      'header button:first-child',
      '.header button:first-child',
      '.top-bar button:first-child',
      '.nav-bar button:first-child'
    ];

    let foundButtons = [];
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el && !foundButtons.includes(el)) {
            foundButtons.push(el);
          }
        });
      } catch (e) {
        // Игнорируем ошибки селекторов
      }
    });

    // Дополнительный поиск по тексту (для :contains которые могут не работать)
    const allButtons = document.querySelectorAll('button, a');
    allButtons.forEach(btn => {
      const text = btn.textContent || btn.innerText || btn.getAttribute('aria-label') || btn.getAttribute('title');
      if (text && (text.includes('Назад') || text.includes('Back') || text.includes('назад') || text.includes('back'))) {
        if (!foundButtons.includes(btn)) {
          foundButtons.push(btn);
        }
      }
    });

    // Поиск по позиции (первая кнопка в заголовке)
    const headerElements = document.querySelectorAll('header, .header, .top-bar, .nav-bar, .tg-header');
    headerElements.forEach(header => {
      const firstButton = header.querySelector('button, a');
      if (firstButton && !foundButtons.includes(firstButton)) {
        foundButtons.push(firstButton);
      }
    });

    this.showDebugInfo(`Найдено кнопок для скрытия: ${foundButtons.length}`);

    // Скрываем все найденные кнопки
    foundButtons.forEach((btn, index) => {
      try {
        btn.style.display = 'none';
        btn.style.visibility = 'hidden';
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
        btn.setAttribute('hidden', 'true');
        
        // Скрываем родительские элементы если они выглядят как контейнеры кнопки
        if (btn.parentElement && btn.parentElement.children.length === 1) {
          btn.parentElement.style.display = 'none';
        }
        
        this.showDebugInfo(`Скрыта кнопка ${index + 1}: ${btn.tagName} "${btn.textContent || btn.getAttribute('aria-label') || 'без текста'}"`);
      } catch (e) {
        this.showDebugInfo(`Ошибка скрытия кнопки ${index + 1}: ${e.message}`);
      }
    });

    // Добавляем глобальные CSS правила для скрытия
    const style = document.createElement('style');
    style.textContent = `
      .tg-back-button,
      [data-testid="back-button"],
      .back-button,
      .tgme_head_button,
      .tgme_head_button_back,
      .tg-header-back,
      .header-back {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
      
      /* Скрываем первую кнопку в заголовке */
      .tg-header button:first-child,
      header button:first-child,
      .header button:first-child,
      .top-bar button:first-child,
      .nav-bar button:first-child {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
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


