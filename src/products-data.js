 

// База данных товаров
export const products = {
  'adobe-creative-cloud': {
    id: 'adobe-creative-cloud',
    title: 'Adobe Creative Cloud',
    category: 'Дизайн',
    price: 1000,
    oldPrice: 1500,
    discount: '-30%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия', 'Нужен VPN'],
    labelColors: ['orange', 'violet', 'blue'],
    images: [
      'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Активация' },
      { id: 'variant-2', name: 'Подписка' },
      { id: 'variant-3', name: 'Ключ' }
    ],
    periods: [
      { id: 'period-week', name: 'Неделя', price: 300 },
      { id: 'period-1', name: '1 мес', price: 1000 },
      { id: 'period-3', name: '3 мес', price: 2500 },
      { id: 'period-12', name: '12 мес', price: 8000 }
    ],
    editions: [
      { id: 'edition-1', name: 'Adobe Creative Cloud', price: 1000,
        displayTitle: 'Adobe Creative Cloud — Standard',
        images: [
          'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center'
        ]
      },
      { id: 'edition-2', name: 'Photoshop + Lightroom', price: 1500,
        displayTitle: 'Adobe Photoshop + Lightroom',
        images: [
          'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=400&fit=crop&crop=center'
        ]
      },
      { id: 'edition-3', name: 'Deluxe', price: 1990,
        displayTitle: 'Adobe Creative Cloud — Deluxe',
        images: [
          'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop&crop=center'
        ]
      }
    ],
    description: `Adobe Creative Cloud — это полный набор профессиональных приложений для творчества. 
    Включает Photoshop, Illustrator, InDesign, After Effects, Premiere Pro и многие другие инструменты 
    для дизайна, фотографии, видео и веб-разработки. Подписка дает доступ ко всем приложениям, 
    облачному хранилищу и дополнительным сервисам Adobe.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 (64-bit) или macOS 10.14<br>
      • Процессор: Intel Core i5 или AMD Ryzen 5<br>
      • ОЗУ: 8 ГБ (рекомендуется 16 ГБ)<br>
      • Место на диске: 4 ГБ для установки<br>
      • Разрешение экрана: 1280x800<br>
      • Интернет-соединение для активации
    `
  },
  
  'microsoft-office': {
    id: 'microsoft-office',
    title: 'Microsoft Office 365',
    category: 'Microsoft',
    price: 800,
    oldPrice: 1200,
    discount: '-33%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Активация' },
      { id: 'variant-2', name: 'Ключ' }
    ],
    periods: [
      { id: 'period-1', name: '1 месяц', price: 800 },
      { id: 'period-2', name: '6 месяцев', price: 4000 },
      { id: 'period-3', name: '12 месяцев', price: 7000 }
    ],
    editions: [
      { id: 'edition-1', name: 'Personal', price: 800 },
      { id: 'edition-2', name: 'Family', price: 1200 },
      { id: 'edition-3', name: 'Business', price: 1500 }
    ],
    description: `Microsoft Office 365 — это облачный пакет офисных приложений, включающий Word, Excel, 
    PowerPoint, Outlook и другие инструменты. Обеспечивает совместную работу в реальном времени, 
    облачное хранилище OneDrive и доступ к приложениям с любого устройства.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 или macOS 10.12<br>
      • Процессор: Intel Core i3 или AMD A4<br>
      • ОЗУ: 4 ГБ (рекомендуется 8 ГБ)<br>
      • Место на диске: 4 ГБ<br>
      • Разрешение экрана: 1024x768<br>
      • Интернет-соединение для активации и обновлений
    `
  },
}

// Функции выборки (изображения ТОВАРОВ оставляем как есть!)
export function getProductById(id) {
  return products[id] || null;
}

export function getAllProducts() {
  return Object.values(products);
}

export function getProductsByCategory(category) {
  return Object.values(products).filter(product => product.category === category);
}

// Функция для получения всех категорий
export function getAllCategories() {
  const categories = [...new Set(Object.values(products).map(product => product.category))];
  return categories;
}

