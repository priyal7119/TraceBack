import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_GATEWAY_URL || env.VITE_API_TARGET || 'https://egtijfq23f.execute-api.us-east-1.amazonaws.com';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: true,
      open: false,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.warn('[Proxy] API Gateway error:', err.message);
            });
          },
        },
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.warn('[Proxy] Uploads proxy error:', err.message);
            });
          },
        }
      }
    }
  };
});
