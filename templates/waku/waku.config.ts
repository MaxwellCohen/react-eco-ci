import react from '@vitejs/plugin-react';
import { defineConfig } from 'waku/config';

export default defineConfig({
  unstable_adapter: 'waku/adapters/cloudflare',
  vite: { plugins: [react()] },
});
