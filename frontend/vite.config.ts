import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Froala 에디터 묶음(약 800KB)은 에디터가 있는 화면에서만 따로 불러오므로 경고 기준을 그 크기에 맞춘다
    chunkSizeWarningLimit: 900,
  },
});
