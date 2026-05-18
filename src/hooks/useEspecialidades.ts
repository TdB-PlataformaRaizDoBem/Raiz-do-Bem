import { useAsync } from "./useAsync";
import { getEspecialidades } from "../services/EspecialidadeService";
import type { EspecialidadeAPI } from "../domain/entities/EspecialidadeAPI";

export const useEspecialidades = () =>
  useAsync<EspecialidadeAPI[]>(getEspecialidades);
