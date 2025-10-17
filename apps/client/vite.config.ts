import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr';

const sharedTypesPath = new URL('../../packages/shared-types/src/index.ts', import.meta.url).pathname;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      // Enable exporting as ReactComponent
      svgrOptions: {
        icon: true, // Adjust this if you need to customize SVG properties
      },
      include: "**/*.svg?react",
    }),
  ],
  resolve: {
    alias: {
      '@bambucamp/shared-types': sharedTypesPath,
    },
  },
})
