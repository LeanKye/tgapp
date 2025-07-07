// Общие компоненты для всех страниц
import { getAllProducts } from './products-data.js';

// Класс для управления меню
export class MenuManager {
  constructor() {
    this.menuButton = document.getElementById('menu-button');
    this.closeMenuButton = document.getElementById('close-menu-button');
    this.menu = document.getElementById('menu');
    this.menuOverlay = document.getElementById('menu-overlay');
    this.init();
  }

  init() {
    if (!this.menuButton || !this.menu) return;

    this.menuButton.addEventListener('click', () => this.toggleMenu());
    this.closeMenuButton?.addEventListener('click', () => this.toggleMenu());
    this.menuOverlay?.addEventListener('click', () => this.closeMenu());

    // Закрытие меню клавишей Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.menu.classList.contains('menu-closed')) {
        this.closeMenu();
      }
    });

    // Инициализация навигации по меню
    this.initMenuNavigation();
  }

  toggleMenu() {
    const isClosing = !this.menu.classList.contains('menu-closed');
    
    this.menu.classList.toggle('menu-closed');
    this.menuOverlay?.classList.toggle('menu-closed');
    
    // Управление прокруткой страницы
    if (isClosing) {
      document.body.style.overflow = '';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }

  closeMenu() {
    this.menu.classList.add('menu-closed');
    this.menuOverlay?.classList.add('menu-closed');
    document.body.style.overflow = '';
  }

  initMenuNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const categoryName = item.dataset.category || item.textContent.trim();
        window.location.href = `category.html?category=${encodeURIComponent(categoryName)}`;
      });
    });
  }
}

// Класс для управления поиском
export class SearchManager {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.searchDropdown = document.getElementById('search-dropdown');
    this.selectedIndex = -1;
    this.products = [];
    this.filteredProducts = [];
    this.init();
  }

  init() {
    if (!this.searchInput || !this.searchDropdown) return;

    this.products = getAllProducts();
    
    this.searchInput.addEventListener('input', (e) => this.handleInput(e.target.value));
    this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.searchInput.addEventListener('focus', () => this.handleFocus());
    this.searchInput.addEventListener('blur', () => this.handleBlur());

    // Закрытие выпадающего списка при клике вне его
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.hideDropdown();
      }
    });
  }

  handleInput(query) {
    if (query.length < 2) {
      this.hideDropdown();
      return;
    }

    this.performSearch(query);
  }

  performSearch(query) {
    const lowerQuery = query.toLowerCase();
    this.filteredProducts = this.products.filter(product => 
      product.title.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    );

    this.selectedIndex = -1;
    
    if (this.filteredProducts.length > 0) {
      this.showResults();
    } else {
      this.showNoResults();
    }
  }

  showResults() {
    this.searchDropdown.innerHTML = '';
    
    this.filteredProducts.slice(0, 8).forEach((product, index) => {
      const suggestion = this.createSuggestion(product, index);
      this.searchDropdown.appendChild(suggestion);
    });

    this.showDropdown();
  }

  createSuggestion(product, index) {
    const suggestion = document.createElement('div');
    suggestion.className = 'search-suggestion';
    suggestion.dataset.index = index;
    
    suggestion.innerHTML = `
      <img src="${product.images[0]}" alt="${product.title}" />
      <div class="search-suggestion-content">
        <div class="search-suggestion-title">${product.title}</div>
        <div class="search-suggestion-category">${product.category}</div>
        <div class="search-suggestion-price">${product.price} ₽</div>
      </div>
    `;
    
    suggestion.addEventListener('click', () => this.selectProduct(product));
    
    return suggestion;
  }

  showNoResults() {
    this.searchDropdown.innerHTML = '<div class="no-results">Товары не найдены</div>';
    this.showDropdown();
  }

  selectProduct(product) {
    window.location.href = `product.html?product=${product.id}`;
  }

  handleKeydown(e) {
    const suggestions = this.searchDropdown.querySelectorAll('.search-suggestion');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, suggestions.length - 1);
        this.updateSelection();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection();
        break;
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0 && this.filteredProducts[this.selectedIndex]) {
          this.selectProduct(this.filteredProducts[this.selectedIndex]);
        }
        break;
      case 'Escape':
        this.hideDropdown();
        this.searchInput.blur();
        break;
    }
  }

  updateSelection() {
    const suggestions = this.searchDropdown.querySelectorAll('.search-suggestion');
    
    suggestions.forEach((suggestion, index) => {
      suggestion.classList.toggle('selected', index === this.selectedIndex);
    });
  }

  handleFocus() {
    if (this.searchInput.value.length >= 2) {
      this.performSearch(this.searchInput.value);
    }
  }

  handleBlur() {
    // Небольшая задержка для обработки клика по результату поиска
    setTimeout(() => {
      this.hideDropdown();
    }, 200);
  }

  showDropdown() {
    this.searchDropdown.classList.add('show');
  }

  hideDropdown() {
    this.searchDropdown.classList.remove('show');
  }
}

// Класс для управления модальными окнами
export class ModalManager {
  constructor() {
    this.currentModal = null;
    this.init();
  }

