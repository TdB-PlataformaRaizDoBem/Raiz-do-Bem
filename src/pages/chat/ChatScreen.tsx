import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getChatHistory,
  sendMessage,
  getActiveConversations,
  markAsRead,
} from "../../services/ChatService";
import { normalizeTel } from "../../utils/Chatutils";
import { ChatSidebar } from "../../components/chat/Chatsidebar";
import { ChatWindow } from "../../components/chat/Chatwindow";
import { useContactLookup } from "../../hooks/useContactLookup";
import type { MessageResponse } from "../../domain/entities/MessageResponse";
import type { ConversationPreview } from "../../domain/entities/ConversationPreview";


const POLLING_INTERVAL_MS = 5_000;

/**
 * ChatScreen — Orquestrador de estado.
 *
 * Responsabilidades:
 *  - Controla todos os estados globais (mensagens, conversas, loading, erro, sidebar).
 *  - Gerencia o ciclo de polling com limpeza garantida (sem memory leaks).
 *  - Chama `markAsRead` ao mudar de conversa ou ao montar na primeira vez.
 *  - Distribui dados via props limpas para ChatSidebar e ChatWindow.
 */
export default function ChatScreen() {
  const { telefone: rawTelefone } = useParams<{ telefone: string }>();
  const telefone = rawTelefone ? normalizeTel(rawTelefone) : "";

  const { contact } = useContactLookup(telefone);

  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Desktop: sidebar abre por padrão; mobile: fechada (o overlay é acionado pelo hamburger)
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.matchMedia("(min-width: 768px)").matches
  );

  // Ref para rastrear qual telefone foi marcado como lido no ciclo atual,
  // evitando chamadas duplicadas ao mudar de rota rapidamente.
  const lastMarkedRef = useRef<string>("");

  // Ref com os IDs de mensagens já conhecidas; usado pelo polling para
  // detectar novas mensagens de "entrada" enquanto o chat está aberto.
  const prevMsgIdsRef = useRef<Set<string>>(new Set());

  // Buscar lista de conversas ativas
  const fetchConversations = useCallback(async () => {
    const data = await getActiveConversations();
    setConversations(data);
  }, []);

  // Buscar histórico
  const fetchHistory = useCallback(async () => {
    if (!telefone) return;
    try {
      const data = await getChatHistory(telefone);
      setMessages(data);
      setError(null);

      // Detecta novas mensagens de "entrada" que chegaram enquanto o chat está aberto.
      // prevIds.size === 0 significa primeira carga — não dispara markAsRead de novo.
      const prevIds = prevMsgIdsRef.current;
      const hasNewIncoming =
        prevIds.size > 0 &&
        data.some((m) => m.direction === "entrada" && !prevIds.has(m.id_db));

      prevMsgIdsRef.current = new Set(data.map((m) => m.id_db));

      if (hasNewIncoming) {
        // Aguarda o backend confirmar a leitura antes de atualizar a sidebar,
        // garantindo que unread_count já seja 0 quando o estado for atualizado.
        markAsRead(telefone)
          .then(() => fetchConversations())
          .catch(() => fetchConversations());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar histórico.");
    } finally {
      setLoadingHistory(false);
    }
  }, [telefone, fetchConversations]);

  //  Marcar como lido ao abrir conversa 
  useEffect(() => {
    if (!telefone || lastMarkedRef.current === telefone) return;
    lastMarkedRef.current = telefone;

    markAsRead(telefone).catch(() => {
      // Silencioso — não é crítico falhar aqui
    });
  }, [telefone]);

  //  Montagem + polling
  useEffect(() => {
    if (!telefone) return;

    // Reset estado ao mudar de conversa
    setMessages([]);
    setLoadingHistory(true);
    setError(null);
    prevMsgIdsRef.current = new Set();

    // Busca inicial imediata
    fetchHistory();
    fetchConversations();

    // Polling: re-busca histórico e lista a cada N segundos
    const id = setInterval(() => {
      fetchHistory();
      fetchConversations();
    }, POLLING_INTERVAL_MS);

    // Cleanup obrigatório — evita memory leaks ao desmontar ou trocar de rota
    return () => clearInterval(id);
  }, [telefone, fetchHistory, fetchConversations]);

  // Enviar mensagem
  const handleSend = useCallback(
    async (text: string) => {
      if (!text || sending) return;
      setSending(true);
      try {
        await sendMessage({
          tel_client: telefone,
          text,
          id_colaborador: 1,
        });
        // Refetch imediato após envio bem-sucedido
        await fetchHistory();
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao enviar mensagem.");
      } finally {
        setSending(false);
      }
    },
    [telefone, sending, fetchHistory]
  );

  // Guard: sem telefone na URL
  if (!telefone) {
    return (
      <div className="flex items-center justify-center flex-1 bg-[#efeae2]">
        <div className="text-center">
          <p className="text-[#8696a0] text-sm">Nenhum número selecionado.</p>
          <p className="text-[#8696a0] text-xs mt-1">
            Selecione um contato na barra lateral para iniciar.
          </p>
        </div>
      </div>
    );
  }

  // Layout
  return (
    <div className="flex flex-1 overflow-hidden">

      {/* Sidebar de conversas ativas */}
      <ChatSidebar
        conversations={conversations}
        activeTel={telefone}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Janela principal do chat */}
      <ChatWindow
        telefone={telefone}
        messages={messages}
        loading={loadingHistory}
        sending={sending}
        error={error}
        contact={contact}
        onSend={handleSend}
        onClearError={() => setError(null)}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    </div>
  );
}