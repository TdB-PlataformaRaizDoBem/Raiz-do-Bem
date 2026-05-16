import { useAsync } from "./useAsync";

import {
  getDentistasCompletos,
  getDentistaCompleto,
  type DentistaCompleto,
} from "../services/DentistaService";

export const useDentistas = () =>
  useAsync<DentistaCompleto[]>(
    getDentistasCompletos,
  );

export const useDentista = (
  cpf: string,
) =>
  useAsync<DentistaCompleto | null>(
    () => getDentistaCompleto(cpf),
    [cpf],
  );