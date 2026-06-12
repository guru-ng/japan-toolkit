import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // GitHub Pages serves from /japan-toolkit/; Netlify serves from the domain root.
  // Set DEPLOY_TARGET=netlify in Netlify's build environment when re-enabling it.
  base: process.env.DEPLOY_TARGET === 'netlify' ? '/' : '/japan-toolkit/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'date-converter': resolve(__dirname, 'date-converter/index.html'),
        'postal-lookup': resolve(__dirname, 'postal-lookup/index.html'),
        'pr-calculator': resolve(__dirname, 'pr-calculator/index.html'),
        'privacy-policy': resolve(__dirname, 'privacy-policy/index.html'),
        guides: resolve(__dirname, 'guides/index.html'),
        'guides-japanese-eras': resolve(__dirname, 'guides/japanese-eras/index.html'),
        'guides-japanese-addresses': resolve(__dirname, 'guides/japanese-addresses/index.html'),
        'guides-hsp-points': resolve(__dirname, 'guides/hsp-points/index.html'),
      },
    },
  },
})
