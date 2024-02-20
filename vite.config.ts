import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve('src', 'index.ts'),
      name: 'Momentum Modal',
      fileName: 'momentum-modal-react',
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@inertiajs/react', 'axios'],
    },
  },
  plugins: [
    react(),
    dts({
      outDir: 'dist/types',
    }),
  ],
});
