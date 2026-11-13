import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwind from '@tailwindcss/vite';
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const mockMode =
    command === 'serve' && (process.env.VITE_ENABLE_MSW ?? env.VITE_ENABLE_MSW) === 'true';
  return {
    plugins: [react(), tailwind()],
    resolve: {
      alias: [
        ...(mockMode
          ? [
              {
                find: '@/context/AuthContext',
                replacement: path.resolve(__dirname, 'src/mocks/MockAuthContext.tsx'),
              },
              {
                find: '@/hooks/useSearch',
                replacement: path.resolve(__dirname, 'src/mocks/MockSearch.ts'),
              },
              {
                find: '@/context/WebSocketContext',
                replacement: path.resolve(__dirname, 'src/mocks/MockWebSocketContext.tsx'),
              },
            ]
          : []),
        { find: '@', replacement: path.resolve(__dirname, 'src') },
      ],
    },
    define: {
      global: 'window',
      'import.meta.env.VITE_ENABLE_MSW': JSON.stringify(mockMode ? 'true' : 'false'),
      ...(mockMode ? { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('') } : {}),
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (pathName) => pathName.replace(/^\/api/, '/api'),
        },
      },
    },
  };
});
