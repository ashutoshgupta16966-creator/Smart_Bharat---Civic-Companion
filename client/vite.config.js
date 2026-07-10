import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://smart-bharat-civic-companion-rk6z.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
