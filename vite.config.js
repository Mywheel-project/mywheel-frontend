import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',          // 브라우저 흉내 (document, localStorage 사용 가능)
    globals: true,                 // describe/it/expect 를 import 없이 사용
    setupFiles: './src/setupTests.js',
  },
})