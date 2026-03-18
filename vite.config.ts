import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:3000';
  const isRemote = proxyTarget.includes('social-pulse.aparagarwal.tech');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api/v1': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            if (isRemote) {
              proxy.on('proxyRes', (proxyRes) => {
                const setCookie = proxyRes.headers['set-cookie'];
                if (setCookie) {
                  // Strip Domain, Secure, and SameSite attributes for localhost dev
                  proxyRes.headers['set-cookie'] = setCookie.map(s =>
                    s.replace(/Domain=[^; ]+;? ?/gi, '')
                      .replace(/Secure;? ?/gi, '')
                      .replace(/SameSite=[^; ]+;? ?/gi, '')
                  );
                }
              });
            }
          },
        },
      },
    },
  }
})
