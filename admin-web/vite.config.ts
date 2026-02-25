import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  base: process.env.VERCEL ? '/' : '/admin/',
  build: {
    outDir: process.env.VERCEL ? 'dist' : '../web-store/public/admin',
    emptyOutDir: true,
  }
})
