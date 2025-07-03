# TG App

Веб-приложение для магазина в Telegram.

## Деплой

Приложение автоматически деплоится на GitHub Pages при каждом пуше в main ветку.

**URL приложения:** https://leankye.github.io/tgapp/

## Разработка

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Сборка для продакшена
```bash
npm run build
```

### Предварительный просмотр сборки
```bash
npm run preview
```

## Структура проекта

- `index.html` - главная страница (каталог)
- `category.html` - страница категории
- `product.html` - страница товара
- `src/` - исходные файлы (стили, скрипты, данные)
- `public/` - статичные файлы

## Автоматический деплой

Настроен GitHub Actions workflow для автоматического деплоя на GitHub Pages:
- `.github/workflows/pages.yml` - основной workflow
- `.github/workflows/deploy.yml` - альтернативный workflow

Деплой происходит автоматически при каждом пуше в main ветку.

---
Создано с ❤️ by LeanKye
