/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site from /<repo-name>/
  base: '/kids-typing/',
  // Keep CSS fallbacks for older Chromebooks that no longer get Chrome updates
  build: {
    cssTarget: 'chrome87',
  },
  define: {
    __BUILD_SHA__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) ?? 'dev'),
  },
  test: {
    environment: 'node',
  },
})
