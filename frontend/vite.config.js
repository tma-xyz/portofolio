import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Frontend Service murni mandiri
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
