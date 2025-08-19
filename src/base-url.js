export const withBase = (path) => {
  // Нормализуем относительный путь
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  // Универсально строим путь относительно текущего документа (работает в dev и на GitHub Pages)
  if (typeof window !== 'undefined' && window.document?.baseURI) {
    const absolute = new URL(normalized, window.document.baseURI);
    // Возвращаем путь без origin, чтобы оставаться в пределах текущего хоста
    return absolute.pathname;
  }
  // Фолбэк для SSR/без window
  return `/${normalized}`;
};


