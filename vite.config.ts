import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
    react(),
    tailwindcss(),
    ],
    server: {
      host: `${env.VITE_HOST}`,
      port: env.VITE_PORT ? Number(env.VITE_PORT) : 5173,
      allowedHosts: [
      'looksmart-properties-introducing-habits.trycloudflare.com'
    ],
    },
  }
})