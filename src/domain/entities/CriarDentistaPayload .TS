import {SexoAPI} from '../types/api-schema'
import {TipoEnderecoAPI} from '../types/api-schema'

export interface CriarDentistaPayload {
  croDentista: string;       
  cpf: string;
  nomeCompleto: string;
  sexo: SexoAPI;                 
  email: string;
  telefone: string;
  categoria?: string;
  disponivel: boolean;           
  endereco?: {
    cep: string;
    numero: string;
    tipoEndereco: TipoEnderecoAPI;
  };
}