import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getChatHistory,
  sendMessage,
  markAsRead,
} from "../../services/ChatService";
import { normalizeTel } from "../../utils/Chatutils";
import { ChatWindow } from "../../components/chat/Chatwindow";
import { ConversationItem } from "../../components/chat/Conversationitem";
import { useUnread } from "../../hooks/useUnread";
import { useContactLookup } from "../../hooks/useContactLookup";
import type { MessageResponse } from "../../domain/entities/MessageResponse";

const POLLING_INTERVAL_MS = 5_000;

export default function ConversasScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { conversations, refresh: refreshUnread } = useUnread();

  const rawPhone = searchParams.get("phone");
  const selectedTel = rawPhone ? normalizeTel(rawPhone) : null;

  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.matchMedia("(min-width: 768px)").matches
  );

  const prevMsgIdsRef = useRef<Set<string>>(new Set());
  const { contact } = useContactLookup(selectedTel ?? "");

  const fetchHistory = useCallback(async () => {
    if (!selectedTel) return;
    try {
      const data = await getChatHistory(selectedTel);
      setMessages(data);
      setError(null);

      const prevIds = prevMsgIdsRef.current;
      const hasNewIncoming =
        prevIds.size > 0 &&
        data.some((m) => m.direction === "entrada" && !prevIds.has(m.id_db));
      prevMsgIdsRef.current = new Set(data.map((m) => m.id_db));

      if (hasNewIncoming) {
        markAsRead(selectedTel)
          .then(() => refreshUnread())
          .catch(() => refreshUnread());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar histórico.");
    } finally {
      setLoadingHistory(false);
    }
  }, [selectedTel, refreshUnread]);

  useEffect(() => {
    if (!selectedTel) return;

    setMessages([]);
    setLoadingHistory(true);
    setError(null);
    prevMsgIdsRef.current = new Set();

    markAsRead(selectedTel)
      .then(() => refreshUnread())
      .catch(() => refreshUnread());

    fetchHistory();

    const id = setInterval(fetchHistory, POLLING_INTERVAL_MS);
    return () => clearInterval(id);
  }, [selectedTel, fetchHistory, refreshUnread]);

  const handleSelect = useCallback(
    (tel: string) => {
      setSearchParams({ phone: tel }, { replace: false });
      if (window.matchMedia("(max-width: 767px)").matches) {
        setSidebarOpen(false);
      }
    },
    [setSearchParams]
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!text || !selectedTel || sending) return;
      setSending(true);
      try {
        await sendMessage({ tel_client: selectedTel, text, id_colaborador: 1 });
        await fetchHistory();
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao enviar mensagem.");
      } finally {
        setSending(false);
      }
    },
    [selectedTel, sending, fetchHistory]
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Painel esquerdo: lista de conversas */}
      <aside
        className={`
          flex flex-col bg-white border-r border-[#e9edef]
          overflow-hidden transition-all duration-300

          fixed inset-y-0 left-0 z-20 w-full max-w-[340px]
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}

          md:static md:inset-auto md:translate-x-0 md:shadow-none md:z-auto
          ${sidebarOpen ? "md:w-[340px] md:min-w-[340px]" : "md:w-0 md:min-w-0 md:border-0"}
        `}
      >
        <div className="bg-[#f0f2f5] px-4 py-3 flex items-center justify-between border-b border-[#e9edef] shrink-0">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-darkgreen">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            <h2 className="font-fredoka font-semibold text-[#111b21] text-base leading-none">
              Atendimentos
            </h2>
          </div>
          <button
            className="p-1.5 rounded-full hover:bg-gray-200 transition text-[#54656f]"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar barra lateral"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111b21]">Nenhuma conversa</p>
                <p className="text-xs text-[#8696a0] mt-1 leading-relaxed">
                  Os atendimentos iniciados aparecerão aqui automaticamente.
                </p>
              </div>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.tel_client}
                conversation={conv}
                isActive={conv.tel_client === selectedTel}
                onClick={() => handleSelect(conv.tel_client)}
              />
            ))
          )}
        </div>

        {conversations.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[#e9edef] bg-[#f0f2f5] shrink-0">
            <p className="text-[11px] text-[#8696a0]">
              {conversations.length} conversa{conversations.length !== 1 ? "s" : ""} ativa{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </aside>

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-10 backdrop-blur-[1px]"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Painel direito: janela de chat ou estado vazio */}
      {selectedTel ? (
        <ChatWindow
          telefone={selectedTel}
          messages={messages}
          loading={loadingHistory}
          sending={sending}
          error={error}
          contact={contact}
          onSend={handleSend}
          onClearError={() => setError(null)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mb-6 p-3 rounded-full bg-white shadow-md text-[#54656f]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="text-center px-8 max-w-sm">
            <div className="w-20 h-20 rounded-full bg-darkgreen/10 flex items-center justify-center mx-auto mb-5">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="text-darkgreen">
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-fredoka font-semibold text-[#111b21] text-xl">
              Central de Atendimentos
            </p>
            <p className="text-sm text-[#8696a0] mt-2 leading-relaxed">
              Selecione uma conversa à esquerda ou inicie uma pelo perfil do contato.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
