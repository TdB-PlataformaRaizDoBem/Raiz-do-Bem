import type { EspecialidadeAPI, ProgramaSocialAPI, SexoAPI } from "../types/api-schema";
import type { EnderecoAPI } from "../types/enderecoAPI";

export interface DentistaAPI {
  id: number;
  croDentista: string;
  cpf: string;
  nomeCompleto: string;
  sexo: SexoAPI;
  email: string;
  telefone: string;
  categoria?: string | null;
  disponivel: boolean;
  endereco?: EnderecoAPI | null;

  especialidades?: EspecialidadeAPI[] | null;
  programaSocial?: ProgramaSocialAPI | null;
}