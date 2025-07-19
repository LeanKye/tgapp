// Модуль для интеграции с Robokassa
// Конфигурация для тестового режима
const ROBOKASSA_CONFIG = {
  // Тестовые данные Robokassa
  merchantLogin: 'test_merchant', // Замените на ваш логин
  password1: 'test_password1', // Пароль #1 для формирования подписи
  password2: 'test_password2', // Пароль #2 для проверки уведомления
  isTest: true, // Тестовый режим
  baseUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx'
};

// Класс для работы с Robokassa
class RobokassaPayment {
  constructor(config = ROBOKASSA_CONFIG) {
    this.config = config;
    this.currentPayment = null;
  }

  // Создание платежа
  createPayment(orderData) {
    const {
      orderId,
      amount,
      description,
      email = '',
      culture = 'ru',
      encoding = 'utf-8'
    } = orderData;

    // Формируем подпись
    const signatureValue = this.generateSignature(orderId, amount, description);
    
    // Создаем форму для отправки
    const formData = {
      MerchantLogin: this.config.merchantLogin,
      OutSum: amount,
      Description: description,
      InvId: orderId,
      Email: email,
      Culture: culture,
      Encoding: encoding,
      SignatureValue: signatureValue,
      IsTest: this.config.isTest ? 1 : 0
    };

    this.currentPayment = {
      formData,
      orderData,
      signatureValue
    };

    return this.currentPayment;
  }

  // Генерация подписи для платежа
  generateSignature(orderId, amount, description) {
    const signatureString = `${this.config.merchantLogin}:${amount}:${orderId}:${this.config.password1}`;
    
    // В реальном проекте используйте crypto-js или другую библиотеку для MD5
    // Здесь используем простую реализацию для демонстрации
    return this.simpleMD5(signatureString);
  }

