import type { EnderecoAPI } from "../types/enderecoAPI";

export interface BeneficiarioAPI {
  id: number;
  cpf: string;
  nomeCompleto: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  programaSocial: string;
  pedido: {
    id: number;
    dentistaResponsavel: string;
  } | null;
  endereco: EnderecoAPI | null;
}
