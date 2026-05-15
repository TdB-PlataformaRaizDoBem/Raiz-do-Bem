import type { EnderecoAPI } from "../types/enderecoAPI";

export interface BeneficiarioAPI {
  id: number;
  cpf: string;
  nomeCompleto: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  programaSocial: string | null;
  pedido: {
    id: number;
    dentistaAprovador: string | null;
  } | null;
  endereco: EnderecoAPI | null;
}