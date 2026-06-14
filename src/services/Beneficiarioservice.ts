import type { AtualizarBeneficiarioPayload } from "../domain/entities/AtualizarBeneficiario.ts";
import type { BeneficiarioAPI } from "../domain/entities/BeneficiarioAPI.ts";
import type { CriarBeneficiarioPayload } from "../domain/entities/CriarBeneficiario.ts";
import {
  mapBeneficiario,
  mapBeneficiarios,
  type BeneficiarioViewModel,
} from "../domain/mappers/Beneficiariomapper.ts";
import { handleResponse, assertOk, safeFetch } from "./httpClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/beneficiario`;

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

/**
 * GET /beneficiario
 */
export async function getBeneficiariosCompletos(): Promise<
  BeneficiarioViewModel[]
> {
  const res = await safeFetch(ENDPOINT);

  if (res.status === 404 || res.status === 204) {
    return [];
  }

  const data = await handleResponse<BeneficiarioAPI[]>(res);
  
  return mapBeneficiarios(data ?? []);
}

export async function getBeneficiarioCompleto(
  cpf: string,
): Promise<BeneficiarioViewModel | null> {
  const res = await safeFetch(`${ENDPOINT}/${cpf}`);
  if (res.status === 404) return null;
  const data = await handleResponse<BeneficiarioAPI>(res);
  return mapBeneficiario(data);
}

export async function criarBeneficiario(
  payload: CriarBeneficiarioPayload,
): Promise<BeneficiarioViewModel> {
  const res = await safeFetch(ENDPOINT, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<BeneficiarioAPI>(res);
  return mapBeneficiario(data);
}

export async function atualizarBeneficiario(
  cpf: string,
  payload: Partial<AtualizarBeneficiarioPayload>,
): Promise<BeneficiarioViewModel> {
  const res = await safeFetch(`${ENDPOINT}/${cpf}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<BeneficiarioAPI>(res);
  return mapBeneficiario(data);
}

export async function excluirBeneficiario(cpf: string): Promise<void> {
  const res = await safeFetch(`${ENDPOINT}/${cpf}`, { method: "DELETE" });
  await handleResponse<void>(res);
}

export async function exportarBeneficiariosCsv(): Promise<Blob> {
  const res = await safeFetch(`${ENDPOINT}/exportarCsv`);
  await assertOk(res);
  return res.blob();
}

export type { BeneficiarioViewModel as BeneficiarioCompleto } from "../domain/mappers/Beneficiariomapper.ts";