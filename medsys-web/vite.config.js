import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Routes d'authentification et d'administration → ms-auth (8082)
      '/api/v1/auth': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/admin': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      // Toutes les autres routes /api/v1 → ms-patient-personnel (8081)
      '/api/v1': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