  init() {
    // Обработчик для кнопок закрытия модальных окон
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay') || 
          e.target.classList.contains('modal-understand-btn') ||
          e.target.closest('.modal-close')) {
        this.closeModal();
      }
    });

    // Закрытие модального окна по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentModal) {
        this.closeModal();
      }
    });
  }

  showModal(type, title, content) {
    // Создаем модальное окно
    const modal = this.createModal(type, title, content);
    
    // Добавляем в конец body (не в контейнер, чтобы избежать трансформаций)
    document.body.appendChild(modal);
    
    this.currentModal = modal;
    
    // Показываем модальное окно с анимацией
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  createModal(type, title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    const iconClass = type === 'guarantee' ? 'guarantee' : 
                      type === 'license' ? 'license' : 'vpn';
    
    const iconSymbol = type === 'guarantee' ? '✓' : 
                       type === 'license' ? '📄' : '🔒';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title-container">
            <div class="modal-icon ${iconClass}">
              ${iconSymbol}
            </div>
            <h3>${title}</h3>
          </div>
        </div>
        <div class="modal-body">
          <p>${content}</p>
        </div>
        <div class="modal-footer">
          <button class="modal-understand-btn">Понятно</button>
        </div>
      </div>
    `;
    
    return modal;
  }

  closeModal() {
    if (!this.currentModal) return;
    
    this.currentModal.classList.remove('show');
    this.currentModal.classList.add('hide');
    
    setTimeout(() => {
      if (this.currentModal && this.currentModal.parentNode) {
        this.currentModal.parentNode.removeChild(this.currentModal);
      }
      this.currentModal = null;
    }, 300);
  }
}

// Класс для управления переключателями
export class ToggleSwitches {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.slider = null;
    this.inputs = [];
    this.labels = [];
    this.init();
  }

  init() {
    if (!this.container) return;

    this.slider = this.container.querySelector('.toggle-switch-slider');
    this.inputs = Array.from(this.container.querySelectorAll('input[type="radio"]'));
    this.labels = Array.from(this.container.querySelectorAll('label'));
    
    if (!this.slider || this.inputs.length === 0) return;

    this.inputs.forEach((input, index) => {
      input.addEventListener('change', () => {
        if (input.checked) {
          this.moveSlider(index);
          this.updateLabels(index);
        }
      });
    });

    // Инициализация позиции слайдера и стилей
    const checkedIndex = this.inputs.findIndex(input => input.checked);
    if (checkedIndex !== -1) {
      this.moveSlider(checkedIndex);
      this.updateLabels(checkedIndex);
    }

    // Обновляем позицию при изменении размера окна
    const resizeHandler = () => {
      const currentCheckedIndex = this.inputs.findIndex(input => input.checked);
      if (currentCheckedIndex !== -1) {
        this.moveSlider(currentCheckedIndex);
      }
    };

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('orientationchange', () => {
      setTimeout(resizeHandler, 100);
    });
  }

  moveSlider(index) {
    // Получаем реальные размеры для точного позиционирования
    const containerWidth = this.container.offsetWidth;
    const padding = 6; // 3px с каждой стороны
    const availableWidth = containerWidth - padding;
    const buttonWidth = availableWidth / 3;
    
    // Рассчитываем позицию в пикселях относительно левого края контейнера
    const translateXPx = index * buttonWidth;
    
    // Применяем плавную анимацию перекатывания
    this.slider.style.transform = `translateX(${translateXPx}px)`;
    this.slider.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  }

  updateLabels(activeIndex) {
    this.labels.forEach((label, index) => {
      if (index === activeIndex) {
        label.classList.add('active-toggle');
        label.classList.remove('inactive-toggle');
      } else {
        label.classList.add('inactive-toggle');
        label.classList.remove('active-toggle');
      }
    });
  }
}

// Общие утилиты
export class Utils {
  static formatPrice(price, currency = '₽', strikethrough = false) {
    if (typeof price !== 'number') return price;
    
    const formattedPrice = price.toLocaleString('ru-RU');
    const priceText = strikethrough ? 
      `<span class="formatted-price"><s>${formattedPrice}</s> <span class="currency-separator">${currency}</span></span>` :
      `<span class="formatted-price">${formattedPrice} <span class="currency-separator">${currency}</span></span>`;
    
    return priceText;
  }

  static getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  static setPageTitle(title) {
    document.title = title;
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Автоматическая инициализация общих компонентов
export function initCommonComponents() {
  // Инициализируем только если элементы есть на странице
  const menuButton = document.getElementById('menu-button');
  const searchInput = document.getElementById('search-input');
  const toggleSwitches = document.getElementById('ps-plus-switches');

  if (menuButton) {
    new MenuManager();
  }

  if (searchInput) {
    new SearchManager();
  }

  if (toggleSwitches) {
    // Добавляем небольшую задержку для корректной инициализации
    setTimeout(() => {
      new ToggleSwitches('ps-plus-switches');
    }, 100);
  }

  // Инициализируем менеджер модальных окон
  new ModalManager();
} 