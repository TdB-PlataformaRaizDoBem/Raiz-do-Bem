import { useEffect } from "react";
import type { ChatSummaryController } from "../../hooks/useChatSummaryPanel";
import { SUMMARY_DRAWER_ID } from "./ChatSummaryTrigger";
import { SparkleIcon } from "./SparkleIcon";

interface ChatSummaryDrawerProps {
  controller: ChatSummaryController;
}

const SECTIONS = [
  { key: "necessidade_principal", title: "Necessidade Principal" },
  { key: "status_atual", title: "Status Atual" },
  { key: "proximos_passos", title: "Próximos Passos" },
] as const;

/** "- a\n- b" → ["a", "b"]. Texto corrido vira uma lista de um item só. */
function toLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function SummarySkeleton() {
  return (
    <div role="status" aria-label="Gerando resumo" className="space-y-5">
      <p className="text-xs text-[#8696a0]">Lendo a conversa…</p>
      {SECTIONS.map(({ key }) => (
        <div key={key} className="space-y-2 motion-safe:animate-pulse">
          <div className="h-2.5 w-28 rounded bg-[#e9edef]" />
          <div className="h-3 w-full rounded bg-[#f0f2f5]" />
          <div className="h-3 w-5/6 rounded bg-[#f0f2f5]" />
        </div>
      ))}
    </div>
  );
}

/**
 * Painel lateral do resumo por IA. No desktop é irmão da coluna do chat (a conversa só se
 * estreita, nada fica coberto); no celular vira uma folha lateral por cima. Não é modal:
 * o chat continua usável e Esc fecha.
 */
export function ChatSummaryDrawer({ controller }: ChatSummaryDrawerProps) {
  const { open, close, state, generate } = controller;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!open) return null;

  return (
    <aside
      id={SUMMARY_DRAWER_ID}
      aria-label="Resumo do atendimento"
      className="
        fixed inset-y-0 right-0 z-40 w-full max-w-[380px]
        md:static md:z-auto md:w-[340px] md:max-w-none md:shrink-0
        flex flex-col bg-white border-l border-[#e9edef] shadow-2xl md:shadow-none
      "
    >
      <header className="flex items-center gap-2 px-4 py-3 border-b border-[#e9edef] bg-[#f0f2f5] shrink-0">
        <SparkleIcon size={18} />
        <h2 className="flex-1 text-sm font-semibold text-[#111b21]">Resumo do atendimento</h2>
        <button
          type="button"
          onClick={close}
          aria-label="Fechar resumo"
          className="p-1.5 -mr-1 rounded-full text-[#54656f] hover:bg-black/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/40"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {state.status === "loading" && <SummarySkeleton />}

        {state.status === "error" && (
          <div role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 leading-relaxed">
            {state.message}
          </div>
        )}

        {state.status === "success" && (
          <dl className="space-y-5">
            {SECTIONS.map(({ key, title }) => {
              const lines = toLines(state.summary[key]);
              return (
                <div key={key}>
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-darkgreen">{title}</dt>
                  {lines.length > 1 ? (
                    <dd>
                      <ul className="mt-1.5 space-y-1.5 text-[13px] text-[#111b21] leading-relaxed list-disc pl-4 marker:text-darkgreen/50">
                        {lines.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </dd>
                  ) : (
                    <dd className="mt-1.5 text-[13px] text-[#111b21] leading-relaxed">{lines[0] ?? ""}</dd>
                  )}
                </div>
              );
            })}
          </dl>
        )}
      </div>

      <footer className="px-4 py-3 border-t border-[#e9edef] flex items-center justify-between gap-3 shrink-0">
        <p className="text-[10px] text-[#8696a0] leading-snug">
          {state.status === "success"
            ? `Gerado por IA a partir das últimas ${state.summary.messages_used} mensagens. Confira antes de agir.`
            : "Gerado por IA. Confira antes de agir."}
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={state.status === "loading"}
          className="text-xs font-semibold text-darkgreen hover:underline shrink-0 disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
        >
          {state.status === "error" ? "Tentar de novo" : state.status === "success" ? "Gerar novamente" : "Gerar resumo"}
        </button>
      </footer>
    </aside>
  );
}
