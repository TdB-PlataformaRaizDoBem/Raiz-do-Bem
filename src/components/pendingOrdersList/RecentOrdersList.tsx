import { LIMITE_PEDIDOS_RECENTES, useOrderStats } from '../../hooks/useOrderState';
import { PedidoLinkRow } from './PedidoLinkRow';

export const RecentOrdersList = () => {
  const { pedidosRecentes } = useOrderStats();

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl w-full shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-sm font-bold text-darkgray uppercase tracking-wider">
            Pedidos de Ajuda mais recentes
          </h4>
          <p className="text-[10px] text-gray-400 font-medium italic uppercase">
            Últimos {LIMITE_PEDIDOS_RECENTES} recebidos
          </p>
        </div>
      </div>

      {pedidosRecentes.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum pedido recebido ainda.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {pedidosRecentes.map((pedido) => (
            <PedidoLinkRow key={pedido.id} pedido={pedido} mostrarStatus />
          ))}
        </div>
      )}
    </div>
  );
};
