import './style.css'
import { getProductById, formatPrice, formatPriceSimple, formatPriceCard } from './products-data.js'
import ModalManager from './modal-manager.js'

function productTemplate() {
  return `
    <div class="product">
      <div class="product-cover">
        <div class="swiper">
          <div class="swiper-wrapper"></div>
        </div>
      </div>
      <div class="container">
        <div class="labels"></div>
        <h1 class="title">Загрузка...</h1>
        <div class="category text-gray">Загрузка...</div>
        <div class="price">
          <span class="price-value">Загрузка...</span>
          <span class="price-old text-gray" style="display: none;">0</span>
          <span class="price-discount" style="display: none;">0%</span>
          <div class="price-usdt text-gray">от 0.00 USDT</div>
          <div class="payment-methods">
            <img src="img/sbp.svg" alt="СБП" class="pm-icon pm-sbp" />
            <img src="img/mir.svg" alt="МИР" class="pm-icon pm-mir" />
          </div>
        </div>
      </div>
      <div class="container" id="checkout">
        <div class="checkout-header" id="checkout-toggle">
          <span id="checkout-header-text">Активация</span>
          <div class="checkout-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9L12 16L5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <button id="more-info-btn" class="checkout-more reset-Button" aria-label="Подробнее">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M11 11h2v5h-2z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div class="button-group variant-group" id="variant-group"></div>
        <div class="button-group period-group" id="period-group"></div>
        <div class="button-group edition-group" id="edition-group"></div>
      </div>
      <div class="container instruction">
        <div class="instruction-title">Перейти к просмотру</div>
        <div class="instruction-subtitle">Инструкция по установке</div>
      </div>
      <div class="container">
        <div class="tabs">
          <div class="tab tab-selected">Описание</div>
          <div class="tab">Системные требования</div>
        </div>
        <div class="tabs-content">Загрузка описания товара...</div>
      </div>
    </div>
    <button class="add-to-cart reset-Button">Добавить в корзину</button>
    <div class="bottom-actions-bg"></div>
  `;
}
 
// Универсальная навигация: используем стек AppNav при наличии
function navigate(path) {
  if (window.AppNav && typeof window.AppNav.go === 'function') {
    return window.AppNav.go(path);
  }
  const basePath = window.location.pathname.replace(/[^/]*$/, '');
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  window.location.href = basePath + normalized;
}



// Функция для получения параметров URL (fallback)
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Последняя выбранная конфигурация пользователя (per product) — для восстановления состояния без морфинга
function getLastConfigFromSession(productId) {
  try {
    const raw = sessionStorage.getItem('hooli_last_config_' + String(productId));
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return null;
    return {
      variantId: obj.variantId || null,
      periodId: obj.periodId || null,
      editionId: obj.editionId || null,
    };
  } catch { return null; }
}
function saveLastConfigToSession(productId, opts) {
  try {
    if (!opts) return;
    const payload = {
      variantId: opts.variantId || null,
      periodId: opts.periodId || null,
      editionId: opts.editionId || null,
    };
    sessionStorage.setItem('hooli_last_config_' + String(productId), JSON.stringify(payload));
  } catch {}
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

    // Fast-tap для лейблов (например, «Нужен VPN») с защитой от bounce-скролла
    let lx=0, ly=0, lt=0, lsy=0, lsx=0; const MOVEL=8, HOLDL=300;
    const openLabel=()=>{ openLabelModal(label); };
    const lpd=(e)=>{ lx=e.clientX; ly=e.clientY; lt=performance.now(); lsy=window.scrollY; lsx=window.scrollX; labelDiv.__moved=false; };
    const lpm=(e)=>{ if(!lt) return; if(Math.abs(e.clientX-lx)>MOVEL||Math.abs(e.clientY-ly)>MOVEL||Math.abs(window.scrollY-lsy)>0||Math.abs(window.scrollX-lsx)>0) labelDiv.__moved=true; };
    const lpu=()=>{ const dur=performance.now()-(lt||performance.now()); const ok=!labelDiv.__moved && dur<=HOLDL; lt=0; if(!ok) return; if(labelDiv.__fastTapLock) return; labelDiv.__fastTapLock=true; try { openLabel(); } finally { setTimeout(()=>{ labelDiv.__fastTapLock=false; }, 250);} };
    labelDiv.addEventListener('pointerdown', lpd, { passive: true });
    labelDiv.addEventListener('pointermove', lpm, { passive: true });
    labelDiv.addEventListener('pointerup', lpu, { passive: true });
    labelDiv.addEventListener('touchend', lpu, { passive: true });

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
  
  // Не рендерим нижнюю кнопку/контролы здесь.
  // Начальное состояние низа устанавливается в mountProduct, чтобы исключить «переключение».

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

    // Fast-tap с защитой от скролла/удержания
    let vx=0,vy=0,vt=0,scy=0,scx=0; const MOVE=8,HOLD=300;
    const vpd=(e)=>{ vx=e.clientX; vy=e.clientY; vt=performance.now(); scy=window.scrollY; scx=window.scrollX; label.__moved=false; };
    const vpm=(e)=>{ if(!vt) return; if(Math.abs(e.clientX-vx)>MOVE||Math.abs(e.clientY-vy)>MOVE||Math.abs(window.scrollY-scy)>0||Math.abs(window.scrollX-scx)>0) label.__moved=true; };
    const vpu=()=>{ const dur=performance.now()-(vt||performance.now()); const ok=!label.__moved && dur<=HOLD; vt=0; if(!ok) return; if(label.__fastTapLock) return; label.__fastTapLock=true; try{ if(!input.checked){ input.checked=true; try{ input.dispatchEvent(new Event('change',{bubbles:true})); }catch{} } } finally { setTimeout(()=>{ label.__fastTapLock=false; },300);} };
    label.addEventListener('pointerdown', vpd, { passive: true });
    label.addEventListener('pointermove', vpm, { passive: true });
    label.addEventListener('pointerup', vpu, { passive: true });
    label.addEventListener('touchend', vpu, { passive: true });
  });
}

