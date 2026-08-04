import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite.config.ts — настройки сборщика Vite
// plugin-react: позволяет React-коду работать внутри Vite
// server.proxy: все запросы к /api пойдут на бэк (позже заменим на адрес Go-сервера)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
