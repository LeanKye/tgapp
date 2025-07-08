// Утилиты для отладки полноэкранного режима на iOS
class IOSFullscreenDebugger {
  constructor() {
    this.isDebugMode = false;
    this.init();
  }

  init() {
    // Добавляем отладочную информацию только в development режиме
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('192.168')) {
      this.isDebugMode = true;
      this.addDebugPanel();
    }
  }

  addDebugPanel() {
    // Создаем панель отладки
    const debugPanel = document.createElement('div');
    debugPanel.id = 'ios-debug-panel';
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
      display: none;
    `;

    // Добавляем информацию об устройстве
    const deviceInfo = this.getDeviceInfo();
    debugPanel.innerHTML = `
      <div><strong>Device Debug Info:</strong></div>
      <div>User Agent: ${deviceInfo.userAgent}</div>
      <div>Platform: ${deviceInfo.platform}</div>
      <div>Screen: ${deviceInfo.screenWidth}x${deviceInfo.screenHeight}</div>
      <div>Viewport: ${deviceInfo.viewportWidth}x${deviceInfo.viewportHeight}</div>
      <div>Is iOS: ${deviceInfo.isIOS}</div>
      <div>Is Telegram: ${deviceInfo.isTelegram}</div>
      <div>Safe Area Top: ${deviceInfo.safeAreaTop}</div>
      <div>Safe Area Bottom: ${deviceInfo.safeAreaBottom}</div>
      <div>Body Padding Top: ${deviceInfo.bodyPaddingTop}</div>
      <div>Has iOS Class: ${deviceInfo.hasIOSClass}</div>
      <button onclick="this.parentElement.style.display='none'" style="margin-top: 5px; padding: 2px 5px;">Close</button>
    `;

    document.body.appendChild(debugPanel);

    // Добавляем кнопку для показа/скрытия панели
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Debug';
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: #29A5FF;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      font-size: 12px;
      z-index: 9999;
      cursor: pointer;
    `;
    toggleButton.onclick = () => {
      debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
    };

    document.body.appendChild(toggleButton);
  }

  getDeviceInfo() {
    const computedStyle = window.getComputedStyle(document.body);
    const htmlStyle = window.getComputedStyle(document.documentElement);
    const tg = window.Telegram?.WebApp;
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
      isTelegram: window.Telegram && window.Telegram.WebApp,
      safeAreaTop: computedStyle.getPropertyValue('--safe-area-inset-top') || 
                   getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || 
                   'undefined',
      safeAreaBottom: computedStyle.getPropertyValue('--safe-area-inset-bottom') || 
                      getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || 
                      'undefined',
      bodyPaddingTop: computedStyle.paddingTop,
      bodyTop: computedStyle.top,
      bodyHeight: computedStyle.height,
      htmlTop: htmlStyle.top,
      htmlHeight: htmlStyle.height,
      hasIOSClass: document.body.classList.contains('telegram-ios-fullscreen'),
      // Telegram Web App специфичная информация
      tgPlatform: tg ? tg.platform : 'undefined',
      tgVersion: tg ? tg.version : 'undefined',
      tgIsExpanded: tg ? tg.isExpanded : 'undefined',
      tgViewportHeight: tg ? tg.viewportHeight : 'undefined',
      tgViewportStableHeight: tg ? tg.viewportStableHeight : 'undefined',
      tgHeaderColor: tg ? tg.headerColor : 'undefined',
      tgBackgroundColor: tg ? tg.backgroundColor : 'undefined'
    };
  }

  logDeviceInfo() {
    if (this.isDebugMode) {
      console.log('iOS Fullscreen Debug Info:', this.getDeviceInfo());
    }
  }
}

// Инициализация отладчика только в development режиме
if (window.location.hostname === 'localhost' || window.location.hostname.includes('192.168')) {
  window.iosDebugger = new IOSFullscreenDebugger();
  
  // Логируем информацию при загрузке
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.iosDebugger.logDeviceInfo();
    }, 1000);
  });
} 