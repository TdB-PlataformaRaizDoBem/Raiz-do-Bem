/** Versão e vigência dos documentos legais. Mude juntas sempre que o texto de um termo mudar. */
export const VERSAO_DOCUMENTOS = "1.0";
export const DATA_VIGENCIA = "2026-10-10";
export const DATA_VIGENCIA_EXTENSO = "10 de outubro de 2026";

export type DocumentoConsentimento = "pedido-de-ajuda" | "voluntario";

export type ItemConsentimento =
  | "dados-pessoais"
  | "dados-sensiveis"
  | "responsavel-legal"
  | "dados-cadastrais";

/** Comprovação do consentimento (art. 8º, §2º da LGPD): qual texto, qual versão, quando e o que foi autorizado. */
export interface RegistroConsentimento {
  documento: DocumentoConsentimento;
  versao: string;
  aceitoEm: string; // ISO 8601, UTC
  itens: ItemConsentimento[];
}

export function criarRegistroConsentimento(
  documento: DocumentoConsentimento,
  itens: ItemConsentimento[],
  agora: Date = new Date(),
): RegistroConsentimento {
  return { documento, versao: VERSAO_DOCUMENTOS, aceitoEm: agora.toISOString(), itens };
}

/**
 * O registro só vai no corpo da requisição quando `VITE_ENVIAR_CONSENTIMENTO=true`.
 * Mantenha desligado até a API principal aceitar o campo `consentimento`: enviar um campo
 * desconhecido a um back que não o espera pode derrubar o cadastro.
 */
export function consentimentoParaEnvio(
  registro: RegistroConsentimento,
): { consentimento?: RegistroConsentimento } {
  return import.meta.env.VITE_ENVIAR_CONSENTIMENTO === "true" ? { consentimento: registro } : {};
}
