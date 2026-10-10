/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    clearMocks: true,
    // Testes de formulário (react-hook-form + user-event) passam de 5s em máquinas lentas.
    testTimeout: 20000,
    // Os testes importam `render`/`renderHook` de '@testing-library/react': o alias entrega a versão
    // com QueryClientProvider embutido (src/test/rtl.tsx), como o App faz em produção.
    alias: [
      {
        find: /^@testing-library\/react$/,
        replacement: fileURLToPath(new URL('./src/test/rtl.tsx', import.meta.url)),
      },
    ],
    // Os testes assumem as URLs-padrão do código (sem .env): o Vite carregaria o .env local.
    env: { VITE_API_BASE_URL: '', VITE_CHAT_API_URL: '', VITE_GEO_API_URL: 'http://localhost:8000' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}', 'src/__tests__/**', 'src/test/**', 'src/main.tsx', 'src/**/*.d.ts',
        // Só declaram tipos (não geram código): nunca são importados em tempo de execução.
        'src/domain/entities/ChatSummary.ts', 'src/domain/entities/VulnerabilidadeGeoAPI.ts',
        'src/components/UserManagement/FilterConfig.ts',
      ],
      // Meta do projeto: 92% de cobertura. `npm test` falha se qualquer métrica cair abaixo.
      thresholds: { statements: 92, branches: 92, functions: 92, lines: 92 },
    },
  },
})