function updatePeriods(product) {
  const container = document.querySelector('#period-group');
  container.innerHTML = '';
  container.classList.add('period-buttons');
  
  // Дефолт: если у товара есть период '1 мес' (id: period-1) — выбираем его, иначе первый по списку
  const hasMonthly = (product.periods || []).some(p => p.id === 'period-1');
  const defaultPeriodId = hasMonthly ? 'period-1' : (product.periods[0]?.id);

  product.periods.forEach((period, index) => {
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'period';
    input.id = period.id;
    input.value = period.id;
    if (period.id === defaultPeriodId) {
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

    // Fast-tap с защитой от скролла/удержания
    let px=0,py=0,pt=0,psy=0,psx=0; const MOVE2=8,HOLD2=300;
    const ppd=(e)=>{ px=e.clientX; py=e.clientY; pt=performance.now(); psy=window.scrollY; psx=window.scrollX; label.__moved=false; };
    const ppm=(e)=>{ if(!pt) return; if(Math.abs(e.clientX-px)>MOVE2||Math.abs(e.clientY-py)>MOVE2||Math.abs(window.scrollY-psy)>0||Math.abs(window.scrollX-psx)>0) label.__moved=true; };
    const ppu=()=>{ const dur=performance.now()-(pt||performance.now()); const ok=!label.__moved && dur<=HOLD2; pt=0; if(!ok) return; if(label.__fastTapLock) return; label.__fastTapLock=true; try{ if(!input.checked && !input.disabled){ input.checked=true; try{ input.dispatchEvent(new Event('change',{bubbles:true})); }catch{} } } finally { setTimeout(()=>{ label.__fastTapLock=false; },300);} };
    label.addEventListener('pointerdown', ppd, { passive: true });
    label.addEventListener('pointermove', ppm, { passive: true });
    label.addEventListener('pointerup', ppu, { passive: true });
    label.addEventListener('touchend', ppu, { passive: true });
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

    // Fast-tap с защитой от скролла/удержания
    let ex=0,ey=0,et=0,esy=0,esx=0; const MOVE3=8,HOLD3=300;
    const epd=(e)=>{ ex=e.clientX; ey=e.clientY; et=performance.now(); esy=window.scrollY; esx=window.scrollX; label.__moved=false; };
    const epm=(e)=>{ if(!et) return; if(Math.abs(e.clientX-ex)>MOVE3||Math.abs(e.clientY-ey)>MOVE3||Math.abs(window.scrollY-esy)>0||Math.abs(window.scrollX-esx)>0) label.__moved=true; };
    const epu=()=>{ const dur=performance.now()-(et||performance.now()); const ok=!label.__moved && dur<=HOLD3; et=0; if(!ok) return; if(label.__fastTapLock) return; label.__fastTapLock=true; try{ if(!input.checked){ input.checked=true; try{ input.dispatchEvent(new Event('change',{bubbles:true})); }catch{} } } finally { setTimeout(()=>{ label.__fastTapLock=false; },300);} };
    label.addEventListener('pointerdown', epd, { passive: true });
    label.addEventListener('pointermove', epm, { passive: true });
    label.addEventListener('pointerup', epu, { passive: true });
    label.addEventListener('touchend', epu, { passive: true });
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
  function activateTab(index) {
    // Убираем активный класс у всех табов
    tabs.forEach(t => t.classList.remove('tab-selected'));
    // Добавляем активный класс к текущему табу
    const tab = tabs[index];
    if (tab) {
      tab.classList.add('tab-selected');
    }
    
    // Обновляем положение полосочки
    tabsContainer.setAttribute('data-active', index.toString());
    updateTabIndicator(index);
    
    // Плавно обновляем содержимое с анимацией
    smoothUpdateTabContent(tabsContent, index === 0 ? product.description : product.systemRequirements);
  }

  tabs.forEach((tab, index) => {
    // Клик как резерв для десктопа/клавиатуры
    tab.addEventListener('click', () => {
      if (tab.__fastTapLock) return;
      activateTab(index);
    });

    // Fast-tap: работает во время bounce-скролла
    let tx = 0, ty = 0, tt = 0, ssy = 0, ssx = 0; const MOVE = 8, HOLD = 300;
    const pd = (e) => { tx = e.clientX; ty = e.clientY; tt = performance.now(); ssy = window.scrollY; ssx = window.scrollX; tab.__moved = false; };
    const pm = (e) => { if (!tt) return; if (Math.abs(e.clientX - tx) > MOVE || Math.abs(e.clientY - ty) > MOVE || Math.abs(window.scrollY - ssy) > 0 || Math.abs(window.scrollX - ssx) > 0) tab.__moved = true; };
    const pu = () => { const dur = performance.now() - (tt || performance.now()); const ok = !tab.__moved && dur <= HOLD; tt = 0; if (!ok) return; if (tab.__fastTapLock) return; tab.__fastTapLock = true; try { activateTab(index); } finally { setTimeout(() => { tab.__fastTapLock = false; }, 250); } };
    tab.addEventListener('pointerdown', pd, { passive: true });
    tab.addEventListener('pointermove', pm, { passive: true });
    tab.addEventListener('pointerup', pu, { passive: true });
    tab.addEventListener('touchend', pu, { passive: true });
  });
  
  // Обновляем позицию полосочки при изменении размера окна
  if (!window.__product_tabs_resize_attached) {
    window.__product_tabs_resize_attached = true;
    window.__product_tabs_resize_handler = () => {
      const activeIndex = parseInt(tabsContainer.getAttribute('data-active') || '0');
      updateTabIndicator(activeIndex);
    };
    window.addEventListener('resize', window.__product_tabs_resize_handler);
  }
  
  // Обновляем позицию полосочки при изменении ориентации устройства
  if (!window.__product_tabs_orient_attached) {
    window.__product_tabs_orient_attached = true;
    window.__product_tabs_orient_handler = () => {
      setTimeout(() => {
        const activeIndex = parseInt(tabsContainer.getAttribute('data-active') || '0');
        updateTabIndicator(activeIndex);
      }, 100);
    };
    window.addEventListener('orientationchange', window.__product_tabs_orient_handler);
  }
  
  // Обновляем позицию скролла в кнопках при изменении размера окна
  if (!window.__product_buttons_resize_attached) {
    window.__product_buttons_resize_attached = true;
    window.__product_buttons_resize_handler = () => {
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
              setTimeout(() => { scrollToSelectedButton(container, label); }, 50);
            }
          }
        }
      });
    };
    window.addEventListener('resize', window.__product_buttons_resize_handler);
  }
  
  // Обновляем позицию скролла в кнопках при изменении ориентации устройства
  if (!window.__product_buttons_orient_attached) {
    window.__product_buttons_orient_attached = true;
    window.__product_buttons_orient_handler = () => {
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
    };
    window.addEventListener('orientationchange', window.__product_buttons_orient_handler);
  }
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

  // Fast-tap для заголовка ("Выберите способ оформления") и стрелочки — надёжно во время bounce
  const toggleCheckout = () => {
    if (isAnimatingCheckout) return;
    if (isExpanded) { collapseCheckout(); } else { expandCheckout(); }
  };

  const attachFastTap = (el) => {
    if (!el) return;
    let sx=0, sy=0, st=0, ssy=0, ssx=0; const MOVE=8, HOLD=300;
    const pd=(e)=>{ sx=e.clientX; sy=e.clientY; st=performance.now(); ssy=window.scrollY; ssx=window.scrollX; el.__moved=false; };
    const pm=(e)=>{ if(!st) return; if(Math.abs(e.clientX-sx)>MOVE||Math.abs(e.clientY-sy)>MOVE||Math.abs(window.scrollY-ssy)>0||Math.abs(window.scrollX-ssx)>0) el.__moved=true; };
    const pu=()=>{ const dur=performance.now()-(st||performance.now()); const ok=!el.__moved && dur<=HOLD; st=0; if(!ok) return; if(el.__fastTapLock) return; el.__fastTapLock=true; try { toggleCheckout(); } finally { setTimeout(()=>{ el.__fastTapLock=false; }, 250);} };
    el.addEventListener('pointerdown', pd, { passive: true });
    el.addEventListener('pointermove', pm, { passive: true });
    el.addEventListener('pointerup', pu, { passive: true });
    el.addEventListener('touchend', pu, { passive: true });
  };

  attachFastTap(checkoutHeaderText);
  attachFastTap(checkoutArrow);
  
  // Добавляем обработчики к вариантам оформления
  function handleVariantSelection() {
    if (isExpanded) {
      collapseCheckout(true); // Показываем анимацию выбора
    }
  }
  
  // Используем event delegation для максимальной надежности
  variantGroup.addEventListener('click', function(e) {
    // Блокируем взаимодействие во время анимации открытия/закрытия
    if (isAnimatingCheckout) {
      try { e.preventDefault(); } catch {}
      try { e.stopPropagation(); } catch {}
      return;
    }
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
  // Fast-tap с защитой от скролла/удержания
  let bx=0,by=0,bt=0,bsy=0,bsx=0; const MOVEB=8,HOLDB=300;
  const bpd=(e)=>{ bx=e.clientX; by=e.clientY; bt=performance.now(); bsy=window.scrollY; bsx=window.scrollX; buyButton.__moved=false; };
  const bpm=(e)=>{ if(!bt) return; if(Math.abs(e.clientX-bx)>MOVEB||Math.abs(e.clientY-by)>MOVEB||Math.abs(window.scrollY-bsy)>0||Math.abs(window.scrollX-bsx)>0) buyButton.__moved=true; };
  const bpu=()=>{ const ok=!buyButton.__moved; bt=0; if(!ok) return; 
    // Разрешаем повторный тап во время морфинга (когда кнопка уже morphed)
    if (buyButton.__fastTapLock && !buyButton.classList.contains('morphed')) return; 
    // Разрешаем клик даже во время анимации морфинга
    buyButton.__fastTapLock=true; try {
    // Если кнопка в морфнутом состоянии — ведём в корзину
    if (buyButton.classList.contains('morphed')) {
      if (window.AppNav && typeof window.AppNav.go === 'function') {
        window.AppNav.go('cart.html');
      } else {
        const basePath = window.location.pathname.replace(/[^/]*$/, '');
        window.location.href = basePath + 'cart.html';
      }
    } else {
      handleAddToCartFromProduct();
    }
  } finally { setTimeout(()=>{ buyButton.__fastTapLock=false; }, 650);} };
  buyButton.addEventListener('pointerdown', bpd, { passive: true });
  buyButton.addEventListener('pointermove', bpm, { passive: true });
  buyButton.addEventListener('pointerup', bpu, { passive: true });
  // Для надёжности используем только pointer-события (без touchend во избежание дублей)
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

function renderBuyOrControls(product, animate = false) {
  const buyBtn = document.querySelector('.add-to-cart');
  const oldControls = document.querySelector('.product-cart-controls');
  
  // Проверяем наличие именно текущей конфигурации
  const selectedOptions = getSelectedOptions();
  const cartItem = selectedOptions ? getCartItem(product, selectedOptions) : null;
  
  // Если нет товара в корзине - показываем кнопку "Добавить в корзину"
  if (!cartItem) {
    if (oldControls) {
      // Анимированное скрытие контролов и показ кнопки
      if (animate) {
        // Мгновенно меняем текст, чтобы он был виден в процессе анимации
        if (buyBtn) buyBtn.textContent = 'Добавить в корзину';
        document.body.classList.add('cart-morph-reverse');
        // Блокируем кнопки количества на время анимации закрытия
        try { oldControls.setAttribute('data-animating', 'true'); } catch(e) {}
        // Синхронизируем завершение: ждём конец обеих анимаций
        let btnDone=false, ctrDone=false, cleaned=false;
        const cleanup=()=>{ if(cleaned) return; cleaned=true;
          try { buyBtn && buyBtn.removeEventListener('animationend', onBtnEnd, true); } catch(e) {}
          try { oldControls && oldControls.removeEventListener('animationend', onCtrEnd, true); } catch(e) {}
          if (buyBtn) buyBtn.classList.remove('morphed');
          document.body.classList.remove('cart-morph-reverse');
        };
        const onBtnEnd=(e)=>{ if(!e || e.animationName!=='morphToBlue') return; btnDone=true; if(ctrDone) cleanup(); };
        const onCtrEnd=(e)=>{ if(!e || e.animationName!=='slideOutToRight') return; ctrDone=true; try { oldControls.remove(); } catch(e) {} if(btnDone) cleanup(); };
        if (buyBtn) buyBtn.addEventListener('animationend', onBtnEnd, true);
        if (oldControls) oldControls.addEventListener('animationend', onCtrEnd, true);
        // Фолбэк на случай отсутствия событий
        setTimeout(()=>{ if(!ctrDone){ try{ oldControls.remove(); }catch(e){} ctrDone=true; } if(!btnDone){ btnDone=true; } cleanup(); }, 700);
      } else {
        oldControls.remove();
        if (buyBtn) {
          buyBtn.classList.remove('morphed');
          buyBtn.textContent = 'Добавить в корзину';
        }
      }
    }
    return;
  }

  // Если товар есть в корзине - показываем контролы
  if (!oldControls) {
    // Создаем контролы
    const controls = document.createElement('div');
    controls.className = 'product-cart-controls';
  controls.innerHTML = `
      <div class="qty-box">
        <button class="reset-Button qty-btn" data-action="dec">−</button>
        <span class="qty-value">${cartItem.qty || 1}</span>
        <button class="reset-Button qty-btn" data-action="inc">+</button>
      </div>
    `;
    
    if (animate && buyBtn) {
      // Помечаем активный морфинг, текст меняем сразу
      document.body.classList.add('cart-morph-active');
      buyBtn.classList.add('morphed');
      buyBtn.textContent = 'Перейти в корзину';

      // Добавляем контролы справа
      document.body.appendChild(controls);
      controls.classList.add('appearing');
      
      // Блокируем кнопки количества на время анимации
      controls.setAttribute('data-animating', 'true');

      // Снимаем флаг cart-morph-active по окончании анимаций
      const onEnd = (e) => {
        if (!e || !e.target || !e.animationName) return;
        if (e.animationName === 'morphToGreen' || e.animationName === 'slideInFromRight') {
          controls.classList.remove('appearing');
          document.body.classList.remove('cart-morph-active');
          buyBtn.removeEventListener('animationend', onEnd, true);
          controls.removeEventListener('animationend', onEnd, true);
          // Разблокируем кнопки после анимации
          controls.removeAttribute('data-animating');
        }
      };
      buyBtn.addEventListener('animationend', onEnd, true);
      controls.addEventListener('animationend', onEnd, true);
      
      // Также разблокируем через время на случай если анимация не сработает
      setTimeout(() => {
        controls.removeAttribute('data-animating');
      }, 450);
    } else {
      // Без анимации: кнопка остаётся слева, добавляем контролы справа
      if (buyBtn) {
        buyBtn.classList.add('morphed');
        buyBtn.textContent = 'Перейти в корзину';
      }
      document.body.appendChild(controls);
    }
    
    // Добавляем обработчики для новых контролов
    attachCartControlHandlers(controls, product);
  } else {
    // Обновляем количество в существующих контролах
    const qtyValue = oldControls.querySelector('.qty-value');
    if (qtyValue) {
      qtyValue.textContent = String(cartItem.qty || 1);
    }
  }
}

// Отдельная функция для навешивания обработчиков на контролы корзины
function attachCartControlHandlers(controls, product) {
  const clickHandler = (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    
    // Блокируем клики во время анимации выкатывания
    if (controls.getAttribute('data-animating') === 'true') return;
    
    const action = btn.getAttribute('data-action');
    const current = getCartItem(product, getSelectedOptions()) || { qty: 0 };
    let nextQty = current.qty || 1;
    if (action === 'inc') nextQty += 1;
    if (action === 'dec') nextQty -= 1;
    setCartItem(product, nextQty, getSelectedOptions());

    // Если удалили последний — анимированно вернуть кнопку «Купить»
    if (nextQty <= 0) {
      // Обратная анимация: сначала уводим контролы, затем расширяем кнопку
      if (!document.body.classList.contains('cart-morph-reverse')) document.body.classList.add('cart-morph-reverse');
      // Смена текста сразу, чтобы во время расширения был «Добавить в корзину»
      const buyBtn = document.querySelector('.add-to-cart');
      if (buyBtn) buyBtn.textContent = 'Добавить в корзину';
      renderBuyOrControls(product, true); // С анимацией
    } else {
      // Анимация изменения количества
      const qtyValue = controls.querySelector('.qty-value');
      qtyValue.classList.add('qty-bounce');
      qtyValue.textContent = String(nextQty);
      setTimeout(() => qtyValue.classList.remove('qty-bounce'), 200);
    }
  };
  
  // Fast-tap для −/+ с защитой от скролла/удержания, без троттлинга быстрых тапов
  let qx=0,qy=0,qt=0,qsy=0,qsx=0; const MOVEQ=8,HOLDQ=300;
  let lastTapAt=0, lastTapEl=null;
  let qDownBtn=null;
  const qpd=(e)=>{ const btn=e.target.closest('[data-action]'); if(!btn) return; qx=e.clientX; qy=e.clientY; qt=performance.now(); qsy=window.scrollY; qsx=window.scrollX; qDownBtn = btn; };
  const qpu=(e)=>{
    const btn=e.target.closest('[data-action]');
    if(!btn) return;
    
    // Блокируем быстрые тапы во время анимации выкатывания
    if (controls.getAttribute('data-animating') === 'true') return;
    
    const moved=Math.abs(e.clientX-qx)>MOVEQ||Math.abs(e.clientY-qy)>MOVEQ||Math.abs(window.scrollY-qsy)>0||Math.abs(window.scrollX-qsx)>0;
    const now=performance.now();
    qt=0;
    // Кнопка должна быть той же, что была под пальцем на pointerdown
    if (btn !== qDownBtn) { qDownBtn = null; return; }
    if(moved) { qDownBtn = null; return; }
    // Дедупликация возможных двойных событий, но без задержки быстрых последовательных тапов
    if(lastTapEl===btn && (now-lastTapAt)<80) return;
    lastTapEl=btn; lastTapAt=now;
    qDownBtn = null;
    clickHandler(e);
  };
  controls.addEventListener('pointerdown', qpd, { passive: true });
  controls.addEventListener('pointerup', qpu, { passive: true });
  controls.addEventListener('pointercancel', ()=>{ qt=0; qDownBtn=null; }, { passive: true });
}

function handleAddToCartFromProduct() {
  const productId = getUrlParameter('product');
  const product = getProductById(productId);
  if (!product) return;
  const selectedOptions = getSelectedOptions();
  const existing = getCartItem(product, selectedOptions || undefined);
  const qty = existing ? (existing.qty || 1) + 1 : 1;
  setCartItem(product, qty, selectedOptions || undefined);
  renderBuyOrControls(product, true); // С анимацией при первом добавлении
}

// Обновление состояния нижней кнопки/контролов в зависимости от выбранных опций
function refreshBuyControls(product) {
  const buyBtn = document.querySelector('.add-to-cart');
  const controls = document.querySelector('.product-cart-controls');
  const options = getSelectedOptions();
  const exists = options ? getCartItem(product, options) : null;
  // Сохраняем последнюю конфигурацию для восстановления при будущих переходах
  try { if (options) saveLastConfigToSession(product.id, options); } catch {}
  if (exists) {
    // Обеспечиваем наличие контролов и morphed-состояние кнопки (не скрываем её)
    if (!controls) renderBuyOrControls(product, false);
    if (buyBtn) {
      buyBtn.classList.add('morphed');
      buyBtn.textContent = 'Перейти в корзину';
      buyBtn.style.display = '';
    }
  } else {
    // Нет товара — убираем контролы и возвращаем кнопку в исходное состояние
    if (controls) controls.remove();
    if (buyBtn) {
      buyBtn.classList.remove('morphed');
      buyBtn.textContent = 'Добавить в корзину';
      buyBtn.style.display = '';
    }
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



// SPA mount/unmount
let __product_cleanup = [];

export async function mountProduct(appContainer, params = {}) {
  appContainer.innerHTML = productTemplate();
  // Инициализация ModalManager
  modalManager = new ModalManager();
  const productId = params?.product || getUrlParameter('product');
  const product = getProductById(productId);
  renderProduct(product);
  document.body.classList.add('has-checkout-bar');
  if (product) {
    // Подготовим стартовое состояние низа без видимого промежуточного состояния
    const buyBtn = document.querySelector('.add-to-cart');
    if (buyBtn) {
      try { buyBtn.style.display = 'none'; } catch {}
    }
    // 1) Параметры из URL имеют наивысший приоритет
    const urlVariant = getUrlParameter('variant');
    const urlPeriod = getUrlParameter('period');
    const urlEdition = getUrlParameter('edition');
    let appliedAny = false;
    if (urlVariant || urlPeriod || urlEdition) {
      try {
        if (urlVariant) {
          const v = document.querySelector(`input[name="variant"]#${CSS.escape(urlVariant)}`);
          if (v && !v.checked) { v.checked = true; v.dispatchEvent(new Event('change', { bubbles: true })); appliedAny = true; }
        }
        if (urlPeriod) {
          const p = document.querySelector(`input[name="period"]#${CSS.escape(urlPeriod)}`);
          if (p && !p.checked) { p.checked = true; p.dispatchEvent(new Event('change', { bubbles: true })); appliedAny = true; }
        }
        if (urlEdition) {
          const e = document.querySelector(`input[name="edition"]#${CSS.escape(urlEdition)}`);
          if (e && !e.checked) { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); appliedAny = true; }
        }
      } catch {}
    }
    // 2) Если из URL ничего не применили — берём последнюю конфигурацию из сессии
    if (!appliedAny) {
      const lastCfg = getLastConfigFromSession(product.id);
      if (lastCfg) {
        try {
          if (lastCfg.variantId) {
            const v = document.querySelector(`input[name="variant"]#${CSS.escape(lastCfg.variantId)}`);
            if (v && !v.checked) { v.checked = true; v.dispatchEvent(new Event('change', { bubbles: true })); appliedAny = true; }
          }
          if (lastCfg.editionId) {
            const e = document.querySelector(`input[name="edition"]#${CSS.escape(lastCfg.editionId)}`);
            if (e && !e.checked) { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); appliedAny = true; }
          }
        } catch {}
      }
    }
    // 3) Если нет ни URL, ни сессии — пробуем восстановить из корзины (первая подходящая позиция)
    if (!appliedAny) {
      const preItem = (() => {
        try {
          const items = JSON.parse(localStorage.getItem('hooli_cart') || '[]');
          const prefix = String(product.id) + '|';
          return items.find(i => String(i.id) === String(product.id) || String(i.id).startsWith(prefix));
        } catch { return null; }
      })();
      if (preItem) {
        try {
          if (preItem.variantId) {
            const v = document.querySelector(`input[name="variant"]#${CSS.escape(preItem.variantId)}`);
            if (v && !v.checked) { v.checked = true; v.dispatchEvent(new Event('change', { bubbles: true })); }
          }
          if (preItem.editionId) {
            const e = document.querySelector(`input[name="edition"]#${CSS.escape(preItem.editionId)}`);
            if (e && !e.checked) { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }
          }
        } catch {}
      }
    }
    // Теперь инициализируем панели и применяем итоговое состояние низа
    setTimeout(() => {
      initCheckoutPanel();
      initPayment();
      try { refreshBuyControls(product); } catch {}
      // Показать кнопку только если контролы не созданы
      const ctr = document.querySelector('.product-cart-controls');
      if (!ctr && buyBtn) {
        try { buyBtn.style.display = ''; } catch {}
      }
      const moreBtn = document.getElementById('more-info-btn');
      if (moreBtn) {
        let ix=0,iy=0,it=0,isy=0,isx=0; const MOVEI=8,HOLDI=300;
        const openInfo=()=>{
          if (!modalManager) return;
          const info = {
            title: 'Подробнее об услуге',
            description: product.serviceDescription || product.description || 'Описание услуги будет доступно позже.',
            icon: '💼',
            iconClass: 'service'
          };
          modalManager.openModal('label-modal', { labelInfo: info });
        };
        const ipd=(e)=>{ ix=e.clientX; iy=e.clientY; it=performance.now(); isy=window.scrollY; isx=window.scrollX; moreBtn.__moved=false; };
        const ipm=(e)=>{ if(!it) return; if(Math.abs(e.clientX-ix)>MOVEI||Math.abs(e.clientY-iy)>MOVEI||Math.abs(window.scrollY-isy)>0||Math.abs(window.scrollX-isx)>0) moreBtn.__moved=true; };
        const ipu=()=>{ const dur=performance.now()-(it||performance.now()); const ok=!moreBtn.__moved && dur<=HOLDI; it=0; if(!ok) return; if (moreBtn.__fastTapLock) return; moreBtn.__fastTapLock=true; try { openInfo(); } finally { setTimeout(()=>{ moreBtn.__fastTapLock=false; }, 300);} };
        moreBtn.addEventListener('pointerdown', ipd, { passive: true });
        moreBtn.addEventListener('pointermove', ipm, { passive: true });
        moreBtn.addEventListener('pointerup', ipu, { passive: true });
        moreBtn.addEventListener('touchend', ipu, { passive: true });
        __product_cleanup.push(() => {
          try { moreBtn.removeEventListener('pointerdown', ipd); } catch {}
          try { moreBtn.removeEventListener('pointermove', ipm); } catch {}
          try { moreBtn.removeEventListener('pointerup', ipu); } catch {}
          try { moreBtn.removeEventListener('touchend', ipu); } catch {}
        });
      }
    }, 100);
  } else {
    setTimeout(() => navigate('index.html'), 2000);
  }
}

export function unmountProduct() {
  try {
    document.body.classList.remove('has-checkout-bar');
    document.body.classList.remove('cart-morph-active');
    document.body.classList.remove('cart-morph-reverse');
  } catch {}
  try {
    const ctr = document.querySelector('.product-cart-controls');
    if (ctr && ctr.parentNode) ctr.parentNode.removeChild(ctr);
  } catch {}
  __product_cleanup.forEach((fn) => { try { fn(); } catch {} });
  __product_cleanup = [];
  // Снимаем глобальные обработчики окна, если устанавливали
  try {
    if (window.__product_tabs_resize_attached) {
      window.removeEventListener('resize', window.__product_tabs_resize_handler);
      delete window.__product_tabs_resize_handler;
      delete window.__product_tabs_resize_attached;
    }
    if (window.__product_tabs_orient_attached) {
      window.removeEventListener('orientationchange', window.__product_tabs_orient_handler);
      delete window.__product_tabs_orient_handler;
      delete window.__product_tabs_orient_attached;
    }
    if (window.__product_buttons_resize_attached) {
      window.removeEventListener('resize', window.__product_buttons_resize_handler);
      delete window.__product_buttons_resize_handler;
      delete window.__product_buttons_resize_attached;
    }
    if (window.__product_buttons_orient_attached) {
      window.removeEventListener('orientationchange', window.__product_buttons_orient_handler);
      delete window.__product_buttons_orient_handler;
      delete window.__product_buttons_orient_attached;
    }
  } catch {}
  const app = document.querySelector('#app');
  if (app) app.innerHTML = '';
}