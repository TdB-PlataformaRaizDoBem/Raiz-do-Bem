const FullScreenLoader = () => (
  <div
    role="status"
    aria-live="polite"
    aria-label="Verificando autenticação..."
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white gap-4"
  >
    <div
      className="w-12 h-12 border-4 border-lightgreen border-t-transparent rounded-full animate-spin"
      aria-hidden="true"
    />
    <p className="text-sm text-gray-400 font-medium tracking-wide">
      Carregando...
    </p>
  </div>
);

export default FullScreenLoader;
