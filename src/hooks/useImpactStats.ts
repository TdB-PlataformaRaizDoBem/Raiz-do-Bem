import { useState, useEffect } from "react";
import { getBeneficiariosCompletos } from "../services/Beneficiarioservice";
import type { BeneficiarioViewModel } from "../domain/mappers/Beneficiariomapper";

interface ImpactStats {
  total: number;
  qtdTdb: number;
  qtdAdb: number;
  totalHoras: number;
  rankingEstado: { uf: string; qtd: number; percent: number }[];
}

const EMPTY: ImpactStats = { total: 0, qtdTdb: 0, qtdAdb: 0, totalHoras: 0, rankingEstado: [] };

export const useImpactStats = () => {
  const [stats, setStats] = useState<ImpactStats>(EMPTY);

  useEffect(() => {
    getBeneficiariosCompletos()
      .then((lista: BeneficiarioViewModel[]) => {
        const qtdTdb = lista.filter((b) => b.programaSocial === "DENTISTA_DO_BEM").length;
        const qtdAdb = lista.filter((b) => b.programaSocial === "APOLONIA_DO_BEM").length;

        const countByEstado = lista.reduce<Record<string, number>>((acc, b) => {
          const uf = b.endereco?.estado ?? "Não informado";
          acc[uf] = (acc[uf] ?? 0) + 1;
          return acc;
        }, {});

        const rankingEstado = Object.entries(countByEstado)
          .map(([uf, qtd]) => ({
            uf,
            qtd,
            percent: lista.length > 0 ? (qtd / lista.length) * 100 : 0,
          }))
          .sort((a, b) => b.qtd - a.qtd)
          .slice(0, 5);

        setStats({
          total: lista.length,
          qtdTdb,
          qtdAdb,
          totalHoras: qtdTdb * 6 + qtdAdb * 20,
          rankingEstado,
        });
      })
      .catch(() => setStats(EMPTY));
  }, []);

  return stats;
};
