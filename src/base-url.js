export const withBase = (path) => {
  // Нормализуем относительный путь
  const normalized = path.startsWith('/') ? path.slice(1) : path;

  // 1) Пытаемся взять base от Vite (в проде он подставляется как строка)
  let base = '/';
  try {
    base = (import.meta?.env?.BASE_URL) || '/';
  } catch (_) {
    base = '/';
  }

  // 2) В production предпочтительно выводим base из текущего URL (надёжно для GitHub Pages и кастомных доменов)
  // В dev всегда используем BASE_URL из Vite (обычно "/").
  if ((import.meta?.env?.PROD) && typeof window !== 'undefined') {
    const pathname = window.location.pathname || '/';
    // Разбиваем путь на сегменты без пустых значений
    const parts = pathname.split('/').filter(Boolean);
    // Если первый сегмент не похож на имя файла (без точки) — считаем его base каталогом
    if (parts.length > 0 && !parts[0].includes('.')) {
      base = `/${parts[0]}/`;
    } else {
      base = '/';
    }
  }

  // Гарантируем завершающий слэш
  if (base && !base.endsWith('/')) base += '/';

  return `${base}${normalized}`;
};


