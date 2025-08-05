import './style.css'
import { getProductById, formatPrice, formatPriceSimple, formatPriceCard } from './products-data.js'
import ModalManager from './modal-manager.js'



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
    
    // Добавляем обработчик клика по лейблу
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
    
    // Добавляем обработчик для автоматического скролла
    input.addEventListener('change', () => {
      if (input.checked) {
        scrollToSelectedButton(container, label);
      }
    });
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
        // Добавляем автоматический скролл к выбранной кнопке
        scrollToSelectedButton(container, label);
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
        // Добавляем автоматический скролл к выбранной кнопке
        scrollToSelectedButton(container, label);
      }
    });
  });
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
  function collapseCheckout(showSelection = false) {
    isExpanded = false;
    
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
    setTimeout(() => {
      variantGroup.classList.remove('expanded', 'collapsing');
    }, 300); // Длительность анимации collapsing
    
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
  
  // Для infinite loop клонируем первый и последний слайды
  if (slides.length > 1) {
    // Клонируем последний слайд и добавляем в начало
    const lastSlideClone = slides[slides.length - 1].cloneNode(true);
    lastSlideClone.classList.add('cloned');
    wrapper.insertBefore(lastSlideClone, wrapper.firstChild);
    
    // Клонируем первый слайд и добавляем в конец
    const firstSlideClone = slides[0].cloneNode(true);
    firstSlideClone.classList.add('cloned');
    wrapper.appendChild(firstSlideClone);
    
    // Обновляем список слайдов
    slides = document.querySelectorAll('.swiper-slide');
  }
  
  let currentIndex = 1; // Начинаем с первого реального слайда (после клона)
  let isTransitioning = false;
  const totalSlides = slides.length;
  const realSlidesCount = totalSlides - 2; // Исключаем 2 клона
  
  // Устанавливаем начальную позицию на первый реальный слайд
  wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
  wrapper.style.transition = 'transform 0.3s ease';
  
  // Помечаем слайдер как инициализированный
  slider.classList.add('slider-initialized');
  
  // Функция для перехода к слайду
  function goToSlide(index) {
    if (isTransitioning) return;
    
    isTransitioning = true;
    currentIndex = index;
    
    // Обновляем позицию слайдера
    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    setTimeout(() => {
      // Обрабатываем loop переходы
      if (currentIndex === 0) {
        // Если мы на клоне последнего слайда, мгновенно переходим к реальному последнему
        wrapper.style.transition = 'none';
        currentIndex = realSlidesCount;
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        setTimeout(() => {
          wrapper.style.transition = 'transform 0.3s ease';
        }, 10);
      } else if (currentIndex === totalSlides - 1) {
        // Если мы на клоне первого слайда, мгновенно переходим к реальному первому
        wrapper.style.transition = 'none';
        currentIndex = 1;
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        setTimeout(() => {
          wrapper.style.transition = 'transform 0.3s ease';
        }, 10);
      }
      
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
    
    function handleTouchStart(e) {
      // Блокируем новые touch события если идет анимация
      if (isTransitioning || touchBlocked) {
        e.preventDefault();
        return;
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
        const currentTransform = -currentIndex * 100;
        const newTransform = currentTransform + (deltaX / slider.offsetWidth) * 100;
        
        wrapper.style.transform = `translateX(${newTransform}%)`;
        e.preventDefault(); // Блокируем скролл только для горизонтальных свайпов
      }
      // Для вертикальных свайпов позволяем браузеру обрабатывать событие нормально
    }
    
    function handleTouchEnd() {
      if (!isDragging || isTransitioning || touchBlocked) return;
      
      isDragging = false;
      touchBlocked = true; // Блокируем новые touch события
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
            // Свайп вправо - предыдущий слайд
            goToSlide(currentIndex - 1);
          } else {
            // Свайп влево - следующий слайд
            goToSlide(currentIndex + 1);
          }
        } else {
          // Возвращаем слайд на место
          wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
      } else {
        // Если это был вертикальный свайп, просто возвращаем слайд на место
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
      }
      
      // Разблокируем touch события через небольшую задержку
      setTimeout(() => {
        touchBlocked = false;
        startX = 0;
        startY = 0;
        currentX = 0;
        currentY = 0;
        startTime = 0;
        swipeDirection = null;
        swipeStarted = false;
      }, 350); // Чуть больше времени анимации
    }
    
    // Добавляем обработчик для отмены touch событий
    function handleTouchCancel() {
      if (isDragging) {
        isDragging = false;
        wrapper.style.transition = 'transform 0.3s ease';
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        setTimeout(() => {
          touchBlocked = false;
          startX = 0;
          startY = 0;
          currentX = 0;
          currentY = 0;
          startTime = 0;
          swipeDirection = null;
          swipeStarted = false;
        }, 350);
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
  modalManager.openModal('label-modal', { labelInfo });
}

// Функции для работы с оплатой
function initPayment() {
  const buyButton = document.querySelector('.add-to-cart');
  if (!buyButton) return;

  buyButton.addEventListener('click', handleBuyClick);
}

// Обработчик клика по кнопке "Купить"
async function handleBuyClick() {
  const productId = getUrlParameter('product');
  const product = getProductById(productId);
  
  if (!product) {
    modalManager?.showError('Товар не найден');
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
  
  if (period && period.price) {
    basePrice = period.price;
  }
  
  if (edition && edition.price) {
    basePrice = edition.price;
  }
  
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
  const product = getProductById(productId);
  
  renderProduct(product);
  
  // Инициализируем компоненты после отрисовки продукта
  if (product) {
    // Небольшая задержка чтобы DOM успел обновиться
    setTimeout(() => {
      initCheckoutPanel();
      initPayment(); // Добавляем инициализацию оплаты
    }, 100);
  }
  
  // Если продукт не найден, перенаправляем на главную
  if (!product) {
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
});