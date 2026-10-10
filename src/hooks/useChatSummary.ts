import { useCallback, useState } from "react";
import type { ChatSummary } from "../domain/entities/ChatSummary";
import { summarizeChat } from "../services/ChatService";

type SummaryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; summary: ChatSummary }
  | { status: "error"; message: string };

const IDLE: SummaryState = { status: "idle" };

/**
 * Resumo por IA de uma conversa, sob demanda. O estado é amarrado ao telefone: ao trocar de
 * conversa volta a `idle` (nunca mostra o resumo de outro contato, nem uma resposta atrasada).
 * O erro não afeta o chat: o histórico segue visível.
 */
export function useChatSummary(telefone: string) {
  const [entry, setEntry] = useState<{ telefone: string; state: SummaryState }>({
    telefone,
    state: IDLE,
  });

  const generate = useCallback(async () => {
    setEntry({ telefone, state: { status: "loading" } });
    try {
      const summary = await summarizeChat(telefone);
      setEntry({ telefone, state: { status: "success", summary } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível gerar o resumo agora.";
      setEntry({ telefone, state: { status: "error", message } });
    }
  }, [telefone]);

  const state = entry.telefone === telefone ? entry.state : IDLE;
  return { state, generate };
}
