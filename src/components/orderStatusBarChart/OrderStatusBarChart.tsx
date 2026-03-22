import { useOrderStats } from "../../hooks/useOrderState";
import time from "../../assets/svgs/time.svg";
import approved from "../../assets/svgs/approved.svg";
import denied from "../../assets/svgs/denied.svg";

export const OrdersStatusBarChart = () => {
  const { pendentes, aprovados, negados, total } = useOrderStats();

  // Mapeando os dados vindos do hook
  let data = [
    { label: "Pendentes", value: pendentes, color: "bg-amber", icon: time },
    { label: "Aprovados", value: aprovados, color: "bg-lightgreen", icon: approved },
    { label: "Negados", value: negados, color: "bg-red-500", icon: denied },
  ];

  data = data.sort((a, b) => b.value - a.value);

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white  p-5 sm:p-6 rounded-2xl w-full shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-bold text-darkgray uppercase tracking-wider">
          Status dos Pedidos
        </h4>
        <span className="text-xs font-bold text-gray-400 bg-gray-200/50 px-2 py-1 rounded-md">
          Total: {total}
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {data.map((item) => {
          const width = (item.value / maxVal) * 100;
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;

          return (
            <div key={item.label} className="flex flex-col gap-2 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img className="w-5 h-5 sm:w-6 sm:h-6" src={item.icon} alt="" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-black transition-colors">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">
                    {percent}%
                  </span>
                  <span className="text-sm font-black text-darkgray">
                    {item.value}
                  </span>
                </div>
              </div>

              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  style={{ width: `${width}%` }}
                  className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};