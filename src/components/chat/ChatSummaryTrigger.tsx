import { SparkleIcon } from "./SparkleIcon";

export const SUMMARY_DRAWER_ID = "chat-summary-drawer";

interface ChatSummaryTriggerProps {
  open: boolean;
  loading: boolean;
  onClick: () => void;
}

/**
 * Gatilho discreto do resumo por IA: só um brilho no cabeçalho do chat, sem ocupar espaço da
 * conversa. Gira devagar enquanto a IA lê o histórico.
 */
export function ChatSummaryTrigger({ open, loading, onClick }: ChatSummaryTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Resumo do atendimento por IA"
      aria-expanded={open}
      aria-controls={SUMMARY_DRAWER_ID}
      title="Resumo por IA"
      className={`
        w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/40
        ${open ? "bg-white shadow-sm" : "hover:bg-black/5"}
      `}
    >
      <SparkleIcon
        size={18}
        className={loading ? "motion-safe:animate-spin [animation-duration:2.4s]" : ""}
      />
    </button>
  );
}
