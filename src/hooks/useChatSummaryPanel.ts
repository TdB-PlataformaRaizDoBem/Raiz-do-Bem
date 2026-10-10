import { useCallback, useState } from "react";
import { useChatSummary } from "./useChatSummary";

/**
 * Assistente de resumo por IA do chat: abre/fecha o painel lateral e gera o resumo na primeira
 * abertura de cada conversa (um clique só). Ao trocar de conversa o painel fecha, porque o resumo
 * é de um contato específico.
 */
export function useChatSummaryPanel(telefone: string) {
  const { state, generate } = useChatSummary(telefone);
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === telefone;

  const close = useCallback(() => setOpenFor(null), []);

  const toggle = useCallback(() => {
    if (open) {
      setOpenFor(null);
      return;
    }
    setOpenFor(telefone);
    if (state.status === "idle") void generate();
  }, [open, telefone, state.status, generate]);

  return { open, toggle, close, state, generate };
}

export type ChatSummaryController = ReturnType<typeof useChatSummaryPanel>;
