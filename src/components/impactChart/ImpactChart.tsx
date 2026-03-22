import React from 'react';
import { useImpactStats } from "../../hooks/useImpactStats";

const ImpactChart = () => {
  const { qtdTdb, qtdAdb, total } = useImpactStats(); 
  
  const tdbPercent = total > 0 ? (qtdTdb / total) * 100 : 0;
  const adbPercent = total > 0 ? (qtdAdb / total) * 100 : 0;

  const RADIUS = 15.9155;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  return (
    <div className="bg-white  p-6 rounded-2xl w-full shadow-sm border border-gray-100">
      <h4 className="text-sm font-bold text-darkgray mb-6 uppercase tracking-wider text-center">
        Proporção de Beneficiários
      </h4>
      
      <div className="relative flex justify-center items-center h-48">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 transform">
          <circle cx="18" cy="18" r={RADIUS} fill="none" className="stroke-gray-200" strokeWidth="3" />
          
          <circle
            cx="18" cy="18" r={RADIUS} fill="none"
            className="stroke-lightgreen transition-all duration-700"
            strokeWidth="3"
            strokeDasharray={`${tdbPercent} ${CIRCUMFERENCE}`}
            strokeDashoffset="0"
          />

          <circle
            cx="18" cy="18" r={RADIUS} fill="none"
            className="stroke-darkgreen transition-all duration-700"
            strokeWidth="3"
            strokeDasharray={`${adbPercent} ${CIRCUMFERENCE}`}
            strokeDashoffset={`-${tdbPercent}`}
          />
        </svg>

        <div className="absolute text-center">
          <strong className="text-4xl font-bold text-black">{total}</strong>
          <p className="text-xs text-gray-400">Total</p>
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-8 border-t border-gray-100 pt-5">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-lightgreen" />
            <span className="text-xs text-gray-500 font-medium">Turma do Bem</span>
          </div>
          <strong className="text-lg text-black">{qtdTdb} <span className="text-xs text-gray-400 font-normal">({tdbPercent.toFixed(0)}%)</span></strong>
        </div>
        
        <div className="w-px h-10 bg-gray-100" />

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-darkgreen" />
            <span className="text-xs text-gray-500 font-medium">Apolônias</span>
          </div>
          <strong className="text-lg text-black">{qtdAdb} <span className="text-xs text-gray-400 font-normal">({adbPercent.toFixed(0)}%)</span></strong>
        </div>
      </div>
    </div>
  );
};

export default ImpactChart;