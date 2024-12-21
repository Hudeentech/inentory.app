import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      '/inventory':{
        target:
        ['http://localhost:3000', 'https://inentory-app.vercel.app'],
        changeOrigin:true,
      }
    }
  }
})
