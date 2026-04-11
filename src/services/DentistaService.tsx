import { dentistasMock, type Dentista } from "../data/dentistasData";
import { type Beneficiario } from "../data/beneficiariosData";

export type DentistaCompleto = Dentista;

// INTEGRAÇÃO API - GET /api/dentistas/:id
export const getDentistaCompleto = async (
  id: number
): Promise<DentistaCompleto | null> => {
  await new Promise((r) => setTimeout(r, 300));
  return dentistasMock.find((d) => d.id === id) ?? null;
};

// INTEGRAÇÃO - API GET /api/dentistas
export const getDentistasCompletos = async (): Promise<DentistaCompleto[]> => {
  await new Promise((r) => setTimeout(r, 300));
  return dentistasMock;
};

// INTEGRAÇÃO API
//   GET /api/dentistas/proximos?cidade=X&estado=Y&programa=Z
//   → DentistaCompleto[]
const programaCompativel = (d: Dentista, b: Beneficiario): boolean =>
  d.programa === "Ambos" || d.programa === b.programaSocial;

export const getDentistasProximos = async (
  beneficiario: Beneficiario
): Promise<DentistaCompleto[]> => {
  await new Promise((r) => setTimeout(r, 300));

  const disponiveis = dentistasMock.filter(
    (d) => d.disponibilidade === "Sim" && programaCompativel(d, beneficiario)
  );

  const porCidade = disponiveis.filter(
    (d) => d.endereco.cidade === beneficiario.cidade
  );
  if (porCidade.length > 0) return porCidade;

  return disponiveis.filter((d) => d.endereco.estado === beneficiario.estado);
};