import { useImpactStats } from "../../hooks/useImpactStats";

export const StateRanking = () => {
  const { rankingEstado } = useImpactStats();

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl w-full shadow-sm border border-gray-100">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-lg font-semibold tracking-wide">
          Ranking por Estado
        </h4>

        <span className="text-[11px] font-medium text-darkgreen">
          Top 5
        </span>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          
          {/* HEAD */}
          <thead>
            <tr className="border-b border-lightgray">
              <th className="pb-2 text-[11px] font-medium text-gray w-10">#</th>
              <th className="pb-2 text-[11px] font-medium text-gray text-left">Estado</th>
              <th className="pb-2 text-[11px] font-medium text-gray text-right">Qtd</th>
              <th className="pb-2 text-[11px] font-medium text-gray text-right">Per%</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {rankingEstado.map((item, index) => {
              const isFirst = index === 0;

              return (
                <tr
                  key={item.uf}
                  className="group border-b border-lightgray/50 hover:bg-cream/30 transition"
                >
                  
                  {/* POS */}
                  <td className="py-3">
                    <span
                      className={`
                        text-xs font-medium
                        ${isFirst ? "text-darkgreen" : "text-gray"}
                      `}
                    >
                      {index + 1}
                    </span>
                  </td>

                  {/* ESTADO */}
                  <td className="py-3">
                    <span
                      className={`
                        text-sm
                        ${isFirst 
                          ? "font-semibold text-darkgreen" 
                          : "text-black"}
                      `}
                    >
                      {item.uf}
                    </span>
                  </td>

                  {/* QTD */}
                  <td className="py-3 text-right">
                    <span
                      className={`
                        text-sm font-semibold
                        ${isFirst 
                          ? "text-darkgreen" 
                          : "text-black"}
                      `}
                    >
                      {item.qtd}
                    </span>
                  </td>

                  {/* % */}
                  <td className="py-3 text-right">
                    <span
                      className={`
                        text-xs
                        ${isFirst ? "text-lightgreen font-medium" : "text-gray"}
                      `}
                    >
                      {item.percent.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EMPTY */}
      {rankingEstado.length === 0 && (
        <p className="text-center text-sm text-gray py-8">
          Nenhum dado disponível
        </p>
      )}
    </div>
  );
};