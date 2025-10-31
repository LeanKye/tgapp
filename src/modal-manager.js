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
    this.isScrollLocked = false;
    this.scrollY = 0;
    
    this.init();
  }

  // Фиксация скролла страницы с сохранением позиции
  lockScroll() {
    if (this.isScrollLocked) return;
    this.scrollY = window.scrollY || window.pageYOffset || 0;
    document.body.classList.add('modal-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    this.isScrollLocked = true;
  }

  // Снятие фиксации и восстановление позиции скролла
  unlockScroll() {
    if (!this.isScrollLocked) return;
    const scrollY = Math.abs(parseInt(document.body.style.top || '0', 10)) || 0;
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    this.isScrollLocked = false;
    window.scrollTo(0, scrollY);
  }

  init() {
    // Создаем базовые модальные окна
    this.createLabelModal();
    this.createCheckoutModal();
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

  // Создание модального окна оформления
  createCheckoutModal() {
    if (document.getElementById('checkout-modal')) return;

    const modalHTML = `
      <div id="checkout-modal" class="checkout-modal-overlay">
        <div class="checkout-modal">
          <div class="checkout-modal-header">
            <h3>Оформление заказа</h3>
            <button class="checkout-modal-close" aria-label="Закрыть">&times;</button>
          </div>
          <div class="checkout-modal-body">
            <div class="payment-details">
              <div class="payment-item">
                <span>Название:</span>
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
            <div class="checkout-button-container">
              <button class="checkout-button" id="checkout-proceed-btn">Перейти к оплате</button>
            </div>
            <div class="payment-agreement-text">
              Нажимая «Перейти к оплате», я принимаю условия <a href="info.html#offer">оферты</a> и даю согласие на обработку данных в соответствии с <a href="info.html#privacy">Политикой конфиденциальности</a>.
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.setupModalEvents('checkout-modal');
  }

  // Настройка событий для модального окна
  setupModalEvents(modalId) {
    const modal = document.getElementById(modalId);
    const content = modal.querySelector('.modal-content, .checkout-modal');
    
    if (!modal || !content) {
      return;
    }

    // Проверяем, не подключены ли уже обработчики
    if (modal.dataset.eventsSetup === 'true') {
      return;
    }

    // Обработчики для закрытия
    this.setupCloseEvents(modal, modalId);
    
    // Настройка drag событий для модальных окон
    if (modalId === 'label-modal' || modalId === 'checkout-modal') {
      this.setupDragEvents(modal, content);
    }
    
    // Дополнительные обработчики для модального окна оформления
    if (modalId === 'checkout-modal') {
      this.setupCheckoutEvents(modal);
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
    let startedInsideScrollable = false;
    const baseAlpha = 0.5; // базовое затемнение оверлея

    // Touch события для мобильных устройств
    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      // Не инициируем drag, если жест начинается на интерактивных элементах футера (кнопка "Понятно" и т.п.)
      const noDragTarget = e.target.closest('.modal-footer, #modal-close, .checkout-button-container');
      if (noDragTarget) {
        return;
      }
      
      isDragging = true;
      startY = e.touches[0].clientY;
      currentY = startY;
      startTime = Date.now();
      lastY = startY;
      lastTime = startTime;
      startedInsideScrollable = false;
      
      content.style.transition = 'none';
      modal.style.transition = 'none';
      modal.style.opacity = '1';
      modal.classList.add('dragging');

      // Если при старте жеста целевой элемент прокручиваемый и он не на самом верху, не инициируем drag модалки
      const target = e.target.closest('.modal-content, .checkout-modal');
      if (target) {
        const scrollable = e.target.closest('.modal-body, .checkout-modal-body, .modal-content, .checkout-modal');
        if (scrollable && scrollable.scrollHeight > scrollable.clientHeight && scrollable.scrollTop > 0) {
          startedInsideScrollable = true;
        }
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      if (startedInsideScrollable) return; // Даём прокручиваться контенту внутри
      
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      // Ограничиваем движение только вниз
      if (deltaY > 0) {
        const translateY = Math.min(deltaY, window.innerHeight * 0.5);
        content.style.setProperty('transform', `translateY(${translateY}px)`, 'important');
        // Чем ниже модалка, тем прозрачнее фон
        const contentHeight = content.offsetHeight || Math.min(window.innerHeight * 0.7, window.innerHeight);
        const progressDown = Math.min(1, translateY / contentHeight);
        const overlayAlpha = baseAlpha * (1 - progressDown);
        modal.style.background = `rgba(0, 0, 0, ${overlayAlpha})`;
        
        // Убираем эффект изменения прозрачности при перетягивании
        
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
      
      if (startedInsideScrollable) {
        // Не было drag модалки — просто ничего не делаем
        startedInsideScrollable = false;
        modal.classList.remove('dragging');
        return;
      }

      // Определяем, нужно ли закрыть модальное окно
      const shouldClose = deltaY > screenHeight * this.closeThreshold || 
                         (velocity > this.velocityThreshold && deltaY > 50);
      
      if (shouldClose) {
        this.closeDragModal(modal, content, deltaY);
      } else {
        // Возвращаем модальное окно в исходное положение с JavaScript анимацией
        modal.classList.remove('dragging');
        this.animateModalReturn(modal, content, deltaY);
      }
    };

    // Mouse события для десктопа
    const handleMouseDown = (e) => {
      if (e.button !== 0) return; // Только левая кнопка мыши
      // Блокируем старт drag при нажатии на кнопки/элементы футера
      const noDragTarget = e.target.closest('.modal-footer, #modal-close, .checkout-button-container');
      if (noDragTarget) {
        return;
      }
      
      isDragging = true;
      startY = e.clientY;
      currentY = startY;
      startTime = Date.now();
      lastY = startY;
      lastTime = startTime;
      startedInsideScrollable = false;
      
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
        content.style.setProperty('transform', `translateY(${translateY}px)`, 'important');
        // Обновляем затемнение для desktop drag
        const contentHeight = content.offsetHeight || Math.min(window.innerHeight * 0.7, window.innerHeight);
        const progressDown = Math.min(1, translateY / contentHeight);
        const overlayAlpha = baseAlpha * (1 - progressDown);
        modal.style.background = `rgba(0, 0, 0, ${overlayAlpha})`;
        
        // Убираем эффект изменения прозрачности при перетягивании
        
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
        this.closeDragModal(modal, content, deltaY);
      } else {
        // Возвращаем модальное окно в исходное положение с JavaScript анимацией
        modal.classList.remove('dragging');
        this.animateModalReturn(modal, content, deltaY);
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
    // Закрытие по клику на фон (игнорируем первый синтетический click сразу после открытия)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        if (modal.dataset.justOpened) return;
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

  // Дополнительные обработчики для модального окна оформления
  setupCheckoutEvents(modal) {
    // Закрытие по клику на крестик
    const closeBtn = modal.querySelector('.checkout-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal('checkout-modal');
      });
    }

    // Обработчик кнопки "Перейти к оформлению"
    const checkoutBtn = modal.querySelector('#checkout-proceed-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.handleCheckoutProceed();
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

    // Заполняем данные для checkout-modal
    if (modalId === 'checkout-modal' && data.paymentData) {
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
      
      // Сохраняем данные для дальнейшего использования
      this.currentPaymentData = data.paymentData;
    }

    // Блокируем прокрутку страницы с сохранением позиции
    this.lockScroll();

    // Убеждаемся, что обработчики событий подключены
    this.setupModalEvents(modalId);

    // Игнорируем один следующий click после открытия (синтетический после pointerup)
    try {
      modal.dataset.justOpened = '1';
      setTimeout(() => { try { delete modal.dataset.justOpened; } catch {} }, 250);
    } catch {}

    // Показываем модальное окно с анимацией
    if (modalId === 'checkout-modal') {
      this.animateCheckoutModalOpen(modal);
    } else if (modalId === 'label-modal') {
      this.animateLabelModalOpen(modal);
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

    // Для всех модальных окон используем JavaScript анимации
    if (modalId === 'checkout-modal') {
      this.animateCheckoutModalClose(modal);
    } else if (modalId === 'label-modal') {
      this.animateLabelModalClose(modal);
    }
  }

  // JavaScript анимация открытия модального окна лейблов
  animateLabelModalOpen(modal) {
    const content = modal.querySelector('.modal-content');
    if (!content) return;

    // Показываем оверлей и подготавливаем контент
    modal.classList.add('show');
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    const baseAlpha = 0.5;
    // Устанавливаем фон сразу на 0, чтобы не было задержки показа затемнения
    modal.style.background = 'rgba(0,0,0,0)';
    
    // Устанавливаем начальное состояние
    content.style.transform = 'translateY(100%)';
    content.style.transition = 'none';
    
    // Запускаем анимацию
    const duration = 300;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // Анимируем transform
      const translateY = (1 - easeProgress) * 100;
      content.style.transform = `translateY(${translateY}%)`;
      // Плавно увеличиваем затемнение без задержки
      modal.style.background = `rgba(0, 0, 0, ${baseAlpha * easeProgress})`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Анимация завершена
        content.style.transform = 'translateY(0)';
        content.style.transition = '';
        modal.style.background = `rgba(0, 0, 0, ${baseAlpha})`;
      }
    };
    
    requestAnimationFrame(animate);
  }

  // JavaScript анимация закрытия модального окна лейблов - только transform, "уезжает вниз"
  animateLabelModalClose(modal) {
    const content = modal.querySelector('.modal-content');
    if (!content) return;

    // Проверяем, не закрывается ли уже модальное окно
    if (modal.classList.contains('closing')) {
      return;
    }

    // Помечаем как закрывающееся
    modal.classList.add('closing');
    modal.classList.remove('dragging');
    
    // Разблокируем скролл после завершения анимации
    
    // Запускаем анимацию закрытия
    const duration = 300;
    const startTime = Date.now();
    const baseAlpha = 0.5;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease in cubic)
      const easeProgress = Math.pow(progress, 3);
      
      // Анимируем только transform - "уезжает вниз"
      const translateY = easeProgress * 100;
      content.style.transform = `translateY(${translateY}%)`;
      modal.style.background = `rgba(0, 0, 0, ${baseAlpha * (1 - easeProgress)})`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Анимация завершена - полностью скрываем модальное окно
        modal.classList.remove('show');
        modal.classList.remove('closing');
        modal.style.opacity = '';
        modal.style.visibility = '';
        content.style.transform = '';
        content.style.transition = '';
        modal.style.background = '';
        
        this.activeModal = null;
        this.unlockScroll();
      }
    };
    
    requestAnimationFrame(animate);
  }

  // JavaScript анимация открытия модального окна оформления заказа - КОПИЯ анимации лейблов
  animateCheckoutModalOpen(modal) {
    const content = modal.querySelector('.checkout-modal');
    if (!content) return;

    // Показываем оверлей и подготавливаем контент
    modal.classList.add('show');
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    const baseAlpha = 0.5;
    // Устанавливаем фон сразу на 0, чтобы не было задержки показа затемнения
    modal.style.background = 'rgba(0,0,0,0)';
    
    // Устанавливаем начальное состояние
    content.style.transform = 'translateY(100%)';
    content.style.transition = 'none';
    
    // Запускаем анимацию
    const duration = 300;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // Анимируем transform
      const translateY = (1 - easeProgress) * 100;
      content.style.transform = `translateY(${translateY}%)`;
      // Плавно увеличиваем затемнение без задержки
      modal.style.background = `rgba(0, 0, 0, ${baseAlpha * easeProgress})`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Анимация завершена
        content.style.transform = 'translateY(0)';
        content.style.transition = '';
        modal.style.background = `rgba(0, 0, 0, ${baseAlpha})`;
      }
    };
    
    requestAnimationFrame(animate);
  }

  // JavaScript анимация закрытия модального окна оформления заказа - КОПИЯ анимации лейблов
  animateCheckoutModalClose(modal) {
    const content = modal.querySelector('.checkout-modal');
    if (!content) return;

    // Проверяем, не закрывается ли уже модальное окно
    if (modal.classList.contains('closing')) {
      return;
    }

    // Помечаем как закрывающееся
    modal.classList.add('closing');
    modal.classList.remove('dragging');
    
    // Разблокируем скролл после завершения анимации
    
    // Запускаем анимацию закрытия
    const duration = 300;
    const startTime = Date.now();
    const baseAlpha = 0.5;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease in cubic)
      const easeProgress = Math.pow(progress, 3);
      
      // Анимируем только transform - "уезжает вниз"
      const translateY = easeProgress * 100;
      content.style.transform = `translateY(${translateY}%)`;
      modal.style.background = `rgba(0, 0, 0, ${baseAlpha * (1 - easeProgress)})`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Анимация завершена - полностью скрываем модальное окно
        modal.classList.remove('show');
        modal.classList.remove('closing');
        modal.style.opacity = '';
        modal.style.visibility = '';
        content.style.transform = '';
        content.style.transition = '';
        modal.style.background = '';
        
        // Очищаем данные для checkout-modal
        if (modal.id === 'checkout-modal') {
          this.currentPaymentData = null;
        }
        
        this.activeModal = null;
        this.unlockScroll();
      }
    };
    
    requestAnimationFrame(animate);
  }

  // Анимация возврата модального окна в исходное положение
  animateModalReturn(modal, content, currentDeltaY) {
    // Возвращаем на ту же длительность/кривую, как и открытие/закрытие
    const contentHeight = content.offsetHeight || Math.min(window.innerHeight * 0.7, window.innerHeight);
    const startPercent = Math.max(0, Math.min(100, (currentDeltaY / contentHeight) * 100));
    const duration = 300;
    const startTime = Date.now();
    const baseAlpha = 0.5;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentPercent = startPercent + (0 - startPercent) * easeProgress;
      content.style.setProperty('transform', `translateY(${currentPercent}%)`, 'important');
      // Увеличиваем затемнение обратно при возврате вверх
      const overlayAlpha = baseAlpha * (1 - currentPercent / 100);
      modal.style.background = `rgba(0, 0, 0, ${overlayAlpha})`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Анимация завершена - возвращаем в нормальное состояние
        content.style.transform = 'translateY(0)';
        content.style.transition = '';
        modal.style.background = `rgba(0, 0, 0, ${baseAlpha})`;
      }
    };

    requestAnimationFrame(animate);
  }

  // Закрытие модального окна через drag (перетаскивание) - единообразно для всех модальных окон
  closeDragModal(modal, content, currentDeltaY) {
    // Проверяем, не закрывается ли уже модальное окно
    if (modal.classList.contains('closing')) {
      return;
    }

    // Помечаем модальное окно как закрывающееся и убираем состояние перетаскивания
    modal.classList.add('closing');
    modal.classList.remove('dragging');

    // Разблокируем скролл после завершения анимации
    
    // Плавно анимируем закрытие из текущей позиции, используя проценты как в обычной анимации закрытия
    const contentHeight = content.offsetHeight || Math.min(window.innerHeight * 0.7, window.innerHeight);
    const startPercent = Math.max(0, Math.min(100, (currentDeltaY / contentHeight) * 100));
    // Длительность пропорциональна оставшемуся пути, чтобы оверлей не зависал
    const remaining = 100 - startPercent;
    const duration = Math.max(120, Math.round(300 * (remaining / 100))); // от 120мс до 300мс
    const startTime = Date.now();
    const baseAlpha = 0.5;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentPercent = startPercent + (100 - startPercent) * easeProgress;
      
      // Анимируем transform в процентах, как в обычном закрытии
      content.style.setProperty('transform', `translateY(${currentPercent}%)`, 'important');
      // Параллельно гасим затемнение оверлея до нуля
      const overlayAlpha = baseAlpha * (1 - currentPercent / 100);
      modal.style.background = `rgba(0, 0, 0, ${overlayAlpha})`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Анимация завершена - окончательно скрываем модальное окно
        modal.classList.remove('show');
        modal.classList.remove('closing');
        modal.style.opacity = '';
        modal.style.visibility = '';
        modal.style.background = '';
        content.style.transform = '';
        content.style.transition = '';
        
        // Очищаем данные модального окна оформления если нужно
        if (modal.id === 'checkout-modal') {
          this.currentPaymentData = null;
        }
        
        this.activeModal = null;
        this.unlockScroll();
      }
    };

    requestAnimationFrame(animate);
  }

  // Обработка нажатия кнопки "Перейти к оформлению"
  handleCheckoutProceed() {
    if (!this.currentPaymentData) {
      this.showError('Ошибка: данные заказа не найдены');
      return;
    }

    // Закрываем модальное окно
    this.closeModal('checkout-modal');

    // Генерируем ID заказа
    const orderId = this.generateOrderId();
    
    // Создаем описание заказа
    const description = `${this.currentPaymentData.productTitle} - ${this.currentPaymentData.variant}, ${this.currentPaymentData.period}, ${this.currentPaymentData.edition}`;
    
    // Показываем уведомление о переходе к оформлению
    this.showSuccess(`✅ Переход к оформлению заказа #${orderId}`);
    
    // Здесь можно добавить логику для:
    // - Перенаправления на страницу оформления
    // - Отправки данных в Telegram Bot API  
    // - Сохранения заказа в базе данных
    
    console.log('Переход к оформлению заказа:', {
      orderId,
      description,
      paymentData: this.currentPaymentData
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