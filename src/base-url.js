export const withBase = (path) => {
  // Нормализуем относительный путь
  const normalized = path.startsWith('/') ? path.slice(1) : path;

  // Берём base от Vite (в проде он подставляется как строка)
  let base = '/';
  try {
    base = (import.meta?.env?.BASE_URL) || '/';
  } catch (_) {
    base = '/';
  }

  // Гарантируем завершающий слэш
  if (base && !base.endsWith('/')) base += '/';

  return `${base}${normalized}`;
};


