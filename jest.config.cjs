/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    // render/renderHook com QueryClientProvider embutido (ver src/test/rtl.tsx)
    '^@testing-library/react$': '<rootDir>/src/test/rtl.tsx',
    // Assets e estilos não importam para testes unitários
    '\.(css|svg|png|jpe?g|gif|webp)$': '<rootDir>/src/test/fileMock.ts',
  },
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/test/**',
    '!src/main.tsx',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  // Meta do projeto: 92% de cobertura. `npm run test:coverage` falha se qualquer métrica cair abaixo.
  coverageThreshold: {
    global: { statements: 92, branches: 92, functions: 92, lines: 92 },
  },
};
