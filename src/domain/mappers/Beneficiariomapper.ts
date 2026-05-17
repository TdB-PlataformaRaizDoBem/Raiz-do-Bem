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
  programaSocial: string | null;
  endereco: EnderecoViewModel | null;
  pedido: {
    id: number;
    dentistaResponsavel: string | null;
  } | null;
}

function mapEndereco(
  api: BeneficiarioAPI["endereco"],
): EnderecoViewModel | null {
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

function formatarPrograma(programa: string): string {
  return programa
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function mapBeneficiario(api: BeneficiarioAPI): BeneficiarioViewModel {
  return {
    id: api.id,
    cpf: api.cpf ?? "—",
    nomeCompleto: api.nomeCompleto ?? "—",
    dataNascimento: formatDate(api.dataNascimento),
    telefone: api.telefone ?? "—",
    email: api.email ?? "—",
    programaSocial: formatarPrograma(api.programaSocial) ?? null,
    endereco: mapEndereco(api.endereco),
    pedido: api.pedido
      ? {
          id: api.pedido.id,
          dentistaResponsavel: api.pedido.dentistaResponsavel ?? null,
        }
      : null,
  };
}

export function mapBeneficiarios(
  apiList: BeneficiarioAPI[],
): BeneficiarioViewModel[] {
  return apiList.map(mapBeneficiario);
}
