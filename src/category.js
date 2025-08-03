import './style.css'
import { getProductsByCategory, categoryData, getAllProducts, formatPrice, formatPriceCard } from './products-data.js'

class CategoryPage {
  constructor() {
    this.currentCategory = null;
    this.currentProducts = [];
    this.filteredProducts = [];
    this.init();
  }

  init() {
    // Получаем категорию из URL
    const urlParams = new URLSearchParams(window.location.search);
    this.currentCategory = urlParams.get('category');
    
    if (!this.currentCategory) {
      // Если категория не указана, перенаправляем на главную
      window.location.href = 'index.html';
      return;
    }

    // Инициализируем компоненты
    this.initMenu();
    this.initSearch();
    this.loadCategoryData();
  }

  initMenu() {
    const menuButton = document.getElementById('menu-button');
    this.menu = document.getElementById('menu');
    const menuOverlay = document.getElementById('menu-overlay');

    // Функция для позиционирования меню относительно хедера
    const positionMenuRelativeToHeader = () => {
      const headerContainer = document.querySelector('.header-container');
      if (headerContainer) {
        const headerRect = headerContainer.getBoundingClientRect();
        const headerBottom = headerRect.bottom;
        
        // Устанавливаем позицию меню относительно нижней границы хедера
        this.menu.style.top = `${headerBottom + 8}px`; // 8px отступ от хедера
      }
    };

    const toggleMenu = () => {
      const isClosing = !this.menu.classList.contains('menu-closed');
      
      // Если открываем меню и поиск активен, закрываем поиск
      if (!isClosing && this.isSearchActive) {
        this.deactivateSearch();
      }
      
      this.menu.classList.toggle('menu-closed');
      menuOverlay.classList.toggle('menu-closed');
      
      // Позиционируем меню относительно хедера
      if (!isClosing) {
        positionMenuRelativeToHeader();
      }
      
      // Управление прокруткой страницы
      if (isClosing) {
        document.body.style.overflow = '';
      } else {
        document.body.style.overflow = 'hidden';
      }
    };

    // Сохраняем функцию closeMenu как метод класса
    this.closeMenu = () => {
      this.menu.classList.add('menu-closed');
      menuOverlay.classList.add('menu-closed');
      // Сбрасываем позицию меню
      this.menu.style.top = '';
      document.body.style.overflow = '';
    };

    if (menuButton) menuButton.addEventListener('click', toggleMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', this.closeMenu);

    // Закрытие меню при клике на хедер (кроме самой кнопки меню)
    const headerContainer = document.querySelector('.header-container');
    if (headerContainer) {
      headerContainer.addEventListener('click', (e) => {
        // Если клик не на кнопку меню и меню открыто
        if (!e.target.closest('#menu-button') && !this.menu.classList.contains('menu-closed')) {
          this.closeMenu();
        }
      });
    }

    // Закрытие меню клавишей Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.menu.classList.contains('menu-closed')) {
        this.closeMenu();
      }
    });

    // Обновляем позицию меню при скролле, если оно открыто
    document.addEventListener('scroll', () => {
      if (!this.menu.classList.contains('menu-closed')) {
        positionMenuRelativeToHeader();
      }
    });

    // Обновляем позицию меню при изменении размера окна, если оно открыто
    window.addEventListener('resize', () => {
      if (!this.menu.classList.contains('menu-closed')) {
        positionMenuRelativeToHeader();
      }
    });

    // Навигация по категориям из меню
    const menuItems = document.querySelectorAll('.menu-item[data-category]');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const category = item.getAttribute('data-category');
        // Если мы уже на странице этой категории, просто закрываем меню
        if (category === this.currentCategory) {
          this.closeMenu();
        } else {
          window.location.href = `category.html?category=${encodeURIComponent(category)}`;
        }
      });
    });
  }



  initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-dropdown');

    if (!searchInput) return;

    let searchTimeout;
    this.isSearchActive = false;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      searchTimeout = setTimeout(() => {
        if (query.length === 0) {
          this.hideSearchDropdown();
        } else {
          this.performSearch(query);
        }
      }, 300);
    });

    // Активируем поиск при фокусе
    searchInput.addEventListener('focus', () => {
      this.activateSearch();
    });

    // Скрываем dropdown при клике вне поиска
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container') && !e.target.closest('.header-container')) {
        this.hideSearchDropdown();
        if (this.isSearchActive) {
          this.deactivateSearch();
        }
      }
    });
    
    // Обработчик для закрытия поиска при клике на оверлей
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay) {
      searchOverlay.addEventListener('click', () => {
        this.deactivateSearch();
      });
    }
    
    // Обработчик для закрытия поиска при клике на хедер (кроме самого поисковика)
    const headerContainer = document.querySelector('.header-container');
    if (headerContainer) {
      headerContainer.addEventListener('click', (e) => {
        // Если клик не на сам поисковик и поиск активен
        if (!e.target.closest('.search-container') && this.isSearchActive) {
          this.deactivateSearch();
        }
      });
    }
    
    // Обработчик для скролла - если пользователь пытается скроллить, закрываем поиск
    document.addEventListener('wheel', (e) => {
      if (this.isSearchActive) {
        // Разрешаем скролл внутри search-dropdown
        if (e.target.closest('.search-dropdown')) {
          return;
        }
        e.preventDefault();
        this.deactivateSearch();
      }
    }, { passive: false });
    
    // Обработчик для touch событий на мобильных устройствах
    document.addEventListener('touchmove', (e) => {
      if (this.isSearchActive) {
        // Разрешаем скролл внутри search-dropdown
        if (e.target.closest('.search-dropdown')) {
          return;
        }
        e.preventDefault();
        this.deactivateSearch();
      }
    }, { passive: false });
  
  // Обработчик для блокировки всех кликов при активном поиске
  document.addEventListener('click', (e) => {
    if (this.isSearchActive) {
      // Разрешаем клики только внутри header-container (включая поиск)
      if (!e.target.closest('.header-container')) {
        e.preventDefault();
        e.stopPropagation();
        this.deactivateSearch();
      }
    }
  }, { capture: true });
  }

  performSearch(query) {
    const searchResults = this.currentProducts.filter(product =>
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );

    this.filteredProducts = searchResults;

    if (searchResults.length > 0) {
      this.showSearchDropdown(searchResults.slice(0, 5)); // Показываем до 5 результатов
    } else {
      this.showNoSearchResults();
    }
  }

  showSearchDropdown(products) {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '';
    
    products.forEach(product => {
      const suggestion = this.createSearchSuggestion(product);
      dropdown.appendChild(suggestion);
    });

    dropdown.classList.add('show');
    
    // Сбрасываем стили блокировки скролла для dropdown с результатами
    dropdown.style.overflow = '';
    dropdown.style.touchAction = '';
  }

  createSearchSuggestion(product) {
    const suggestion = document.createElement('div');
    suggestion.className = 'search-suggestion';
    
    let priceHTML = `<span class="search-suggestion-price">${formatPriceCard(product.price)}</span>`;
    if (product.oldPrice) {
      priceHTML = `<span class="search-suggestion-price">${formatPriceCard(product.price)} <span class="category-product-price-old">${formatPriceCard(product.oldPrice, '₽', true)}</span></span>`;
    }

    suggestion.innerHTML = `
      <img src="${product.images[0]}" alt="${product.title}" />
      <div class="search-suggestion-content">
        <div class="search-suggestion-title">${product.title}</div>
        <div class="search-suggestion-category">${product.category}</div>
        ${priceHTML}
      </div>
    `;

    suggestion.addEventListener('click', () => {
      window.location.href = `product.html?product=${product.id}`;
    });

    return suggestion;
  }

  showNoSearchResults() {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '<div class="no-results">Товары не найдены</div>';
    dropdown.classList.add('show');
    
    // Блокируем скролл для dropdown когда показывается "Товары не найдены"
    dropdown.style.overflow = 'hidden';
    dropdown.style.touchAction = 'none';
    
    // Добавляем обработчик клика для сброса поиска
    const noResultsElement = dropdown.querySelector('.no-results');
    if (noResultsElement) {
      noResultsElement.addEventListener('click', () => {
        this.deactivateSearch(); // Полностью закрываем поиск с затемнением
      });
      
      // Блокируем скролл для элемента "Товары не найдены" на мобильных устройствах
      noResultsElement.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
      
      noResultsElement.addEventListener('touchmove', (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
      
      noResultsElement.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
    }
  }

  hideSearchDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
      
      // Сбрасываем стили блокировки скролла
      dropdown.style.overflow = '';
      dropdown.style.touchAction = '';
    }
  }

  activateSearch() {
    // Закрываем меню если оно открыто
    if (this.menu && !this.menu.classList.contains('menu-closed')) {
      this.closeMenu();
    }
    
    this.isSearchActive = true;
    document.body.classList.add('search-active');
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay) {
      searchOverlay.classList.add('show');
    }
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
      searchContainer.classList.add('search-active');
    }
  }

  deactivateSearch() {
    this.isSearchActive = false;
    document.body.classList.remove('search-active');
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay) {
      searchOverlay.classList.remove('show');
    }
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
      searchContainer.classList.remove('search-active');
    }
    this.hideSearchDropdown();
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = '';
      searchInput.blur();
    }
    // Убеждаемся, что все товары категории отображаются
    this.displayProducts(this.currentProducts);
  }

  showAllProducts() {
    this.displayProducts(this.currentProducts);
  }

  loadCategoryData() {
    // Получаем данные категории
    const category = categoryData[this.currentCategory];
    if (!category) {
      // Если категория не найдена, перенаправляем на главную
      window.location.href = 'index.html';
      return;
    }

    // Обновляем заголовок страницы
    document.title = `${category.name} - App`;
    
    // Обновляем заголовок категории
    const titleElement = document.getElementById('category-title');
    
    if (titleElement) {
      titleElement.textContent = category.name;
    }

    // Загружаем товары категории
    this.currentProducts = getProductsByCategory(this.currentCategory);
    this.displayProducts(this.currentProducts);
  }

  displayProducts(products) {
    const container = document.getElementById('category-products');
    const noProductsElement = document.getElementById('no-products');
    
    if (!container) return;

    // Очищаем контейнер
    container.innerHTML = '';

    if (products.length === 0) {
      // Показываем сообщение об отсутствии товаров
      if (noProductsElement) {
        noProductsElement.style.display = 'block';
      }
      return;
    }

    // Скрываем сообщение об отсутствии товаров
    if (noProductsElement) {
      noProductsElement.style.display = 'none';
    }

    // Создаем карточки товаров
    products.forEach(product => {
      const card = this.createProductCard(product);
      container.appendChild(card);
    });
  }

  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'category-product-card';
    
    let priceHTML = `<span class="category-product-price-current">${formatPriceCard(product.price)}</span>`;
    if (product.oldPrice) {
      priceHTML += `<span class="category-product-price-old">${formatPriceCard(product.oldPrice, '₽', true)}</span>`;
    }
    
    card.innerHTML = `
      <img src="${product.images[0]}" alt="${product.title}" />
      <div class="category-product-title">${product.title}</div>
      <div class="category-product-category">${product.category}</div>
      <div class="category-product-price">${priceHTML}</div>
    `;
    
    // Добавляем обработчик клика для перехода на страницу товара
    card.addEventListener('click', () => {
      window.location.href = `product.html?product=${product.id}`;
    });
    
    return card;
  }
}

