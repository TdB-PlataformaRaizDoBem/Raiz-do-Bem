import type { BeneficiarioAPI } from "../entities/BeneficiarioAPI";
import { formatDate } from "../../utils/dateUtils";
 
export interface EnderecoViewModel {
  id: number;
  tipoEndereco: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface ProgramaSocialViewModel {
  id: number;
  programa: string;
  programaLabel: string;
}

export interface DentistaResumoViewModel {
  id: number;
  nomeCompleto: string;
  croDentista: string;
  email: string;
  telefone: string;
}

export interface PedidoResumoViewModel {
  id: number;
  descricaoProblema: string;
  statusAPI: string;
  statusLabel: string;
  dataPedido: string;
  dentistaResponsavel: DentistaResumoViewModel | null;
}
export interface BeneficiarioViewModel {
  // Identificação
  id: number;
  cpf: string;
  nomeCompleto: string;
  dataNascimento: string;

  // Contato
  telefone: string;
  email: string;

  // Relações aninhadas
  programaSocial: ProgramaSocialViewModel | null;
  endereco: EnderecoViewModel | null;
  pedido: PedidoResumoViewModel | null;
}
 
const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  REJEITADO: "Negado",
};

// Converte Programa para formatação ideal
function formatarPrograma(raw: string): string {
  const preposicoes = new Set(["do", "da", "de", "dos", "das"]);
  return raw
    .toLowerCase()
    .split("_")
    .map((word, i) =>
      i === 0 || !preposicoes.has(word)
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word
    )
    .join(" ");
}
 
function mapEndereco(api: BeneficiarioAPI["endereco"]): EnderecoViewModel | null {
  if (!api) return null;
  return {
    id: api.id,
    tipoEndereco: api.tipoEndereco ?? "RESIDENCIAL",
    logradouro: api.logradouro ?? "—",
    numero: api.numero ?? "S/N",
    bairro: api.bairro ?? "—",
    cidade: api.cidade ?? "—",
    estado: api.estado ?? "—",
    cep: api.cep ?? "—",
  };
}

export function mapBeneficiario(api: BeneficiarioAPI): BeneficiarioViewModel {
  const programaSocial: ProgramaSocialViewModel | null = api.programaSocial
    ? {
        id: api.programaSocial.id,
        programa: api.programaSocial.programa,
        programaLabel: formatarPrograma(api.programaSocial.programa),
      }
    : null;

  const pedido: PedidoResumoViewModel | null = api.pedido
    ? {
        id: api.pedido.id,
        descricaoProblema: api.pedido.descricaoProblema ?? "Sem descrição informada.",
        statusAPI: api.pedido.status,
        statusLabel: STATUS_LABEL[api.pedido.status] ?? "Desconhecido",
        dataPedido: formatDate(api.pedido.dataPedido),
        dentistaResponsavel: api.pedido.dentista
          ? {
              id: api.pedido.dentista.id,
              nomeCompleto: api.pedido.dentista.nomeCompleto ?? "—",
              croDentista: api.pedido.dentista.croDentista ?? "—",
              email: api.pedido.dentista.email ?? "—",
              telefone: api.pedido.dentista.telefone ?? "—",
            }
          : null,
      }
    : null;

  return {
    id: api.id,
    cpf: api.cpf ?? "—",
    nomeCompleto: api.nomeCompleto ?? "—",
    dataNascimento: formatDate(api.dataNascimento),
    telefone: api.telefone ?? "—",
    email: api.email ?? "—",
    programaSocial,
    endereco: mapEndereco(api.endereco),
    pedido,
  };
}
 
export function mapBeneficiarios(
  apiList: BeneficiarioAPI[]
): BeneficiarioViewModel[] {
  return apiList.map(mapBeneficiario);
}