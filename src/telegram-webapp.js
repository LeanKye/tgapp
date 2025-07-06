// Модуль для работы с Telegram WebApp API
class TelegramWebApp {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (!this.tg) {
      console.warn('Telegram WebApp не найден. Приложение может работать некорректно.');
      return;
    }

    try {
      // Расширяем приложение на весь экран
      this.tg.expand();
      
      // Отключаем сворачиваемость при прокрутке
      this.tg.disableVerticalSwipes();
      
      // Настраиваем внешний вид
      this.setupTheme();
      
      // Готовим приложение к работе
      this.tg.ready();
      
      this.isInitialized = true;
      console.log('Telegram WebApp инициализирован');
    } catch (error) {
      console.error('Ошибка при инициализации Telegram WebApp:', error);
    }
  }

  setupTheme() {
    if (!this.tg) return;

    // Устанавливаем цвет фона хедера
    this.tg.setHeaderColor('#1f1f1f');
    
    // Устанавливаем цвет фона приложения
    this.tg.setBackgroundColor('#1f1f1f');
  }

  // Настройка главной кнопки
  setupMainButton(text, callback) {
    if (!this.tg) return;

    this.tg.MainButton.text = text;
    this.tg.MainButton.onClick(callback);
    this.tg.MainButton.show();
  }

  hideMainButton() {
    if (!this.tg) return;
    this.tg.MainButton.hide();
  }

  // Настройка кнопки "Назад"
  setupBackButton(callback) {
    if (!this.tg) return;

    this.tg.BackButton.onClick(callback);
    this.tg.BackButton.show();
  }

  hideBackButton() {
    if (!this.tg) return;
    this.tg.BackButton.hide();
  }

  // Закрытие приложения
  close() {
    if (!this.tg) return;
    this.tg.close();
  }

  // Получение данных пользователя
  getUserData() {
    if (!this.tg) return null;
    return this.tg.initDataUnsafe?.user || null;
  }

  // Показ всплывающего уведомления
  showAlert(message) {
    if (!this.tg) {
      alert(message);
      return;
    }
    this.tg.showAlert(message);
  }

  // Показ подтверждения
  showConfirm(message, callback) {
    if (!this.tg) {
      callback(confirm(message));
      return;
    }
    this.tg.showConfirm(message, callback);
  }

  // Вибрация
  vibrate(type = 'medium') {
    if (!this.tg) return;
    
    switch (type) {
      case 'light':
        this.tg.HapticFeedback.impactOccurred('light');
        break;
      case 'medium':
        this.tg.HapticFeedback.impactOccurred('medium');
        break;
      case 'heavy':
        this.tg.HapticFeedback.impactOccurred('heavy');
        break;
      case 'error':
        this.tg.HapticFeedback.notificationOccurred('error');
        break;
      case 'success':
        this.tg.HapticFeedback.notificationOccurred('success');
        break;
      case 'warning':
        this.tg.HapticFeedback.notificationOccurred('warning');
        break;
    }
  }

  // Проверка, запущено ли приложение в Telegram
  isInTelegram() {
    return !!this.tg;
  }

  // Получение платформы
  getPlatform() {
    if (!this.tg) return 'web';
    return this.tg.platform;
  }

  // Получение версии приложения
  getVersion() {
    if (!this.tg) return '1.0';
    return this.tg.version;
  }
}

// Создаем глобальный экземпляр
window.telegramWebApp = new TelegramWebApp();

export default TelegramWebApp; 