  // Простая реализация MD5 (для демонстрации)
  // В продакшене используйте crypto-js или другую библиотеку
  simpleMD5(str) {
    // Это заглушка - в реальном проекте используйте настоящий MD5
    return btoa(str).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  // Открытие платежной формы в модальном окне
  openPaymentModal(paymentData) {
    return new Promise((resolve, reject) => {
      console.log('Открытие модального окна оплаты');
      
      // Создаем модальное окно для оплаты
      const modal = this.createPaymentModal(paymentData);
      
      // Добавляем обработчики событий
      const handleSuccess = (event) => {
        console.log('Платеж успешен:', event.detail);
        this.closePaymentModal();
        resolve(event.detail);
        // Удаляем обработчики
        modal.element.removeEventListener('paymentSuccess', handleSuccess);
        modal.element.removeEventListener('paymentCancel', handleCancel);
      };
      
      const handleCancel = () => {
        console.log('Платеж отменен');
        this.closePaymentModal();
        reject(new Error('Payment cancelled'));
        // Удаляем обработчики
        modal.element.removeEventListener('paymentSuccess', handleSuccess);
        modal.element.removeEventListener('paymentCancel', handleCancel);
      };
      
      // Привязываем обработчики событий
      modal.element.addEventListener('paymentSuccess', handleSuccess);
      modal.element.addEventListener('paymentCancel', handleCancel);
      
      console.log('Обработчики событий установлены');
      
      // Показываем модальное окно
      document.body.appendChild(modal.element);
      setTimeout(() => modal.element.classList.add('show'), 10);
    });
  }

  // Создание модального окна для оплаты
  createPaymentModal(paymentData) {
    const modalElement = document.createElement('div');
    modalElement.className = 'robokassa-modal-overlay';
    modalElement.innerHTML = `
      <div class="robokassa-modal">
        <div class="robokassa-modal-header">
          <h3>Оплата заказа</h3>
          <button class="robokassa-modal-close">&times;</button>
        </div>
        <div class="robokassa-modal-body">
          <div class="payment-info">
            <div class="payment-item">
              <span>Товар:</span>
              <span>${paymentData.orderData.description}</span>
            </div>
            <div class="payment-item">
              <span>Сумма:</span>
              <span>${paymentData.orderData.amount} ₽</span>
            </div>
            <div class="payment-item">
              <span>Номер заказа:</span>
              <span>${paymentData.orderData.orderId}</span>
            </div>
          </div>
          <div class="payment-methods">
            <h4>Выберите способ оплаты:</h4>
            <div class="payment-method" data-method="card">
              <div class="method-icon">💳</div>
              <div class="method-info">
                <div class="method-name">Банковская карта</div>
                <div class="method-description">Visa, MasterCard, МИР</div>
              </div>
            </div>
            <div class="payment-method" data-method="sbp">
              <div class="method-icon">📱</div>
              <div class="method-info">
                <div class="method-name">СБП</div>
                <div class="method-description">Система быстрых платежей</div>
              </div>
            </div>
            <div class="payment-method" data-method="wallet">
              <div class="method-icon">👛</div>
              <div class="method-info">
                <div class="method-name">Электронные кошельки</div>
                <div class="method-description">ЮMoney, QIWI, WebMoney</div>
              </div>
            </div>
          </div>
        </div>
        <div class="robokassa-modal-footer">
          <button class="robokassa-btn robokassa-btn-secondary" data-action="cancel">Отмена</button>
          <button class="robokassa-btn robokassa-btn-primary" data-action="pay" disabled>Оплатить</button>
        </div>
      </div>
    `;

    // Обработчики событий
    const closeBtn = modalElement.querySelector('.robokassa-modal-close');
    const cancelBtn = modalElement.querySelector('[data-action="cancel"]');
    const payBtn = modalElement.querySelector('[data-action="pay"]');
    const paymentMethods = modalElement.querySelectorAll('.payment-method');

    let selectedMethod = null;

    // Выбор способа оплаты
    paymentMethods.forEach(method => {
      method.addEventListener('click', () => {
        paymentMethods.forEach(m => m.classList.remove('selected'));
        method.classList.add('selected');
        selectedMethod = method.dataset.method;
        payBtn.disabled = false;
      });
    });

    // Кнопка оплаты
    payBtn.addEventListener('click', () => {
      if (!selectedMethod) return;
      
      console.log('Нажата кнопка оплаты, метод:', selectedMethod);
      
      // Показываем индикатор загрузки
      payBtn.disabled = true;
      payBtn.textContent = 'Обработка...';
      
      // Имитируем процесс оплаты
      setTimeout(() => {
        console.log('Начинаем обработку платежа...');
        
        // Создаем результат напрямую
        const result = {
          success: true,
          orderId: paymentData.orderData.orderId,
          amount: paymentData.orderData.amount,
          method: selectedMethod,
          transactionId: 'TEST_' + Date.now(),
          timestamp: new Date().toISOString()
        };
        
        console.log('Платеж обработан, результат:', result);
        
        // Вызываем onSuccess через событие
        const successEvent = new CustomEvent('paymentSuccess', { detail: result });
        modalElement.dispatchEvent(successEvent);
      }, 2000);
    });

    // Кнопка отмены
    const handleCancel = () => {
      console.log('Отмена платежа');
      // Вызываем onCancel через событие
      const cancelEvent = new CustomEvent('paymentCancel');
      modalElement.dispatchEvent(cancelEvent);
    };

    // Привязываем обработчики событий
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Клик по крестику');
        handleCancel();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Клик по кнопке Отмена');
        handleCancel();
      });
    }

    // Закрытие по клику на фон
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) {
        console.log('Клик по фону');
        handleCancel();
      }
    });

    // Закрытие по клавише Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        console.log('Нажата клавиша Escape');
        handleCancel();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    return {
      element: modalElement
    };
  }

  // Обработка платежа
  async processPayment(paymentData, method) {
    // В реальном проекте здесь будет отправка данных на ваш сервер
    // который затем перенаправит пользователя на Robokassa
    
    // Для демонстрации имитируем успешную оплату
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          console.log('Обработка платежа:', { paymentData, method });
          resolve({
            success: true,
            orderId: paymentData.orderData.orderId,
            amount: paymentData.orderData.amount,
            method: method,
            transactionId: 'TEST_' + Date.now(),
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Ошибка обработки платежа:', error);
          reject(error);
        }
      }, 1000);
    });
  }

  // Закрытие модального окна
  closePaymentModal() {
    const modal = document.querySelector('.robokassa-modal-overlay');
    if (modal) {
      console.log('Закрытие модального окна');
      modal.classList.remove('show');
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
          console.log('Модальное окно удалено из DOM');
        }
      }, 300);
    } else {
      console.log('Модальное окно не найдено для закрытия');
    }
  }

  // Проверка подписи уведомления (для серверной части)
  verifySignature(orderId, amount, signature) {
    const expectedSignature = this.generateSignature(orderId, amount, '');
    return signature.toLowerCase() === expectedSignature.toLowerCase();
  }
}

// Экспорт класса
export default RobokassaPayment;

// Создаем глобальный экземпляр
export const robokassa = new RobokassaPayment(); 