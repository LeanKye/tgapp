 

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
  
  'photoroom': {
    id: 'photoroom',
    title: 'Photoroom',
    category: 'Дизайн',
    price: 600,
    oldPrice: 800,
    discount: '-25%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия', 'Нужен VPN'],
    labelColors: ['orange', 'violet', 'blue'],
    images: [
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Активация' },
      { id: 'variant-2', name: 'Подписка' },
      { id: 'variant-3', name: 'Ключ' }
    ],
    periods: [
      { id: 'period-week', name: 'Неделя', price: 200 },
      { id: 'period-1', name: '1 мес', price: 600 },
      { id: 'period-3', name: '3 мес', price: 1500 },
      { id: 'period-12', name: '12 мес', price: 5000 }
    ],
    editions: [
      { id: 'edition-1', name: 'Standard', price: 600,
        displayTitle: 'Photoroom — Standard',
        images: [
          'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=600&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=400&fit=crop&crop=center'
        ]
      },
      { id: 'edition-2', name: 'Plus', price: 900,
        displayTitle: 'Photoroom — Plus',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&crop=center'
        ]
      },
      { id: 'edition-3', name: 'Pro', price: 1200,
        displayTitle: 'Photoroom — Pro',
        images: [
          'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=600&h=400&fit=crop&crop=center'
        ]
      }
    ],
    description: `Photoroom — инструмент для быстрой обработки и вырезания фона с фото. Подходит для маркетплейсов и соцсетей.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Современный браузер (Chrome/Firefox/Safari)<br>
      • Стабильное интернет-соединение
    `
  },
  
  'midjorney-ai': {
    id: 'midjorney-ai',
    title: 'Midjorney AI',
    category: 'Нейросети',
    price: 900,
    oldPrice: 1200,
    discount: '-25%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия', 'Нужен VPN'],
    labelColors: ['orange', 'violet', 'blue'],
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Активация' },
      { id: 'variant-2', name: 'Подписка' }
    ],
    periods: [
      { id: 'period-week', name: 'Неделя', price: 300 },
      { id: 'period-1', name: '1 мес', price: 900 },
      { id: 'period-3', name: '3 мес', price: 2500 },
      { id: 'period-12', name: '12 мес', price: 8500 }
    ],
    editions: [
      { id: 'edition-1', name: 'Basic', price: 900, displayTitle: 'Midjorney — Basic' },
      { id: 'edition-2', name: 'Standard', price: 1500, displayTitle: 'Midjorney — Standard' },
      { id: 'edition-3', name: 'Pro', price: 2500, displayTitle: 'Midjorney — Pro' }
    ],
    description: `Midjorney AI — нейросеть для генерации изображений по текстовым подсказкам.`,
    systemRequirements: `
      <strong>Требования:</strong><br>
      • Современный браузер<br>
      • Интернет-соединение
    `
  },
  
  'chatgpt-ai': {
    id: 'chatgpt-ai',
    title: 'ChatGPT AI',
    category: 'Нейросети',
    price: 800,
    oldPrice: 1100,
    discount: '-27%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Подписка' },
      { id: 'variant-2', name: 'Активация' }
    ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 800 },
      { id: 'period-3', name: '3 мес', price: 2100 },
      { id: 'period-12', name: '12 мес', price: 7200 }
    ],
    editions: [
      { id: 'edition-1', name: 'Plus', price: 800, displayTitle: 'ChatGPT — Plus' },
      { id: 'edition-2', name: 'Team', price: 1300, displayTitle: 'ChatGPT — Team' }
    ],
    description: `ChatGPT — помощник на базе ИИ для повседневных задач, генерации текста и кода.`,
    systemRequirements: `
      <strong>Требования:</strong><br>
      • Браузер и интернет
    `
  },
  
  'canva': {
    id: 'canva',
    title: 'Canva',
    category: 'Дизайн',
    price: 700,
    oldPrice: 1000,
    discount: '-30%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Подписка' },
      { id: 'variant-2', name: 'Активация' }
    ],
    periods: [
      { id: 'period-week', name: 'Неделя', price: 250 },
      { id: 'period-1', name: '1 мес', price: 700 },
      { id: 'period-3', name: '3 мес', price: 1800 },
      { id: 'period-12', name: '12 мес', price: 6000 }
    ],
    editions: [
      { id: 'edition-1', name: 'Pro', price: 700, displayTitle: 'Canva — Pro' },
      { id: 'edition-2', name: 'Teams', price: 1200, displayTitle: 'Canva — Teams' }
    ],
    description: `Canva — удобный редактор для дизайна с тысячами шаблонов.`,
    systemRequirements: `
      <strong>Требования:</strong><br>
      • Современный браузер и интернет
    `
  },
  
  'runway-ai': {
    id: 'runway-ai',
    title: 'Runway AI',
    category: 'Нейросети',
    price: 1200,
    oldPrice: 1500,
    discount: '-20%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1512427691650-5fed1f2e5d37?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [
      { id: 'variant-1', name: 'Подписка' }
    ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 1200 },
      { id: 'period-3', name: '3 мес', price: 3300 }
    ],
    editions: [
      { id: 'edition-1', name: 'Standard', price: 1200 },
      { id: 'edition-2', name: 'Pro', price: 2200 }
    ],
    description: `Runway — инструменты ИИ для генерации и редактирования видео/изображений.`,
    systemRequirements: `Браузер, интернет.`
  },
  
  'suno-ai': {
    id: 'suno-ai',
    title: 'Suno AI',
    category: 'Нейросети',
    price: 900,
    oldPrice: 1200,
    discount: '-25%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 900 },
      { id: 'period-3', name: '3 мес', price: 2400 }
    ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 900 } ],
    description: `Suno AI — генерация музыки с помощью ИИ.`,
    systemRequirements: `Браузер, интернет.`
  },
  
  'leonardo-ai': {
    id: 'leonardo-ai',
    title: 'Leonardo AI',
    category: 'Нейросети',
    price: 850,
    oldPrice: 1100,
    discount: '-23%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 850 },
      { id: 'period-3', name: '3 мес', price: 2200 }
    ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 850 } ],
    description: `Leonardo AI — генерация изображений и ассетов.`,
    systemRequirements: `Браузер, интернет.`
  },
  
  'recraft-ai': {
    id: 'recraft-ai',
    title: 'Recraft AI',
    category: 'Нейросети',
    price: 750,
    oldPrice: 980,
    discount: '-23%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 750 },
      { id: 'period-3', name: '3 мес', price: 2000 }
    ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 750 } ],
    description: `Recraft — векторная и 3D‑генерация с помощью ИИ.`,
    systemRequirements: `Браузер, интернет.`
  },
  
  'cursor-ai': {
    id: 'cursor-ai',
    title: 'Cursor AI',
    category: 'Нейросети',
    price: 990,
    oldPrice: 1300,
    discount: '-24%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 990 },
      { id: 'period-3', name: '3 мес', price: 2700 }
    ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 990 } ],
    description: `Cursor — ИИ‑редактор кода с автодополнением и агентами.`,
    systemRequirements: `Браузер, интернет.`
  },
  
  'flo': {
    id: 'flo',
    title: 'Flo',
    category: 'Подписки',
    price: 500,
    oldPrice: 700,
    discount: '-29%',
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 500 },
      { id: 'period-12', name: '12 мес', price: 4500 }
    ],
    editions: [ { id: 'edition-1', name: 'Premium', price: 500 } ],
    description: `Flo — подписка на расширенные функции приложения.`,
    systemRequirements: `iOS/Android или веб‑доступ.`
  },
  
  'inshot': {
    id: 'inshot',
    title: 'InShot',
    category: 'Дизайн',
    price: 450,
    oldPrice: 650,
    discount: '-31%',
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 450 },
      { id: 'period-12', name: '12 мес', price: 3800 }
    ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 450 } ],
    description: `InShot — мобильный видеоредактор с эффектами и фильтрами.`,
    systemRequirements: `iOS/Android.`
  },
  
  'airbrush': {
    id: 'airbrush',
    title: 'Airbrush',
    category: 'Дизайн',
    price: 550,
    oldPrice: 800,
    discount: '-31%',
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 550 },
      { id: 'period-12', name: '12 мес', price: 4200 }
    ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 550 } ],
    description: `Airbrush — ретушь и улучшение фото.`,
    systemRequirements: `iOS/Android или веб.`
  },
  
  'gopro-quik': {
    id: 'gopro-quik',
    title: 'GoPro Quik',
    category: 'Дизайн',
    price: 600,
    oldPrice: 850,
    discount: '-29%',
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 600 },
      { id: 'period-12', name: '12 мес', price: 5000 }
    ],
    editions: [ { id: 'edition-1', name: 'Premium', price: 600 } ],
    description: `GoPro Quik — подписка на функции редактирования и облако.`,
    systemRequirements: `iOS/Android.`
  },
  
  'photomechanic': {
    id: 'photomechanic',
    title: 'PhotoMechanic',
    category: 'Дизайн',
    price: 1800,
    oldPrice: 2200,
    discount: '-18%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-3', name: 'Ключ' } ],
    periods: [ { id: 'period-12', name: 'Лицензия', price: 1800 } ],
    editions: [ { id: 'edition-1', name: 'Single', price: 1800 } ],
    description: `PhotoMechanic — быстрый просмотр, отбор и метаданные для фото.`,
    systemRequirements: `Windows/macOS.`
  },
  
  'yazio-ai': {
    id: 'yazio-ai',
    title: 'Yazio AI',
    category: 'Нейросети',
    price: 450,
    oldPrice: 600,
    discount: '-25%',
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 450 },
      { id: 'period-12', name: '12 мес', price: 3600 }
    ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 450 } ],
    description: `Yazio AI — персональные рекомендации по питанию на базе ИИ.`,
    systemRequirements: `iOS/Android.`
  },
  
  'krea-ai': {
    id: 'krea-ai',
    title: 'Krea AI',
    category: 'Нейросети',
    price: 700,
    oldPrice: 950,
    discount: '-26%',
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 700 },
      { id: 'period-3', name: '3 мес', price: 1800 }
    ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 700 } ],
    description: `Krea AI — генерация и редактирование изображений в реальном времени.`,
    systemRequirements: `Браузер, интернет.`
  },
  
  'office': {
    id: 'office',
    title: 'Office',
    category: 'Microsoft',
    price: 900,
    oldPrice: 1300,
    discount: '-31%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-3', name: 'Ключ' } ],
    periods: [ { id: 'period-12', name: 'Лицензия', price: 900 } ],
    editions: [ { id: 'edition-1', name: 'Home/Student', price: 900 } ],
    description: `Microsoft Office — ключ/активация офисного пакета.`,
    systemRequirements: `Windows/macOS.`
  },
  
  'windows': {
    id: 'windows',
    title: 'Windows',
    category: 'Microsoft',
    price: 1100,
    oldPrice: 1600,
    discount: '-31%',
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-3', name: 'Ключ' } ],
    periods: [ { id: 'period-12', name: 'Лицензия', price: 1100 } ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 1100 } ],
    description: `Windows — лицензионный ключ активации.`,
    systemRequirements: `PC с совместимыми характеристиками.`
  },
  
  'claude-ai': {
    id: 'claude-ai',
    title: 'Claude AI',
    category: 'Нейросети',
    price: 950,
    oldPrice: 1250,
    discount: '-24%',
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 950 },
      { id: 'period-3', name: '3 мес', price: 2550 }
    ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 950 } ],
    description: `Claude — продвинутый ИИ‑ассистент для текста и анализа.`,
    systemRequirements: `Браузер, интернет.`
  },
  
  'freepik': {
    id: 'freepik',
    title: 'Freepik',
    category: 'Дизайн',
    price: 650,
    oldPrice: 900,
    discount: '-28%',
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 650 },
      { id: 'period-12', name: '12 мес', price: 5400 }
    ],
    editions: [ { id: 'edition-1', name: 'Premium', price: 650 } ],
    description: `Freepik — премиум‑доступ к стоковым ресурсам.`,
    systemRequirements: `Браузер, интернет.`
  },
  
  'spotify': {
    id: 'spotify',
    title: 'Spotify',
    category: 'Подписки',
    price: 399,
    oldPrice: 499,
    discount: '-20%',
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=400&fit=crop&crop=center'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 399 },
      { id: 'period-12', name: '12 мес', price: 3990 }
    ],
    editions: [
      { id: 'edition-1', name: 'Individual', price: 399 },
      { id: 'edition-2', name: 'Family', price: 699 }
    ],
    description: `Spotify — подписка на музыку без ограничений.`,
    systemRequirements: `iOS/Android/Windows/macOS или веб.`
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

// Автодобавление описания услуги и корректировка вариантов для всех товаров
Object.values(products).forEach(product => {
  const name = product.title || 'сервису';
  if (!product.serviceDescription) {
    product.serviceDescription = `Услуга по организации доступа к сервису ${name}.\nМы не продаём сам продукт и не являемся его правообладателями.\nНаша услуга включает: помощь в восстановлении доступа к учётной записи или подписке, рекомендации по самостоятельной активации, а также консультации и техническую поддержку.\nВсе условия использования самого сервиса ${name} определяются правообладателем и доступны на официальном сайте правообладателя.`;
  }

  // Убираем способ оформления "Ключ" и подставляем "Активация" по умолчанию при отсутствии вариантов
  if (Array.isArray(product.variants)) {
    product.variants = product.variants.filter(v => String(v?.name).trim() !== 'Ключ');
  }
  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    product.variants = [ { id: 'variant-1', name: 'Активация' } ];
  }
});

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