// Функция для форматирования цен с разделителями тысяч
export function formatPrice(price, currency = '₽') {
  // Преобразуем число в строку и добавляем разделители тысяч
  const priceStr = price.toString();
  let formattedPrice = '';
  
  // Разбиваем число на разряды справа налево
  for (let i = priceStr.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      formattedPrice = '\u2009' + formattedPrice; // Тонкий пробел (thin space) между разрядами
    }
    formattedPrice = priceStr[i] + formattedPrice;
  }
  
  // Убираем пробел перед currency-separator - отступ будет через CSS
  return `<span class="formatted-price">${formattedPrice}<span class="currency-separator">${currency}</span></span>`;
}

// Функция для простого форматирования цен без разделителей (для кнопок)
export function formatPriceSimple(price, currency = '₽') {
  // Добавляем тонкий пробел (U+2009) как разделитель тысяч
  const priceStr = price.toString();
  let formattedPrice = '';
  for (let i = priceStr.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      formattedPrice = '\u2009' + formattedPrice;
    }
    formattedPrice = priceStr[i] + formattedPrice;
  }
  return `${formattedPrice}${currency}`;
}

// Функция для форматирования цен в карточках товаров (используем CSS для отступов)
export function formatPriceCard(price, currency = '₽', isOldPrice = false) {
  // Преобразуем число в строку и добавляем разделители тысяч
  const priceStr = price.toString();
  let formattedPrice = '';
  
  // Разбиваем число на разряды справа налево
  for (let i = priceStr.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      formattedPrice = '\u2009' + formattedPrice; // Тонкий пробел (thin space) между разрядами
    }
    formattedPrice = priceStr[i] + formattedPrice;
  }
  
  // Для перечеркнутой цены делаем так чтобы символ валюты не был перечеркнут
  if (isOldPrice) {
    return `<span class="formatted-price"><span style="text-decoration: line-through;">${formattedPrice}</span><span class="currency-separator">${currency}</span></span>`;
  }
  
  // Для обычной цены используем CSS для отступов
  return `<span class="formatted-price">${formattedPrice}<span class="currency-separator">${currency}</span></span>`;
}

// Изображения категорий указываем относительными путями к каталогу img/

// Данные баннеров для главной страницы
export const bannerData = [
  {
    id: 'banner-1',
    title: 'Скидки до 70%',
    subtitle: 'На популярные товары',
    category: 'Игры',
    action: 'category',
    actionParams: { category: 'Игры' },
    backgroundColor: '#6366f1',
    active: true // Первый баннер активен по умолчанию
  },
  {
    id: 'banner-2',
    title: 'Хиты продаж',
    subtitle: 'Самые покупаемые товары',
    category: 'Игры',
    action: 'category',
    actionParams: { category: 'Игры' },
    backgroundColor: '#ef4444',
    active: false
  },
  {
    id: 'banner-3',
    title: 'Подписки',
    subtitle: 'Выгодные предложения',
    category: 'Подписки',
    action: 'category',
    actionParams: { category: 'Подписки' },
    backgroundColor: '#06b6d4',
    active: false
  },
  {
    id: 'banner-4',
    title: 'Специальное предложение',
    subtitle: 'Ограниченное время',
    category: 'Adobe',
    action: 'category',
    actionParams: { category: 'Adobe' },
    backgroundColor: '#f59e0b',
    active: false
  }
];

// Данные категорий с изображениями и описаниями
export const categoryData = {
  'Дизайн': {
    name: 'Дизайн',
    description: 'Инструменты для графики и видео',
    image: 'img/design.png'
  },
  'Нейросети': {
    name: 'Нейросети',
    description: 'Искусственный интеллект и нейронные сети',
    image: 'img/ai.png'
  },
  'Microsoft': {
    name: 'Microsoft',
    description: 'Office и другие продукты Microsoft',
    image: 'img/microsoft.png'
  },
  'Игры': {
    name: 'Игры',
    description: 'Лучшие игры для PC и консолей',
    // В категориях используем локальное изображение, чтобы оно точно грузилось в Telegram WebApp
    image: 'img/games.svg'
  },
  'Подписки': {
    name: 'Подписки',
    description: 'Подписки на сервисы и программы',
    image: 'img/subscriptions.png'
  }
};