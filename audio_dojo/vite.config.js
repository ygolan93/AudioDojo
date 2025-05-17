// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path  from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Redirect your old Node‐only API to a browser‐safe implementation
      './utils/audioAPI.js': path.resolve(__dirname, 'src/utils/browserAudioAPI.js'),

      // Stub out all Node built‐ins so Vite stops trying to bundle them
      fs:                   path.resolve(__dirname, 'src/shims/empty.js'),
      path:                 path.resolve(__dirname, 'src/shims/empty.js'),
      dotenv:               path.resolve(__dirname, 'src/shims/empty.js'),
      'node-web-audio-api': path.resolve(__dirname, 'src/shims/browserAudioContext.js'),
      'wav-encoder':        path.resolve(__dirname, 'src/shims/empty.js'),
      cloudinary:           path.resolve(__dirname, 'src/shims/empty.js'),
    }
  },
  optimizeDeps: {
    // Don’t pre-bundle these (they’re just empty shims in the client)
    exclude: [
      'fs',
      'path',
      'dotenv',
      'node-web-audio-api',
      'wav-encoder',
      'cloudinary'
    ]
  }
});
