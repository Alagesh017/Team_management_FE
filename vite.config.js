import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),  tailwindcss(),],
  base: './',
  server: {
    force: true,
    https: true // Force Vite to clear its cache
  },
  cacheDir: '.vite-cache', // Change cache dir to force fresh start
})
