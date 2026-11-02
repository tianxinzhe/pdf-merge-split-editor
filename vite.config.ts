import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 纯网页版配置：
// - base 使用相对路径，dist 可直接部署到任意子目录（GitHub Pages / 静态托管 / 反向代理）
// - 不使用浏览器扩展的 manifest / background 打包逻辑
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    // pdfjs 的 worker / wasm / cmaps / 字体体积较大，放宽体积警告阈值
    chunkSizeWarningLimit: 2000,
  },
  worker: {
    format: 'es',
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
})