// База данных товаров
export const products = {
  'adobe-creative-cloud': {
    id: 'adobe-creative-cloud',
    title: 'Adobe Creative Cloud',
    category: 'Adobe',
    price: 1000,
    oldPrice: 1500,
    discount: '-30%',
    priceUSDT: 'от 26.90 USDT',
    labels: ['Гарантия', 'Лицензия', 'Нужен VPN'],
    labelColors: ['orange', 'violet', 'blue'],
    images: [
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Аккаунт' },
      { id: 'variant-2', name: 'Подписка' },
      { id: 'variant-3', name: 'Ключ' }
    ],
    periods: [
      { id: 'period-1', name: '1 месяц', price: 1000 },
      { id: 'period-2', name: '2 месяца', price: 1800, discount: 'Выгода 32%' },
      { id: 'period-3', name: '12 месяцев', price: 8000, discount: 'Выгода 32%' }
    ],
    editions: [
      { id: 'edition-1', name: 'Standard', price: 1000 },
      { id: 'edition-2', name: 'Premium', price: 1500 },
      { id: 'edition-3', name: 'Deluxe', price: 1990 }
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
    category: 'Подписки',
    price: 800,
    oldPrice: 1200,
    discount: '-33%',
    priceUSDT: 'от 21.50 USDT',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Аккаунт' },
      { id: 'variant-2', name: 'Ключ' }
    ],
    periods: [
      { id: 'period-1', name: '1 месяц', price: 800 },
      { id: 'period-2', name: '6 месяцев', price: 4000, discount: 'Выгода 17%' },
      { id: 'period-3', name: '12 месяцев', price: 7000, discount: 'Выгода 27%' }
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

  'cyberpunk-2077': {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    category: 'Игры',
    price: 1500,
    oldPrice: 2000,
    discount: '-25%',
    priceUSDT: 'от 40.30 USDT',
    labels: ['Гарантия'],
    labelColors: ['orange'],
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Steam' },
      { id: 'variant-2', name: 'Epic Games' },
      { id: 'variant-3', name: 'GOG' }
    ],
    periods: [
      { id: 'period-1', name: 'Навсегда', price: 1500 }
    ],
    editions: [
      { id: 'edition-1', name: 'Standard', price: 1500 },
      { id: 'edition-2', name: 'Deluxe', price: 2200 },
      { id: 'edition-3', name: 'Ultimate', price: 2990 }
    ],
    description: `Cyberpunk 2077 — приключенческая ролевая игра с открытым миром, 
    действие которой происходит в мегаполисе Найт-Сити, где власть, роскошь и модификации тела 
    ценятся выше всего. Вы играете за наёмника V, который гонится за уникальным имплантом — 
    ключом к бессмертию.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 64-bit<br>
      • Процессор: Intel Core i5-3570K / AMD FX-8310<br>
      • ОЗУ: 8 ГБ<br>
      • Видеокарта: NVIDIA GTX 780 / AMD Radeon RX 470<br>
      • DirectX: Версии 12<br>
      • Место на диске: 70 ГБ
    `
  },

  'photoshop': {
    id: 'photoshop',
    title: 'Adobe Photoshop',
    category: 'Adobe',
    price: 600,
    oldPrice: 900,
    discount: '-33%',
    priceUSDT: 'от 16.10 USDT',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Аккаунт' },
      { id: 'variant-2', name: 'Ключ' }
    ],
    periods: [
      { id: 'period-1', name: '1 месяц', price: 600 },
      { id: 'period-2', name: '6 месяцев', price: 3000, discount: 'Выгода 17%' },
      { id: 'period-3', name: '12 месяцев', price: 5500, discount: 'Выгода 24%' }
    ],
    editions: [
      { id: 'edition-1', name: 'Standard', price: 600 },
      { id: 'edition-2', name: 'Premium', price: 900 }
    ],
    description: `Adobe Photoshop — профессиональный графический редактор для создания и обработки растровых изображений. 
    Лидер в области цифровой обработки изображений с множеством инструментов для ретуши, коллажирования и создания цифрового искусства.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 (64-bit) или macOS 10.14<br>
      • Процессор: Intel Core i5 или AMD Ryzen 5<br>
      • ОЗУ: 8 ГБ (рекомендуется 16 ГБ)<br>
      • Место на диске: 4 ГБ<br>
      • Видеокарта: DirectX 12 или OpenGL 3.3
    `
  },

  'fifa-24': {
    id: 'fifa-24',
    title: 'FIFA 24',
    category: 'Игры',
    price: 2500,
    oldPrice: 3500,
    discount: '-29%',
    priceUSDT: 'от 67.10 USDT',
    labels: ['Гарантия'],
    labelColors: ['orange'],
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Steam' },
      { id: 'variant-2', name: 'Origin' },
      { id: 'variant-3', name: 'Epic Games' }
    ],
    periods: [
      { id: 'period-1', name: 'Навсегда', price: 2500 }
    ],
    editions: [
      { id: 'edition-1', name: 'Standard', price: 2500 },
      { id: 'edition-2', name: 'Ultimate', price: 3990 }
    ],
    description: `FIFA 24 — новейшая футбольная симуляция от EA Sports с улучшенной графикой, 
    реалистичной физикой мяча и обновленными составами команд. Включает режимы карьеры, 
    Ultimate Team и многопользовательские матчи онлайн.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 64-bit<br>
      • Процессор: Intel Core i5-6600K / AMD Ryzen 5 1600<br>
      • ОЗУ: 8 ГБ<br>
      • Видеокарта: NVIDIA GTX 1050 Ti / AMD Radeon RX 570<br>
      • DirectX: Версии 12<br>
      • Место на диске: 100 ГБ
    `
  },

  'chatgpt-plus': {
    id: 'chatgpt-plus',
    title: 'ChatGPT Plus',
    category: 'Нейросети',
    price: 1200,
    oldPrice: null,
    discount: null,
    priceUSDT: 'от 32.20 USDT',
    labels: ['Подписка'],
    labelColors: ['violet'],
    images: [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1676299081847-824916de030a?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1675557009904-e2c4b81e905b?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Подписка' }
    ],
    periods: [
      { id: 'period-1', name: '1 месяц', price: 1200 },
      { id: 'period-2', name: '3 месяца', price: 3200, discount: 'Выгода 11%' },
      { id: 'period-3', name: '12 месяцев', price: 11000, discount: 'Выгода 24%' }
    ],
    editions: [
      { id: 'edition-1', name: 'Plus', price: 1200 }
    ],
    description: `ChatGPT Plus — подписка на расширенную версию ChatGPT с доступом к модели GPT-4, 
    приоритетным обслуживанием и новейшим функциям. Идеально для профессиональной работы, 
    обучения и творческих задач.`,
    systemRequirements: `
      <strong>Системные требования:</strong><br>
      • Любое устройство с интернет-браузером<br>
      • Стабильное интернет-соединение<br>
      • Поддерживаемые браузеры: Chrome, Firefox, Safari, Edge<br>
      • Мобильное приложение для iOS и Android
    `
  },

  'midjourney': {
    id: 'midjourney',
    title: 'Midjourney',
    category: 'Нейросети',
    price: 800,
    oldPrice: 1000,
    discount: '-20%',
    priceUSDT: 'от 21.50 USDT',
    labels: ['Подписка', 'ИИ'],
    labelColors: ['violet', 'blue'],
    images: [
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Подписка' }
    ],
    periods: [
      { id: 'period-1', name: '1 месяц', price: 800 },
      { id: 'period-2', name: '3 месяца', price: 2200, discount: 'Выгода 8%' },
      { id: 'period-3', name: '12 месяцев', price: 8000, discount: 'Выгода 17%' }
    ],
    editions: [
      { id: 'edition-1', name: 'Basic', price: 800 },
      { id: 'edition-2', name: 'Standard', price: 1200 },
      { id: 'edition-3', name: 'Pro', price: 1800 }
    ],
    description: `Midjourney — это сервис генерации изображений с помощью искусственного интеллекта. 
    Создавайте потрясающие цифровые артворки, концепт-арты и иллюстрации просто описав их текстом. 
    Подходит для дизайнеров, художников и творческих людей.`,
         systemRequirements: `
       <strong>Системные требования:</strong><br>
       • Discord аккаунт<br>
       • Интернет-соединение<br>
       • Веб-браузер или Discord приложение<br>
       • Поддержка работы через бота в Discord
     `
   },

   'kaspersky-antivirus': {
     id: 'kaspersky-antivirus',
     title: 'Kaspersky Internet Security',
     category: 'Антивирусы',
     price: 900,
     oldPrice: 1200,
     discount: '-25%',
     priceUSDT: 'от 24.20 USDT',
     labels: ['Лицензия', 'Гарантия'],
     labelColors: ['violet', 'orange'],
     images: [
       'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&crop=center',
       'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&h=400&fit=crop&crop=center',
       'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop&crop=center'
     ],
     variants: [
       { id: 'variant-1', name: 'Ключ' },
       { id: 'variant-2', name: 'Аккаунт' }
     ],
     periods: [
       { id: 'period-1', name: '1 год', price: 900 },
       { id: 'period-2', name: '2 года', price: 1600, discount: 'Выгода 11%' },
       { id: 'period-3', name: '3 года', price: 2200, discount: 'Выгода 18%' }
     ],
     editions: [
       { id: 'edition-1', name: 'Antivirus', price: 900 },
       { id: 'edition-2', name: 'Internet Security', price: 1200 },
       { id: 'edition-3', name: 'Total Security', price: 1600 }
     ],
     description: `Kaspersky Internet Security — комплексная защита от вирусов, троянов, 
     шпионских программ и других угроз. Включает антивирус, файрвол, защиту от фишинга 
     и родительский контроль. Надежная защита для всех ваших устройств.`,
     systemRequirements: `
       <strong>Минимальные системные требования:</strong><br>
       • ОС: Windows 10/11, macOS 10.15, Android 6.0, iOS 12<br>
       • Процессор: Intel Pentium 1 ГГц<br>
       • ОЗУ: 2 ГБ<br>
       • Место на диске: 2,5 ГБ<br>
       • Интернет-соединение для активации и обновлений
     `
   }
};

