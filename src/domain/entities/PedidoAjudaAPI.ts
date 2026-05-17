import type { SexoAPI, StatusPedidoAPI } from "../types/api-schema";

export interface PedidoAjudaAPI {
  id: number;
  cpf: string | null;
  nomeCompleto: string;
  dataNascimento: string | null;
  sexo: SexoAPI | null;
  telefone: string;
  email: string;
  descricaoProblema: string;
  dataPedido: string;
  status: StatusPedidoAPI;
  endereco: string;
  dentistaResponsavel?: string | null;
}