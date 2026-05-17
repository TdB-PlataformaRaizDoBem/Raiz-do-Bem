import type { AtualizarBeneficiarioPayload } from "../domain/entities/AtualizarBeneficiario.ts";
import type { BeneficiarioAPI } from "../domain/entities/BeneficiarioAPI";
import type { CriarBeneficiarioPayload } from "../domain/entities/CriarBeneficiario.ts";
import {
  mapBeneficiario,
  mapBeneficiarios,
  type BeneficiarioViewModel,
} from "../domain/mappers/Beneficiariomapper.ts";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/beneficiario`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let mensagem = `Erro ${res.status}`;
    try {
      const body = await res.json();
      mensagem = body?.mensagem ?? body?.message ?? mensagem;
    } catch {
      /* manter mensagem padrão */
    }
    throw new Error(mensagem);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export async function getBeneficiariosCompletos(): Promise<
  BeneficiarioViewModel[]
> {
  const res = await fetch(ENDPOINT);
  const data = await handleResponse<BeneficiarioAPI[]>(res);
  return mapBeneficiarios(data);
}

export async function getBeneficiarioCompleto(
  cpf: string,
): Promise<BeneficiarioViewModel | null> {
  const res = await fetch(`${ENDPOINT}/${cpf}`);
  if (res.status === 404) return null;
  const data = await handleResponse<BeneficiarioAPI>(res);
  return mapBeneficiario(data);
}

export async function criarBeneficiario(
  payload: CriarBeneficiarioPayload,
): Promise<BeneficiarioViewModel> {
  const res = await fetch(ENDPOINT, {
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
  const res = await fetch(`${ENDPOINT}/${cpf}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<BeneficiarioAPI>(res);
  return mapBeneficiario(data);
}

export async function excluirBeneficiario(cpf: string): Promise<void> {
  const res = await fetch(`${ENDPOINT}/${cpf}`, { method: "DELETE" });
  await handleResponse<void>(res);
}

export type { BeneficiarioViewModel as BeneficiarioCompleto } from "../domain/mappers/Beneficiariomapper";