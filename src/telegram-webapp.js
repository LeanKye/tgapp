// Telegram Web App базовые настройки
class TelegramWebApp {
  constructor() {
    this.tg = null;
    this.currentPage = this.detectCurrentPage();
    this.init();
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
    this.tg = window.Telegram.WebApp;
    
    // Базовые настройки
    this.tg.ready();
    this.tg.expand();
    this.tg.disableVerticalSwipes();
    this.tg.setHeaderColor('#000000');

    // Настройки UI
    this.setupUIBehavior();
    
    // Управление кнопками
    this.updateTelegramHeader();

    // Неблокирующая предзагрузка страниц и ключевых ассетов
    this.schedulePrefetch();
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

  // Определение текущей страницы по URL
  detectCurrentPage() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path.includes('category.html')) {
      return 'categories';
    } else if (path.includes('product.html')) {
      return 'product';
    } else if (path.includes('info.html')) {
      return 'info';
    } else if (path.includes('cart.html')) {
      return 'cart';
    } else if (path.includes('profile.html')) {
      return 'profile';
    } else {
      return 'home';
    }
  }

  // Управление кнопками Telegram
  updateTelegramHeader() {
    if (!this.tg) return;

    if (this.currentPage === "home") {
      // На главной странице скрываем все кнопки
      this.tg.BackButton.hide();
      this.tg.MainButton.show();
      this.tg.MainButton.setText('Закрыть');
    } else {
      // На остальных страницах показываем кнопку "Назад" (стандартное поведение)
      this.tg.MainButton.hide();
      this.tg.BackButton.show();
      
      // Удаляем предыдущие обработчики
      this.tg.BackButton.offClick();
      this.tg.BackButton.onClick(() => {
        // Стандартный back
        if (window.history.length > 1) {
          return window.history.back();
        }
        const basePath = window.location.pathname.replace(/[^/]*$/, '');
        window.location.href = basePath + 'index.html';
      });
    }
  }

  // Неблокирующая предзагрузка других HTML-страниц и небольших ассетов
  schedulePrefetch() {
    const run = () => {
      try {
        // Учитываем экономию трафика и очень медленные сети
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn && (conn.saveData || (conn.effectiveType && ['slow-2g', '2g'].includes(conn.effectiveType)))) {
          return; // не предзагружаем в режимах экономии/очень медленной сети
        }

        const basePath = window.location.pathname.replace(/[^/]*$/, '');
        const allPages = ['index.html', 'category.html', 'product.html', 'cart.html', 'profile.html', 'info.html'];

        // Определяем файл текущей страницы, чтобы не дублировать
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        const pagesToPrefetch = allPages.filter(p => p !== currentFile);

        // Предзагрузка HTML-документов
        pagesToPrefetch.forEach((page) => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.as = 'document';
          link.href = basePath + page;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        });

        // Небольшие часто используемые изображения (иконки оплаты и т.п.)
        const images = ['/img/sbp.svg', '/img/mir.svg'];
        images.forEach((src) => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.as = 'image';
          link.href = src;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        });
      } catch (e) {
        // Молча игнорируем ошибки предзагрузки
      }
    };

    // Планируем на простой, чтобы не мешать первому рендеру
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(run, { timeout: 3000 });
    } else {
      setTimeout(run, 800);
    }
  }
}

// Глобальная переменная для доступа к экземпляру
window.telegramWebApp = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.telegramWebApp = new TelegramWebApp();
});


