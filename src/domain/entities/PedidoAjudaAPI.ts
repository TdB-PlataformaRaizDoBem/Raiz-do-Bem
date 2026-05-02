import type { SexoAPI, StatusPedidoAPI } from "../types/api-schema";
import type { EnderecoAPI } from "../types/enderecoAPI";
import type { DentistaAPI } from "./DentistaAPI";

export interface PedidoAjudaAPI {
  id: number;
  cpf?: string | null;
  nomeCompleto: string;
  dataNascimento?: string | null; 
  sexo?: SexoAPI | null;
  telefone: string;
  email: string;
  descricaoProblema: string;
  dataPedido: string;           
  status: StatusPedidoAPI;
  endereco?: EnderecoAPI | null;
  dentista?: DentistaAPI | null;
}