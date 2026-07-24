import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    // Dev proxy: forwards /api calls to local backend
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  // In production (Vercel), VITE_API_URL is set to the Render backend URL
  // e.g. https://keystone-api.onrender.com
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL ?? ''),
  },
})
