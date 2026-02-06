
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // SECURITY: Only use Environment Variable. No hardcoding.
  const apiKey = env.API_KEY || process.env.API_KEY;

  if (!apiKey) {
    console.warn("⚠️ WARNING: API_KEY is missing. App will not function correctly until configured in Netlify.");
  }

  return {
    plugins: [react()],
    define: {
      // This injects the key into the code during the build process
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Prevents crash when accessing other process.env variables
      'process.env': {}
    }
  };
});
