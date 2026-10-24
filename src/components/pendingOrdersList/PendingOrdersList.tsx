import { useOrderStats } from '../../hooks/useOrderState';
import { PedidoLinkRow } from './PedidoLinkRow';

export const CriticalOrdersList = () => {
  const { pedidosCriticos } = useOrderStats();

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl w-full shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-sm font-bold text-darkgray uppercase tracking-wider">
            Pedidos de Ajuda sem resposta há mais tempo
          </h4>
          <p className="text-[10px] text-gray-400 font-medium italic uppercase">Top 10 mais antigos</p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {pedidosCriticos.map((pedido) => (
          <PedidoLinkRow key={pedido.id} pedido={pedido} />
        ))}
      </div>
    </div>
  );
};
