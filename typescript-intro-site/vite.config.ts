import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages（プロジェクトサイト）は /リポジトリ名/ 配下になる。CI で VITE_BASE_PATH を渡す。
const base = process.env.VITE_BASE_PATH?.replace(/\/?$/, '/') || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  optimizeDeps: {
    include: ['typescript'],
  },
})
