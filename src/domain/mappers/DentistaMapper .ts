import type { DentistaAPI } from "../entities/DentistaAPI";
import type { SexoAPI } from "../types/api-schema";

export const SEXO_LABEL: Record<SexoAPI, string> = {
  M: "Masculino",
  F: "Feminino",
  O: "Outro",
};

export interface EspecialidadeViewModel {
  id: number;
  descricao: string;
}

export interface DentistaViewModel {
  // Identificação
  id: number;
  croDentista: string;
  cpf: string;
  nomeCompleto: string;

  // Dados pessoais
  sexoAPI: SexoAPI;
  sexoLabel: string;

  // Contato
  email: string;
  telefone: string;

  // Dados profissionais
  categoria: string;
  disponivel: boolean;
  disponibilidadeLabel: string;
  programa: string;
  especialidades: EspecialidadeViewModel[];

  // Endereço (opcional)
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  } | null;
}

export function mapDentista(api: DentistaAPI): DentistaViewModel {
  const sexoAPI = api.sexo ?? "O";

  const disponivel = api.disponivel === "S";

  const programa: string =
    api.programaSocial?.programa ??
    (api.categoria ? api.categoria : "Não informado");

  const especialidades: EspecialidadeViewModel[] = (
    api.especialidades ?? []
  ).map((e) => ({ id: e.id, descricao: e.descricao }));

  return {
    id: api.id,
    croDentista: api.croDentista ?? "—",
    cpf: api.cpf ?? "—",
    nomeCompleto: api.nomeCompleto ?? "—",

    sexoAPI,
    sexoLabel: SEXO_LABEL[sexoAPI] ?? "—",

    email: api.email ?? "—",
    telefone: api.telefone ?? "—",

    categoria: api.categoria ?? "—",
    disponivel,
    disponibilidadeLabel: disponivel ? "Sim" : "Não",

    programa,
    especialidades,

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
  };
}

export function mapDentistas(apiList: DentistaAPI[]): DentistaViewModel[] {
  return apiList.map(mapDentista);
}

export function isDentistaDisponivel(d: DentistaViewModel): boolean {
  return d.disponivel === true;
}

/**
 "Não informado" é tratado como compatível com qualquer programa para não travar o fluxo no momento
 */
export function programaCompativel(
  dentista: DentistaViewModel,
  programaBeneficiario: string,
): boolean {
  if (dentista.programa === "Não informado") return true;
  return (
    dentista.programa === "Ambos" || dentista.programa === programaBeneficiario
  );
}

