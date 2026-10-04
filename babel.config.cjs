// Usado apenas pelo Jest (o Vite compila com SWC).
// `import.meta.env.*` (Vite) é convertido para `process.env.*` para rodar no Node.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: ['transform-vite-meta-env'],
};
