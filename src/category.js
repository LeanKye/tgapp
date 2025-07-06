import './style.css'
import { getProductsByCategory, categoryData, getAllProducts, formatPrice, formatPriceCard } from './products-data.js'
import TelegramWebApp from './telegram-webapp.js'

// Отключаем анимации до полной загрузки страницы
document.documentElement.classList.add('preload');

// Включаем анимации после полной загрузки
window.addEventListener('load', () => {
  document.documentElement.classList.remove('preload');
});

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

    // Настраиваем Telegram WebApp для страницы категории
    this.setupTelegramWebApp();

    // Инициализируем компоненты
    this.initMenu();
    this.initSearch();
    this.loadCategoryData();
  }

  initMenu() {
    const menuButton = document.getElementById('menu-button');
    const closeMenuButton = document.getElementById('close-menu-button');
    const menu = document.getElementById('menu');
    const menuOverlay = document.getElementById('menu-overlay');

    const toggleMenu = () => {
      const isClosing = !menu.classList.contains('menu-closed');
      
      menu.classList.toggle('menu-closed');
      menuOverlay.classList.toggle('menu-closed');
      
      // Управление прокруткой страницы
      if (isClosing) {
        document.body.style.overflow = '';
      } else {
        document.body.style.overflow = 'hidden';
      }
    };

    const closeMenu = () => {
      menu.classList.add('menu-closed');
      menuOverlay.classList.add('menu-closed');
      document.body.style.overflow = '';
    };

    if (menuButton) menuButton.addEventListener('click', toggleMenu);
    if (closeMenuButton) closeMenuButton.addEventListener('click', toggleMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    // Закрытие меню клавишей Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.classList.contains('menu-closed')) {
        closeMenu();
      }
    });

    // Навигация по категориям из меню
    const menuItems = document.querySelectorAll('.menu-item[data-category]');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const category = item.getAttribute('data-category');
        // Если мы уже на странице этой категории, просто закрываем меню
        if (category === this.currentCategory) {
          closeMenu();
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

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      searchTimeout = setTimeout(() => {
        if (query.length === 0) {
          this.hideSearchDropdown();
          this.showAllProducts();
        } else {
          this.performSearch(query);
        }
      }, 300);
    });

    // Скрываем dropdown при клике вне поиска
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.hideSearchDropdown();
      }
    });
  }

  performSearch(query) {
    const searchResults = this.currentProducts.filter(product =>
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );

    this.filteredProducts = searchResults;
    this.displayProducts(searchResults);

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
  }

  hideSearchDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
    }
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

  setupTelegramWebApp() {
    if (!window.telegramWebApp.isInTelegram()) {
      console.log('Приложение запущено не в Telegram');
      return;
    }

    // Показываем кнопку "Назад" на странице категории
    window.telegramWebApp.setupBackButton(() => {
      // Возвращаемся на главную страницу при нажатии кнопки "Назад"
      window.location.href = 'index.html';
    });
    
    // Скрываем главную кнопку на странице категории
    window.telegramWebApp.hideMainButton();
  }
}

// Инициализируем страницу категории
new CategoryPage(); 