// Класс для управления блокировкой кликов при открытом меню или поиске
class ClickBlocker {
  constructor() {
    this.isMenuOpen = false;
    this.isSearchOpen = false;
    this.blockedElements = new Set();
    this.init();
  }

  init() {
    // Отслеживаем изменения в меню
    const menu = document.getElementById('menu');
    if (menu) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            this.isMenuOpen = !menu.classList.contains('menu-closed');
            this.updateBlockState();
          }
        });
      });
      observer.observe(menu, { attributes: true });
    }

    // Отслеживаем изменения в поиске
    const searchDropdown = document.getElementById('search-dropdown');
    if (searchDropdown) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            this.isSearchOpen = searchDropdown.classList.contains('show');
            this.updateBlockState();
          }
        });
      });
      observer.observe(searchDropdown, { attributes: true });
    }
  }

  updateBlockState() {
    const shouldBlock = this.isMenuOpen || this.isSearchOpen;
    
    if (shouldBlock) {
      this.blockClicks();
    } else {
      this.unblockClicks();
    }
  }

  blockClicks() {
    // Блокируем клики по карточкам товаров
    const productCards = document.querySelectorAll('.category-product-card, .category-card');
    productCards.forEach(card => {
      if (!this.blockedElements.has(card)) {
        card.style.pointerEvents = 'none';
        this.blockedElements.add(card);
      }
    });
  }

  unblockClicks() {
    // Разблокируем клики по карточкам товаров
    this.blockedElements.forEach(card => {
      card.style.pointerEvents = '';
    });
    this.blockedElements.clear();
  }
}

// Инициализируем страницу категории
document.addEventListener('DOMContentLoaded', () => {
  new CategoryPage();
  const clickBlocker = new ClickBlocker();
}); 