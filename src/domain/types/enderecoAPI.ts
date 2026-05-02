import type { TipoEnderecoAPI } from "./api-schema";

export interface EnderecoAPI {
  id: number;
  logradouro: string;
  cep: string;
  numero: string;
  bairro?: string | null;
  cidade: string;
  estado: string;
  tipoEndereco?: TipoEnderecoAPI | null;
}