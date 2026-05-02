import type { SexoAPI, TipoEnderecoAPI } from "../types/api-schema";

export interface CriarPedidoAjudaPayload {
  nomeCompleto: string;
  cpf?: string;
  dataNascimento?: string;       // ISO-8601
  sexo?: SexoAPI;
  telefone: string;
  email: string;
  descricaoProblema: string;
  endereco?: {
    cep: string;
    numero: string;
    tipoEndereco?: TipoEnderecoAPI;
  };
}