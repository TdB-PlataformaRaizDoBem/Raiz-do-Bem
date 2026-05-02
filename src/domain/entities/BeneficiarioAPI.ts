import type { ProgramaSocialAPI } from "../types/api-schema";
import type { EnderecoAPI } from "../types/enderecoAPI";
import type { PedidoAjudaAPI } from "./PedidoAjudaAPI";

export interface BeneficiarioAPI {
  id: number;
  cpf: string;
  nomeCompleto: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  pedido?: PedidoAjudaAPI | null;
  programaSocial?: ProgramaSocialAPI | null;
  endereco?: EnderecoAPI | null;
}