import { useState, useEffect } from "react";
import { getDentistasCompletos } from "../services/DentistaService";

export const useProfessionalStats = () => {
  const [stats, setStats] = useState({ dentistasDisponiveis: 0, totalDentistas: 0 });

  useEffect(() => {
    getDentistasCompletos()
      .then((lista) =>
        setStats({
          dentistasDisponiveis: lista.filter((d) => d.disponivel).length,
          totalDentistas: lista.length,
        })
      )
      .catch(() => {});
  }, []);

  return stats;
};
