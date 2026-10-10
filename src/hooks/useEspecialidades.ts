import { getEspecialidades } from "../services/EspecialidadeService";
import type { EspecialidadeAPI } from "../domain/entities/EspecialidadeAPI";
import { queryKeys } from "./queryKeys";
import { useDomainQuery } from "./useDomainQuery";

/** Especialidades odontológicas (dado de referência, `staleTime` de 10 min). */
export const useEspecialidades = () =>
  useDomainQuery<EspecialidadeAPI[]>({
    queryKey: queryKeys.especialidades,
    queryFn: getEspecialidades,
    staleTime: 10 * 60_000,
  });
