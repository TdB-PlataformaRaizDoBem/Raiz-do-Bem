import React from "react";
import { beneficiariosData } from "../data/beneficiariosData";

export const useImpactStats = () => {
  return React.useMemo(() => {
    const qtdTdb = beneficiariosData.filter(p => p.programaSocial === "Turma do Bem").length;
    const qtdAdb = beneficiariosData.filter(p => p.programaSocial === "Apolônias do Bem").length;
    
    // Cálculo de Horas
    const totalHoras = (qtdTdb * 6) + (qtdAdb * 20);

    // Lógica do Ranking de Estados
    const rankingEstado = Object.entries(
      beneficiariosData.reduce((acc, b) => {
        const uf = b.estado || "Não Informado";
        acc[uf] = (acc[uf] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([uf, qtd]) => ({ 
        uf, 
        qtd,
        percent: beneficiariosData.length > 0 ? (qtd / beneficiariosData.length) * 100 : 0
      }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5);

    return { 
      total: beneficiariosData.length, 
      qtdTdb, 
      qtdAdb, 
      totalHoras, 
      rankingEstado 
    };
  }, [beneficiariosData]);
};