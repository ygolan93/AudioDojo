// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@cloudinary/url-gen": "@cloudinary/url-gen",
      "@cloudinary/react": "@cloudinary/react"
    }
  }
});
