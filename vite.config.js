import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/tgapp/', // Замените на название вашего репозитория
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        category: resolve(__dirname, 'category.html'),
        product: resolve(__dirname, 'product.html')
      }
    }
  }
}) 