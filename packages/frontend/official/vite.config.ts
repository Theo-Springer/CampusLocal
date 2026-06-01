import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    fs: {
      // Autorise Vite à aller chercher des fichiers dans le dossier partagé (shared)
      allow: ['..', '../../shared']
    }
  }
});