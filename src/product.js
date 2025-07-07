import './style.css'
import { getProductById, formatPrice, formatPriceSimple } from './products-data.js'
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'

// Функция для получения параметров URL
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Функция для отображения товара
function renderProduct(product) {
  if (!product) {
    document.querySelector('.product').innerHTML = '<div class="container">Товар не найден</div>';
    return;
  }

  // Обновляем заголовок страницы
  document.title = product.title;

  // Обновляем слайдер изображений
  const swiperWrapper = document.querySelector('.swiper-wrapper');
  swiperWrapper.innerHTML = '';
  product.images.forEach((image, index) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `<img src="${image}" alt="${product.title} ${index + 1}" />`;
    swiperWrapper.appendChild(slide);
  });

  // Обновляем лейблы
  const labelsContainer = document.querySelector('.labels');
  labelsContainer.innerHTML = '';
  product.labels.forEach((label, index) => {
    const labelDiv = document.createElement('div');
    labelDiv.className = `label label-${product.labelColors[index]}`;
    labelDiv.innerHTML = `
      <span>${label}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // Добавляем обработчик клика по плашке
    labelDiv.addEventListener('click', () => {
      openLabelModal(label);
    });
    
    labelsContainer.appendChild(labelDiv);
  });

  // Обновляем основную информацию
  document.querySelector('.title').textContent = product.title;
  document.querySelector('.category').textContent = product.category;
  document.querySelector('.price-value').innerHTML = formatPrice(product.price);
  
  if (product.oldPrice) {
    // Форматируем старую цену так чтобы символ валюты не был перечеркнут
    const priceStr = product.oldPrice.toString();
    let formattedPrice = '';
    
    // Разбиваем число на разряды справа налево
    for (let i = priceStr.length - 1, count = 0; i >= 0; i--, count++) {
      if (count > 0 && count % 3 === 0) {
        formattedPrice = ' ' + formattedPrice;
      }
      formattedPrice = priceStr[i] + formattedPrice;
    }
    
    // Устанавливаем HTML с перечеркнутым числом но неперечеркнутой валютой
    document.querySelector('.price-old').innerHTML = `<span style="text-decoration: line-through;">${formattedPrice}</span> <span style="font-size: 0.8em;">₽</span>`;
    document.querySelector('.price-old').style.display = 'inline';
  } else {
    document.querySelector('.price-old').style.display = 'none';
  }
  
  if (product.discount) {
    document.querySelector('.price-discount').textContent = product.discount;
    document.querySelector('.price-discount').style.display = 'inline';
  } else {
    document.querySelector('.price-discount').style.display = 'none';
  }
  
  // Форматируем цену в USDT с разными размерами шрифтов
  const priceUsdtElement = document.querySelector('.price-usdt');
  const usdtText = product.priceUSDT;
  if (usdtText.includes('USDT')) {
    const parts = usdtText.split(' USDT');
    priceUsdtElement.innerHTML = `${parts[0]} <span class="usdt-currency">USDT</span>`;
  } else {
    priceUsdtElement.textContent = usdtText;
  }

  // Обновляем варианты оформления
  updateVariants(product);
  updatePeriods(product);
  updateEditions(product);

  // Обновляем описание и системные требования
  updateTabs(product);
}

function updateVariants(product) {
  const container = document.querySelector('#variant-group');
  container.innerHTML = '';
  
  product.variants.forEach((variant, index) => {
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'variant';
    input.id = variant.id;
    input.value = variant.id;
    if (index === 0) {
      input.checked = true;
      input.setAttribute('checked', 'checked');
    }

    const label = document.createElement('label');
    label.htmlFor = variant.id;
    label.innerHTML = `<span>${variant.name}</span>`;

    container.appendChild(input);
    container.appendChild(label);
  });
}

function updatePeriods(product) {
  const container = document.querySelector('#period-group');
  container.innerHTML = '';
  container.classList.add('period-buttons');
  
  product.periods.forEach((period, index) => {
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'period';
    input.id = period.id;
    input.value = period.id;
    if (index === 0) input.checked = true;

    const label = document.createElement('label');
    label.htmlFor = period.id;
    
    let labelContent = `<span>${period.name}</span>`;
    if (period.discount) {
      labelContent += `<div class="discount-badge">${period.discount}</div>`;
    }
    label.innerHTML = labelContent;

    container.appendChild(input);
    container.appendChild(label);

    // Обновляем цену при выборе периода
    input.addEventListener('change', () => {
      if (input.checked) {
        document.querySelector('.price-value').innerHTML = formatPrice(period.price);
      }
    });
  });
}

function updateEditions(product) {
  const container = document.querySelector('#edition-group');
  container.innerHTML = '';
  
  product.editions.forEach((edition, index) => {
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'edition';
    input.id = edition.id;
    input.value = edition.id;
    if (index === 0) input.checked = true;

    const label = document.createElement('label');
    label.htmlFor = edition.id;
    label.innerHTML = `
      <div>
        <div>${edition.name}</div>
        <div>${formatPriceSimple(edition.price)}</div>
      </div>
    `;

    container.appendChild(input);
    container.appendChild(label);

    // Обновляем цену при выборе издания
    input.addEventListener('change', () => {
      if (input.checked) {
        document.querySelector('.price-value').innerHTML = formatPrice(edition.price);
      }
    });
  });
}

function updateTabs(product) {
  const tabsContent = document.querySelector('.tabs-content');
  const tabs = document.querySelectorAll('.tab');
  
  // Устанавливаем содержимое по умолчанию (описание)
  tabsContent.innerHTML = product.description;
  
  // Добавляем обработчики для переключения табов
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      // Убираем активный класс у всех табов
      tabs.forEach(t => t.classList.remove('tab-selected'));
      // Добавляем активный класс к текущему табу
      tab.classList.add('tab-selected');
      
      // Плавно обновляем содержимое без "подпрыгивания"
      smoothUpdateTabContent(tabsContent, index === 0 ? product.description : product.systemRequirements);
    });
  });
}

// Функция для плавного обновления контента табов
function smoothUpdateTabContent(container, newContent) {
  // Сохраняем текущую высоту
  const currentHeight = container.offsetHeight;
  container.style.height = currentHeight + 'px';
  container.style.overflow = 'hidden';
  container.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Создаем временный элемент для измерения новой высоты
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.width = container.offsetWidth + 'px';
  tempDiv.style.padding = getComputedStyle(container).padding;
  tempDiv.style.fontSize = getComputedStyle(container).fontSize;
  tempDiv.style.lineHeight = getComputedStyle(container).lineHeight;
  tempDiv.innerHTML = newContent;
  
  // Добавляем в DOM для измерения
  container.parentNode.appendChild(tempDiv);
  const newHeight = tempDiv.offsetHeight;
  container.parentNode.removeChild(tempDiv);
  
  // Запускаем анимацию к новой высоте
  requestAnimationFrame(() => {
    container.style.height = newHeight + 'px';
    
    // После завершения анимации обновляем контент и убираем ограничения
    setTimeout(() => {
      container.innerHTML = newContent;
      container.style.height = '';
      container.style.overflow = '';
      container.style.transition = '';
    }, 300);
  });
}

// Функции для работы с панелью оформления
function initCheckoutPanel() {
  const checkoutToggle = document.getElementById('checkout-toggle');
  const checkoutHeaderText = document.getElementById('checkout-header-text');
  const checkoutContainer = document.getElementById('checkout');
  const checkoutArrow = document.querySelector('.checkout-arrow');
  const variantGroup = document.getElementById('variant-group');
  const periodGroup = document.getElementById('period-group');
  const editionGroup = document.getElementById('edition-group');
  
  let isExpanded = false;
  let selectedVariant = 'Аккаунт'; // Изначально выбранный вариант
  
  // Функция для получения текста выбранного варианта
  function getSelectedVariantText() {
    const checkedInput = variantGroup.querySelector('input[name="variant"]:checked');
    if (checkedInput) {
      const label = variantGroup.querySelector(`label[for="${checkedInput.id}"] span`);
      return label ? label.textContent.trim() : 'Аккаунт';
    }
    return 'Аккаунт';
  }
  
  // Функция для обновления текста заголовка
  function updateHeaderText() {
    if (isExpanded) {
      checkoutHeaderText.textContent = 'Выберите способ оформления';
    } else {
      checkoutHeaderText.textContent = selectedVariant;
    }
  }
  
  // Функция для сворачивания блока
  function collapseCheckout() {
    isExpanded = false;
    
    // Запускаем анимацию закрытия для variant-group
    variantGroup.classList.add('collapsing');
    variantGroup.classList.remove('expanding');
    
    // Одновременно убираем класс expanded, чтобы другие группы начали анимацию перемещения
    checkoutContainer.classList.remove('expanded');
    checkoutArrow.classList.remove('expanded');
    
    // Сразу возвращаем другие группы в активное состояние
    periodGroup.classList.remove('inactive');
    editionGroup.classList.remove('inactive');
    
    // После завершения анимации убираем все классы
    setTimeout(() => {
      variantGroup.classList.remove('expanded', 'collapsing');
    }, 300); // Длительность анимации collapsing
    
    // Обновляем выбранный вариант и текст заголовка
    selectedVariant = getSelectedVariantText();
    updateHeaderText();
  }
  
  // Функция для разворачивания блока
  function expandCheckout() {
    isExpanded = true;
    checkoutContainer.classList.add('expanded');
    checkoutArrow.classList.add('expanded');
    variantGroup.classList.add('expanded');
    
    // Сразу делаем другие группы неактивными и запускаем анимацию появления variant-group
    periodGroup.classList.add('inactive');
    editionGroup.classList.add('inactive');
    
    variantGroup.classList.add('expanding');
    variantGroup.classList.remove('collapsing');
    
    // После анимации убираем классы анимации
    setTimeout(() => {
      variantGroup.classList.remove('expanding');
    }, 400);
    
    // Обновляем текст заголовка
    updateHeaderText();
  }
  
  // Обработчик клика по заголовку - только на текст или стрелочку
  checkoutToggle.addEventListener('click', function(e) {
    // Проверяем, что клик был именно по тексту или стрелочке
    const clickedOnText = e.target.id === 'checkout-header-text' || e.target.closest('#checkout-header-text');
    const clickedOnArrow = e.target.classList.contains('checkout-arrow') || e.target.closest('.checkout-arrow');
    
    if (clickedOnText || clickedOnArrow) {
      if (isExpanded) {
        collapseCheckout();
      } else {
        expandCheckout();
      }
    }
  });
  
  // Добавляем обработчики к вариантам оформления
  function handleVariantSelection() {
    if (isExpanded) {
      selectedVariant = getSelectedVariantText();
      collapseCheckout();
    }
  }
  
  // Используем event delegation для максимальной надежности
  variantGroup.addEventListener('click', function(e) {
    // Проверяем что кликнули по label или input внутри варианта
    const clickedLabel = e.target.closest('label[for^="variant-"]');
    const clickedInput = e.target.closest('input[name="variant"]');
    
    if (clickedLabel || clickedInput) {
      // Находим соответствующий input
      let targetInput;
      if (clickedLabel) {
        const forId = clickedLabel.getAttribute('for');
        targetInput = document.getElementById(forId);
      } else {
        targetInput = clickedInput;
      }
      
      if (targetInput && isExpanded) {
        // Устанавливаем checked
        targetInput.checked = true;
        
        // Обрабатываем выбор
        handleVariantSelection();
      }
    }
  });
  
  // Инициализация: устанавливаем правильный текст при загрузке
  selectedVariant = getSelectedVariantText();
  updateHeaderText();
}

// Инициализация Swiper
function initSwiper() {
  const swiper = new Swiper('.swiper', {
    speed: 400,
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    // Настройки для touch/swipe
    touchRatio: 1,
    touchAngle: 45,
    grabCursor: true,
    // Симуляция нативного touch поведения
    simulateTouch: true,
    allowTouchMove: true,
    touchStartPreventDefault: false,
  });
}

// Функции для работы с модальным окном лейблов
function openLabelModal(labelText) {
  // Убеждаемся, что модальное окно создано
  if (!document.getElementById('label-modal')) {
    createModal();
  }
  
  const modal = document.getElementById('label-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalIcon = document.getElementById('modal-icon');
  
  // Устанавливаем заголовок и описание в зависимости от типа лейбла
  const labelInfo = getLabelInfo(labelText);
  modalTitle.textContent = labelInfo.title;
  modalDescription.textContent = labelInfo.description;
  
  // Устанавливаем иконку и класс
  modalIcon.textContent = labelInfo.icon;
  modalIcon.className = `modal-icon ${labelInfo.iconClass}`;
  
  // Блокируем прокрутку страницы
  document.body.style.overflow = 'hidden';
  
  // Показываем модальное окно с небольшой задержкой для плавности
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

function closeLabelModal() {
  const modal = document.getElementById('label-modal');
  
  // Добавляем класс для анимации закрытия
  modal.classList.add('hide');
  modal.classList.remove('show');
  
  // Восстанавливаем прокрутку страницы после анимации
  setTimeout(() => {
    document.body.style.overflow = '';
    modal.classList.remove('hide');
  }, 300);
}

function getLabelInfo(labelText) {
  const labelInfoMap = {
    'Гарантия': {
      title: 'Гарантия',
      description: 'Мы предоставляем гарантию на все цифровые товары. В случае возникновения проблем с работоспособностью продукта, мы бесплатно заменим его или вернем деньги. Гарантия действует в течение 30 дней с момента покупки.',
      icon: '🛡️',
      iconClass: 'guarantee'
    },
    'Лицензия': {
      title: 'Лицензия',
      description: 'Все продукты поставляются с официальными лицензиями от производителя. Вы получаете полностью легальный и активированный продукт с возможностью получения обновлений и технической поддержки.',
      icon: '📜',
      iconClass: 'license'
    },
    'Нужен VPN': {
      title: 'Требуется VPN',
      description: 'Для активации и использования данного продукта может потребоваться VPN-соединение. Это связано с региональными ограничениями производителя. Мы рекомендуем использовать надежные VPN-сервисы для обеспечения стабильной работы.',
      icon: '🌐',
      iconClass: 'vpn'
    }
  };
  
  return labelInfoMap[labelText] || {
    title: 'Информация',
    description: 'Информация о данном лейбле недоступна.',
    icon: '⚡',
    iconClass: 'guarantee'
  };
}

// Создание модального окна
function createModal() {
  // Проверяем, не создано ли уже модальное окно
  if (document.getElementById('label-modal')) {
    return;
  }
  
  const modalHTML = `
    <div id="label-modal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title-container">
            <div id="modal-icon" class="modal-icon">
              ⚡
            </div>
            <h3 id="modal-title">Информация</h3>
          </div>
        </div>
        <div class="modal-body">
          <p id="modal-description">Загрузка информации...</p>
        </div>
        <div class="modal-footer">
          <button id="modal-understand" class="modal-understand-btn">
            Понятно
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Вставляем модальное окно в начало body
  document.body.insertAdjacentHTML('afterbegin', modalHTML);
  
  // Форсируем позиционирование модального окна
  const modal = document.getElementById('label-modal');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.zIndex = '10000';
}

// Инициализация модального окна
function initLabelModal() {
  // Создаем модальное окно динамически
  createModal();
  
  const modal = document.getElementById('label-modal');
  const understandBtn = document.getElementById('modal-understand');
  
  // Обработчик для кнопки "Понятно"
  understandBtn.addEventListener('click', closeLabelModal);
  
  // Обработчик для клика по фону модального окна
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLabelModal();
    }
  });
  
  // Обработчик для клавиши Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeLabelModal();
    }
  });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const productId = getUrlParameter('product');
  const product = getProductById(productId);
  renderProduct(product);
  
  // Инициализируем компоненты после отрисовки продукта
  if (product) {
    // Небольшая задержка чтобы DOM успел обновиться
    setTimeout(() => {
      initSwiper();
      initCheckoutPanel();
      initLabelModal(); // Добавляем инициализацию модального окна
    }, 100);
  }
  
  // Если продукт не найден, перенаправляем на главную
  if (!product) {
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
});