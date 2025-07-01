import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/tgapp/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(fileURLToPath(new URL('.', import.meta.url)), 'index.html'),
        category: resolve(fileURLToPath(new URL('.', import.meta.url)), 'category.html'),
        product: resolve(fileURLToPath(new URL('.', import.meta.url)), 'product.html')
      }
    }
  }
}) 