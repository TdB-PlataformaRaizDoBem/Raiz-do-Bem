import React from 'react';
import { useOrderStats } from '../../hooks/useOrderState';

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
          <div key={pedido.id} className="py-4 flex items-center justify-between group">
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                {/* ID com estilo de Protocolo / Badge */}
                <span className="text-sm font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md border border-gray-200 font-mono">
                  #{String(pedido.id)}
                </span>
                
                <span className="text-lg font-bold text-black group-hover:text-darkgreen transition-colors">
                  {pedido.nome_completo}
                </span>
              </div>

              {/* Breve descrição do problema */}
              <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px] sm:max-w-[300px]">
                {pedido.descricao_problema}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-bold text-black bg-amber/5 border border-amber/20 px-2 py-1 rounded">
                {pedido.data}
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};