import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Same-origin `/api` → Express backend on :3000 (no CORS, works in
      // Codespaces regardless of the forwarded *.app.github.dev host).
      '/api': 'http://localhost:3000',
    },
  },
})
