import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, 'src')
const outDir = path.resolve(__dirname, 'dist')

export default defineConfig(() => ({
  root: srcDir,
  publicDir: path.resolve(srcDir, 'public'),
  base: '/',
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'd3': ['d3', 'd3-geo', 'd3-geo-projection', 'd3-composite-projections'],
          'vue-core': ['vue', 'vue-router', 'pinia'],
          'plot': ['@observablehq/plot'],
          'geo-data': ['topojson-client'],
        },
      },
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    eslint({
      failOnError: false,
      failOnWarning: false,
    }),
  ],
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
}))
