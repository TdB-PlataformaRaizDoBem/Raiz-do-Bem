import { beneficiariosData, type Beneficiario } from "../data/beneficiariosData";
import { dentistasMock, type Dentista } from "../data/dentistasData";
import { colaboradorData, type Colaborador } from "../data/colaboradorData";
import { PedidoAjuda, type PedidoAjudaData } from "../data/pedidosAjudaData";

export type BeneficiarioCompleto = Beneficiario & {
  dentista: Dentista | null;
  coordenador: Colaborador | null;
  pedido: PedidoAjudaData | null;
};
 
// Índices por id
const _dentistasIdx = new Map(dentistasMock.map((d) => [d.id, d]));
const _colaboradoresIdx = new Map(colaboradorData.map((c) => [c.id, c]));
const _pedidosIdx = new Map(PedidoAjuda.map((p) => [p.id, p]));
 
// Adapter — resolve vínculos de um beneficiário.

// INTEGRAÇÃO API - Substituir por:
//   const res = await fetch(`/api/beneficiarios/${id}`);
//   if (!res.ok) throw new Error("Falha ao buscar beneficiário");
//   return res.json() as BeneficiarioCompleto;
export const getBeneficiarioCompleto = async (
  id: number
): Promise<BeneficiarioCompleto | null> => {
  // Simula latência de rede — remover quando API chegar
  await new Promise((r) => setTimeout(r, 300));
 
  const b = beneficiariosData.find((b) => b.id === id);
  if (!b) return null;
 
  return {
    ...b,
    dentista: _dentistasIdx.get(b.idDentistaDesignado ?? -1) ?? null,
    coordenador: _colaboradoresIdx.get(b.idCoordenadorResponsavel ?? -1) ?? null,
    pedido: _pedidosIdx.get(b.id_pedido_ajuda ?? -1) ?? null,
  };
};
 

// INTEGRAÇÃO API - Substituir por:
//   const res = await fetch("/api/beneficiarios");
//   return res.json() as BeneficiarioCompleto[];
export const getBeneficiariosCompletos = async (): Promise<BeneficiarioCompleto[]> => {
  await new Promise((r) => setTimeout(r, 300));
 
  return beneficiariosData.map((b) => ({
    ...b,
    dentista: _dentistasIdx.get(b.idDentistaDesignado ?? -1) ?? null,
    coordenador: _colaboradoresIdx.get(b.idCoordenadorResponsavel ?? -1) ?? null,
    pedido: _pedidosIdx.get(b.id_pedido_ajuda ?? -1) ?? null,
  }));
};