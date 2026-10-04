/// <reference types="vitest/config" />
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
    // `node`, e não `jsdom`: os testes cobrem REGRA — a decisão de exibir o selo
    // de procedência — e não pintura. Regra testada como função pura roda em
    // milissegundos, não quebra por mudança de classe do Tailwind e não pede
    // jsdom + testing-library no package.json. Se um dia houver comportamento
    // de componente para testar, troque para `jsdom` neste ponto.
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