// Функция для получения товара по ID
export function getProductById(id) {
  return products[id] || null;
}

// Функция для получения всех товаров
export function getAllProducts() {
  return Object.values(products);
}

// Функция для получения товаров по категории
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
      formattedPrice = '\u200A' + formattedPrice; // Волосяной пробел (самый узкий)
    }
    formattedPrice = priceStr[i] + formattedPrice;
  }
  
  // Добавляем валюту с отступом
  return `<span class="formatted-price">${formattedPrice}<span class="currency-separator">${currency}</span></span>`;
}

// Функция для простого форматирования цен с разделителями (для кнопок)
export function formatPriceSimple(price, currency = '₽') {
  // Преобразуем число в строку и добавляем волосяные пробелы как разделители
  const priceStr = price.toString();
  let formattedPrice = '';
  
  // Разбиваем число на разряды справа налево
  for (let i = priceStr.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      formattedPrice = '\u200A' + formattedPrice; // Волосяной пробел (самый узкий)
    }
    formattedPrice = priceStr[i] + formattedPrice;
  }
  
  // Возвращаем простую строку без HTML
  return `${formattedPrice}\u200A${currency}`;
}

// Данные категорий с изображениями и описаниями
export const categoryData = {
  'Adobe': {
    name: 'Adobe',
    description: 'Профессиональные инструменты для дизайна и творчества',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&crop=center'
  },
  'Нейросети': {
    name: 'Нейросети',
    description: 'Искусственный интеллект и нейронные сети',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center'
  },
  'Игры': {
    name: 'Игры',
    description: 'Лучшие игры для PC и консолей',
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop&crop=center'
  },
  'Подписки': {
    name: 'Подписки',
    description: 'Подписки на сервисы и программы',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop&crop=center'
  },
  'Антивирусы': {
    name: 'Антивирусы',
    description: 'Защита компьютера и данных',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=center'
  }
}; 