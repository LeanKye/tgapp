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
  
  // Обновляем заголовок в хедере
  if (window.navigationManager) {
    window.navigationManager.setProductTitle(product.title);
  }

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
    labelDiv.dataset.labelType = label.toLowerCase().replace(/\s+/g, '-');
    labelDiv.innerHTML = `
      <span>${label}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // Добавляем обработчик клика для открытия модального окна
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
  
  // Настраиваем главную кнопку Telegram для покупки
  if (window.navigationManager) {
    window.navigationManager.updateMainButton('Купить', () => {
      // Здесь можно добавить логику покупки
      console.log('Покупка товара:', product.title);
    });
  }
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
      
      // Обновляем содержимое
      if (index === 0) {
        tabsContent.innerHTML = product.description;
      } else if (index === 1) {
        tabsContent.innerHTML = product.systemRequirements;
      }
    });
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

// Данные для модальных окон плашек
const labelModalData = {
  'гарантия': {
    title: 'Гарантия',
    description: 'Мы предоставляем гарантию на приобретенный товар согласно условиям.',
    features: [
      'Гарантия распространяется на все функции товара',
      'Бесплатная замена в случае технических проблем',
      'Поддержка 24/7 в течение гарантийного периода',
      'Возврат средств при невозможности решения проблемы'
    ],
    warning: {
      title: 'Важно знать',
      text: 'Гарантия не распространяется на проблемы, возникшие в результате нарушения правил использования или блокировки аккаунта по вине пользователя.'
    }
  },
  'лицензия': {
    title: 'Лицензия',
    description: 'Все наши товары имеют официальную лицензию и полностью законны.',
    features: [
      'Официальная лицензия от правообладателя',
      'Полное соответствие лицензионным требованиям',
      'Безопасное использование без риска блокировки',
      'Все обновления и DLC включены в лицензию'
    ],
    warning: {
      title: 'Преимущества лицензии',
      text: 'Лицензионный товар гарантирует стабильную работу, безопасность и доступ ко всем функциям без ограничений.'
    }
  },
  'нужен-vpn': {
    title: 'Нужен VPN',
    description: 'Для использования данного товара требуется VPN-подключение.',
    features: [
      'VPN необходим для активации и использования',
      'Рекомендуем использовать надежные VPN-сервисы',
      'Подключение через любую страну, кроме запрещенных',
      'Инструкция по настройке VPN предоставляется'
    ],
    warning: {
      title: 'Обратите внимание',
      text: 'VPN-сервис не входит в стоимость товара. Вам необходимо самостоятельно обеспечить VPN-подключение для корректной работы.'
    }
  }
};

// Функция для открытия модального окна плашки
function openLabelModal(labelText) {
  const modal = document.getElementById('label-modal');
  const modalTitle = document.getElementById('label-modal-title');
  const modalBody = document.getElementById('label-modal-body');
  
  const labelKey = labelText.toLowerCase().replace(/\s+/g, '-');
  const modalData = labelModalData[labelKey];
  
  if (!modalData) {
    console.warn('Данные для плашки не найдены:', labelText);
    return;
  }
  
  // Устанавливаем заголовок
  modalTitle.textContent = modalData.title;
  
  // Формируем контент
  let featuresHtml = '';
  if (modalData.features && modalData.features.length > 0) {
    featuresHtml = `
      <ul class="label-modal-features">
        ${modalData.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
    `;
  }
  
  let warningHtml = '';
  if (modalData.warning) {
    warningHtml = `
      <div class="label-modal-warning">
        <div class="label-modal-warning-title">${modalData.warning.title}</div>
        <div class="label-modal-warning-text">${modalData.warning.text}</div>
      </div>
    `;
  }
  
  modalBody.innerHTML = `
    <div class="label-modal-description">${modalData.description}</div>
    ${featuresHtml}
    ${warningHtml}
  `;
  
  // Показываем модальное окно
  modal.classList.add('show');
  
  // Блокируем скролл страницы
  document.body.style.overflow = 'hidden';
}

// Функция для закрытия модального окна плашки
function closeLabelModal() {
  const modal = document.getElementById('label-modal');
  modal.classList.remove('show');
  
  // Разблокируем скролл страницы
  document.body.style.overflow = '';
}

// Инициализация модального окна плашек
function initLabelModal() {
  const modal = document.getElementById('label-modal');
  const closeButton = document.getElementById('label-modal-close');
  
  // Закрытие по клику на кнопку
  closeButton.addEventListener('click', closeLabelModal);
  
  // Закрытие по клику на фон
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLabelModal();
    }
  });
  
  // Закрытие по клавише Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeLabelModal();
    }
  });
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
      initLabelModal();
    }, 100);
  }
  
  // Если продукт не найден, перенаправляем на главную
  if (!product) {
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
});