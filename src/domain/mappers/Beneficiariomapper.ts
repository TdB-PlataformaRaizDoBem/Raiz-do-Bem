import type { BeneficiarioAPI } from "../entities/BeneficiarioAPI";
import { formatDate } from "../../utils/dateUtils";
 
export interface BeneficiarioViewModel {
  id: number;
  cpf: string;
  nomeCompleto: string;
  dataNascimento: string; 
  telefone: string;
  email: string;
  programaSocial: string;    
  programaSocialId: number | null;
 
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  } | null;
 
  // Relato do pedido original
  pedido: {
    id: number;
    descricaoProblema: string;
    statusLabel: string;
    dataPedido: string;         
  } | null;
}
 
const STATUS_LABEL_BREVE: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  REJEITADO: "Negado",
};
 
export function mapBeneficiario(api: BeneficiarioAPI): BeneficiarioViewModel {
  return {
    id: api.id,
    cpf: api.cpf,
    nomeCompleto: api.nomeCompleto,
    dataNascimento: formatDate(api.dataNascimento),
    telefone: api.telefone,
    email: api.email,

    programaSocial: api.programaSocial?.programa ?? "",
    programaSocialId: api.programaSocial?.id ?? null,

    endereco: api.endereco
      ? {
          logradouro: api.endereco.logradouro,
          numero: api.endereco.numero,
          bairro: api.endereco.bairro ?? "",
          cidade: api.endereco.cidade,
          estado: api.endereco.estado,
          cep: api.endereco.cep,
        }
      : null,

    pedido: api.pedido
      ? {
          id: api.pedido.id,
          descricaoProblema: api.pedido.descricaoProblema,
          statusLabel:
            STATUS_LABEL_BREVE[api.pedido.status] ?? "Desconhecido",
          dataPedido: formatDate(api.pedido.dataPedido),
        }
      : null,
  };
}
 
export function mapBeneficiarios(
  apiList: BeneficiarioAPI[]
): BeneficiarioViewModel[] {
  return apiList.map(mapBeneficiario);
}