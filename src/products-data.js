 

// База данных товаров
export const products = {
  'adobe-creative-cloud': {
    id: 'adobe-creative-cloud',
    title: 'Adobe Creative Cloud',
    category: 'Дизайн',
    price: 1890,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия', 'Нужен VPN'],
    labelColors: ['orange', 'violet', 'blue'],
    images: [
      'img/adobecreativecloud.webp'
    ],
    variants: [
      { id: 'variant-1', name: 'Активация' },
      { id: 'variant-2', name: 'Подписка' }
    ],
    periods: [
      { id: 'period-week', name: 'Неделя', price: 500 },
      { id: 'period-1', name: '1 мес', price: 1890 },
      { id: 'period-3', name: '3 мес', price: 4500 },
      { id: 'period-12', name: '12 мес', price: 16000 }
    ],
    editions: [
      { id: 'edition-1', name: 'Adobe Creative Cloud', price: 1890,
        displayTitle: 'Adobe Creative Cloud — Полный пакет',
        images: [
          'img/adobecreativecloud.webp'
        ],
        periodPricing: {
          'period-week': 500,
          'period-1': 1890,
          'period-3': 4500,
          'period-12': 16000
        }
      },
      { id: 'edition-2', name: 'Photoshop + Lightroom', price: 1290,
        displayTitle: 'Adobe Photoshop + Lightroom',
        images: [
          'img/adobecreativecloud.webp'
        ],
        periodPricing: {
          'period-1': 1290,
          'period-3': 2990,
          'period-12': 10500
        }
      }
    ],
    description: `Adobe Creative Cloud — это профессиональная экосистема приложений и сервисов для работы с графикой, фото, видео, 3D и веб‑дизайном. Подходит дизайнерам, видеографам, маркетологам, художникам и контент‑креаторам.<br><br>
    <strong>Особенности:</strong><br>
    • Более 20 приложений в одной подписке (Photoshop, Illustrator, After Effects, Lightroom, Premiere Pro и др.)<br>
    • Доступ к Adobe Fonts и библиотекам стоковых ресурсов<br>
    • Интеграция с облачным хранилищем Creative Cloud<br>
    • Поддержка совместной работы в реальном времени<br>
    • Полная синхронизация проектов между устройствами`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Windows: Windows 10 (64‑bit), версия 1903+<br>
      • macOS: macOS 10.14+<br>
      • Процессор: Intel Core i5 или AMD Ryzen 5<br>
      • ОЗУ: 8 ГБ (рекомендуется 16 ГБ)<br>
      • Место на диске: от 4 ГБ для установки<br>
      • Интернет: требуется для активации и обновлений
    `
  },
  
  'photoroom': {
    id: 'photoroom',
    title: 'Photoroom',
    category: 'Дизайн',
    price: 690,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия', 'Нужен VPN'],
    labelColors: ['orange', 'violet', 'blue'],
    images: [
      'img/photoroom.webp'
    ],
    variants: [
      { id: 'variant-1', name: 'Активация' },
      { id: 'variant-2', name: 'Подписка' },
      { id: 'variant-3', name: 'Ключ' }
    ],
    periods: [
      { id: 'period-week', name: 'Неделя', price: 350 },
      { id: 'period-1', name: '1 мес', price: 690 },
      { id: 'period-12', name: '12 мес', price: 3000 }
    ],
    editions: [
      { id: 'edition-1', name: 'Pro', price: 690,
        displayTitle: 'Photoroom — Pro'
      }
    ],
    description: `Photoroom — это AI‑редактор изображений для интернет‑магазинов, блогеров и маркетологов. Удаление фона, коллажи, баннеры и карточки товаров за секунды.<br><br>
    <strong>Особенности:</strong><br>
    • Мгновенное удаление фона<br>
    • 1000+ готовых шаблонов<br>
    • Пакетная обработка изображений<br>
    • Экспорт в высоком разрешении и с прозрачным фоном<br>
    • Встроенный AI‑генератор изображений`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Android: 9.0+<br>
      • iOS/iPadOS: 17.0+<br>
      • macOS: устройства с Apple M1+, macOS 14+<br>
      • Web‑версия: современные браузеры
    `
  },
  
  'midjorney-ai': {
    id: 'midjorney-ai',
    title: 'MidJourney AI',
    category: 'Нейросети',
    price: 1300,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия', 'Нужен VPN'],
    labelColors: ['orange', 'violet', 'blue'],
    images: [
      'img/midjorneyai.webp'
    ],
    variants: [
      { id: 'variant-1', name: 'Подписка' }
    ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 1300 }
    ],
    editions: [
      { id: 'edition-1', name: 'Basic', price: 1300, displayTitle: 'MidJourney — Basic', periodPricing: { 'period-1': 1300 } },
      { id: 'edition-2', name: 'Standard', price: 3300, displayTitle: 'MidJourney — Standard', periodPricing: { 'period-1': 3300 } }
    ],
    description: `MidJourney — AI‑сервис для генерации изображений и артов по текстовым запросам. Более 40 визуальных стилей, настройка качества и композиции, upscale и вариации. Работает через Discord — без установки отдельных приложений.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Устройство: любое, с доступом к Discord или браузеру<br>
      • Интернет: стабильное подключение от 10 Мбит/с<br>
      • Железо: не требуется, генерация в облаке
    `
  },
  
  'chatgpt-ai': {
    id: 'chatgpt-ai',
    title: 'ChatGPT AI',
    category: 'Нейросети',
    price: 1990,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'img/chatgptai.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 1990 } ],
    editions: [ { id: 'edition-1', name: 'Plus', price: 1990, displayTitle: 'ChatGPT — Plus', periodPricing: { 'period-1': 1990 } } ],
    description: `ChatGPT AI — платформа на базе GPT‑4/4o для общения, написания текстов, кода, анализа данных и генерации изображений. Подходит для личного использования, бизнеса и обучения.<br><br>
    <strong>Особенности:</strong><br>
    • Генерация текстов, статей, скриптов, писем<br>
    • Написание и отладка кода (30+ языков)<br>
    • Анализ документов, таблиц, PDF и больших файлов<br>
    • Мультимодальность: текст, изображение, голос<br>
    • Интеграция с DALL·E и API для разработчиков`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Windows: Windows 10 (64‑bit/ARM) 17763.0+<br>
      • macOS: macOS 14 (Sonoma), устройства с Apple Silicon (M1+)<br>
      • Веб‑версия: современные браузеры (Chrome/Safari/Edge/Firefox)<br>
      • ОЗУ: от 8 ГБ (рекомендуется 16 ГБ)
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
      'img/сanva.webp'
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
    price: 1890,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'img/runwayai.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 1890 } ],
    editions: [
      { id: 'edition-1', name: 'Standard', price: 1890, periodPricing: { 'period-1': 1890 } },
      { id: 'edition-2', name: 'Pro', price: 3690, periodPricing: { 'period-1': 3690 } },
      { id: 'edition-3', name: 'Unlimited', price: 9500, periodPricing: { 'period-1': 9500 } }
    ],
    description: `Runway — облачная AI‑платформа для генерации видео, анимаций, изображений и VFX. Интегрируется с Adobe Premiere Pro, After Effects и другими редакторами. Экспорт до 4K и API для кастомных решений.<br><br>
    <strong>Особенности:</strong><br>
    • Генерация видео в высоком качестве<br>
    • AI‑инструменты для монтажа и удаления объектов<br>
    • Поддержка VFX, анимаций и стилизации кадров<br>
    • Интеграция с профессиональными редакторами<br>
    • Экспорт в 4K и доступ к API`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Web‑версия: современные браузеры (Chrome/Edge/Safari/Firefox)<br>
      • Локальные проекты: Intel Core i5+, 8 ГБ RAM, GPU GTX 1050+, 20 ГБ HDD<br>
      • Интернет: стабильное соединение от 10 Мбит/с
    `
  },
  
  'suno-ai': {
    id: 'suno-ai',
    title: 'Suno AI',
    category: 'Нейросети',
    price: 1390,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'img/sunoai.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 1390 } ],
    editions: [
      { id: 'edition-1', name: 'Pro', price: 1390, periodPricing: { 'period-1': 1390 } },
      { id: 'edition-2', name: 'Premier', price: 3390, periodPricing: { 'period-1': 3390 } }
    ],
    description: `Suno AI — платформа для генерации музыки и вокала. Создание песен и мелодий по тексту, генерация вокала и инструментальных партий, экспорт в MP3/WAV и интеграции с AI‑инструментами.<br><br>
    <strong>Особенности:</strong><br>
    • Генерация музыки и вокала по запросу<br>
    • Поддержка разных жанров и стилей<br>
    • Экспорт в MP3/WAV и HQ‑форматы<br>
    • Интеграции с Microsoft Copilot и др.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • iOS: 17.0+<br>
      • Android: 9.0+<br>
      • Web: любые современные браузеры<br>
      • Интернет: стабильное подключение от 10 Мбит/с
    `
  },
  
  'leonardo-ai': {
    id: 'leonardo-ai',
    title: 'Leonardo AI',
    category: 'Нейросети',
    price: 1350,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'img/leonardoai.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 1350 } ],
    editions: [
      { id: 'edition-1', name: 'Apprentice', price: 1350, periodPricing: { 'period-1': 1350 } },
      { id: 'edition-2', name: 'Artisan', price: 2990, periodPricing: { 'period-1': 2990 } },
      { id: 'edition-3', name: 'Maestro', price: 5850, periodPricing: { 'period-1': 5850 } }
    ],
    description: `Leonardo AI — платформа для создания изображений, 3D‑текстур, видео и концепт‑артов. Поддержка кастомных моделей, тонкой настройки стиля, совместной работы и API интеграций.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Web‑версия: любой современный браузер<br>
      • iOS/macOS: iOS 16.0+, iPadOS 16.0+, macOS 13+ (M1+)<br>
      • Интернет: необходим для работы
    `
  },
  
  'recraft-ai': {
    id: 'recraft-ai',
    title: 'Recraft AI',
    category: 'Нейросети',
    price: 1290,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'img/recraftai.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 1290 } ],
    editions: [
      { id: 'edition-1', name: 'Basic', price: 1290, periodPricing: { 'period-1': 1290 } },
      { id: 'edition-2', name: 'Advanced', price: 3890, periodPricing: { 'period-1': 3890 } },
      { id: 'edition-3', name: 'Pro', price: 6890, periodPricing: { 'period-1': 6890 } }
    ],
    description: `Recraft AI — платформа для генерации логотипов, баннеров, мокапов и векторной графики. Умеет генерировать изображения в векторном формате, интегрируется с Figma, Illustrator и Photoshop, поддерживает совместную работу через облако.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Web‑версия: любой современный браузер<br>
      • Интернет: стабильное соединение от 5 Мбит/с
    `
  },
  
  'cursor-ai': {
    id: 'cursor-ai',
    title: 'Cursor AI',
    category: 'Нейросети',
    price: 2490,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'img/cursor.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 2490 } ],
    editions: [
      { id: 'edition-1', name: 'Pro', price: 2490, periodPricing: { 'period-1': 2490 } },
      { id: 'edition-2', name: 'Business', price: 4350, periodPricing: { 'period-1': 4350 } }
    ],
    description: `Cursor — AI‑IDE на базе VS Code для ускорения разработки: автокомплит, генерация кода, автоматическое исправление ошибок, оптимизация алгоритмов, рефакторинг и интеграции с GitHub. Есть Privacy Mode.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10/11 (64‑bit), macOS 10.15+, Linux (Ubuntu 20.04+)<br>
      • ОЗУ: от 4 ГБ (рекомендуется 8 ГБ)<br>
      • Диск: 1–2 ГБ свободного места<br>
      • Интернет: обязателен для AI‑функций
    `
  },
  
  'flo': {
    id: 'flo',
    title: 'Flo',
    category: 'Подписки',
    price: 399,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'img/flo.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-12', name: '12 мес', price: 399 } ],
    editions: [ { id: 'edition-1', name: 'Premium', price: 399, periodPricing: { 'period-12': 399 } } ],
    description: `Flo — одно из самых популярных приложений для женского здоровья на базе AI. Отслеживание цикла, овуляции, симптомов, настроения и активности; персональные рекомендации по здоровью, планированию беременности, тренировкам и питанию. Есть защищённый режим приватности.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Android: 8.0+<br>
      • iOS: 15.0+<br>
      • Web‑версия: современный браузер
    `
  },
  
  'inshot': {
    id: 'inshot',
    title: 'InShot',
    category: 'Дизайн',
    price: 199,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'img/inshot.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-12', name: '12 мес', price: 199 } ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 199, periodPricing: { 'period-12': 199 } } ],
    description: `InShot — мобильный видеоредактор для TikTok, Instagram, YouTube и других платформ. Поддерживает AI‑инструменты, эффекты, музыку и субтитры. Отлично подходит для Reels, Shorts и Stories.<br><br>
    <strong>Особенности:</strong><br>
    • Поддержка видео в 4K и 60 FPS<br>
    • AI‑фильтры и автоматическая цветокоррекция<br>
    • Интеграция с TikTok и Instagram Reels<br>
    • Переходы, музыка, текст и стикеры<br>
    • Многослойные проекты`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Android: 5.0+<br>
      • iOS: 15.0+<br>
      • Mac: macOS 13+ (M1+), visionOS 1.0+<br>
      • Эмулятор: Windows 7+/macOS 11+, 4 ГБ RAM, 10 ГБ HDD
    `
  },
  
  'airbrush': {
    id: 'airbrush',
    title: 'Airbrush',
    category: 'Дизайн',
    price: 199,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'img/airbrush.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-12', name: '12 мес', price: 199 } ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 199, periodPricing: { 'period-12': 199 } } ],
    description: `AirBrush — AI‑фоторедактор с профессиональной портретной ретушью. Сглаживание кожи, отбеливание зубов, макияж, фильтры и цветокоррекция.<br><br>
    <strong>Особенности:</strong><br>
    • Автоматическая AI‑ретушь лица<br>
    • Фильтры и художественные эффекты<br>
    • AI‑инструменты для изменения фона и деталей<br>
    • Поддержка HDR и RAW`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Android: 7.0+<br>
      • iOS: 13.0+<br>
      • Эмулятор (BlueStacks): Windows 7+/macOS 11+, 4 ГБ RAM, 10 ГБ SSD<br>
      • GameLoop: Windows 8.1/10, GPU GTX 1050, CPU i3-8300, 8 ГБ RAM (рек. 16 ГБ), 1 ГБ HDD
    `
  },
  
  'gopro-quik': {
    id: 'gopro-quik',
    title: 'GoPro Quik',
    category: 'Дизайн',
    price: 1290,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'img/goproquik.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-12', name: '12 мес', price: 1290 } ],
    editions: [
      { id: 'edition-1', name: 'Quik', price: 1290, periodPricing: { 'period-12': 1290 } },
      { id: 'edition-2', name: 'Premium', price: 1999, periodPricing: { 'period-12': 1999 } }
    ],
    description: `GoPro Quik — официальное приложение для автоматического монтажа и редактирования клипов с GoPro и смартфона. Управление камерой из приложения, шаблоны и эффекты, синхронизация через GoPro Cloud.<br><br>
    <strong>Особенности:</strong><br>
    • Автоматическая нарезка из фото и клипов<br>
    • Профессиональные шаблоны и эффекты<br>
    • Поддержка GoPro Cloud<br>
    • Экспорт в 4K и интеграции с соцсетями`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Windows: Windows 10 (64‑bit desktop)<br>
      • macOS: 10.9+<br>
      • ОЗУ: 8 ГБ для FullHD, 16 ГБ для 4K<br>
      • Хранилище: от 512 ГБ SSD<br>
      • Mobile: iOS 17.0+, iPadOS 17.0+, Android 9.0+
    `
  },
  
  'photomechanic': {
    id: 'photomechanic',
    title: 'PhotoMechanic',
    category: 'Дизайн',
    price: 1990,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'img/photomechanic.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 1990 }, { id: 'period-12', name: '12 мес', price: 15990 } ],
    editions: [
      { id: 'edition-1', name: 'Standard', price: 1990, periodPricing: { 'period-1': 1990, 'period-12': 15990 } },
      { id: 'edition-2', name: 'Plus', price: 3190, periodPricing: { 'period-1': 3190, 'period-12': 26990 } }
    ],
    description: `PhotoMechanic — инструмент для быстрого просмотра, отбора и каталогизации изображений, работы с RAW и метаданными. Идеален для спортивной и репортажной фотографии.<br><br>
    <strong>Особенности:</strong><br>
    • Мгновенный просмотр тысяч RAW‑снимков<br>
    • Метаданные, теги, авторские права<br>
    • Пакетное переименование и экспорт<br>
    • Интеграция с Adobe Lightroom и Photoshop`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Windows: Windows 10+<br>
      • macOS: 10.14+<br>
      • ОЗУ: от 4 ГБ (рек. 8 ГБ)<br>
      • Хранилище: SSD для быстрой работы с RAW
    `
  },
  
  'yazio-ai': {
    id: 'yazio-ai',
    title: 'Yazio AI',
    category: 'Нейросети',
    price: 400,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'img/yazioai.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-12', name: '12 мес', price: 400 } ],
    editions: [ { id: 'edition-1', name: 'Pro', price: 400, periodPricing: { 'period-12': 400 } } ],
    description: `Yazio AI — приложение для персонального питания: контроль калорий, меню и дневник питания. Подбор диеты с AI и интеграция с фитнес‑трекерами.<br><br>
    <strong>Особенности:</strong><br>
    • Автоподбор питания под цель<br>
    • База 2+ млн продуктов<br>
    • Генерация меню и рецептов с AI<br>
    • Интеграция с Fitbit, Garmin, Google Fit, Apple Health`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Android: 8.0+<br>
      • iOS: 14.0+<br>
      • Web‑версия: современные браузеры
    `
  },
  
  'krea-ai': {
    id: 'krea-ai',
    title: 'Krea AI',
    category: 'Нейросети',
    price: 1350,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'img/kreaai.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 1350 } ],
    editions: [
      { id: 'edition-1', name: 'Basic', price: 1350, periodPricing: { 'period-1': 1350 } },
      { id: 'edition-2', name: 'Pro', price: 3600, periodPricing: { 'period-1': 3600 } },
      { id: 'edition-3', name: 'Max', price: 6000, periodPricing: { 'period-1': 6000 } }
    ],
    description: `Krea AI — платформа для генерации изображений, анимаций и видео по текстовым подсказкам. Динамические стили, генерация в высоком разрешении и кастомные модели.<br><br>
    <strong>Особенности:</strong><br>
    • Генерация по тексту<br>
    • Динамические стили и цветовые схемы<br>
    • AI‑инструменты для анимации и видео<br>
    • Кастомизация моделей под бренд`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Web‑версия: современный браузер (Chrome/Safari/Edge/Firefox)<br>
      • Интернет: стабильное соединение от 5 Мбит/с
    `
  },
  
  'office': {
    id: 'office',
    title: 'Microsoft Office',
    category: 'Microsoft',
    price: 900,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'img/microsoftoffice.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 900 } ],
    editions: [ { id: 'edition-1', name: 'Personal/Home', price: 900, periodPricing: { 'period-1': 900 } } ],
    description: `Microsoft Office — пакет приложений для документов, таблиц и презентаций (Word, Excel, PowerPoint, Outlook, OneNote и др.). В версии Office 365 — OneDrive, Teams, SharePoint и интеграция с AI‑ассистентом Copilot.<br><br>
    <strong>Особенности:</strong><br>
    • Совместная работа в реальном времени<br>
    • Облачное хранилище до 1 ТБ<br>
    • Поддержка всех устройств и платформ<br>
    • Интеграция с Microsoft Teams`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Windows: Windows 10+<br>
      • macOS: Big Sur (11)+<br>
      • Интернет: обязателен для Office 365<br>
      • Мобильные устройства: Android 8.0+, iOS 14.0+
    `
  },
  
  'windows': {
    id: 'windows',
    title: 'Windows',
    category: 'Microsoft',
    price: 500,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Гарантия', 'Лицензия'],
    labelColors: ['orange', 'violet'],
    images: [
      'img/microsoftwindows.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-12', name: '12 мес', price: 500 } ],
    editions: [ { id: 'edition-1', name: 'Windows 11', price: 500, periodPricing: { 'period-12': 500 } } ],
    description: `Microsoft Windows — ОС для работы, игр, бизнеса и разработки. DirectX 12 и HDR для игр, интеграция с Xbox и Microsoft Store, безопасность (TPM 2.0), оптимизация и современный дизайн. Windows 11: поддержка Android‑приложений, новый Microsoft Store, обновлённая панель задач и AI Copilot.`,
    systemRequirements: `
      <strong>Минимальные системные требования (Windows 11):</strong><br>
      • ОС: Windows 11 (64‑bit)<br>
      • Процессор: 1 ГГц, 2 ядра, 64‑bit<br>
      • ОЗУ: минимум 4 ГБ (рек. 8 ГБ)<br>
      • Хранилище: 64 ГБ SSD<br>
      • Видеокарта: DirectX 12, драйвер WDDM 2.0<br>
      • Экран: минимум 9″, 720p<br>
      • Интернет: обязателен для активации
    `
  },
  
  'claude-ai': {
    id: 'claude-ai',
    title: 'Claude AI',
    category: 'Нейросети',
    price: 2249,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'img/claudeai.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 2249 }, { id: 'period-12', name: '12 мес', price: 19000 } ],
    editions: [
      { id: 'edition-1', name: 'Pro', price: 2249, periodPricing: { 'period-1': 2249, 'period-12': 19000 } },
      { id: 'edition-2', name: 'Max 5x лимиты', price: 9500, periodPricing: { 'period-1': 9500 } },
      { id: 'edition-3', name: 'Max 20x лимиты', price: 19000, periodPricing: { 'period-1': 19000 } }
    ],
    description: `Claude AI — ассистент от Anthropic для генерации текстов, анализа документов, написания кода и работы с большими файлами. Версия Claude 3.5 Sonnet повысила точность и производительность.<br><br>
    <strong>Особенности:</strong><br>
    • Большие PDF и Excel<br>
    • Генерация кода и работа с API<br>
    • Конфиденциальная обработка данных<br>
    • Командная работа`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Desktop: Windows 10+, macOS Big Sur+<br>
      • CLI (Claude Code): Windows/macOS/Linux, 4 ГБ RAM, Node.js 18+<br>
      • Web‑версия: современный браузер
    `
  },
  
  'freepik': {
    id: 'freepik',
    title: 'Freepik',
    category: 'Дизайн',
    price: 1250,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'img/freepik.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 1250 }, { id: 'period-12', name: '12 мес', price: 8990 } ],
    editions: [
      { id: 'edition-1', name: 'Essential', price: 1250, periodPricing: { 'period-1': 1250, 'period-12': 8990 } },
      { id: 'edition-2', name: 'Premium', price: 2250, periodPricing: { 'period-1': 2250 } },
      { id: 'edition-3', name: 'Premium+', price: 4650, periodPricing: { 'period-1': 4650 } }
    ],
    description: `Freepik — платформа для стоковой графики, иллюстраций, иконок, PSD‑макетов, фото и шаблонов. Интеграции с Photoshop, Figma и Illustrator. Есть бесплатные и премиум‑ресурсы.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Web‑версия: современный браузер<br>
      • Интернет: стабильное соединение 5 Мбит/с и выше
    `
  },
  
  'spotify': {
    id: 'spotify',
    title: 'Spotify',
    category: 'Подписки',
    price: 199,
    oldPrice: null,
    discount: null,
    priceUSDT: 'для юрлиц',
    labels: ['Лицензия'],
    labelColors: ['violet'],
    images: [
      'img/spotify.webp'
    ],
    variants: [ { id: 'variant-1', name: 'Подписка' } ],
    periods: [ { id: 'period-1', name: '1 мес', price: 199 } ],
    editions: [ { id: 'edition-1', name: 'Individual', price: 199, periodPricing: { 'period-1': 199 } } ],
    description: `Spotify — музыкальный стриминговый сервис с миллионами треков, подкастов и плейлистов. Персональные рекомендации, офлайн‑загрузка, совместные плейлисты и интеграция с соцсетями. Работает на ПК, смартфонах, ТВ, колонках и в авто.`,
    systemRequirements: `
      <strong>Минимальные системные требования:</strong><br>
      • Android: 7.0+<br>
      • iOS: 14.0+<br>
      • Windows: Windows 10 (64‑bit)+<br>
      • macOS: 10.13+<br>
      • Web‑версия: современные браузеры (Chrome/Safari/Edge/Firefox)
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
      'img/microsoftoffice365.webp'
    ],
    variants: [
      { id: 'variant-1', name: 'Активация' },
      { id: 'variant-2', name: 'Ключ' }
    ],
    periods: [
      { id: 'period-1', name: '1 мес', price: 800 },
      { id: 'period-2', name: '6 мес', price: 4000 },
      { id: 'period-3', name: '12 мес', price: 7000 }
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
    image: 'img/design.webp'
  },
  'Нейросети': {
    name: 'Нейросети',
    description: 'Искусственный интеллект и нейронные сети',
    image: 'img/ai.webp'
  },
  'Microsoft': {
    name: 'Microsoft',
    description: 'Office и другие продукты Microsoft',
    image: 'img/microsoft.webp'
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
    image: 'img/subscriptions.webp'
  }
};