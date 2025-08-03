// Менеджер модальных окон с поддержкой перетаскивания (drag & drop / swipe)
class ModalManager {
  constructor() {
    this.activeModal = null;
    this.isDragging = false;
    this.startY = 0;
    this.currentY = 0;
    this.startTime = 0;
    this.velocity = 0;
    this.modalHeight = 0;
    this.screenHeight = 0;
    this.closeThreshold = 0.15; // 15% от высоты экрана для закрытия (более чувствительно)
    this.velocityThreshold = 0.3; // Скорость для закрытия при быстром свайпе (более чувствительно)
    
    this.init();
  }

  init() {
    // Создаем базовые модальные окна
    this.createLabelModal();
    this.createWebMoneyModal();
  }

  // Создание модального окна для лейблов
  createLabelModal() {
    if (document.getElementById('label-modal')) return;

    const modalHTML = `
      <div id="label-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <div id="modal-icon" class="modal-icon">💡</div>
            <h3 id="modal-title" class="modal-title">Информация</h3>
          </div>
          <div class="modal-body">
            <p id="modal-text" class="modal-text">Загрузка...</p>
          </div>
          <div class="modal-footer">
            <button id="modal-close" class="modal-close">Понятно</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.setupModalEvents('label-modal');
  }

  // Создание модального окна WebMoney
  createWebMoneyModal() {
    if (document.getElementById('webmoney-modal')) return;

    const modalHTML = `
      <div id="webmoney-modal" class="webmoney-modal-overlay">
        <div class="webmoney-modal">
          <div class="webmoney-modal-header">
            <h3>Оплата через WebMoney</h3>
            <button class="webmoney-modal-close" aria-label="Закрыть">&times;</button>
          </div>
          <div class="webmoney-modal-body">
            <div class="payment-details">
              <div class="payment-item">
                <span>Товар:</span>
                <span id="modal-product-title">-</span>
              </div>
              <div class="payment-item">
                <span>Способ оформления:</span>
                <span id="modal-variant">-</span>
              </div>
              <div class="payment-item">
                <span>Период:</span>
                <span id="modal-period">-</span>
              </div>
              <div class="payment-item">
                <span>План:</span>
                <span id="modal-edition">-</span>
              </div>
              <div class="payment-item total">
                <span>Итого:</span>
                <span id="modal-price">-</span>
              </div>
            </div>
            <div class="webmoney-widget-container">
              <div id="wm-widget"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.setupModalEvents('webmoney-modal');
  }

  // Настройка событий для модального окна
  setupModalEvents(modalId) {
    const modal = document.getElementById(modalId);
    const content = modal.querySelector('.modal-content, .webmoney-modal');
    
    if (!modal || !content) {
      return;
    }

    // Проверяем, не подключены ли уже обработчики
    if (modal.dataset.eventsSetup === 'true') {
      return;
    }

    // Обработчики для закрытия
    this.setupCloseEvents(modal, modalId);
    
    // Настройка drag событий для обычных модальных окон
    if (modalId === 'label-modal') {
      this.setupDragEvents(modal, content);
    }
    
    // Дополнительные обработчики для WebMoney модального окна
    if (modalId === 'webmoney-modal') {
      this.setupWebMoneyCloseEvents(modal);
    }

    // Помечаем, что обработчики подключены
    modal.dataset.eventsSetup = 'true';
  }

  // Настройка событий перетаскивания
  setupDragEvents(modal, content) {
    let isDragging = false;
    let startY = 0;
    let currentY = 0;
    let startTime = 0;
    let velocity = 0;
    let lastY = 0;
    let lastTime = 0;

    // Touch события для мобильных устройств
    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      
      isDragging = true;
      startY = e.touches[0].clientY;
      currentY = startY;
      startTime = Date.now();
      lastY = startY;
      lastTime = startTime;
      
      content.style.transition = 'none';
      modal.style.transition = 'none';
      modal.style.opacity = '1';
      modal.classList.add('dragging');
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      // Ограничиваем движение только вниз
      if (deltaY > 0) {
        const translateY = Math.min(deltaY, window.innerHeight * 0.5);
        content.style.transform = `translateY(${translateY}px)`;
        
        // Добавляем визуальную обратную связь - изменение прозрачности
        const progress = Math.min(deltaY / (window.innerHeight * this.closeThreshold), 1);
        modal.style.opacity = 1 - (progress * 0.3); // Максимальная прозрачность 0.7
        
        // Вычисляем скорость
        const now = Date.now();
        if (now - lastTime > 0) {
          velocity = (currentY - lastY) / (now - lastTime);
          lastY = currentY;
          lastTime = now;
        }
      }
      
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      isDragging = false;
      const deltaY = currentY - startY;
      const deltaTime = Date.now() - startTime;
      const screenHeight = window.innerHeight;
      
      // Определяем, нужно ли закрыть модальное окно
      const shouldClose = deltaY > screenHeight * this.closeThreshold || 
                         (velocity > this.velocityThreshold && deltaY > 50);
      
      if (shouldClose) {
        this.closeModal(modal.id);
      } else {
        // Возвращаем модальное окно в исходное положение
        content.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        modal.style.transition = 'opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        content.style.transform = 'translateY(0)';
        modal.style.opacity = '1';
        
        setTimeout(() => {
          modal.classList.remove('dragging');
        }, 300);
      }
    };

