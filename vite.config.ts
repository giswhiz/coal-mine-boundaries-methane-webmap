import { defineConfig } from 'vite'

// GitHub Pages project site: https://giswhiz.github.io/coal-mine-boundaries-methane-webmap/
export default defineConfig({
  base: '/coal-mine-boundaries-methane-webmap/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
