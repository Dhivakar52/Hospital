// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),tailwindcss()],
// })
import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = (env.VITE_API_BASE_URL || 'https://6b14-103-94-173-10.ngrok-free.app').replace(/\/+$/, '');

  const proxyConfig = {
    target,
    changeOrigin: true,
    secure: false,
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      host: true,
      proxy: {
        '/api': proxyConfig,
      },
    },
    preview: {
      host: true,
      proxy: {
        '/api': proxyConfig,
      },
    },
  };
})