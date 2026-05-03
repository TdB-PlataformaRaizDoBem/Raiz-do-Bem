import { useAsync } from "./useAsync";
import {
  getColaboradoresCompletos,
  getColaboradorCompleto,
  type ColaboradorCompleto,
} from "../services/ColaboradorService";
 
export const useColaboradores = () =>
  useAsync<ColaboradorCompleto[]>(getColaboradoresCompletos);
 
export const useColaborador = (id: number) =>
  useAsync<ColaboradorCompleto | null>(
    () => getColaboradorCompleto(id),
    [id]
  );
 