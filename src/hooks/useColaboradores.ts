import { getColaboradoresCompletos, type ColaboradorCompleto } from "../services/ColaboradorService";
import { queryKeys } from "./queryKeys";
import { useDomainQuery } from "./useDomainQuery";

export const useColaboradores = () =>
  useDomainQuery<ColaboradorCompleto[]>({
    queryKey: queryKeys.colaboradores,
    queryFn: getColaboradoresCompletos,
  });

/** Colaborador por id (seleciona da lista em cache; não há GET por id). */
export const useColaborador = (id: number) =>
  useDomainQuery<ColaboradorCompleto[], ColaboradorCompleto | null>({
    queryKey: queryKeys.colaboradores,
    queryFn: getColaboradoresCompletos,
    select: (lista) => lista.find((c) => c.id === id) ?? null,
  });
