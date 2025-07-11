import './style.css'
import { getProductById, formatPrice, formatPriceSimple } from './products-data.js'

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
      openModal(label);
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
  const tabsContainer = document.querySelector('.tabs');
  
  // Устанавливаем содержимое по умолчанию (описание) обернутое в анимированный контейнер
  tabsContent.innerHTML = `<div class="tabs-content-inner fade-in">${product.description}</div>`;
  
  // Устанавливаем начальное положение полосочки
  tabsContainer.setAttribute('data-active', '0');
  
  // Добавляем обработчики для переключения табов
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      // Убираем активный класс у всех табов
      tabs.forEach(t => t.classList.remove('tab-selected'));
      // Добавляем активный класс к текущему табу
      tab.classList.add('tab-selected');
      
      // Обновляем положение полосочки
      tabsContainer.setAttribute('data-active', index.toString());
      
      // Плавно обновляем содержимое с анимацией
      smoothUpdateTabContent(tabsContent, index === 0 ? product.description : product.systemRequirements);
    });
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
    let currentX = 0;
    let isDragging = false;
    let startTime = 0;
    let touchBlocked = false; // Блокируем новые touch события во время анимации
    
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
      currentX = startX;
      isDragging = true;
      startTime = Date.now();
      wrapper.style.transition = 'none';
    }
    
    function handleTouchMove(e) {
      if (!isDragging || isTransitioning || touchBlocked) return;
      
      currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      const currentTransform = -currentIndex * 100;
      const newTransform = currentTransform + (deltaX / slider.offsetWidth) * 100;
      
      wrapper.style.transform = `translateX(${newTransform}%)`;
    }
    
    function handleTouchEnd() {
      if (!isDragging || isTransitioning || touchBlocked) return;
      
      isDragging = false;
      touchBlocked = true; // Блокируем новые touch события
      wrapper.style.transition = 'transform 0.3s ease';
      
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
      
      // Разблокируем touch события через небольшую задержку
      setTimeout(() => {
        touchBlocked = false;
        startX = 0;
        currentX = 0;
        startTime = 0;
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
          currentX = 0;
          startTime = 0;
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

// Функции для работы с модальными окнами
function getLabelInfo(labelText) {
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

function createModal() {
  if (document.getElementById('label-modal')) {
    return;
  }

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
}

function openModal(labelText) {
  createModal();

  const modal = document.getElementById('label-modal');
  const icon = document.getElementById('modal-icon');
  const title = document.getElementById('modal-title');
  const text = document.getElementById('modal-text');

  const labelInfo = getLabelInfo(labelText);
  
  // Обновляем содержимое модального окна
  icon.textContent = labelInfo.icon;
  icon.className = `modal-icon ${labelInfo.iconClass}`;
  title.textContent = labelInfo.title;
  text.textContent = labelInfo.description;

  // Сохраняем текущую позицию скролла
  const scrollY = window.scrollY;
  
  // Блокируем прокрутку страницы и фиксируем позицию
  document.body.classList.add('modal-open');
  document.body.style.top = `-${scrollY}px`;

  // Показываем модальное окно
  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('label-modal');
  if (!modal) return;

  // Получаем сохраненную позицию скролла
  const scrollY = document.body.style.top;
  
  // Убираем блокировку прокрутки и фиксацию позиции
  document.body.classList.remove('modal-open');
  document.body.style.top = '';

  // Восстанавливаем позицию скролла
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }

  // Скрываем модальное окно
  modal.classList.remove('show');
}

function initModal() {
  createModal();

  const modal = document.getElementById('label-modal');
  const closeBtn = document.getElementById('modal-close');

  // Закрытие по кнопке
  closeBtn.addEventListener('click', closeModal);

  // Закрытие по клику на фон
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Закрытие по клавише Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
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
      initCheckoutPanel();
      initModal();
    }, 100);
  }
  
  // Если продукт не найден, перенаправляем на главную
  if (!product) {
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
});