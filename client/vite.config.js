import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      '/inventory':{
        target:
        'https://inventory-hudeentech-hudeens-projects-c7c7e208.vercel.app',
        changeOrigin:true,
      }
    }
  }
})
