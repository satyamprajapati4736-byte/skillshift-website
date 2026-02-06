
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Casting process to any to avoid TypeScript errors in some environments
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Priority: Netlify Environment > Local .env file
  const apiKey = process.env.API_KEY || env.API_KEY;

  console.log(`[SkillShift Build] API Key Status: ${apiKey ? 'Present' : 'Missing (Check Netlify Deploys)'}`);

  return {
    plugins: [react()],
    define: {
      // Securely inject the key. If missing, inject empty string "" to prevent 'undefined' errors.
      'process.env.API_KEY': JSON.stringify(apiKey || ''),
    }
  };
});
