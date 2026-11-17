import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 서버에서 /api 요청을 백엔드(backend/, 기본 3000번)로 넘긴다 (API_SPEC 1.1)
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
