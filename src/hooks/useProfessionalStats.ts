import { useQuery } from "@tanstack/react-query";
import { getDentistasCompletos } from "../services/DentistaService";
import type { DentistaViewModel } from "../domain/mappers/DentistaMapper";
import { queryKeys } from "./queryKeys";

const EMPTY = { dentistasDisponiveis: 0, totalDentistas: 0 };

const calcular = (lista: DentistaViewModel[]) => ({
  dentistasDisponiveis: lista.filter((d) => d.disponivel).length,
  totalDentistas: lista.length,
});

/** Total de dentistas e quantos estão disponíveis. */
export const useProfessionalStats = () => {
  const { data } = useQuery({
    queryKey: queryKeys.dentistas,
    queryFn: getDentistasCompletos,
    select: calcular,
  });
  return data ?? EMPTY;
};
