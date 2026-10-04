import { getColaboradoresCompletos, type ColaboradorCompleto } from "../services/ColaboradorService";
import { queryKeys } from "./queryKeys";
import { useDomainQuery } from "./useDomainQuery";

export const useColaboradores = () =>
  useDomainQuery<ColaboradorCompleto[]>({
    queryKey: queryKeys.colaboradores,
    queryFn: getColaboradoresCompletos,
  });

// O back não tem GET por id: reaproveita a lista já em cache em vez de buscá-la de novo.
export const useColaborador = (id: number) =>
  useDomainQuery<ColaboradorCompleto[], ColaboradorCompleto | null>({
    queryKey: queryKeys.colaboradores,
    queryFn: getColaboradoresCompletos,
    select: (lista) => lista.find((c) => c.id === id) ?? null,
  });
