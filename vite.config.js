import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: {
        index: './index.html',
        main: 'src/scripts/content/index.js',
        // thrifting: 'src/scripts/content/thrifting.js',
      },
      output: {
        entryFileNames: `[name].js`,
        assetFileNames: assetInfo => {
          return assetInfo.name
        },
      },
    },
  },
  optimizeDeps: {
    entries: ['src/*.html'],
  },
})
