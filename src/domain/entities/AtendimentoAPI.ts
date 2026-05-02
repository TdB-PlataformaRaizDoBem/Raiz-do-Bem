import type { BeneficiarioAPI } from "./BeneficiarioAPI";
import type { ColaboradorAPI } from "./ColaboradorAPI";
import type { DentistaAPI } from "./DentistaAPI";

export interface AtendimentoAPI {
  id: number;
  prontuario?: string | null;
  dataInicial?: string | null; 
  dataFinal?: string | null;    
  beneficiario?: BeneficiarioAPI | null;
  dentista?: DentistaAPI | null;
  colaborador?: ColaboradorAPI | null;
}