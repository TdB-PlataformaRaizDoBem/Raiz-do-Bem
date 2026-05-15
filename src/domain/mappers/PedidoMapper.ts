import { formatDate } from "../../utils/dateUtils";
import type { PedidoAjudaAPI } from "../entities/PedidoAjudaAPI";
import type { StatusPedidoAPI } from "../types/api-schema";

export const STATUS_LABEL: Record<StatusPedidoAPI, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  REJEITADO: "Negado",
};

export const STATUS_CLASS: Record<StatusPedidoAPI, string> = {
  PENDENTE: "text-amber bg-amber/10",
  APROVADO: "text-darkgreen bg-darkgreen/10",
  REJEITADO: "text-red-500 bg-red-500/10",
};

export interface PedidoViewModel {
  // Identificação
  id: number;
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;

  // Dados pessoais do solicitante
  dataNascimento: string;
  sexoLabel: string;
  descricaoProblema: string;

  // Status
  statusAPI: StatusPedidoAPI;
  statusLabel: string;
  statusClass: string;

  // Datas
  dataPedido: string;
  dataPedidoISO: string;

  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  } | null;

  dentistaAtribuido: {
    id: number;
    nomeCompleto: string;
    croDentista: string;
  } | null;
}

const SEXO_LABEL: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  O: "Outro",
};

export function mapPedido(api: PedidoAjudaAPI): PedidoViewModel {
  const statusAPI = api.status ?? "PENDENTE";

  return {
    id: api.id,
    nomeCompleto: api.nomeCompleto ?? "—",
    cpf: api.cpf ?? "—",
    email: api.email ?? "—",
    telefone: api.telefone ?? "—",

    dataNascimento: api.dataNascimento ? formatDate(api.dataNascimento) : "—",
    sexoLabel: SEXO_LABEL[api.sexo ?? ""] ?? "—",

    descricaoProblema: api.descricaoProblema ?? "Sem descrição informada.",

    statusAPI,
    statusLabel: STATUS_LABEL[statusAPI],
    statusClass: STATUS_CLASS[statusAPI],

    dataPedido: api.dataPedido ? formatDate(api.dataPedido) : "—",
    dataPedidoISO: api.dataPedido ?? "",

    endereco: api.endereco
      ? {
          logradouro: api.endereco.logradouro ?? "—",
          numero: api.endereco.numero ?? "S/N",
          bairro: api.endereco.bairro ?? "—",
          cidade: api.endereco.cidade ?? "—",
          estado: api.endereco.estado ?? "—",
          cep: api.endereco.cep ?? "—",
        }
      : null,

    dentistaAtribuido: api.dentista
      ? {
          id: api.dentista?.id ?? 0,
          nomeCompleto: api.dentista?.nomeCompleto ?? "—",
          croDentista: api.dentista?.croDentista ?? "—",
        }
      : null,
  };
}

export function mapPedidos(apiList: PedidoAjudaAPI[]): PedidoViewModel[] {
  return apiList.map(mapPedido);
}

export function isPedidoAprovado(pedido: PedidoViewModel): boolean {
  return pedido.statusAPI === "APROVADO";
}

export function isPedidoPendente(pedido: PedidoViewModel): boolean {
  return pedido.statusAPI === "PENDENTE";
}

export function isPedidoRejeitado(pedido: PedidoViewModel): boolean {
  return pedido.statusAPI === "REJEITADO";
}
