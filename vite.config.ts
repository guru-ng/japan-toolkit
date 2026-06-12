import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/japan-toolkit/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'date-converter': resolve(__dirname, 'date-converter/index.html'),
        'postal-lookup': resolve(__dirname, 'postal-lookup/index.html'),
        'pr-calculator': resolve(__dirname, 'pr-calculator/index.html'),
        'privacy-policy': resolve(__dirname, 'privacy-policy/index.html'),
      },
    },
  },
})