    // Mouse события для десктопа
    const handleMouseDown = (e) => {
      if (e.button !== 0) return; // Только левая кнопка мыши
      
      isDragging = true;
      startY = e.clientY;
      currentY = startY;
      startTime = Date.now();
      lastY = startY;
      lastTime = startTime;
      
      content.style.transition = 'none';
      modal.style.transition = 'none';
      modal.style.opacity = '1';
      modal.classList.add('dragging');
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      currentY = e.clientY;
      const deltaY = currentY - startY;
      
      // Ограничиваем движение только вниз
      if (deltaY > 0) {
        const translateY = Math.min(deltaY, window.innerHeight * 0.5);
        content.style.transform = `translateY(${translateY}px)`;
        
        // Добавляем визуальную обратную связь - изменение прозрачности
        const progress = Math.min(deltaY / (window.innerHeight * this.closeThreshold), 1);
        modal.style.opacity = 1 - (progress * 0.3); // Максимальная прозрачность 0.7
        
        // Вычисляем скорость
        const now = Date.now();
        if (now - lastTime > 0) {
          velocity = (currentY - lastY) / (now - lastTime);
          lastY = currentY;
          lastTime = now;
        }
      }
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      
      isDragging = false;
      const deltaY = currentY - startY;
      const screenHeight = window.innerHeight;
      
      // Определяем, нужно ли закрыть модальное окно
      const shouldClose = deltaY > screenHeight * this.closeThreshold || 
                         (velocity > this.velocityThreshold && deltaY > 50);
      
      if (shouldClose) {
        this.closeModal(modal.id);
      } else {
        // Возвращаем модальное окно в исходное положение
        content.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        modal.style.transition = 'opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        content.style.transform = 'translateY(0)';
        modal.style.opacity = '1';
        
        setTimeout(() => {
          modal.classList.remove('dragging');
        }, 300);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    // Добавляем обработчики событий
    content.addEventListener('touchstart', handleTouchStart, { passive: false });
    content.addEventListener('touchmove', handleTouchMove, { passive: false });
    content.addEventListener('touchend', handleTouchEnd, { passive: true });
    content.addEventListener('mousedown', handleMouseDown);
  }

  // Настройка событий закрытия
  setupCloseEvents(modal, modalId) {
    // Закрытие по клику на фон
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modalId);
      }
    });

    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        this.closeModal(modalId);
      }
    });

    // Закрытие по кнопке "Понятно" (только для label-modal)
    if (modalId === 'label-modal') {
      const closeBtn = modal.querySelector('#modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeModal(modalId);
        });
      }
    }
  }

  // Дополнительные обработчики закрытия для WebMoney модального окна
  setupWebMoneyCloseEvents(modal) {
    // Закрытие по клику на крестик
    const closeBtn = modal.querySelector('.webmoney-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal('webmoney-modal');
      });
    }
  }

  // Открытие модального окна
  openModal(modalId, data = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      return;
    }

    this.activeModal = modalId;

    // Заполняем данные для label-modal
    if (modalId === 'label-modal' && data.labelInfo) {
      const icon = modal.querySelector('#modal-icon');
      const title = modal.querySelector('#modal-title');
      const text = modal.querySelector('#modal-text');

      if (icon && title && text) {
        icon.textContent = data.labelInfo.icon;
        icon.className = `modal-icon ${data.labelInfo.iconClass}`;
        title.textContent = data.labelInfo.title;
        text.textContent = data.labelInfo.description;
      }
    }

    // Заполняем данные для webmoney-modal
    if (modalId === 'webmoney-modal' && data.paymentData) {
      const productTitle = modal.querySelector('#modal-product-title');
      const variant = modal.querySelector('#modal-variant');
      const period = modal.querySelector('#modal-period');
      const edition = modal.querySelector('#modal-edition');
      const price = modal.querySelector('#modal-price');

      if (productTitle && variant && period && edition && price) {
        productTitle.textContent = data.paymentData.productTitle || '-';
        variant.textContent = data.paymentData.variant || '-';
        period.textContent = data.paymentData.period || '-';
        edition.textContent = data.paymentData.edition || '-';
        price.innerHTML = data.paymentData.price || '-';
      }
    }

    // Блокируем прокрутку страницы
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    // Сбрасываем прозрачность и трансформацию
    modal.style.opacity = '1';
    modal.style.transition = '';
    const content = modal.querySelector('.modal-content, .webmoney-modal');
    if (content) {
      content.style.transform = '';
      content.style.transition = '';
    }

    // Показываем модальное окно
    modal.classList.add('show');

    // Убеждаемся, что обработчики событий подключены
    this.setupModalEvents(modalId);

    // Инициализируем WebMoney виджет если нужно
    if (modalId === 'webmoney-modal' && data.paymentData) {
      this.initWebMoneyWidget(data.paymentData);
    }
  }

  // Закрытие модального окна
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      return;
    }

    // Проверяем, не закрывается ли уже модальное окно
    if (modal.classList.contains('closing')) {
      return;
    }

    // Помечаем модальное окно как закрывающееся
    modal.classList.add('closing');

    // Сразу убираем блокировку прокрутки
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';

    // Скрываем модальное окно
    modal.classList.remove('show');

    // Сбрасываем трансформацию и прозрачность
    const content = modal.querySelector('.modal-content, .webmoney-modal');
    if (content) {
      content.style.transform = '';
      content.style.transition = '';
    }
    modal.style.opacity = '';
    modal.style.transition = '';

    // Очищаем WebMoney виджет если нужно
    if (modalId === 'webmoney-modal') {
      const widgetContainer = document.getElementById('wm-widget');
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    }

    this.activeModal = null;
    modal.classList.remove('closing');
  }

  // Инициализация WebMoney виджета
  initWebMoneyWidget(paymentData) {
    const widgetContainer = document.getElementById('wm-widget');
    if (!widgetContainer) return;

    widgetContainer.innerHTML = '';

    // Создаем описание заказа
    const description = `${paymentData.productTitle} - ${paymentData.variant}, ${paymentData.period}, ${paymentData.edition}`;
    
    // Генерируем ID заказа
    const orderId = this.generateOrderId();
    
    // Убеждаемся, что amount является числом
    const numericAmount = Number(paymentData.amount);
    
    // Добавляем отладочную информацию
    console.log('Инициализация WebMoney виджета:', {
      paymentData,
      orderId,
      numericAmount,
      webmoneyAvailable: !!window.webmoney,
      widgetsAvailable: !!(window.webmoney && window.webmoney.widgets)
    });
    
    // Функция для создания fallback кнопки
    const createFallbackButton = () => {
      widgetContainer.innerHTML = `
        <div style="color: #888; text-align: center; padding: 20px;">
          <div style="margin-bottom: 15px;">Ошибка загрузки платежного виджета</div>
          <button id="fallback-pay-button" style="
            background: #007AFF;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            width: 100%;
            max-width: 200px;
          ">Оплатить ${numericAmount} ₽</button>
        </div>
      `;
      
      // Добавляем обработчик для fallback кнопки
      const fallbackButton = document.getElementById('fallback-pay-button');
      if (fallbackButton) {
        fallbackButton.addEventListener('click', () => {
          const result = {
            orderId: orderId,
            amount: numericAmount,
            description: description,
            webmoneyData: { fallback: true }
          };
          
          this.closeModal('webmoney-modal');
          this.handlePaymentSuccess(result, paymentData);
        });
      }
    };
    
    // Функция для создания виджета
    const createWidget = () => {
      if (window.webmoney && window.webmoney.widgets) {
        const widgetConfig = {
          "data": {
            "amount": numericAmount,
            "purse": "T231993574772",
            "desc": description,
            "paymentType": "wm",
            "lmi_payment_no": orderId,
            "forcePay": true,
            "lmi_currency": "RUB",
            "lmi_currency_code": "RUB",
            "test": true
          },
          "style": {
            "theme": "wm",
            "showAmount": true,
            "titleNum": 1,
            "title": "",
            "design": "flat"
          },
          "lang": "ru"
        };
        
        console.log('Создание WebMoney виджета с конфигурацией:', widgetConfig);
        
        try {
          window.webmoney.widgets().button.create(widgetConfig).on('paymentComplete', (data) => {
            // Обрабатываем успешную оплату
            const result = {
              orderId: orderId,
              amount: numericAmount,
              description: description,
              webmoneyData: data
            };
            
            this.closeModal('webmoney-modal');
            this.handlePaymentSuccess(result, paymentData);
          }).mount('wm-widget');
          
          console.log('WebMoney виджет успешно создан и смонтирован');
        } catch (error) {
          console.error('Ошибка при создании WebMoney виджета:', error);
          createFallbackButton();
        }
      } else {
        console.warn('WebMoney виджет недоступен');
        createFallbackButton();
      }
    };
    
    // Проверяем, загружен ли WebMoney виджет
    if (window.webmoney && window.webmoney.widgets) {
      console.log('WebMoney виджет уже загружен, создаем виджет');
      createWidget();
    } else {
      console.log('WebMoney виджет не загружен, показываем fallback кнопку и пытаемся загрузить...');
      
      // Сразу показываем fallback кнопку, чтобы пользователь не ждал
      createFallbackButton();
      
      // Попытка принудительной загрузки WebMoney скрипта
      if (!window.webmoney) {
        console.log('Попытка принудительной загрузки WebMoney скрипта');
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://merchant.web.money/conf/lib/widgets/wmApp.js?v=1.6';
        script.onload = () => {
          console.log('WebMoney скрипт загружен принудительно');
          setTimeout(() => {
            if (window.webmoney && window.webmoney.widgets) {
              console.log('WebMoney виджет доступен после принудительной загрузки');
              // Заменяем fallback кнопку на WebMoney виджет
              createWidget();
            } else {
              console.log('WebMoney виджет все еще недоступен после принудительной загрузки');
            }
          }, 1000);
        };
        script.onerror = () => {
          console.error('Ошибка принудительной загрузки WebMoney скрипта');
        };
        document.head.appendChild(script);
      }
      
      // Ждем загрузки WebMoney виджета
      let attempts = 0;
      const maxAttempts = 15; // Увеличиваем количество попыток
      
      const checkWebMoney = setInterval(() => {
        attempts++;
        console.log(`Попытка ${attempts}/${maxAttempts} загрузки WebMoney виджета`);
        
        if (window.webmoney && window.webmoney.widgets) {
          clearInterval(checkWebMoney);
          console.log('WebMoney виджет загружен, заменяем fallback кнопку');
          createWidget();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkWebMoney);
          console.error('Превышено максимальное количество попыток загрузки WebMoney виджета');
        }
      }, 300); // Уменьшаем интервал
    }
  }

  // Обработка успешной оплаты
  handlePaymentSuccess(result, paymentData) {
    // Показываем уведомление об успешной оплате
    this.showSuccess(`✅ Оплата прошла успешно! Заказ #${result.orderId}`);
    
    console.log('Платеж успешен:', {
      result,
      paymentData
    });
  }

  // Генерация ID заказа
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORDER_${timestamp}_${random}`;
  }

  // Показ уведомлений
  showMessage(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 30000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideInDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutUp 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  // Получение информации о лейбле
  getLabelInfo(labelText) {
    const labelData = {
      'Гарантия': {
        title: 'Гарантия качества',
        description: 'Мы предоставляем гарантию на все цифровые товары. В случае возникновения проблем с работоспособностью продукта, мы бесплатно заменим его или вернем деньги в течение 30 дней с момента покупки.',
        icon: '🛡️',
        iconClass: 'guarantee'
      },
      'Лицензия': {
        title: 'Официальная лицензия',
        description: 'Все продукты поставляются с официальными лицензиями от производителя. Вы получаете полностью легальный и активированный продукт с возможностью получения обновлений и технической поддержки.',
        icon: '📜',
        iconClass: 'license'
      },
      'Нужен VPN': {
        title: 'Требуется VPN',
        description: 'Для активации и использования данного продукта может потребоваться VPN-соединение. Это связано с региональными ограничениями производителя. Рекомендуем использовать надежные VPN-сервисы.',
        icon: '🌐',
        iconClass: 'vpn'
      }
    };

    return labelData[labelText] || {
      title: 'Информация',
      description: 'Дополнительная информация о данном продукте.',
      icon: '💡',
      iconClass: 'guarantee'
    };
  }
}

// Экспортируем класс для использования в других файлах
export default ModalManager; 