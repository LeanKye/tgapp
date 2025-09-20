import './style.css'
import { getProductById, formatPrice, formatPriceSimple, formatPriceCard } from './products-data.js'
import ModalManager from './modal-manager.js'
 
// Универсальная навигация: используем стек AppNav при наличии
function navigate(path) {
  if (window.AppNav && typeof window.AppNav.go === 'function') {
    return window.AppNav.go(path);
  }
  const basePath = window.location.pathname.replace(/[^/]*$/, '');
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  window.location.href = basePath + normalized;
}



// Функция для получения параметров URL
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Функция для отображения товара
function renderProduct(product) {
  if (!product) {
    document.querySelector('.product').innerHTML = '<div class="container">Не найдено</div>';
    return;
  }

  // Обновляем заголовок страницы
  document.title = product.title;

  // Обновляем слайдер изображений
  const swiperWrapper = document.querySelector('.swiper-wrapper');
  const slider = document.querySelector('.swiper');
  swiperWrapper.innerHTML = '';
  
  // Удаляем старые индикаторы если они есть
  const oldIndicators = document.querySelector('.slider-indicators');
  if (oldIndicators) {
    oldIndicators.remove();
  }
  
  // Сбрасываем инициализацию слайдера
  if (slider) {
    slider.classList.remove('slider-initialized');
  }
  
  product.images.forEach((image, index) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `<img src="${image}" alt="${product.title} ${index + 1}" />`;
    swiperWrapper.appendChild(slide);
  });


  // Инициализируем слайдер сразу после создания слайдов
  setTimeout(() => {
    initImageSlider();
  }, 10);

  // Обновляем лейблы (удаляем запрещенные: "Гарантия", "Лицензия")
  const labelsContainer = document.querySelector('.labels');
  labelsContainer.innerHTML = '';
  const labelPairs = (product.labels || []).map((lbl, i) => ({
    label: lbl,
    color: (product.labelColors || [])[i]
  })).filter(pair => !['Гарантия', 'Лицензия'].includes(pair.label));
  labelPairs.forEach(({ label, color }) => {
    const labelDiv = document.createElement('div');
    labelDiv.className = `label label-${color}`;
    labelDiv.innerHTML = `
      <span>${label}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
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
    // Используем функцию formatPriceCard для единообразного форматирования
    document.querySelector('.price-old').innerHTML = formatPriceCard(product.oldPrice, '₽', true);
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
  
  // Форматируем цену в USDT с разными размерами шрифтов или обрабатываем цену для юрлиц
  const priceUsdtElement = document.querySelector('.price-usdt');
  const usdtText = product.priceUSDT;
  
  if (usdtText === 'для юрлиц') {
    // Вычисляем цену для юрлиц (на 3% дешевле основной цены)
    const corporatePrice = Math.round(product.price * 0.97); // Скидка 3%
    priceUsdtElement.innerHTML = `для юрлиц <span class="corporate-price">${formatPrice(corporatePrice)}</span>`;
  } else if (usdtText.includes('USDT')) {
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
  
  // Рендерим нижнюю кнопку / контролы корзины
  renderBuyOrControls(product);

  // Убеждаемся, что полосочка правильно позиционируется после полной загрузки
  setTimeout(() => {
    const tabsContainer = document.querySelector('.tabs');
    if (tabsContainer) {
      const activeIndex = parseInt(tabsContainer.getAttribute('data-active') || '0');
      const updateTabIndicator = (activeIndex) => {
        const activeTab = document.querySelectorAll('.tab')[activeIndex];
        if (!activeTab || !tabsContainer) return;
        
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = tabsContainer.getBoundingClientRect();
        
        const left = tabRect.left - containerRect.left;
        const width = tabRect.width;
        
        tabsContainer.style.setProperty('--tab-indicator-left', `${left}px`);
        tabsContainer.style.setProperty('--tab-indicator-width', `${width}px`);
      };
      updateTabIndicator(activeIndex);
    }
    
    // Инициализируем скролл для уже выбранных кнопок
    const scrollableContainers = [
      document.querySelector('#variant-group'),
      document.querySelector('#period-group'),
      document.querySelector('#edition-group')
    ];
    
    scrollableContainers.forEach(container => {
      if (container) {
        const checkedInput = container.querySelector('input:checked');
        if (checkedInput) {
          const label = container.querySelector(`label[for="${checkedInput.id}"]`);
          if (label) {
            scrollToSelectedButton(container, label);
          }
        }
      }
    });
  }, 100);
}

// Функция для автоматического скролла к выбранной кнопке
function scrollToSelectedButton(container, selectedElement) {
  if (!container || !selectedElement) return;

  // Получаем размеры контейнера и выбранного элемента
  const containerRect = container.getBoundingClientRect();
  const elementRect = selectedElement.getBoundingClientRect();
  const currentScrollLeft = container.scrollLeft;

  // Получаем стили контейнера
  const style = getComputedStyle(container);
  const paddingLeft = parseInt(style.paddingLeft) || 0;
  const paddingRight = parseInt(style.paddingRight) || 0;
  // Получаем gap между кнопками (если есть)
  let gap = 0;
  if (style.gap) {
    gap = parseInt(style.gap) || 0;
  } else if (style.columnGap) {
    gap = parseInt(style.columnGap) || 0;
  }

  // Вычисляем позицию элемента относительно контейнера с учетом скролла
  const elementLeftRelative = elementRect.left - containerRect.left + currentScrollLeft;
  const elementRightRelative = elementLeftRelative + elementRect.width;
  const containerWidth = containerRect.width;

  // Проверяем, полностью ли элемент видим (с небольшим запасом)
  const isFullyVisible =
    elementLeftRelative >= currentScrollLeft + paddingLeft - gap &&
    elementRightRelative <= currentScrollLeft + containerWidth - paddingRight + gap;
  if (isFullyVisible) return;

  let newScrollLeft = currentScrollLeft;

  // Если элемент частично или полностью скрыт справа
  if (elementRightRelative > currentScrollLeft + containerWidth - paddingRight) {
    newScrollLeft = elementRightRelative - containerWidth + paddingRight + gap;
  }
  // Если элемент частично или полностью скрыт слева
  else if (elementLeftRelative < currentScrollLeft + paddingLeft) {
    newScrollLeft = elementLeftRelative - paddingLeft - gap;
  }

  // Ограничиваем скролл пределами контента
  const maxScrollLeft = container.scrollWidth - containerWidth;
  newScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));

  if (newScrollLeft !== currentScrollLeft) {
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  }
}

// Вспомогательная функция: получить цену для пары (издание, период) по тем же правилам, что и конечная цена
function getPriceForEditionAndPeriod(product, edition, periodId) {
  const periodObj = product.periods.find(p => p.id === periodId);
  if (edition && edition.periodPricing && periodId && Object.prototype.hasOwnProperty.call(edition.periodPricing, periodId)) {
    const val = edition.periodPricing[periodId];
    if (typeof val === 'number') return val;
  }
  if (periodObj && typeof periodObj.price === 'number') return periodObj.price;
  if (edition && typeof edition.price === 'number') return edition.price;
  return product.price;
}

// Обновить ценники на кнопках изданий согласно текущему выбранному периоду
function updateEditionPriceLabels(product) {
  const container = document.querySelector('#edition-group');
  const periodInput = document.querySelector('input[name="period"]:checked');
  const periodId = periodInput?.value;
  if (!container || !periodId) return;
  (product.editions || []).forEach((edition) => {
    const label = container.querySelector(`label[for="${edition.id}"]`);
    if (!label) return;
    const priceEl = label.querySelector('.edition-price');
    const hasMap = edition && edition.periodPricing && typeof edition.periodPricing === 'object';
    const supports = hasMap ? (typeof edition.periodPricing[periodId] === 'number') : true;
    if (supports) {
      label.classList.remove('unavailable');
      if (priceEl) {
        const previewPrice = getPriceForEditionAndPeriod(product, edition, periodId);
        priceEl.textContent = formatPriceSimple(previewPrice);
      }
    } else {
      // Помечаем план как недоступный для текущего периода: серый и без цены
      label.classList.add('unavailable');
      if (priceEl) {
        priceEl.textContent = '';
      }
    }
  });
}

// Обновить отображение цены для юрлиц (если применимо) от текущей цены
function setCorporatePriceDisplayIfApplicable(product, baseAmount) {
  const priceUsdtElement = document.querySelector('.price-usdt');
  if (!priceUsdtElement) return;
  const usdtText = product.priceUSDT;
  if (usdtText === 'для юрлиц') {
    const corporatePrice = Math.round((typeof baseAmount === 'number' ? baseAmount : product.price) * 0.97);
    const span = priceUsdtElement.querySelector('.corporate-price');
    if (span) {
      span.innerHTML = formatPrice(corporatePrice);
    } else {
      priceUsdtElement.innerHTML = `для юрлиц <span class="corporate-price">${formatPrice(corporatePrice)}</span>`;
    }
  }
}

// Применение визуальных изменений при выборе издания (плана)
function applyEditionVisuals(product, edition) {
  if (!product || !edition) return;

  const titleElement = document.querySelector('.title');
  const swiperWrapper = document.querySelector('.swiper-wrapper');
  const slider = document.querySelector('.swiper');
  if (!titleElement || !swiperWrapper || !slider) return;

  const newTitle = (edition.displayTitle && edition.displayTitle.trim())
    ? edition.displayTitle
    : `${product.title} — ${edition.name}`;

  // Обновляем заголовок страницы и таба
  titleElement.textContent = newTitle;
  document.title = newTitle;

  // Выбираем изображения: специфичные для издания или дефолтные
  const imagesToUse = Array.isArray(edition.images) && edition.images.length > 0
    ? edition.images
    : product.images;

  // Переинициализируем слайдер изображений без перезагрузки страницы
  swiperWrapper.innerHTML = '';
  const oldIndicators = document.querySelector('.slider-indicators');
  if (oldIndicators) oldIndicators.remove();
  slider.classList.remove('slider-initialized');

  imagesToUse.forEach((image, index) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `<img src="${image}" alt="${newTitle} ${index + 1}" />`;
    swiperWrapper.appendChild(slide);
  });


  setTimeout(() => {
    initImageSlider();
  }, 10);
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
    
    // Добавляем обработчик для автоматического скролла и обновления кнопок
    input.addEventListener('change', () => {
      if (input.checked) {
        scrollToSelectedButton(container, label);
        const product = getProductById(getUrlParameter('product'));
        if (product) refreshBuyControls(product);
      }
    });

    // Fast-tap: выбираем по pointerup/touchend даже во время bounce
    const fastTap = (e) => {
      // Предотвращаем двойные срабатывания (последующий click)
      if (label.__fastTapLock) return;
      label.__fastTapLock = true;
      try {
        if (!input.checked) {
          input.checked = true;
          try { input.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
        }
      } finally {
        setTimeout(() => { label.__fastTapLock = false; }, 300);
      }
    };
    label.addEventListener('pointerup', fastTap, { passive: true });
    label.addEventListener('touchend', fastTap, { passive: true });
  });
}

function updatePeriods(product) {
  const container = document.querySelector('#period-group');
  container.innerHTML = '';
  container.classList.add('period-buttons');
  
  const isAdobe = String(product?.id) === 'adobe-creative-cloud';
  const defaultPeriodId = isAdobe ? 'period-1' : (product.periods[0]?.id);

  product.periods.forEach((period, index) => {
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'period';
    input.id = period.id;
    input.value = period.id;
    if ((index === 0 && !isAdobe) || (isAdobe && period.id === defaultPeriodId)) {
      input.checked = true;
      input.setAttribute('checked', 'checked');
    }

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
        const productObj = getProductById(getUrlParameter('product'));
        const selectedOptions = getSelectedOptions();
        let baseAmount;
        if (productObj && selectedOptions) {
          const final = calculateFinalPrice(productObj, selectedOptions);
          baseAmount = final;
          document.querySelector('.price-value').innerHTML = formatPrice(final);
        } else {
          baseAmount = period.price;
          document.querySelector('.price-value').innerHTML = formatPrice(period.price);
        }
        // Добавляем автоматический скролл к выбранной кнопке
        scrollToSelectedButton(container, label);
        const product = getProductById(getUrlParameter('product'));
        // Обновляем ценники на изданиях под выбранный период
        if (product) updateEditionPriceLabels(product);
        // Обновляем цену для юрлиц, если необходимо
        if (product) setCorporatePriceDisplayIfApplicable(product, baseAmount);
        if (product) refreshBuyControls(product);
      }
    });

    // Fast-tap: выбираем по pointerup/touchend даже во время bounce
    const fastTap = (e) => {
      if (label.__fastTapLock) return;
      label.__fastTapLock = true;
      try {
        if (!input.checked && !input.disabled) {
          input.checked = true;
          try { input.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
        }
      } finally {
        setTimeout(() => { label.__fastTapLock = false; }, 300);
      }
    };
    label.addEventListener('pointerup', fastTap, { passive: true });
    label.addEventListener('touchend', fastTap, { passive: true });
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
    // Изначальный ценник на кнопке издания — согласно текущему выбранному периоду
    const selectedPeriodInput = document.querySelector('input[name="period"]:checked');
    const selectedPeriodId = selectedPeriodInput ? selectedPeriodInput.value : null;
    const initialEditionPrice = selectedPeriodId
      ? getPriceForEditionAndPeriod(product, edition, selectedPeriodId)
      : ((edition.periodPricing && edition.periodPricing['period-1']) || edition.price || product.price);
    const priceHtml = initialEditionPrice ? `${formatPriceSimple(initialEditionPrice)}` : '';
    label.innerHTML = `
      <div>
        <div>${edition.name}</div>
        <div class="edition-price">${priceHtml}</div>
      </div>
    `;

    container.appendChild(input);
    container.appendChild(label);

    // Обновляем состояние при выборе издания
    input.addEventListener('change', () => {
      if (input.checked) {
        // Скрываем недоступные периоды и переключаемся на первый доступный, если нужно
        updatePeriodAvailabilityForEdition(product, edition);
        // Визуальные изменения (заголовок + изображения)
        applyEditionVisuals(product, edition);
        // Пересчитываем итоговую цену исходя из выбранных опций
        const productObj = getProductById(getUrlParameter('product'));
        const selectedOptions = getSelectedOptions();
        let baseAmount;
        if (productObj && selectedOptions) {
          const final = calculateFinalPrice(productObj, selectedOptions);
          baseAmount = final;
          document.querySelector('.price-value').innerHTML = formatPrice(final);
        } else if (edition.price) {
          baseAmount = edition.price;
          document.querySelector('.price-value').innerHTML = formatPrice(edition.price);
        } else {
          baseAmount = product.price;
          document.querySelector('.price-value').innerHTML = formatPrice(product.price);
        }
        // Добавляем автоматический скролл к выбранной кнопке
        scrollToSelectedButton(container, label);
        if (productObj) refreshBuyControls(productObj);
        // Обновляем цену для юрлиц, если необходимо
        if (productObj) setCorporatePriceDisplayIfApplicable(productObj, baseAmount);
      }
    });

    // Fast-tap: выбираем по pointerup/touchend даже во время bounce
    const fastTap = (e) => {
      if (label.__fastTapLock) return;
      label.__fastTapLock = true;
      try {
        if (!input.checked) {
          input.checked = true;
          try { input.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
        }
      } finally {
        setTimeout(() => { label.__fastTapLock = false; }, 300);
      }
    };
    label.addEventListener('pointerup', fastTap, { passive: true });
    label.addEventListener('touchend', fastTap, { passive: true });
  });

  // Применяем визуалы для издания по умолчанию (первого), если указаны спец. данные
  const defaultEdition = product.editions[0];
  if (defaultEdition) {
    applyEditionVisuals(product, defaultEdition);
    // Скрываем недоступные периоды под дефолтное издание и выбираем первый доступный
    updatePeriodAvailabilityForEdition(product, defaultEdition);
  }
  // Устанавливаем корректную цену согласно выбранным по умолчанию опциям
  const productObj = getProductById(getUrlParameter('product'));
  const selectedOptions = getSelectedOptions();
  if (productObj && selectedOptions) {
    const final = calculateFinalPrice(productObj, selectedOptions);
    const priceEl = document.querySelector('.price-value');
    if (priceEl) priceEl.innerHTML = formatPrice(final);
    // Синхронизируем ценники на изданиях и цену для юрлиц
    updateEditionPriceLabels(productObj);
    setCorporatePriceDisplayIfApplicable(productObj, final);
  }
}

// Обеспечить корректный период для выбранного издания:
// если текущий период недоступен у издания, переключаемся на первый доступный
function ensurePeriodForEdition(product, edition) {
  const container = document.querySelector('#period-group');
  if (!container) return;
  const currentInput = container.querySelector('input[name="period"]:checked');
  const currentId = currentInput?.value;
  const hasMap = edition && edition.periodPricing && typeof edition.periodPricing === 'object';
  let supportsCurrent = true;
  if (hasMap) supportsCurrent = typeof edition.periodPricing[currentId] === 'number';

  if (supportsCurrent) return;

  // Находим первый доступный период в порядке объявления товара
  let targetId = null;
  if (hasMap) {
    for (const p of product.periods) {
      if (typeof edition.periodPricing[p.id] === 'number') {
        targetId = p.id;
        break;
      }
    }
  }
  // Если карта не задана или ничего не найдено — оставляем как есть
  if (!targetId) return;

  const targetInput = container.querySelector(`input[id="${targetId}"]`);
  const targetLabel = container.querySelector(`label[for="${targetId}"]`);
  if (targetInput && !targetInput.checked) {
    targetInput.checked = true;
    try { targetInput.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
    if (targetLabel) scrollToSelectedButton(container, targetLabel);
  }
}

// Показ/скрытие периодов в зависимости от выбранного издания.
// Недоступные периоды полностью скрываем; если текущий период стал недоступным —
// автоматически выбираем первый доступный и инициируем пересчёт.
function updatePeriodAvailabilityForEdition(product, edition) {
  const container = document.querySelector('#period-group');
  if (!container) return;

  const hasPricingMap = edition && edition.periodPricing && typeof edition.periodPricing === 'object';
  const inputs = Array.from(container.querySelectorAll('input[name="period"]'));
  let firstAvailable = null;

  inputs.forEach((input) => {
    const label = container.querySelector(`label[for="${input.id}"]`);
    let available = true;
    if (hasPricingMap) {
      const priceValue = edition.periodPricing[input.id];
      available = typeof priceValue === 'number';
    }

    if (available) {
      input.disabled = false;
      if (label) {
        label.style.display = '';
        label.classList.remove('disabled');
        label.style.opacity = '';
      }
      if (!firstAvailable) firstAvailable = input;
    } else {
      input.disabled = true;
      if (label) {
        label.style.display = 'none';
        label.classList.add('disabled');
        label.style.opacity = '0.5';
      }
      if (input.checked) {
        input.checked = false;
      }
    }
  });

  const currentlyChecked = container.querySelector('input[name="period"]:checked');
  if (!currentlyChecked && firstAvailable) {
    firstAvailable.checked = true;
    try { firstAvailable.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
  }
}

function updateTabs(product) {
  const tabsContent = document.querySelector('.tabs-content');
  const tabs = document.querySelectorAll('.tab');
  const tabsContainer = document.querySelector('.tabs');
  
  // Устанавливаем содержимое по умолчанию (описание) обернутое в анимированный контейнер
  tabsContent.innerHTML = `<div class="tabs-content-inner fade-in">${product.description}</div>`;
  
  // Устанавливаем начальное положение полосочки
  tabsContainer.setAttribute('data-active', '0');
  
  // Функция для обновления позиции полосочки
  function updateTabIndicator(activeIndex) {
    const activeTab = tabs[activeIndex];
    const tabsContainer = document.querySelector('.tabs');
    
    if (!activeTab || !tabsContainer) return;
    
    // Получаем размеры и позицию активного таба
    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();
    
    // Вычисляем позицию относительно контейнера табов
    const left = tabRect.left - containerRect.left;
    const width = tabRect.width;
    
    // Применяем стили к псевдоэлементу через CSS переменные
    tabsContainer.style.setProperty('--tab-indicator-left', `${left}px`);
    tabsContainer.style.setProperty('--tab-indicator-width', `${width}px`);
  }
  
  // Инициализируем позицию полосочки для первого таба
  setTimeout(() => {
    updateTabIndicator(0);
  }, 0);
  
  // Добавляем обработчики для переключения табов
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      // Убираем активный класс у всех табов
      tabs.forEach(t => t.classList.remove('tab-selected'));
      // Добавляем активный класс к текущему табу
      tab.classList.add('tab-selected');
      
      // Обновляем положение полосочки
      tabsContainer.setAttribute('data-active', index.toString());
      updateTabIndicator(index);
      
      // Плавно обновляем содержимое с анимацией
      smoothUpdateTabContent(tabsContent, index === 0 ? product.description : product.systemRequirements);
    });
  });
  
  // Обновляем позицию полосочки при изменении размера окна
  window.addEventListener('resize', () => {
    const activeIndex = parseInt(tabsContainer.getAttribute('data-active') || '0');
    updateTabIndicator(activeIndex);
  });
  
  // Обновляем позицию полосочки при изменении ориентации устройства
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      const activeIndex = parseInt(tabsContainer.getAttribute('data-active') || '0');
      updateTabIndicator(activeIndex);
    }, 100);
  });
  
  // Обновляем позицию скролла в кнопках при изменении размера окна
  window.addEventListener('resize', () => {
    // Находим все активные кнопки в скроллируемых контейнерах
    const scrollableContainers = [
      document.querySelector('#variant-group'),
      document.querySelector('#period-group'),
      document.querySelector('#edition-group')
    ];
    
    scrollableContainers.forEach(container => {
      if (container) {
        const checkedInput = container.querySelector('input:checked');
        if (checkedInput) {
          const label = container.querySelector(`label[for="${checkedInput.id}"]`);
          if (label) {
            // Небольшая задержка для корректного расчета размеров
            setTimeout(() => {
              scrollToSelectedButton(container, label);
            }, 50);
          }
        }
      }
    });
  });
  
  // Обновляем позицию скролла в кнопках при изменении ориентации устройства
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      const scrollableContainers = [
        document.querySelector('#variant-group'),
        document.querySelector('#period-group'),
        document.querySelector('#edition-group')
      ];
      
      scrollableContainers.forEach(container => {
        if (container) {
          const checkedInput = container.querySelector('input:checked');
          if (checkedInput) {
            const label = container.querySelector(`label[for="${checkedInput.id}"]`);
            if (label) {
              scrollToSelectedButton(container, label);
            }
          }
        }
      });
    }, 100);
  });
}

// Функция для плавного обновления контента табов с анимацией
function smoothUpdateTabContent(container, newContent) {
  const contentInner = container.querySelector('.tabs-content-inner');
  
  if (!contentInner) {
    // Если нет обертки, создаем её
    container.innerHTML = `<div class="tabs-content-inner fade-in">${newContent}</div>`;
    return;
  }
  
  // Сохраняем текущую высоту контейнера
  const currentHeight = container.offsetHeight;
  container.style.height = currentHeight + 'px';
  container.style.overflow = 'hidden';
  container.style.transition = 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Создаем временный элемент для измерения новой высоты
  const tempDiv = document.createElement('div');
  tempDiv.className = 'tabs-content-inner';
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
  
  // Запускаем анимацию исчезновения старого контента
  contentInner.classList.add('fade-out');
  
  // Через время анимации исчезновения обновляем контент
  setTimeout(() => {
    contentInner.innerHTML = newContent;
    contentInner.classList.remove('fade-out');
    contentInner.classList.add('fade-in');
    
    // Анимируем высоту к новому размеру
    requestAnimationFrame(() => {
      container.style.height = newHeight + 'px';
      
      // После завершения анимации высоты убираем ограничения
      setTimeout(() => {
        container.style.height = '';
        container.style.overflow = '';
        container.style.transition = '';
      }, 250);
    });
  }, 125); // Половина времени анимации текста
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
  let selectedVariant = 'Активация'; // Изначально выбранный вариант
  // Блокировка многократных быстрых нажатий во время анимаций
  let isAnimatingCheckout = false;
  const EXPAND_DURATION_MS = 420;   // немного больше 400 для запаса
  const COLLAPSE_DURATION_MS = 330; // немного больше 300 для запаса
  let expandTimer = null;
  let collapseTimer = null;
  
  function clearCheckoutTimers() {
    if (expandTimer) {
      clearTimeout(expandTimer);
      expandTimer = null;
    }
    if (collapseTimer) {
      clearTimeout(collapseTimer);
      collapseTimer = null;
    }
  }
  
  // Функция для получения текста выбранного варианта
  function getSelectedVariantText() {
    const checkedInput = variantGroup.querySelector('input[name="variant"]:checked');
    if (checkedInput) {
      const label = variantGroup.querySelector(`label[for="${checkedInput.id}"] span`);
      return label ? label.textContent.trim() : 'Активация';
    }
    return 'Активация';
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
  function collapseCheckout(showSelection = false) {
    if (isAnimatingCheckout) return;
    isAnimatingCheckout = true;
    isExpanded = false;
    clearCheckoutTimers();
    
    // Обновляем выбранный вариант перед анимацией
    selectedVariant = getSelectedVariantText();
    
    if (showSelection) {
      // Показываем анимацию выбора
      showSelectionAnimation();
    }
    
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
    collapseTimer = setTimeout(() => {
      variantGroup.classList.remove('expanded', 'collapsing');
      isAnimatingCheckout = false;
    }, COLLAPSE_DURATION_MS);
    
    // Обновляем текст заголовка
    updateHeaderText();
  }
  
  // Функция для показа анимации выбора
  function showSelectionAnimation() {
    // Добавляем класс для анимации выбора
    checkoutContainer.classList.add('selection-made');
    
    // Временно показываем выбранный вариант
    const tempText = checkoutHeaderText.textContent;
    checkoutHeaderText.textContent = `✓ ${selectedVariant}`;
    
    // Убираем анимацию через короткое время
    setTimeout(() => {
      checkoutContainer.classList.remove('selection-made');
    }, 500);
  }
  
  // Функция для разворачивания блока
  function expandCheckout() {
    if (isAnimatingCheckout) return;
    isAnimatingCheckout = true;
    clearCheckoutTimers();
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
    expandTimer = setTimeout(() => {
      variantGroup.classList.remove('expanding');
      isAnimatingCheckout = false;
    }, EXPAND_DURATION_MS);
    
    // Обновляем текст заголовка
    updateHeaderText();
  }
  
  // Обработчик клика по заголовку - только на текст или стрелочку
  checkoutToggle.addEventListener('click', function(e) {
    // Проверяем, что клик был именно по тексту или стрелочке
    const clickedOnText = e.target.id === 'checkout-header-text' || e.target.closest('#checkout-header-text');
    const clickedOnArrow = e.target.classList.contains('checkout-arrow') || e.target.closest('.checkout-arrow');
    
    if (clickedOnText || clickedOnArrow) {
      if (isAnimatingCheckout) return;
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
      collapseCheckout(true); // Показываем анимацию выбора
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
        // Явно инициируем событие change и обновляем состояние кнопок
        try {
          targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        } catch {}
        const product = getProductById(getUrlParameter('product'));
        if (product) refreshBuyControls(product);
      }
    }
  });
  
  // Инициализация: устанавливаем правильный текст при загрузке
  selectedVariant = getSelectedVariantText();
  updateHeaderText();
}

// Нативный слайдер изображений
function initImageSlider() {
  const slider = document.querySelector('.swiper');
  const wrapper = document.querySelector('.swiper-wrapper');
  let slides = document.querySelectorAll('.swiper-slide');
  
  if (!slider || !wrapper || slides.length === 0) {
    return;
  }

  // Проверяем, что слайдер еще не инициализирован
  if (slider.classList.contains('slider-initialized')) {
    return;
  }
  
  // Отключаем бесконечный цикл: работаем только с реальными слайдами
  let currentIndex = 0; // Начинаем с первого слайда
  let isTransitioning = false;
  const totalSlides = slides.length;
  let animationSeq = 0; // Идентификатор текущей анимации для безопасной отмены
  
  // Устанавливаем начальную позицию на первый слайд
  wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
  wrapper.style.transition = 'transform 0.3s ease';
  
  // Помечаем слайдер как инициализированный
  slider.classList.add('slider-initialized');
  
  // Функция для перехода к слайду без loop
  function goToSlide(index) {
    if (isTransitioning) return;
    // Ограничиваем индекс в пределах 0..totalSlides-1
    const clampedIndex = Math.max(0, Math.min(totalSlides - 1, index));
    isTransitioning = true;
    currentIndex = clampedIndex;
    const localSeq = ++animationSeq;
    // Обновляем позицию слайдера
    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    setTimeout(() => {
      if (localSeq !== animationSeq) return;
      isTransitioning = false;
    }, 300);
  }
  
  // Обработчики событий добавляем только если больше одного изображения
  if (slides.length > 1) {
    // Проверяем, является ли устройство мобильным
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);
    
    // Обработка touch событий
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let startTime = 0;
    let touchBlocked = false; // Блокируем новые touch события во время анимации
    let swipeDirection = null; // 'horizontal', 'vertical', null
    let swipeStarted = false;
    let startTransformPercent = 0; // Текущая позиция слайдера в процентах на момент touchstart

    function getCurrentTranslatePercent() {
      const style = window.getComputedStyle(wrapper);
      const transform = style.transform || style.webkitTransform;
      if (!transform || transform === 'none') {
        return -currentIndex * 100;
      }
      const match = transform.match(/matrix\(([^)]+)\)/);
      let tx = 0;
      if (match) {
        const parts = match[1].split(',');
        tx = parseFloat(parts[4]);
      } else {
        const match2 = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
        tx = match2 ? parseFloat(match2[1]) : 0;
      }
      const width = slider.offsetWidth || 1;
      return (tx / width) * 100;
    }
    
    function handleTouchStart(e) {
      // Если идёт анимация или стоим в блоке, прерываем её и начинаем новый свайп сразу
      if (isTransitioning || touchBlocked) {
        wrapper.style.transition = 'none';
        isTransitioning = false;
        touchBlocked = false;
        // Инвалидация предыдущей анимации
        animationSeq++;
      }
      
      // Сбрасываем предыдущее состояние
      if (isDragging) {
        isDragging = false;
        wrapper.style.transition = 'transform 0.3s ease';
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
      }
      
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = startX;
      currentY = startY;
      isDragging = true;
      startTime = Date.now();
      swipeDirection = null;
      swipeStarted = false;
      wrapper.style.transition = 'none';
      // Запоминаем текущую фактическую позицию слайдера в процентах
      startTransformPercent = getCurrentTranslatePercent();
    }
    
    function handleTouchMove(e) {
      if (!isDragging || isTransitioning || touchBlocked) return;
      
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
      
      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);
      
      // Определяем направление свайпа только один раз
      if (!swipeStarted && (deltaX > 10 || deltaY > 10)) {
        swipeStarted = true;
        
        // Определяем преобладающее направление движения
        if (deltaX > deltaY * 1.5) {
          swipeDirection = 'horizontal';
        } else if (deltaY > deltaX * 1.5) {
          swipeDirection = 'vertical';
        }
      }
      
      // Обновляем трансформацию только для горизонтальных свайпов
      if (swipeDirection === 'horizontal') {
        const deltaX = currentX - startX;
        let newTransform = startTransformPercent + (deltaX / slider.offsetWidth) * 100;
        // Эффект резинки на краях без loop
        const minPercent = -(totalSlides - 1) * 100;
        const maxPercent = 0;
        if (newTransform > maxPercent) {
          newTransform = maxPercent + (newTransform - maxPercent) * 0.35;
        } else if (newTransform < minPercent) {
          newTransform = minPercent + (newTransform - minPercent) * 0.35;
        }
        wrapper.style.transform = `translateX(${newTransform}%)`;
        e.preventDefault(); // Блокируем скролл только для горизонтальных свайпов
      }
      // Для вертикальных свайпов позволяем браузеру обрабатывать событие нормально
    }
    
    function handleTouchEnd() {
      if (!isDragging || isTransitioning || touchBlocked) return;
      
      isDragging = false;
      // Не блокируем новые touch события — позволяем мгновенно начинать следующий свайп
      wrapper.style.transition = 'transform 0.3s ease';
      
      // Обрабатываем свайп только если было горизонтальное движение
      if (swipeDirection === 'horizontal') {
        const deltaX = currentX - startX;
        const deltaTime = Date.now() - startTime;
        const velocity = Math.abs(deltaX) / deltaTime; // пикселей в миллисекунду
        
        // Улучшенная логика определения переключения слайда
        const threshold = 50; // Минимальное расстояние
        const velocityThreshold = 0.3; // Минимальная скорость для быстрого свайпа
        
        const shouldChange = Math.abs(deltaX) > threshold || 
                            (velocity > velocityThreshold && Math.abs(deltaX) > 20);
        
        if (shouldChange) {
          if (deltaX > 0) {
            goToSlide(currentIndex - 1);
          } else {
            goToSlide(currentIndex + 1);
          }
        } else {
          wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
      } else {
        // Если это был вертикальный свайп, просто возвращаем слайд на место
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
      }
      
      // Сбрасываем состояние сразу — без задержки
      touchBlocked = false;
      startX = 0;
      startY = 0;
      currentX = 0;
      currentY = 0;
      startTime = 0;
      swipeDirection = null;
      swipeStarted = false;
    }
    
    // Добавляем обработчик для отмены touch событий
    function handleTouchCancel() {
      if (isDragging) {
        isDragging = false;
        wrapper.style.transition = 'transform 0.3s ease';
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        // Мгновенно сбрасываем флаги, не блокируя последующие жесты
        touchBlocked = false;
        startX = 0;
        startY = 0;
        currentX = 0;
        currentY = 0;
        startTime = 0;
        swipeDirection = null;
        swipeStarted = false;
      }
    }
    
    // Добавляем touch обработчики
    slider.addEventListener('touchstart', handleTouchStart, { passive: false });
    slider.addEventListener('touchmove', handleTouchMove, { passive: false });
    slider.addEventListener('touchend', handleTouchEnd, { passive: true });
    slider.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    
    // Добавляем обработчики кликов только на десктопе
    if (!isMobile) {
      function handleClick(e) {
        if (isDragging || isTransitioning || touchBlocked) return;
        
        const rect = slider.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const centerX = rect.width / 2;
        
        if (clickX < centerX) {
          // Клик слева - предыдущий слайд
          goToSlide(currentIndex - 1);
        } else {
          // Клик справа - следующий слайд
          goToSlide(currentIndex + 1);
        }
      }
      
      slider.addEventListener('click', handleClick);
    }
  }
}

// Глобальная переменная для ModalManager
let modalManager;

// Функция для открытия модального окна с лейблом
function openLabelModal(labelText) {
  if (!modalManager) return;
  
  const labelInfo = modalManager.getLabelInfo(labelText);
  // Если лейбл относится к "Гарантия" или "Лицензия" — не показываем модалку
  if (['Гарантия', 'Лицензия'].includes(labelText)) return;
  modalManager.openModal('label-modal', { labelInfo });
}

// Функции для работы с оплатой
function initPayment() {
  const buyButton = document.querySelector('.add-to-cart');
  if (!buyButton) return;
  // Больше не открываем модалку — переключаемся на контролы корзины
  const fastHandler = (e) => {
    if (buyButton.__fastTapLock) return;
    buyButton.__fastTapLock = true;
    try { handleAddToCartFromProduct(); } finally {
      setTimeout(() => { buyButton.__fastTapLock = false; }, 300);
    }
  };
  buyButton.addEventListener('pointerup', fastHandler, { passive: true });
  buyButton.addEventListener('touchend', fastHandler, { passive: true });
  buyButton.addEventListener('click', handleAddToCartFromProduct);
}

// Обработчик клика по кнопке "Купить"
async function handleBuyClick() {
  const productId = getUrlParameter('product');
  const product = getProductById(productId);
  
  if (!product) {
    modalManager?.showError('Не найдено');
    return;
  }

  // Получаем выбранные опции
  const selectedOptions = getSelectedOptions();
  if (!selectedOptions) {
    modalManager?.showError('Пожалуйста, выберите все необходимые опции');
    return;
  }

  // Рассчитываем итоговую цену
  const finalPrice = calculateFinalPrice(product, selectedOptions);
  
  // Открываем модальное окно оформления
  openCheckoutModal(product, selectedOptions, finalPrice);
}

// --- Корзина (страница товара) ---
const STORAGE_KEY = 'hooli_cart';

function readCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function writeCart(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }

function buildCartItemId(product, selectedOptions) {
  const baseId = String(product.id);
  if (!selectedOptions) return baseId;
  const v = selectedOptions.variantId || 'v';
  const p = selectedOptions.periodId || 'p';
  const e = selectedOptions.editionId || 'e';
  return `${baseId}|${v}|${p}|${e}`;
}

function getCartItem(product, selectedOptions) {
  const items = readCart();
  const targetId = buildCartItemId(product, selectedOptions);
  return items.find(i => i.id === targetId);
}

function setCartItem(product, qty, selectedOptions) {
  const items = readCart();
  const id = buildCartItemId(product, selectedOptions);
  const idx = items.findIndex(i => i.id === id);
  if (qty <= 0) {
    if (idx !== -1) items.splice(idx, 1);
  } else {
    const payload = {
      id,
      title: product.title,
      // Цена фиксируется с учётом выбранных опций (если переданы)
      price: selectedOptions ? calculateFinalPrice(product, selectedOptions) : (product.price),
      image: (() => {
        if (selectedOptions && selectedOptions.editionId) {
          const editionObj = (product.editions || []).find(e => e.id === selectedOptions.editionId);
          if (editionObj && Array.isArray(editionObj.images) && editionObj.images.length > 0) {
            return editionObj.images[0];
          }
        }
        return product.images?.[0] || '';
      })(),
      qty,
      // Сохраняем выбранные опции, чтобы показывать в корзине и модалке
      variantId: selectedOptions?.variantId,
      periodId: selectedOptions?.periodId,
      editionId: selectedOptions?.editionId,
      variantName: selectedOptions?.variant,
      periodName: selectedOptions?.period,
      editionName: selectedOptions?.edition
    };
    if (idx === -1) items.push(payload); else items[idx] = { ...items[idx], ...payload };
  }
  writeCart(items);
  window.dispatchEvent(new Event('cart:updated'));
}

function renderBuyOrControls(product) {
  // Удаляем старые элементы
  const oldControls = document.querySelector('.product-cart-controls');
  if (oldControls) oldControls.remove();

  // Проверяем наличие именно текущей конфигурации
  const selectedOptions = getSelectedOptions();
  const cartItem = selectedOptions ? getCartItem(product, selectedOptions) : null;
  if (!cartItem) return; // показываем стандартную кнопку "Добавить в корзину"

  // Скрываем стандартную кнопку
  const buyBtn = document.querySelector('.add-to-cart');
  if (buyBtn) buyBtn.style.display = 'none';

  // Рендер контролов
  const controls = document.createElement('div');
  controls.className = 'product-cart-controls';
  controls.innerHTML = `
    <button class="reset-Button go-to-cart">Перейти в корзину</button>
    <div class="qty-box">
      <button class="reset-Button qty-btn" data-action="dec">−</button>
      <span class="qty-value">${cartItem.qty || 1}</span>
      <button class="reset-Button qty-btn" data-action="inc">+</button>
    </div>
  `;
  document.body.appendChild(controls);

  // Обработчики
  const goToCartBtn = controls.querySelector('.go-to-cart');
  const goToCart = () => {
    if (window.AppNav && typeof window.AppNav.go === 'function') {
      return window.AppNav.go('cart.html');
    }
    const basePath = window.location.pathname.replace(/[^/]*$/, '');
    window.location.href = basePath + 'cart.html';
  };
  goToCartBtn.addEventListener('click', goToCart);
  // Fast-tap для перехода в корзину
  const goToCartFast = (e) => {
    if (goToCartBtn.__fastTapLock) return;
    goToCartBtn.__fastTapLock = true;
    try { goToCart(); } finally { setTimeout(() => { goToCartBtn.__fastTapLock = false; }, 300); }
  };
  goToCartBtn.addEventListener('pointerup', goToCartFast, { passive: true });
  goToCartBtn.addEventListener('touchend', goToCartFast, { passive: true });

  const clickHandler = (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const current = getCartItem(product, getSelectedOptions()) || { qty: 0 };
    let nextQty = current.qty || 1;
    if (action === 'inc') nextQty += 1;
    if (action === 'dec') nextQty -= 1;
    setCartItem(product, nextQty, getSelectedOptions());

    // Если удалили последний — вернуть кнопку «Купить»
    if (nextQty <= 0) {
      controls.remove();
      if (buyBtn) {
        buyBtn.style.display = 'block';
      }
    } else {
      controls.querySelector('.qty-value').textContent = String(nextQty);
    }
  };
  controls.addEventListener('click', clickHandler);
  // Fast-tap для −/+
  const controlsFastTap = (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.__fastTapLock) return;
    btn.__fastTapLock = true;
    try { clickHandler(e); } finally { setTimeout(() => { btn.__fastTapLock = false; }, 250); }
  };
  controls.addEventListener('pointerup', controlsFastTap, { passive: true });
  controls.addEventListener('touchend', controlsFastTap, { passive: true });
}

function handleAddToCartFromProduct() {
  const productId = getUrlParameter('product');
  const product = getProductById(productId);
  if (!product) return;
  const selectedOptions = getSelectedOptions();
  const existing = getCartItem(product, selectedOptions || undefined);
  const qty = existing ? (existing.qty || 1) + 1 : 1;
  setCartItem(product, qty, selectedOptions || undefined);
  renderBuyOrControls(product);
}

// Обновление состояния нижней кнопки/контролов в зависимости от выбранных опций
function refreshBuyControls(product) {
  const buyBtn = document.querySelector('.add-to-cart');
  const controls = document.querySelector('.product-cart-controls');
  const options = getSelectedOptions();
  const exists = options ? getCartItem(product, options) : null;
  if (exists) {
    if (!controls) {
      renderBuyOrControls(product);
    }
    if (buyBtn) buyBtn.style.display = 'none';
  } else {
    if (controls) controls.remove();
    if (buyBtn) buyBtn.style.display = 'block';
  }
}

// Получение выбранных опций
function getSelectedOptions() {
  const variantInput = document.querySelector('input[name="variant"]:checked');
  const periodInput = document.querySelector('input[name="period"]:checked');
  const editionInput = document.querySelector('input[name="edition"]:checked');

  if (!variantInput || !periodInput || !editionInput) {
    return null;
  }

  const productId = getUrlParameter('product');
  const product = getProductById(productId);
  
  if (!product) return null;

  const variant = product.variants.find(v => v.id === variantInput.value);
  const period = product.periods.find(p => p.id === periodInput.value);
  const edition = product.editions.find(e => e.id === editionInput.value);

  return {
    variant: variant ? variant.name : 'Неизвестно',
    period: period ? period.name : 'Неизвестно',
    edition: edition ? edition.name : 'Неизвестно',
    variantId: variantInput.value,
    periodId: periodInput.value,
    editionId: editionInput.value
  };
}

// Расчет итоговой цены
function calculateFinalPrice(product, selectedOptions) {
  let basePrice = product.price;
  
  // Находим выбранные опции и их цены
  const period = product.periods.find(p => p.id === selectedOptions.periodId);
  const edition = product.editions.find(e => e.id === selectedOptions.editionId);
  
  // 1) Приоритет: если у издания задана помесячная сетка цен, используем цену для выбранного периода
  if (edition && edition.periodPricing && selectedOptions.periodId && Object.prototype.hasOwnProperty.call(edition.periodPricing, selectedOptions.periodId)) {
    const priceForPeriod = edition.periodPricing[selectedOptions.periodId];
    if (typeof priceForPeriod === 'number') {
      return priceForPeriod;
    }
  }
  
  // 2) Далее — цена периода, если есть
  if (period && typeof period.price === 'number') {
    return period.price;
  }
  
  // 3) Затем — цена издания, если задана
  if (edition && typeof edition.price === 'number') {
    return edition.price;
  }
  
  // 4) Иначе — базовая цена товара
  return basePrice;
}

// Генерация ID заказа
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORDER_${timestamp}_${random}`;
}

// Обработка успешной оплаты
function handlePaymentSuccess(result, product, selectedOptions) {
  // Показываем уведомление об успешной оплате
  showSuccess(`✅ Оплата прошла успешно! Заказ #${result.orderId}`);
  
  // Здесь можно добавить логику для:
  // - Сохранения заказа в базу данных
  // - Отправки уведомления пользователю
  // - Отправки данных в Telegram Bot API
  
  console.log('Платеж успешен:', {
    result,
    product,
    selectedOptions
  });
  
  // НЕ перенаправляем на главную - пользователь остается на странице товара
  // Если нужно перенаправление, раскомментируйте код ниже:
  // setTimeout(() => {
  //   window.location.href = '/';
  // }, 3000);
}

// Показ сообщений
function showMessage(message, type = 'info') {
  // Создаем уведомление
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Добавляем стили
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
  
  // Удаляем через 3 секунды
  setTimeout(() => {
    notification.style.animation = 'slideOutUp 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function showSuccess(message) {
  showMessage(message, 'success');
}

function showError(message) {
  showMessage(message, 'error');
}

// Функции для работы с модальным окном оформления
function openCheckoutModal(product, selectedOptions, finalPrice) {
  if (!modalManager) {
    return;
  }
  
  // Используем функцию formatPrice для единообразного форматирования
  const formattedPriceHTML = formatPrice(finalPrice);
  
  const paymentData = {
    productTitle: product.title,
    variant: selectedOptions.variant,
    period: selectedOptions.period,
    edition: selectedOptions.edition,
    price: formattedPriceHTML,
    amount: finalPrice
  };
  
  modalManager.openModal('checkout-modal', { paymentData });
}



// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем ModalManager
  modalManager = new ModalManager();
  
  const productId = getUrlParameter('product');
  console.log('DEBUG: productId from URL:', productId);
  console.log('DEBUG: window.location.search:', window.location.search);
  console.log('DEBUG: window.location.href:', window.location.href);
  
  const product = getProductById(productId);
  console.log('DEBUG: product found:', !!product, product?.title);
  
  renderProduct(product);
  // На странице товара всегда есть нижние действия — показываем подложку
  document.body.classList.add('has-checkout-bar');
  
  // Инициализируем компоненты после отрисовки продукта
  if (product) {
    // Небольшая задержка чтобы DOM успел обновиться
    setTimeout(() => {
      initCheckoutPanel();
      initPayment(); // Добавляем инициализацию оплаты
      // Синхронизируем состояние кнопок в соответствии с выбранными опциями
      refreshBuyControls(product);
      // Кнопка "Подробнее" — открывает модалку с описанием услуги
      const moreBtn = document.getElementById('more-info-btn');
      if (moreBtn) {
        moreBtn.addEventListener('click', () => {
          if (!modalManager) return;
          const info = {
            title: 'Подробнее об услуге',
            description: product.serviceDescription || product.description || 'Описание услуги будет доступно позже.',
            icon: '💼',
            iconClass: 'service'
          };
          modalManager.openModal('label-modal', { labelInfo: info });
        });
      }
    }, 100);
  }
  
  // Если продукт не найден, перенаправляем на главную
  if (!product) {
    setTimeout(() => {
      navigate('index.html');
    }, 2000);
  }
});