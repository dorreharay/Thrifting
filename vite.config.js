import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, defineManifest } from '@crxjs/vite-plugin'
import svgr from 'vite-plugin-svgr'

// import manifest from './public/manifest.json'

const viteManifestHackIssue846 = {
  // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
  name: 'manifestHackIssue846',
  renderCrxManifest(_manifest, bundle) {
    bundle['manifest.json'] = bundle['.vite/manifest.json']
    bundle['manifest.json'].fileName = 'manifest.json'
    delete bundle['.vite/manifest.json']
  },
}

const manifest = defineManifest({
  manifest_version: 3,
  name: 'CreatorsInc. Extension',
  version: '1.6.0',
  description: 'internal tool',
  action: {
    default_popup: 'index.html',
  },
  icons: {
    16: 'icons/icon-16.png',
    32: 'icons/icon-32.png',
  },
  permissions: [
    'cookies',
    'tabs',
    'history',
    'storage',
    'privacy',
    'browsingData',
  ],
  web_accessible_resources: [
    {
      matches: ['<all_urls>'],
      resources: ['src/scripts/content/*'],
    },
  ],
  content_scripts: [
    {
      js: ['src/scripts/content/index.js'],
      matches: ['<all_urls>'],
    },
    {
      js: ['src/scripts/content/thrifting.js'],
      matches: ['<all_urls>'],
    },
  ],
  background: {
    service_worker: 'src/scripts/background/index.js',
  },
  host_permissions: ['https://onlyfans.com/*'],
})

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
