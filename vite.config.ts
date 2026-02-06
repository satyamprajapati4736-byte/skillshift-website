
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' ensures we load ALL variables (like API_KEY), not just VITE_* ones.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Try to find the key in various standard locations
  const apiKey = env.API_KEY || process.env.API_KEY || env.VITE_API_KEY;

  // Log status for build debugging (Visible in Netlify Deploy Logs)
  console.log(`[SkillShift Build] API Key detected: ${apiKey ? 'Yes (Securely Injected)' : 'No (Missing)'}`);

  return {
    plugins: [react()],
    define: {
      // This injects the key string directly into the code where 'process.env.API_KEY' is used
      'process.env.API_KEY': JSON.stringify(apiKey),
      // We removed the generic 'process.env': {} to prevent it from accidentally hiding our key
    }
  };
});
