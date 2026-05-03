import { useAsync } from "./useAsync";
import {
  getDentistasCompletos,
  getDentistaCompleto,
  getDentistasProximos,
  type DentistaCompleto,
} from "../services/DentistaService";
import type { BeneficiarioViewModel as Beneficiario } from "../domain/mappers/Beneficiariomapper";

export const useDentistas = () =>
  useAsync<DentistaCompleto[]>(getDentistasCompletos);

export const useDentista = (cpf: string) =>
  useAsync<DentistaCompleto | null>(() => getDentistaCompleto(cpf), [cpf]);

export const useDentistasProximos = (beneficiario: Beneficiario) =>
  useAsync<DentistaCompleto[]>(
    () => getDentistasProximos(beneficiario),
    [beneficiario.id],
  );
