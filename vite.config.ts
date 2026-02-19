
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Fix: Removed loadEnv and process.cwd() usage which was causing a TypeScript error.
// Adhering to the @google/genai guidelines: process.env.API_KEY is assumed to be 
// pre-configured and accessible in the execution context. We must not manually define 
// process.env or manage the API_KEY within the application configuration.
export default defineConfig(() => {
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
          },
        },
      },
    }
  };
});
