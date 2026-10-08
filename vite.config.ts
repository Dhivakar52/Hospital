// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),tailwindcss()],
// })
import fs from "fs"
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  const getDynamicTarget = () => {
    try {
      const configPath = path.resolve(process.cwd(), 'public/config.json');
      if (fs.existsSync(configPath)) {
        const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (cfg.API_BASE_URL) {
          return cfg.API_BASE_URL.replace(/\/+$/, '');
        }
      }
    } catch {}
    return '';
  };

  const proxyConfig = {
    target: getDynamicTarget(),
    router: () => getDynamicTarget(),
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