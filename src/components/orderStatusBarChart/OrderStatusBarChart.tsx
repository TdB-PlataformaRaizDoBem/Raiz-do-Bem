import React from "react";
import { useStats } from "../../hooks/useStats";
import time from "../../assets/svgs/time.svg";
import approved from "../../assets/svgs/approved.svg";
import denied from "../../assets/svgs/denied.svg";

export const OrdersStatusBarChart = () => {
  const { statusCounts } = useStats();

  let data = [
    {
      label: "Pendentes",
      value: statusCounts.pendente,
      color: "bg-amber",
      icon: time,
    },
    {
      label: "Aprovados",
      value: statusCounts.aprovado,
      color: "bg-lightgreen",
      icon: approved,
    },
    {
      label: "Negados",
      value: statusCounts.negado,
      color: "bg-red-500",
      icon: denied,
    },
  ];

  // Ordena do maior para o menor
  data = data.sort((a, b) => b.value - a.value);

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-[#f4f4f4] p-5 sm:p-6 rounded-2xl w-full shadow-sm border border-gray-100">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-bold text-darkgray uppercase tracking-wider">
          Status dos Pedidos
        </h4>
        <span className="text-xs text-gray-400">
          Total: {total}
        </span>
      </div>

      {/* GRÁFICO */}
      <div className="flex flex-col gap-5">
        {data.map((item) => {
          const width = (item.value / maxVal) * 100;
          const percent = total > 0
            ? ((item.value / total) * 100).toFixed(0)
            : 0;

          return (
            <div key={item.label} className="flex flex-col gap-2 group">
              
              {/* Label + valor */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img className="w-6 h-6" src={item.icon} alt="" />
                  <span className="text-sm font-medium text-gray-600">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {percent}%
                  </span>
                  <span className="text-sm font-bold text-darkgray">
                    {item.value}
                  </span>
                </div>
              </div>

              {/* Barra */}
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${width}%` }}
                  className={`
                    ${item.color}
                    h-full
                    rounded-full
                    transition-all duration-700 ease-out
                    group-hover:brightness-110
                  `}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};