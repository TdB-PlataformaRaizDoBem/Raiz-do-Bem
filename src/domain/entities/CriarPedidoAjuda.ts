import type { RegistroConsentimento } from "../legal/consentimento";

export interface CriarPedidoAjudaPayload {
  cpf: string;
  nome: string;
  dataNascimento: string; // ISO yyyy-MM-dd
  sexo: "M" | "F" | "O";
  telefone: string;
  email: string;
  descricaoProblema: string;
  endereco: { cep: string; numero: string };
  /** Comprovação do consentimento. Só é enviado com `VITE_ENVIAR_CONSENTIMENTO=true` (ver `consentimentoParaEnvio`). */
  consentimento?: RegistroConsentimento;
}