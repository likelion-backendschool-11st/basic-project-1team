import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 관리자 사이트 빌드·개발 서버 설정. 사용자 사이트(vite.config.ts)와 주소(포트)가 달라
 * 로그인 토큰을 공유하지 않으므로 관리자는 관리자 사이트에서 따로 로그인한다.
 *   개발: npm run dev:admin → http://localhost:5174/admin
 *   빌드: npm run build:admin → dist-admin/
 */
const ADMIN_HTML = 'admin.html';

// 개발 서버에서 화면 주소(/admin/members 등)를 새로 읽어도 admin.html 을 내주도록 한다 (기본은 index.html)
const serveAdminHtml = () => ({
  name: 'serve-admin-html',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
        req.url = `/${ADMIN_HTML}`;
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), serveAdminHtml()],
  server: {
    port: 5174,
    strictPort: true,
    // 사용자 사이트와 같은 백엔드(backend/, 기본 3000번)로 /api 요청을 넘긴다 (API_SPEC 1.1)
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist-admin',
    rollupOptions: { input: ADMIN_HTML },
    // Froala 에디터 묶음(약 800KB)은 에디터가 있는 화면에서만 따로 불러오므로 경고 기준을 그 크기에 맞춘다
    chunkSizeWarningLimit: 900,
  },
});
