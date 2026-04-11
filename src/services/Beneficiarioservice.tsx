import { beneficiariosData, type Beneficiario } from "../data/beneficiariosData";
import { dentistasMock, type Dentista } from "../data/dentistasData";
import { colaboradorData, type Colaborador } from "../data/colaboradorData";
import { PedidoAjuda, type PedidoAjudaData } from "../data/pedidosAjudaData";
 
// ---------------------------------------------------------------------------
// DTO — espelha o contrato de resposta de GET /beneficiarios/:id
// Campos opcionais do mock viram null quando ausentes (sem undefined silencioso)
// ---------------------------------------------------------------------------
export type BeneficiarioCompleto = Beneficiario & {
  dentista:    Dentista        | null;
  coordenador: Colaborador     | null;
  pedido:      PedidoAjudaData | null;
};
 
// Índices por id para evitar O(n²) nos joins — calculados uma vez no módulo.
const _dentistasIdx    = new Map(dentistasMock.map((d) => [d.id, d]));
const _colaboradoresIdx = new Map(colaboradorData.map((c) => [c.id, c]));
const _pedidosIdx      = new Map(PedidoAjuda.map((p) => [p.id, p]));
 
// ---------------------------------------------------------------------------
// Adapter — resolve vínculos de um beneficiário.
//
// TODO: [INTEGRAÇÃO API] Substituir por:
//   const res = await fetch(`/api/beneficiarios/${id}`);
//   if (!res.ok) throw new Error("Falha ao buscar beneficiário");
//   return res.json() as BeneficiarioCompleto;
// ---------------------------------------------------------------------------
export const getBeneficiarioCompleto = async (
  id: number
): Promise<BeneficiarioCompleto | null> => {
  // Simula latência de rede — remover quando integrar API real
  await new Promise((r) => setTimeout(r, 300));
 
  const b = beneficiariosData.find((b) => b.id === id);
  if (!b) return null;
 
  return {
    ...b,
    dentista:    _dentistasIdx.get(b.idDentistaDesignado ?? -1)    ?? null,
    coordenador: _colaboradoresIdx.get(b.idCoordenadorResponsavel ?? -1) ?? null,
    pedido:      _pedidosIdx.get(b.id_pedido_ajuda ?? -1)          ?? null,
  };
};
 
// ---------------------------------------------------------------------------
// TODO: [INTEGRAÇÃO API] Substituir por:
//   const res = await fetch("/api/beneficiarios");
//   return res.json() as BeneficiarioCompleto[];
// ---------------------------------------------------------------------------
export const getBeneficiariosCompletos = async (): Promise<BeneficiarioCompleto[]> => {
  await new Promise((r) => setTimeout(r, 300));
 
  return beneficiariosData.map((b) => ({
    ...b,
    dentista:    _dentistasIdx.get(b.idDentistaDesignado ?? -1)    ?? null,
    coordenador: _colaboradoresIdx.get(b.idCoordenadorResponsavel ?? -1) ?? null,
    pedido:      _pedidosIdx.get(b.id_pedido_ajuda ?? -1)          ?? null,
  }));
};