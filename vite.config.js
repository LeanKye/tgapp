import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/tgapp/',
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