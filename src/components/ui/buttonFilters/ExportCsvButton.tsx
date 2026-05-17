import React from "react";
import { Button } from "../Button";
import { useNotification } from "../../../hooks/useNotification";

type ExportCsvButtonProps = {
  onExport: () => Promise<Blob>;
  fileName: string;
  label?: string;
};

const ExportCsvButton = ({
  onExport,
  fileName,
  label = "Exportar CSV",
}: ExportCsvButtonProps) => {
  const [loading, setLoading] = React.useState(false);
  const { showNotification } = useNotification();

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await onExport();

      // Cria uma URL temporária apontando para o blob e dispara o download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Limpeza: remove o elemento e libera a URL da memória
      link.remove();
      URL.revokeObjectURL(url);

      showNotification(`Arquivo "${fileName}" exportado com sucesso!`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao exportar CSV.";
      showNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4 shrink-0"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {loading ? "Exportando..." : label}
    </Button>
  );
};

export default ExportCsvButton;
