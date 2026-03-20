import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // コンテナ外からアクセスできるよう 0.0.0.0 にバインド
    port: 5173,
  },
  optimizeDeps: {
    include: ['typescript'],
  },
})
