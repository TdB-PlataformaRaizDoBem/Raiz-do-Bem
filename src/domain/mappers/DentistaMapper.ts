import type { DentistaAPI } from "../entities/DentistaAPI";

function formatarPrograma(programa: string): string {
  return programa
    .toLowerCase()
    .split("_")
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");
}

export const SEXO_LABEL: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  O: "Outro",
};

export interface DentistaViewModel {
  // Identificação
  id: number;
  croDentista: string;
  cpf: string;
  nomeCompleto: string;

  // Dados pessoais
  sexoAPI: string;
  sexoLabel: string;

  // Contato
  email: string;
  telefone: string;

  // Dados profissionais
  categoria: string;
  disponivel: boolean;
  disponibilidadeLabel: string;

  programasSociais: string[];

  programa: string;

  especialidades: string[];

  // Endereço flat
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  cidade: string | null;
  estado: string | null;
}

export function mapDentista(api: DentistaAPI): DentistaViewModel {
  const sexoAPI: string = api.sexo ?? "O";
  const disponivel = api.disponivel === "S";

  return {
    // Identificação
    id: api.id,

    croDentista: api.croDentista ?? "—",

    cpf: api.cpf ?? "—",

    nomeCompleto: api.nomeCompleto ?? "—",

    // Dados pessoais
    sexoAPI,

    sexoLabel: SEXO_LABEL[sexoAPI] ?? "—",

    // Contato
    email: api.email ?? "—",

    telefone: api.telefone ?? "—",

    // Profissional
    categoria: api.categoria ?? "—",

    disponivel,

    disponibilidadeLabel: disponivel ? "Sim" : "Não",

    programasSociais: api.programasSociais ?? [],

    programa: api.programasSociais?.[0]
      ? formatarPrograma(api.programasSociais[0])
      : (api.categoria ?? "Não informado"),

    especialidades: api.especialidades ?? [],

    // Endereço flat
    cep: api.cep ?? null,

    logradouro: api.logradouro ?? null,

    numero: api.numero ?? null,

    cidade: api.cidade ?? null,

    estado: api.estado ?? null,
  };
}

export function mapDentistas(apiList: DentistaAPI[]): DentistaViewModel[] {
  return apiList.map(mapDentista);
}

export function isDentistaDisponivel(d: DentistaViewModel): boolean {
  return d.disponivel === true;
}

/**
 * "Não informado" é tratado como compatível
 * para não travar o fluxo temporariamente.
 */
export function programaCompativel(
  dentista: DentistaViewModel,
  programaBeneficiario: string,
): boolean {
  if (dentista.programa === "Não informado") {
    return true;
  }

  return (
    dentista.programa === "Ambos" || dentista.programa === programaBeneficiario
  );
}
