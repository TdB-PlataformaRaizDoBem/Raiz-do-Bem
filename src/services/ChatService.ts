import type { ConversationPreview } from "../domain/entities/ConversationPreview";
import type { MessageCreateRequest } from "../domain/entities/MessageCreateRequest";
import type { MessageResponse } from "../domain/entities/MessageResponse";

const CHAT_API_URL = (import.meta.env.VITE_CHAT_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let mensagem = `Erro ${res.status}`;
    try {
      const body = await res.json();
      mensagem = body?.detail ?? body?.mensagem ?? body?.message ?? mensagem;
    } catch {
      /* manter mensagem padrão */
    }
    throw new Error(mensagem);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * GET /chat/history/{tel}?skip=0&limit=20
 * Retorna o histórico paginado de mensagens de um número.
 * O backend já retorna em ordem cronológica (mais antigas → mais novas).
 */
export async function getChatHistory(
  telefone: string,
  skip = 0,
  limit = 20
): Promise<MessageResponse[]> {
  const tel = encodeURIComponent(telefone);
  const res = await fetch(`${CHAT_API_URL}/chat/history/${tel}?skip=${skip}&limit=${limit}`);
  if (res.status === 404) return [];
  const data = await handleResponse<MessageResponse[]>(res);
  return data ?? [];
}

/**
 * POST /chat/send
 * Dispara uma mensagem via Twilio e persiste no MongoDB.
 */
export async function sendMessage(
  payload: MessageCreateRequest
): Promise<{ status: string; id_db: string; id_twilio: string }> {
  const res = await fetch(`${CHAT_API_URL}/chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * GET /chat/conversations
 * Retorna a lista de conversas ativas já ordenadas pelo backend,
 * com `unread_count` calculado via agregação MongoDB.
 */
export async function getActiveConversations(): Promise<ConversationPreview[]> {
  try {
    const res = await fetch(`${CHAT_API_URL}/chat/conversations`);
    if (!res.ok) return [];
    const data: ConversationPreview[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * PUT /chat/read/{tel}
 * Marca todas as mensagens de entrada de um número como lidas.
 * Deve ser chamado ao abrir uma conversa.
 */
export async function markAsRead(
  telefone: string
): Promise<{ status: string; messagens_updated: number }> {
  const tel = encodeURIComponent(telefone);
  const res = await fetch(`${CHAT_API_URL}/chat/read/${tel}`, { method: "PUT" });
  return handleResponse(res);
}