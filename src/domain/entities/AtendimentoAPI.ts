export interface AtendimentoAPI {
  id: number;
  prontuario: string | null;
  beneficiario: string | null;
  dentista: string | null;
  dataInicial: string | null;
  dataFim: string | null;
}