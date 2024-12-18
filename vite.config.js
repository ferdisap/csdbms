import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // define:{
  //   'process.env': loadEnv('development',process.cwd(),'') // jika mau paka import path form 'path
  // },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['text-editor'].includes(tag)
        }
      }
    }),
  ],
  build: {
    rollupOptions: {
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
