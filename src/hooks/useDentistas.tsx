import { useAsync } from "./useAsync";
import {
  getDentistasCompletos,
  getDentistaCompleto,
  getDentistasProximos,
  type DentistaCompleto,
} from "../services/DentistaService";
import type { Beneficiario } from "../data/beneficiariosData";
 
export const useDentistas = () =>
  useAsync<DentistaCompleto[]>(getDentistasCompletos);
 
export const useDentista = (id: number) =>
  useAsync<DentistaCompleto | null>(
    () => getDentistaCompleto(id),
    [id]
  );
 
export const useDentistasProximos = (beneficiario: Beneficiario) =>
  useAsync<DentistaCompleto[]>(
    () => getDentistasProximos(beneficiario),
    [beneficiario.id]
  );