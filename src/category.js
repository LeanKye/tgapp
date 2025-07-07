import { getProductsByCategory, categoryData, formatPriceCard } from './products-data.js'
import { initCommonComponents, Utils } from './common.js'

class CategoryPage {
  constructor() {
    this.currentCategory = null;
    this.currentProducts = [];
    this.filteredProducts = [];
    this.init();
  }

  init() {
    // Получаем категорию из URL
    this.currentCategory = Utils.getUrlParameter('category');
    
    if (!this.currentCategory) {
      // Если категория не указана, перенаправляем на главную
      window.location.href = 'index.html';
      return;
    }

    // Инициализируем общие компоненты
    initCommonComponents();
    
    // Инициализируем специфичные для категории функции
    this.initCategorySearch();
    this.loadCategoryData();
  }

  // Специфичный поиск для страницы категории (поиск только в текущей категории)
  initCategorySearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      searchTimeout = setTimeout(() => {
        if (query.length === 0) {
          this.showAllProducts();
        } else {
          this.performCategorySearch(query);
        }
      }, 300);
    });
  }

  performCategorySearch(query) {
    const searchResults = this.currentProducts.filter(product =>
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );

    this.filteredProducts = searchResults;
    this.displayProducts(searchResults);
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
    Utils.setPageTitle(`${category.name} - App`);
    
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

// Инициализируем страницу категории
document.addEventListener('DOMContentLoaded', () => {
  new CategoryPage();
}); 