import { getEspecialidades } from "../services/EspecialidadeService";
import type { EspecialidadeAPI } from "../domain/entities/EspecialidadeAPI";
import { queryKeys } from "./queryKeys";
import { useDomainQuery } from "./useDomainQuery";

// Dado de referência: muda raramente, então fica 10 minutos em cache.
export const useEspecialidades = () =>
  useDomainQuery<EspecialidadeAPI[]>({
    queryKey: queryKeys.especialidades,
    queryFn: getEspecialidades,
    staleTime: 10 * 60_000,
  });
