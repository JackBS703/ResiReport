import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'
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
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './localhost-cert.pem')),
    },
    proxy: {
      // En desarrollo, /api/... se redirige al backend automáticamente
      // Backend puede estar en https o http (aquí http)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})