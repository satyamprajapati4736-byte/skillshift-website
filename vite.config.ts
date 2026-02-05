
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Check if API_KEY is available during build
  const apiKey = env.API_KEY || process.env.API_KEY;

  if (!apiKey) {
    console.warn("⚠️ WARNING: API_KEY is missing in build environment. The app will not function correctly without it.");
  }

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY with the value found during build
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Prevent other process.env access from crashing in browser
      'process.env': {}
    }
  };
});
