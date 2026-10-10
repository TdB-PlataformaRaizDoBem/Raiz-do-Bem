import type { RegistroConsentimento } from "../legal/consentimento";

export interface CriarDentistaPayload {
  croDentista: string;
  cpf: string;
  nomeCompleto: string;
  sexo: "M" | "F" | "O";
  email: string;
  telefone: string;
  categoria: "CLINICO" | "COORDENADOR";
  idEspecialidade: number;
  disponivel: "S" | "N";
  endereco: {
    cep: string;
    numero: string;
  };
  /** Comprovação do consentimento. Só é enviado com `VITE_ENVIAR_CONSENTIMENTO=true` (ver `consentimentoParaEnvio`). */
  consentimento?: RegistroConsentimento;
}