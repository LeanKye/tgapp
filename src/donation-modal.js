// Класс для управления модальным окном DonationAlerts
class DonationModal {
  constructor() {
    this.overlay = document.getElementById('donation-modal-overlay');
    this.closeButton = document.getElementById('donation-modal-close');
    this.supportButton = document.querySelector('.support-btn');
    
    this.init();
  }

  init() {
    // Добавляем обработчики событий
    this.supportButton.addEventListener('click', () => this.openModal());
    this.closeButton.addEventListener('click', () => this.closeModal());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.closeModal();
      }
    });

    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.closeModal();
      }
    });

    // Обработка изменения ориентации устройства
    window.addEventListener('orientationchange', () => {
      if (this.isOpen()) {
        // Небольшая задержка для корректного пересчета размеров
        setTimeout(() => {
          this.repositionModal();
        }, 100);
      }
    });

    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
      if (this.isOpen()) {
        this.repositionModal();
      }
    });
  }

  openModal() {
    this.overlay.classList.add('show');
    document.body.classList.add('donation-modal-open');
    
    // Блокируем прокрутку страницы
    document.body.style.overflow = 'hidden';
    
    // Сохраняем текущую позицию прокрутки
    this.scrollPosition = window.pageYOffset;
    document.body.style.top = `-${this.scrollPosition}px`;
    
    // Фокусируемся на кнопке закрытия для доступности
    setTimeout(() => {
      this.closeButton.focus();
    }, 100);
  }

  closeModal() {
    this.overlay.classList.remove('show');
    document.body.classList.remove('donation-modal-open');
    
    // Восстанавливаем прокрутку страницы
    document.body.style.overflow = '';
    document.body.style.top = '';
    
    // Восстанавливаем позицию прокрутки
    if (this.scrollPosition !== undefined) {
      window.scrollTo(0, this.scrollPosition);
    }
  }

  isOpen() {
    return this.overlay.classList.contains('show');
  }

  // Метод для программного открытия модального окна
  show() {
    this.openModal();
  }

  // Метод для программного закрытия модального окна
  hide() {
    this.closeModal();
  }

  // Метод для перепозиционирования модального окна при изменении размера
  repositionModal() {
    if (this.isOpen()) {
      // Принудительно пересчитываем размеры
      this.overlay.style.display = 'none';
      this.overlay.offsetHeight; // Форсируем пересчет
      this.overlay.style.display = 'flex';
    }
  }
}

// Экспортируем класс для использования в других файлах
export default DonationModal; 