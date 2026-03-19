import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

// Reconstruimos __dirname porque Vite usa ESM y no lo provee por defecto
const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4: ya no necesita postcss.config.js ni tailwind.config.js
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Permite imports tipo @/components/...
    },
  },
  server: {
    proxy: {
      // En desarrollo, /api/... se redirige al backend automáticamente
      // Evita hardcodear http://localhost:5000 en cada llamada de Axios
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})