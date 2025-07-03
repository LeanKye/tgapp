(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver(e=>{for(const i of e)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&t(n)}).observe(document,{childList:!0,subtree:!0});function a(e){const i={};return e.integrity&&(i.integrity=e.integrity),e.referrerPolicy&&(i.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?i.credentials="include":e.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(e){if(e.ep)return;e.ep=!0;const i=a(e);fetch(e.href,i)}})();const s={"adobe-creative-cloud":{id:"adobe-creative-cloud",title:"Adobe Creative Cloud",category:"Adobe",price:1e3,oldPrice:1500,discount:"-30%",priceUSDT:"на wallet 26.90 USDT",labels:["Гарантия","Лицензия","Нужен VPN"],labelColors:["orange","violet","blue"],images:["https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Аккаунт"},{id:"variant-2",name:"Подписка"},{id:"variant-3",name:"Ключ"}],periods:[{id:"period-week",name:"Неделя",price:300},{id:"period-1",name:"1 Мес",price:1e3},{id:"period-3",name:"3 Мес",price:2500,discount:"Выгода 17%"},{id:"period-12",name:"12 Мес",price:8e3,discount:"Выгода 33%"}],editions:[{id:"edition-1",name:"Adobe Creative Cloud",price:1e3},{id:"edition-2",name:"Photoshop + Lightroom",price:1500},{id:"edition-3",name:"Deluxe",price:1990}],description:`Adobe Creative Cloud — это полный набор профессиональных приложений для творчества. 
    Включает Photoshop, Illustrator, InDesign, After Effects, Premiere Pro и многие другие инструменты 
    для дизайна, фотографии, видео и веб-разработки. Подписка дает доступ ко всем приложениям, 
    облачному хранилищу и дополнительным сервисам Adobe.`,systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 (64-bit) или macOS 10.14<br>
      • Процессор: Intel Core i5 или AMD Ryzen 5<br>
      • ОЗУ: 8 ГБ (рекомендуется 16 ГБ)<br>
      • Место на диске: 4 ГБ для установки<br>
      • Разрешение экрана: 1280x800<br>
      • Интернет-соединение для активации
    `},"microsoft-office":{id:"microsoft-office",title:"Microsoft Office 365",category:"Подписки",price:800,oldPrice:1200,discount:"-33%",priceUSDT:"на wallet 21.50 USDT",labels:["Гарантия","Лицензия"],labelColors:["orange","violet"],images:["https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Аккаунт"},{id:"variant-2",name:"Ключ"}],periods:[{id:"period-1",name:"1 месяц",price:800},{id:"period-2",name:"6 месяцев",price:4e3,discount:"Выгода 17%"},{id:"period-3",name:"12 месяцев",price:7e3,discount:"Выгода 27%"}],editions:[{id:"edition-1",name:"Personal",price:800},{id:"edition-2",name:"Family",price:1200},{id:"edition-3",name:"Business",price:1500}],description:`Microsoft Office 365 — это облачный пакет офисных приложений, включающий Word, Excel, 
    PowerPoint, Outlook и другие инструменты. Обеспечивает совместную работу в реальном времени, 
    облачное хранилище OneDrive и доступ к приложениям с любого устройства.`,systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 или macOS 10.12<br>
      • Процессор: Intel Core i3 или AMD A4<br>
      • ОЗУ: 4 ГБ (рекомендуется 8 ГБ)<br>
      • Место на диске: 4 ГБ<br>
      • Разрешение экрана: 1024x768<br>
      • Интернет-соединение для активации и обновлений
    `},"cyberpunk-2077":{id:"cyberpunk-2077",title:"Cyberpunk 2077",category:"Игры",price:1500,oldPrice:2e3,discount:"-25%",priceUSDT:"на wallet 40.30 USDT",labels:["Гарантия"],labelColors:["orange"],images:["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Steam"},{id:"variant-2",name:"Epic Games"},{id:"variant-3",name:"GOG"}],periods:[{id:"period-1",name:"Навсегда",price:1500}],editions:[{id:"edition-1",name:"Standard",price:1500},{id:"edition-2",name:"Deluxe",price:2200},{id:"edition-3",name:"Ultimate",price:2990}],description:`Cyberpunk 2077 — приключенческая ролевая игра с открытым миром, 
    действие которой происходит в мегаполисе Найт-Сити, где власть, роскошь и модификации тела 
    ценятся выше всего. Вы играете за наёмника V, который гонится за уникальным имплантом — 
    ключом к бессмертию.`,systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 64-bit<br>
      • Процессор: Intel Core i5-3570K / AMD FX-8310<br>
      • ОЗУ: 8 ГБ<br>
      • Видеокарта: NVIDIA GTX 780 / AMD Radeon RX 470<br>
      • DirectX: Версии 12<br>
      • Место на диске: 70 ГБ
    `},photoshop:{id:"photoshop",title:"Adobe Photoshop",category:"Adobe",price:600,oldPrice:900,discount:"-33%",priceUSDT:"на wallet 16.10 USDT",labels:["Гарантия","Лицензия"],labelColors:["orange","violet"],images:["https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Аккаунт"},{id:"variant-2",name:"Ключ"}],periods:[{id:"period-1",name:"1 месяц",price:600},{id:"period-2",name:"6 месяцев",price:3e3,discount:"Выгода 17%"},{id:"period-3",name:"12 месяцев",price:5500,discount:"Выгода 24%"}],editions:[{id:"edition-1",name:"Standard",price:600},{id:"edition-2",name:"Premium",price:900}],description:`Adobe Photoshop — профессиональный графический редактор для создания и обработки растровых изображений. 
    Лидер в области цифровой обработки изображений с множеством инструментов для ретуши, коллажирования и создания цифрового искусства.`,systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 (64-bit) или macOS 10.14<br>
      • Процессор: Intel Core i5 или AMD Ryzen 5<br>
      • ОЗУ: 8 ГБ (рекомендуется 16 ГБ)<br>
      • Место на диске: 4 ГБ<br>
      • Видеокарта: DirectX 12 или OpenGL 3.3
    `},"fifa-24":{id:"fifa-24",title:"FIFA 24",category:"Игры",price:2500,oldPrice:3500,discount:"-29%",priceUSDT:"на wallet 67.10 USDT",labels:["Гарантия"],labelColors:["orange"],images:["https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Steam"},{id:"variant-2",name:"Origin"},{id:"variant-3",name:"Epic Games"}],periods:[{id:"period-1",name:"Навсегда",price:2500}],editions:[{id:"edition-1",name:"Standard",price:2500},{id:"edition-2",name:"Ultimate",price:3990}],description:`FIFA 24 — новейшая футбольная симуляция от EA Sports с улучшенной графикой, 
    реалистичной физикой мяча и обновленными составами команд. Включает режимы карьеры, 
    Ultimate Team и многопользовательские матчи онлайн.`,systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 64-bit<br>
      • Процессор: Intel Core i5-6600K / AMD Ryzen 5 1600<br>
      • ОЗУ: 8 ГБ<br>
      • Видеокарта: NVIDIA GTX 1050 Ti / AMD Radeon RX 570<br>
      • DirectX: Версии 12<br>
      • Место на диске: 100 ГБ
    `},"chatgpt-plus":{id:"chatgpt-plus",title:"ChatGPT Plus",category:"Нейросети",price:1200,oldPrice:null,discount:null,priceUSDT:"на wallet 32.20 USDT",labels:["Подписка"],labelColors:["violet"],images:["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1676299081847-824916de030a?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1675557009904-e2c4b81e905b?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Подписка"}],periods:[{id:"period-1",name:"1 месяц",price:1200},{id:"period-2",name:"3 месяца",price:3200,discount:"Выгода 11%"},{id:"period-3",name:"12 месяцев",price:11e3,discount:"Выгода 24%"}],editions:[{id:"edition-1",name:"Plus",price:1200}],description:`ChatGPT Plus — подписка на расширенную версию ChatGPT с доступом к модели GPT-4, 
    приоритетным обслуживанием и новейшим функциям. Идеально для профессиональной работы, 
    обучения и творческих задач.`,systemRequirements:`
      <strong>Системные требования:</strong><br>
      • Любое устройство с интернет-браузером<br>
      • Стабильное интернет-соединение<br>
      • Поддерживаемые браузеры: Chrome, Firefox, Safari, Edge<br>
      • Мобильное приложение для iOS и Android
    `},midjourney:{id:"midjourney",title:"Midjourney",category:"Нейросети",price:800,oldPrice:1e3,discount:"-20%",priceUSDT:"на wallet 21.50 USDT",labels:["Подписка","ИИ"],labelColors:["violet","blue"],images:["https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Подписка"}],periods:[{id:"period-1",name:"1 месяц",price:800},{id:"period-2",name:"3 месяца",price:2200,discount:"Выгода 8%"},{id:"period-3",name:"12 месяцев",price:8e3,discount:"Выгода 17%"}],editions:[{id:"edition-1",name:"Basic",price:800},{id:"edition-2",name:"Standard",price:1200},{id:"edition-3",name:"Pro",price:1800}],description:`Midjourney — это сервис генерации изображений с помощью искусственного интеллекта. 
    Создавайте потрясающие цифровые артворки, концепт-арты и иллюстрации просто описав их текстом. 
    Подходит для дизайнеров, художников и творческих людей.`,systemRequirements:`
       <strong>Системные требования:</strong><br>
       • Discord аккаунт<br>
       • Интернет-соединение<br>
       • Веб-браузер или Discord приложение<br>
       • Поддержка работы через бота в Discord
     `},"kaspersky-antivirus":{id:"kaspersky-antivirus",title:"Kaspersky Internet Security",category:"Антивирусы",price:900,oldPrice:1200,discount:"-25%",priceUSDT:"на wallet 24.20 USDT",labels:["Лицензия","Гарантия"],labelColors:["violet","orange"],images:["https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Ключ"},{id:"variant-2",name:"Аккаунт"}],periods:[{id:"period-1",name:"1 год",price:900},{id:"period-2",name:"2 года",price:1600,discount:"Выгода 11%"},{id:"period-3",name:"3 года",price:2200,discount:"Выгода 18%"}],editions:[{id:"edition-1",name:"Antivirus",price:900},{id:"edition-2",name:"Internet Security",price:1200},{id:"edition-3",name:"Total Security",price:1600}],description:`Kaspersky Internet Security — комплексная защита от вирусов, троянов, 
     шпионских программ и других угроз. Включает антивирус, файрвол, защиту от фишинга 
     и родительский контроль. Надежная защита для всех ваших устройств.`,systemRequirements:`
       <strong>Минимальные системные требования:</strong><br>
       • ОС: Windows 10/11, macOS 10.15, Android 6.0, iOS 12<br>
       • Процессор: Intel Pentium 1 ГГц<br>
       • ОЗУ: 2 ГБ<br>
       • Место на диске: 2,5 ГБ<br>
       • Интернет-соединение для активации и обновлений
     `},"adobe-illustrator":{id:"adobe-illustrator",title:"Adobe Illustrator",category:"Adobe",price:700,oldPrice:1e3,discount:"-30%",priceUSDT:"на wallet 18.80 USDT",labels:["Гарантия","Лицензия"],labelColors:["orange","violet"],images:["https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Аккаунт"},{id:"variant-2",name:"Ключ"}],periods:[{id:"period-1",name:"1 месяц",price:700},{id:"period-2",name:"6 месяцев",price:3500,discount:"Выгода 17%"},{id:"period-3",name:"12 месяцев",price:6e3,discount:"Выгода 29%"}],editions:[{id:"edition-1",name:"Standard",price:700},{id:"edition-2",name:"Premium",price:1e3}],description:"Adobe Illustrator — профессиональный векторный графический редактор для создания логотипов, иконок, рисунков, типографии и иллюстраций для печати, веба, видео и мобильных устройств.",systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 (64-bit) или macOS 10.14<br>
      • Процессор: Intel Core i5 или AMD Ryzen 5<br>
      • ОЗУ: 8 ГБ (рекомендуется 16 ГБ)<br>
      • Место на диске: 3 ГБ<br>
      • Видеокарта: DirectX 12 или OpenGL 3.3
    `},"adobe-after-effects":{id:"adobe-after-effects",title:"Adobe After Effects",category:"Adobe",price:800,oldPrice:1200,discount:"-33%",priceUSDT:"на wallet 21.50 USDT",labels:["Гарантия","Лицензия","Нужен VPN"],labelColors:["orange","violet","blue"],images:["https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Аккаунт"},{id:"variant-2",name:"Подписка"}],periods:[{id:"period-1",name:"1 месяц",price:800},{id:"period-2",name:"6 месяцев",price:4e3,discount:"Выгода 17%"},{id:"period-3",name:"12 месяцев",price:7e3,discount:"Выгода 27%"}],editions:[{id:"edition-1",name:"Standard",price:800},{id:"edition-2",name:"Premium",price:1200}],description:"Adobe After Effects — профессиональное приложение для создания анимации и визуальных эффектов. Идеально для создания титров, вступлений, переходов и всевозможных визуальных эффектов для видео.",systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 (64-bit) или macOS 10.14<br>
      • Процессор: Intel Core i7 или AMD Ryzen 7<br>
      • ОЗУ: 16 ГБ (рекомендуется 32 ГБ)<br>
      • Место на диске: 5 ГБ<br>
      • Видеокарта: 2 ГБ VRAM
    `},"adobe-premiere-pro":{id:"adobe-premiere-pro",title:"Adobe Premiere Pro",category:"Adobe",price:750,oldPrice:1100,discount:"-32%",priceUSDT:"на wallet 20.20 USDT",labels:["Гарантия","Лицензия"],labelColors:["orange","violet"],images:["https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Аккаунт"},{id:"variant-2",name:"Ключ"}],periods:[{id:"period-1",name:"1 месяц",price:750},{id:"period-2",name:"6 месяцев",price:3800,discount:"Выгода 15%"},{id:"period-3",name:"12 месяцев",price:6500,discount:"Выгода 28%"}],editions:[{id:"edition-1",name:"Standard",price:750},{id:"edition-2",name:"Premium",price:1100}],description:"Adobe Premiere Pro — профессиональный видеоредактор для создания кино, телевизионных программ и веб-контента. Мощные инструменты редактирования временной шкалы для точного управления видео.",systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 (64-bit) или macOS 10.14<br>
      • Процессор: Intel Core i7 или AMD Ryzen 7<br>
      • ОЗУ: 16 ГБ (рекомендуется 32 ГБ)<br>
      • Место на диске: 8 ГБ<br>
      • Видеокарта: 4 ГБ VRAM
    `},"call-of-duty-mw3":{id:"call-of-duty-mw3",title:"Call of Duty: Modern Warfare III",category:"Игры",price:3200,oldPrice:4500,discount:"-29%",priceUSDT:"на wallet 85.90 USDT",labels:["Гарантия"],labelColors:["orange"],images:["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Steam"},{id:"variant-2",name:"Battle.net"}],periods:[{id:"period-1",name:"Навсегда",price:3200}],editions:[{id:"edition-1",name:"Standard",price:3200},{id:"edition-2",name:"Deluxe",price:4500},{id:"edition-3",name:"Ultimate",price:5990}],description:"Call of Duty: Modern Warfare III — новейший шутер от первого лица в знаменитой серии Call of Duty. Захватывающая кампания, мультиплеер и режим Zombies в одной игре.",systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 64-bit<br>
      • Процессор: Intel Core i5-6600 / AMD Ryzen 5 1400<br>
      • ОЗУ: 8 ГБ<br>
      • Видеокарта: NVIDIA GTX 1060 / AMD Radeon RX 580<br>
      • DirectX: Версии 12<br>
      • Место на диске: 125 ГБ
    `},"baldurs-gate-3":{id:"baldurs-gate-3",title:"Baldur's Gate 3",category:"Игры",price:2800,oldPrice:3500,discount:"-20%",priceUSDT:"на wallet 75.20 USDT",labels:["Гарантия"],labelColors:["orange"],images:["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Steam"},{id:"variant-2",name:"GOG"}],periods:[{id:"period-1",name:"Навсегда",price:2800}],editions:[{id:"edition-1",name:"Standard",price:2800},{id:"edition-2",name:"Deluxe",price:3500}],description:"Baldur's Gate 3 — эпическая ролевая игра, основанная на правилах D&D 5-го издания. Соберите отряд и отправляйтесь в путешествие по Забытым Королевствам и за их пределы.",systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 64-bit<br>
      • Процессор: Intel Core i5-4690 / AMD FX 4350<br>
      • ОЗУ: 8 ГБ<br>
      • Видеокарта: NVIDIA GTX 970 / AMD Radeon RX 480<br>
      • DirectX: Версии 11<br>
      • Место на диске: 150 ГБ
    `},"hogwarts-legacy":{id:"hogwarts-legacy",title:"Hogwarts Legacy",category:"Игры",price:2200,oldPrice:3e3,discount:"-27%",priceUSDT:"на wallet 59.10 USDT",labels:["Гарантия"],labelColors:["orange"],images:["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Steam"},{id:"variant-2",name:"Epic Games"}],periods:[{id:"period-1",name:"Навсегда",price:2200}],editions:[{id:"edition-1",name:"Standard",price:2200},{id:"edition-2",name:"Deluxe",price:3e3}],description:"Hogwarts Legacy — приключенческая ролевая игра с открытым миром, действие которой происходит в мире Гарри Поттера в 1800-х годах. Станьте студентом Хогвартса и откройте для себя магический мир.",systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10 64-bit<br>
      • Процессор: Intel Core i5-6600 / AMD Ryzen 5 1400<br>
      • ОЗУ: 16 ГБ<br>
      • Видеокарта: NVIDIA GTX 960 / AMD Radeon RX 470<br>
      • DirectX: Версии 12<br>
      • Место на диске: 85 ГБ
    `},"netflix-premium":{id:"netflix-premium",title:"Netflix Premium",category:"Подписки",price:600,oldPrice:800,discount:"-25%",priceUSDT:"на wallet 16.10 USDT",labels:["Подписка"],labelColors:["violet"],images:["https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Аккаунт"}],periods:[{id:"period-1",name:"1 месяц",price:600},{id:"period-2",name:"3 месяца",price:1600,discount:"Выгода 11%"},{id:"period-3",name:"12 месяцев",price:5500,discount:"Выгода 24%"}],editions:[{id:"edition-1",name:"Basic",price:600},{id:"edition-2",name:"Standard",price:800},{id:"edition-3",name:"Premium",price:1200}],description:"Netflix Premium — подписка на стриминговый сервис с доступом к тысячам фильмов, сериалов и документальных фильмов в высоком качестве 4K. Смотрите на любых устройствах без рекламы.",systemRequirements:`
      <strong>Системные требования:</strong><br>
      • Любое устройство с интернет-браузером<br>
      • Стабильное интернет-соединение (25 Мбит/с для 4K)<br>
      • Поддерживаемые браузеры: Chrome, Firefox, Safari, Edge<br>
      • Приложения для Smart TV, мобильных устройств
    `},"spotify-premium":{id:"spotify-premium",title:"Spotify Premium",category:"Подписки",price:400,oldPrice:600,discount:"-33%",priceUSDT:"на wallet 10.80 USDT",labels:["Подписка"],labelColors:["violet"],images:["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Аккаунт"}],periods:[{id:"period-1",name:"1 месяц",price:400},{id:"period-2",name:"3 месяца",price:1e3,discount:"Выгода 17%"},{id:"period-3",name:"12 месяцев",price:3500,discount:"Выгода 27%"}],editions:[{id:"edition-1",name:"Individual",price:400},{id:"edition-2",name:"Family",price:600}],description:"Spotify Premium — премиум подписка на музыкальный стриминговый сервис с доступом к миллионам треков без рекламы, возможностью скачивания и высоким качеством звука.",systemRequirements:`
      <strong>Системные требования:</strong><br>
      • Любое устройство с интернет-браузером<br>
      • Стабильное интернет-соединение<br>
      • Мобильные приложения для iOS и Android<br>
      • Десктопное приложение для Windows и macOS
    `},"github-copilot":{id:"github-copilot",title:"GitHub Copilot",category:"Подписки",price:800,oldPrice:1e3,discount:"-20%",priceUSDT:"на wallet 21.50 USDT",labels:["Подписка","ИИ"],labelColors:["violet","blue"],images:["https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Подписка"}],periods:[{id:"period-1",name:"1 месяц",price:800},{id:"period-2",name:"6 месяцев",price:4e3,discount:"Выгода 17%"},{id:"period-3",name:"12 месяцев",price:7e3,discount:"Выгода 27%"}],editions:[{id:"edition-1",name:"Individual",price:800},{id:"edition-2",name:"Business",price:1500}],description:"GitHub Copilot — AI-помощник для программистов, который помогает писать код быстрее и эффективнее. Предлагает интеллектуальные автодополнения и целые функции на основе контекста.",systemRequirements:`
      <strong>Системные требования:</strong><br>
      • Visual Studio Code, Visual Studio, или JetBrains IDE<br>
      • Активный аккаунт GitHub<br>
      • Стабильное интернет-соединение<br>
      • Поддержка множества языков программирования
    `},"claude-pro":{id:"claude-pro",title:"Claude Pro",category:"Нейросети",price:1100,oldPrice:null,discount:null,priceUSDT:"на wallet 29.50 USDT",labels:["Подписка","ИИ"],labelColors:["violet","blue"],images:["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1676299081847-824916de030a?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1675557009904-e2c4b81e905b?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Подписка"}],periods:[{id:"period-1",name:"1 месяц",price:1100},{id:"period-2",name:"3 месяца",price:3e3,discount:"Выгода 9%"},{id:"period-3",name:"12 месяцев",price:10500,discount:"Выгода 20%"}],editions:[{id:"edition-1",name:"Pro",price:1100}],description:"Claude Pro — продвинутая версия AI-ассистента Claude от Anthropic с расширенными возможностями для анализа, написания текстов, программирования и решения сложных задач.",systemRequirements:`
      <strong>Системные требования:</strong><br>
      • Любое устройство с интернет-браузером<br>
      • Стабильное интернет-соединение<br>
      • Поддерживаемые браузеры: Chrome, Firefox, Safari, Edge<br>
      • Доступ через веб-интерфейс или API
    `},"dalle-3":{id:"dalle-3",title:"DALL-E 3",category:"Нейросети",price:900,oldPrice:1200,discount:"-25%",priceUSDT:"на wallet 24.20 USDT",labels:["Подписка","ИИ"],labelColors:["violet","blue"],images:["https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Подписка"}],periods:[{id:"period-1",name:"1 месяц",price:900},{id:"period-2",name:"3 месяца",price:2400,discount:"Выгода 11%"},{id:"period-3",name:"12 месяцев",price:8500,discount:"Выгода 22%"}],editions:[{id:"edition-1",name:"Basic",price:900},{id:"edition-2",name:"Pro",price:1200}],description:"DALL-E 3 — самая продвинутая модель OpenAI для генерации изображений. Создает высококачественные изображения по текстовым описаниям с невероятной детализацией и точностью.",systemRequirements:`
      <strong>Системные требования:</strong><br>
      • Любое устройство с интернет-браузером<br>
      • Стабильное интернет-соединение<br>
      • Поддержка работы через ChatGPT Plus или API<br>
      • Минимальные требования к производительности
    `},"stable-diffusion-xl":{id:"stable-diffusion-xl",title:"Stable Diffusion XL",category:"Нейросети",price:650,oldPrice:900,discount:"-28%",priceUSDT:"на wallet 17.50 USDT",labels:["Подписка","ИИ"],labelColors:["violet","blue"],images:["https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Cloud"},{id:"variant-2",name:"Local"}],periods:[{id:"period-1",name:"1 месяц",price:650},{id:"period-2",name:"3 месяца",price:1700,discount:"Выгода 13%"},{id:"period-3",name:"12 месяцев",price:6e3,discount:"Выгода 23%"}],editions:[{id:"edition-1",name:"Standard",price:650},{id:"edition-2",name:"Pro",price:900}],description:"Stable Diffusion XL — мощная модель генерации изображений с открытым исходным кодом. Создает высококачественные изображения с улучшенным разрешением и детализацией.",systemRequirements:`
      <strong>Системные требования:</strong><br>
      • Для локального использования: NVIDIA GPU с 8+ ГБ VRAM<br>
      • Для облачного: любое устройство с браузером<br>
      • Python 3.8+ (для локальной установки)<br>
      • Стабильное интернет-соединение
    `},"norton-360":{id:"norton-360",title:"Norton 360 Deluxe",category:"Антивирусы",price:1200,oldPrice:1600,discount:"-25%",priceUSDT:"на wallet 32.20 USDT",labels:["Лицензия","Гарантия"],labelColors:["violet","orange"],images:["https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Ключ"},{id:"variant-2",name:"Аккаунт"}],periods:[{id:"period-1",name:"1 год",price:1200},{id:"period-2",name:"2 года",price:2100,discount:"Выгода 13%"},{id:"period-3",name:"3 года",price:2900,discount:"Выгода 19%"}],editions:[{id:"edition-1",name:"Standard",price:1200},{id:"edition-2",name:"Deluxe",price:1600},{id:"edition-3",name:"Premium",price:2200}],description:"Norton 360 Deluxe — комплексная защита устройств с антивирусом, VPN, менеджером паролей и облачным хранилищем. Защищает до 5 устройств одновременно.",systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10/11, macOS 10.12, Android 6.0, iOS 12<br>
      • Процессор: Intel Pentium 4 / AMD Athlon 64<br>
      • ОЗУ: 2 ГБ<br>
      • Место на диске: 300 МБ<br>
      • Интернет-соединение для активации
    `},"bitdefender-total-security":{id:"bitdefender-total-security",title:"Bitdefender Total Security",category:"Антивирусы",price:1e3,oldPrice:1400,discount:"-29%",priceUSDT:"на wallet 26.90 USDT",labels:["Лицензия","Гарантия"],labelColors:["violet","orange"],images:["https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Ключ"},{id:"variant-2",name:"Аккаунт"}],periods:[{id:"period-1",name:"1 год",price:1e3},{id:"period-2",name:"2 года",price:1800,discount:"Выгода 10%"},{id:"period-3",name:"3 года",price:2500,discount:"Выгода 17%"}],editions:[{id:"edition-1",name:"Antivirus Plus",price:1e3},{id:"edition-2",name:"Internet Security",price:1400},{id:"edition-3",name:"Total Security",price:1800}],description:"Bitdefender Total Security — award-winning защита от всех видов малware, с продвинутой защитой от ransomware, веб-защитой и многоуровневой защитой в реальном времени.",systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 8.1/10/11, macOS 10.14, Android 5.0, iOS 11<br>
      • Процессор: Intel Core 2 Duo / AMD Athlon 64 X2<br>
      • ОЗУ: 2 ГБ<br>
      • Место на диске: 2,5 ГБ<br>
      • Интернет-соединение обязательно
    `},"mcafee-total-protection":{id:"mcafee-total-protection",title:"McAfee Total Protection",category:"Антивирусы",price:800,oldPrice:1100,discount:"-27%",priceUSDT:"на wallet 21.50 USDT",labels:["Лицензия","Гарантия"],labelColors:["violet","orange"],images:["https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&h=400&fit=crop&crop=center","https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop&crop=center"],variants:[{id:"variant-1",name:"Ключ"},{id:"variant-2",name:"Аккаунт"}],periods:[{id:"period-1",name:"1 год",price:800},{id:"period-2",name:"2 года",price:1400,discount:"Выгода 13%"},{id:"period-3",name:"3 года",price:1900,discount:"Выгода 21%"}],editions:[{id:"edition-1",name:"Antivirus",price:800},{id:"edition-2",name:"Internet Security",price:1100},{id:"edition-3",name:"Total Protection",price:1400}],description:"McAfee Total Protection — всесторонняя защита от вирусов, защита личности, безопасный VPN и менеджер паролей. Защищает неограниченное количество устройств.",systemRequirements:`
      <strong>Минимальные системные требования:</strong><br>
      • ОС: Windows 10/11, macOS 10.12, Android 5.0, iOS 12<br>
      • Процессор: Intel Pentium 4 1.5 ГГц<br>
      • ОЗУ: 2 ГБ<br>
      • Место на диске: 500 МБ<br>
      • Интернет-соединение для обновлений
         `}};function c(o){return s[o]||null}function p(){return Object.values(s)}function d(o){return Object.values(s).filter(r=>r.category===o)}function m(o,r="₽"){const a=o.toString();let t="";for(let e=a.length-1,i=0;e>=0;e--,i++)i>0&&i%3===0&&(t=" "+t),t=a[e]+t;return`<span class="formatted-price">${t}<span class="currency-separator">${r}</span></span>`}function l(o,r="₽"){const a=o.toString();let t="";for(let e=a.length-1,i=0;e>=0;e--,i++)i>0&&i%3===0&&(t=" "+t),t=a[e]+t;return`${t} ${r}`}const h={Adobe:{name:"Adobe",description:"Профессиональные инструменты для дизайна и творчества",image:"https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&crop=center"},Нейросети:{name:"Нейросети",description:"Искусственный интеллект и нейронные сети",image:"https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center"},Игры:{name:"Игры",description:"Лучшие игры для PC и консолей",image:"https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop&crop=center"},Подписки:{name:"Подписки",description:"Подписки на сервисы и программы",image:"https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop&crop=center"},Антивирусы:{name:"Антивирусы",description:"Защита компьютера и данных",image:"https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=center"}};export{d as a,c as b,h as c,l as d,m as f,p as g};
