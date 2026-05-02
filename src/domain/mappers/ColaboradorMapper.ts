
import type { ColaboradorAPI } from "../entities/ColaboradorAPI";
import { formatDate } from "../../utils/dateUtils";

export interface ColaboradorViewModel {
  id: number;
  cpf: string;
  nomeCompleto: string;
  dataNascimento: string;
  dataContratacao: string; 
  email: string;

  /**
   * Virá do claim JWT ou de campo no back-end quando implementado.
   * Por enquanto, undefined para todos os colaboradores reais.
   * ProtectedRoutes.tsx deve tratar undefined como "colaborador".
   */
  nivelAcesso?: "admin" | "colaborador";
}

export function mapColaborador(api: ColaboradorAPI): ColaboradorViewModel {
  return {
    id:              api.id,
    cpf:             api.cpf ?? "—",
    nomeCompleto:    api.nomeCompleto ?? "—",
    dataNascimento:  formatDate(api.dataNascimento),
    dataContratacao: formatDate(api.dataContratacao),
    email:           api.email ?? "—",
    // nivelAcesso: omitido intencionalmente — aguarda implementação de JWT
  };
}

export function mapColaboradores(
  apiList: ColaboradorAPI[]
): ColaboradorViewModel[] {
  return apiList.map(mapColaborador);
}