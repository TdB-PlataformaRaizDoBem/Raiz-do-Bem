import type { AtendimentoAPI } from "../entities/AtendimentoAPI";
import { formatDate } from "../../utils/dateUtils";
export const ATENDIMENTO_EM_ABERTO = "NÃO FINALIZADO";

export interface AtendimentoViewModel {
  id: number;
  prontuario: string;
  beneficiario: string;
  dentista: string;
  contatoDentista: string;
  emailDentista: string;
  enderecoDentista: string;
  dataInicial: string;
  dataInicialISO: string | null;
  dataFim: string;
  dataFimISO: string | null;
  encerrado: boolean;
}

function isFinalizado(dataFim: string | null): boolean {
  if (dataFim === null) return false;
  if (dataFim === ATENDIMENTO_EM_ABERTO) return false;
  return dataFim.trim().length > 0;
}

export function mapAtendimento(api: AtendimentoAPI): AtendimentoViewModel {
  const encerrado = isFinalizado(api.dataFim);

  return {
    id: api.id,
    prontuario: api.prontuario ?? "—",
    beneficiario: api.beneficiario ?? "—",
    dentista: api.dentista ?? "—",
    contatoDentista: api.contatoDentista,
    emailDentista: api.emailDentista,
    enderecoDentista: api.enderecoDentista,
    dataInicial: api.dataInicial ? formatDate(api.dataInicial) : "—",
    dataInicialISO: api.dataInicial ?? null,
    dataFim: encerrado ? formatDate(api.dataFim) : "",
    dataFimISO: encerrado ? api.dataFim : null,
    encerrado,
  };
}

export function mapAtendimentos(
  apiList: AtendimentoAPI[],
): AtendimentoViewModel[] {
  return apiList.map(mapAtendimento);
}
