import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Explicit base path for deployment
  build: {
    outDir: 'dist', // Explicitly set the output directory
    emptyOutDir: true, // Clear the output directory before building
    minify: 'terser', // Use terser for minification
    sourcemap: false, // Disable sourcemaps in production
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks for better caching
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            'chart.js',
            'react-chartjs-2'
          ],
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true
  }
})
