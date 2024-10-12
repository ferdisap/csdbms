import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions:{
      input: [
        "index.html",
        "login.html",
        // "src/assets/js/worker/ListTree.js"
      ],
      // external: ['json'],
      // output: {
      //   globals:{
      //     json: 'json'
      //   }
      // }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
            global: 'globalThis',
        },
    },
},
})
