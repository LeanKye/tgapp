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
    labelsContainer.appendChild(labelDiv);
  });

  // Обновляем основную информацию
  document.querySelector('.title').textContent = product.title;
  document.querySelector('.category').textContent = product.category;
  document.querySelector('.price-value').innerHTML = formatPrice(product.price);
  
  if (product.oldPrice) {
    document.querySelector('.price-old').innerHTML = formatPrice(product.oldPrice);
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
    
    // После анимации убираем все классы и возвращаем другие группы в активное состояние
    setTimeout(() => {
      checkoutContainer.classList.remove('expanded');
      checkoutArrow.classList.remove('expanded');
      variantGroup.classList.remove('expanded', 'collapsing');
      
      // Возвращаем другие группы в активное состояние только после завершения анимации
      periodGroup.classList.remove('inactive');
      editionGroup.classList.remove('inactive');
    }, 150);
    
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
  
  // Обработчик клика по заголовку
  checkoutToggle.addEventListener('click', function() {
    if (isExpanded) {
      collapseCheckout();
    } else {
      expandCheckout();
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
    }, 100);
  }
  
  // Если продукт не найден, перенаправляем на главную
  if (!product) {
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
});