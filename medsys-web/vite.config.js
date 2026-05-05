import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/v1/chatbot': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/auth': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/admin': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        ws: true,
      },
      '/ws-native': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
