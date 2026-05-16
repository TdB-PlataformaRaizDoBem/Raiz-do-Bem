import type { EnderecoAPI } from "../types/enderecoAPI";

export interface DentistaResumoPedidoAPI {
  id: number;

  croDentista?: string | null;

  nomeCompleto?: string | null;

  cpf?: string | null;

  sexo?: string | null;

  email?: string | null;

  telefone?: string | null;

  categoria?: string | null;

  disponivel?: string | null;

  endereco?: EnderecoAPI | null;

  especialidades?: {
    id: number;
    descricao: string;
  }[];

  programasSociais?: {
    id: number;
    programa: string;
  }[];
}