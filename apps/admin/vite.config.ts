import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const sharedTypesPath = new URL('../../packages/shared-types/src/index.ts', import.meta.url).pathname;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@bambucamp/shared-types': sharedTypesPath,
    },
  },
})
