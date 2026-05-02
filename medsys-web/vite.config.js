import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // ── Chatbot → port 8083 ────────────────────────────────────
      '/api/v1/chatbot': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
      },
      // ── Auth endpoints → port 8082 (ms-auth) ──────────────────
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
      // ── Tout le reste /api/v1/* → port 8081 (ms-patient-personnel)
      '/api/v1': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      // ── WebSocket notifications → port 8081 ───────────────────
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
