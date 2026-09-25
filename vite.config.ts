import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api/nig': {
          target: 'https://nt.studybeepro.site',
          changeOrigin: true,
          secure: false,
        },
        '/api/foy': {
          target: 'https://nt.studybeepro.site',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (proxyReq.path && !proxyReq.path.includes('key=SB-')) {
                const sep = proxyReq.path.includes('?') ? '&' : '?';
                proxyReq.path += `${sep}key=SB-AUTO-PASS-01&device_id=dev_enforced_user`;
              }
            });
          },
        },
      },
    },
  };
});
