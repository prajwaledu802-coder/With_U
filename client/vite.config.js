import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/loaders/FBXLoader', 'fflate'],
  },
  assetsInclude: ['**/*.fbx'],
});
