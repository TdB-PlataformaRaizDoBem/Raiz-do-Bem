import { colaboradorData, type Colaborador } from "../data/colaboradorData";
 
export type ColaboradorCompleto = Colaborador;
 
// INTEGRAÇÃO API - GET /api/colaboradores/:id
export const getColaboradorCompleto = async (
  id: number
): Promise<ColaboradorCompleto | null> => {
  await new Promise((r) => setTimeout(r, 300));
  return colaboradorData.find((c) => c.id === id) ?? null;
};
 
// INTEGRAÇÃO API - GET /api/colaboradores
export const getColaboradoresCompletos = async (): Promise<ColaboradorCompleto[]> => {
  await new Promise((r) => setTimeout(r, 300));
  return colaboradorData;
};
 