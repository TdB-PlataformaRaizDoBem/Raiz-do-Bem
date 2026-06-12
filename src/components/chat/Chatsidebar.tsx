import { useNavigate } from "react-router-dom";
import type { ConversationPreview } from "../../domain/entities/ConversationPreview";
import { ConversationItem } from "./Conversationitem";
import { buildChatUrl } from "../../utils/Chatutils";

interface ChatSidebarProps {
  conversations: ConversationPreview[];
  activeTel: string;
  isOpen: boolean;        
  onClose: () => void;   
}

/**
 * Barra lateral de conversas ativas.
 */
export function ChatSidebar({ conversations, activeTel, isOpen, onClose }: ChatSidebarProps) {
  const navigate = useNavigate();

  const handleSelect = (tel: string) => {
    onClose(); // Fecha overlay no mobile
    navigate(buildChatUrl(tel));
  };

  return (
    <>
      <aside
        className={`
          shrink-0 flex flex-col
          bg-white border-r border-[#e9edef]
          transition-transform duration-300

          fixed inset-y-0 left-0 z-20 w-full max-w-[340px]
          md:absolute
          ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        {/* Cabeçalho da sidebar */}
        <div className="bg-[#f0f2f5] px-4 py-3 flex items-center justify-between border-b border-[#e9edef] shrink-0">
          <div className="flex items-center gap-2">
            {/* Ícone de chat */}
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
            onClick={onClose}
            aria-label="Fechar barra lateral"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Lista de conversas com scroll independente */}
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
                isActive={conv.tel_client === activeTel}
                onClick={() => handleSelect(conv.tel_client)}
              />
            ))
          )}
        </div>

        {/* Rodapé da sidebar com contagem total */}
        {conversations.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[#e9edef] bg-[#f0f2f5] shrink-0">
            <p className="text-[11px] text-[#8696a0]">
              {conversations.length} conversa{conversations.length !== 1 ? "s" : ""} ativa{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 md:absolute md:inset-0 bg-black/40 z-10 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}