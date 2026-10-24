import { Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import type { PedidoViewModel } from "../../domain/mappers/PedidoMapper";
import { caminhoDoPedido } from "../../utils/pedidoRoutes";

interface PedidoLinkRowProps {
  pedido: PedidoViewModel;
  /** Mostra o status ao lado da data (útil quando a lista mistura pendentes, aprovados e negados). */
  mostrarStatus?: boolean;
}

/** Linha de pedido do painel. Clicar leva à tela de Pedidos de Ajuda com o modal desse pedido aberto. */
export const PedidoLinkRow = ({ pedido, mostrarStatus = false }: PedidoLinkRowProps) => {
  const user = useUser();

  return (
    <Link
      to={caminhoDoPedido(user?.role, pedido.id)}
      className="py-4 px-2 -mx-2 flex items-center justify-between gap-4 group rounded-lg transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/40"
    >
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-3">
          {/* ID com estilo de Protocolo / Badge */}
          <span className="text-sm font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md border border-gray-200 font-mono">
            #{String(pedido.id)}
          </span>

          <span className="text-lg font-bold text-black group-hover:text-darkgreen transition-colors">
            {pedido.nomeCompleto}
          </span>
        </div>

        {/* Breve descrição do problema */}
        <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px] sm:max-w-[300px]">
          {pedido.descricaoProblema}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-bold text-black bg-amber/5 border border-amber/20 px-2 py-1 rounded">
            {pedido.dataPedido}
          </span>
          {mostrarStatus && (
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${pedido.statusClass}`}>
              {pedido.statusLabel}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 rounded-lg border border-darkgreen/30 px-3 py-1.5 text-xs font-bold text-darkgreen transition-colors group-hover:bg-darkgreen group-hover:text-white">
          <span className="sr-only sm:not-sr-only">Analisar</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
};
