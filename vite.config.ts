import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
import { loadEnv } from 'vite';


// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      host: '0.0.0.0',
      proxy: {
        '/ask': {
          changeOrigin: true,
          // rewrite: (path:any) => path.replace(/^\/ask/, ''),
          // mock代理目标地址
          target: env.VITE_SERVER_BASEURL,
          ws: true,
        },
      },
    }
  }
})
