import { getDentistasCompletos, getDentistaCompleto, type DentistaCompleto } from "../services/DentistaService";
import { queryKeys } from "./queryKeys";
import { useDomainQuery } from "./useDomainQuery";

export const useDentistas = () =>
  useDomainQuery<DentistaCompleto[]>({
    queryKey: queryKeys.dentistas,
    queryFn: getDentistasCompletos,
  });

export const useDentista = (cpf: string) =>
  useDomainQuery<DentistaCompleto | null>({
    queryKey: queryKeys.dentista(cpf),
    queryFn: () => getDentistaCompleto(cpf),
  });
