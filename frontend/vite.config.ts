import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/species': 'http://localhost:8000',
      '/recommend': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
    },
  },
})
