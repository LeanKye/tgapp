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
    
    // Добавляем класс для идентификации Telegram WebApp
    document.body.classList.add('tg-webapp');

    // Настройки UI
    this.setupUIBehavior();
    
    // Управление кнопками
    this.updateTelegramHeader();
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
      this.tg.MainButton.hide();
    } else if (this.currentPage === "product") {
      // На странице товара показываем кнопку "Купить"
      this.tg.BackButton.show();
      
      // Настраиваем MainButton как кнопку "Купить"
      this.tg.MainButton.text = "Купить";
      this.tg.MainButton.color = "#29A5FF";
      this.tg.MainButton.textColor = "#FFFFFF";
      this.tg.MainButton.show();
      this.tg.MainButton.enable();
      
      // Скрываем HTML кнопку на мобильных устройствах
      const htmlButton = document.querySelector('.add-to-cart');
      if (htmlButton && this.isMobileDevice()) {
        htmlButton.style.display = 'none';
      }
      
      // Удаляем предыдущие обработчики
      this.tg.BackButton.offClick();
      this.tg.MainButton.offClick();
      
      // Обработчик для кнопки "Назад"
      this.tg.BackButton.onClick(() => {
        window.location.href = './';
      });
      
      // Обработчик для кнопки "Купить"
      this.tg.MainButton.onClick(() => {
        this.handlePurchase();
      });
    } else {
      // На остальных страницах показываем только кнопку "Назад"
      this.tg.MainButton.hide();
      this.tg.BackButton.show();
      
      // Удаляем предыдущие обработчики
      this.tg.BackButton.offClick();
      this.tg.BackButton.onClick(() => {
        window.location.href = './';
      });
    }
  }
  
  // Проверка мобильного устройства
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
  }
  
  // Обработчик покупки
  handlePurchase() {
    // Здесь будет логика покупки
    // Пока просто показываем уведомление
    this.tg.showPopup({
      title: 'Покупка',
      message: 'Функция покупки будет доступна в ближайшее время',
      buttons: [{type: 'ok', text: 'Понятно'}]
    });
  }
  
  // Метод для скрытия MainButton при открытии модального окна
  hideMainButton() {
    if (this.tg && this.currentPage === "product") {
      this.tg.MainButton.hide();
    }
  }
  
  // Метод для показа MainButton при закрытии модального окна
  showMainButton() {
    if (this.tg && this.currentPage === "product" && !document.body.classList.contains('modal-open')) {
      this.tg.MainButton.show();
    }
  }
}

// Глобальная переменная для доступа к экземпляру
window.telegramWebApp = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.telegramWebApp = new TelegramWebApp();
});


