// Общий файл инициализации приложения
import './style.css'

// Класс для управления общими настройками приложения
class AppInitializer {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  // Определение текущей страницы
  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');
    
    switch (filename) {
      case 'index':
      case '':
        return 'main';
      case 'category':
        return 'category';
      case 'product':
        return 'product';
      default:
        return 'main';
    }
  }

  // Инициализация приложения
  init() {
    this.initViewport();
    this.removePreloader();
    this.initTelegramWebApp();
    this.initGestures();
    this.initBounceScroll();
  }

  // Инициализация viewport для правильного отображения на мобильных устройствах
  initViewport() {
    // Устанавливаем правильную высоту viewport для мобильных устройств
    const setViewportHeight = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100);
    });
  }

  // Убираем preloader и показываем контент
  removePreloader() {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        document.body.classList.remove('preload');
        document.body.classList.add('loaded');
      }, 100);
    });
  }

  // Инициализация Telegram WebApp
  initTelegramWebApp() {
    // Проверяем, доступен ли Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      // Импортируем и инициализируем модуль telegram-webapp
      import('./telegram-webapp.js').then(module => {
        console.log('Telegram WebApp initialized');
      }).catch(error => {
        console.error('Failed to initialize Telegram WebApp:', error);
      });
    }
  }

  // Инициализация жестов
  initGestures() {
    // Импортируем и инициализируем модуль gesture-handler
    import('./gesture-handler.js').then(module => {
      console.log('Gesture handler initialized');
    }).catch(error => {
      console.error('Failed to initialize gesture handler:', error);
    });
  }

  // Инициализация bounce scroll
  initBounceScroll() {
    // Импортируем и инициализируем модуль bounce-scroll
    import('./bounce-scroll.js').then(module => {
      console.log('Bounce scroll initialized');
    }).catch(error => {
      console.error('Failed to initialize bounce scroll:', error);
    });
  }

  // Получение текущей страницы
  getPage() {
    return this.currentPage;
  }
}

// Создаем глобальный экземпляр приложения
const app = new AppInitializer();

// Экспортируем для использования в других модулях
export default app; 