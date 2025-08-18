import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command }) => ({
  // В dev используем корень, в проде — подкаталог репозитория для GitHub Pages
  // Можно переопределить через VITE_BASE из CI, если нужно другой путь
  base: command === 'serve' ? '/' : (process.env.VITE_BASE || '/tgapp/'),
  build: {
    rollupOptions: {
      input: {
        main: resolve(fileURLToPath(new URL('.', import.meta.url)), 'index.html'),
        category: resolve(fileURLToPath(new URL('.', import.meta.url)), 'category.html'),
        product: resolve(fileURLToPath(new URL('.', import.meta.url)), 'product.html'),
        info: resolve(fileURLToPath(new URL('.', import.meta.url)), 'info.html')
      }
    }
  }
}))