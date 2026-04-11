type AsyncEstadoProps = {
  loading: boolean;
  error: string | null;
  vazio?: boolean;
  mensagemVazio?: string;
  children: React.ReactNode;
};

export const AsyncEstado = ({
  loading,
  error,
  vazio = false,
  mensagemVazio = "Nenhum registro encontrado.",
  children,
}: AsyncEstadoProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 w-full">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-darkgreen border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 w-full">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="font-bold text-red-700 mb-1">Erro ao carregar dados</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (vazio) {
    return (
      <div className="flex items-center justify-center py-24 w-full">
        <p className="text-sm text-gray-400 italic">{mensagemVazio}</p>
      </div>
    );
  }

  return <>{children}</>;
};