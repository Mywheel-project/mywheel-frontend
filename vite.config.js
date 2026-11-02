import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
	server: {
    host: true, // 0.0.0.0으로 열어 외부 접속 허용
		allowedHosts: true,
    port: 5173  // 필요시 포트 지정 (기본 5173)
  }
})
