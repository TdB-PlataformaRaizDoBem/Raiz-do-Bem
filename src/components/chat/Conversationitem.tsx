import type { ConversationPreview } from "../../domain/entities/ConversationPreview";
import {
  formatHora,
  formatPreview,
  avatarColor,
  avatarInitials,
} from "../../utils/Chatutils";
import { formatPhone } from "../../utils/formatUtils";

interface ConversationItemProps {
  conversation: ConversationPreview;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Item da barra lateral que representa uma conversa.
 * Exibe avatar com iniciais coloridas, prévia da última mensagem,
 * horário e — quando `unread_count > 0` — um badge de notificações.
 */
export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const { tel_client, text, date_time, direction, unread_count } = conversation;
  const hasUnread = unread_count > 0;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left flex items-center gap-3 px-4 py-3
        border-b border-[#f0f2f5] transition-colors duration-150
        ${isActive ? "bg-[#f0f2f5]" : "hover:bg-[#f5f6f6] active:bg-[#eaeaea]"}
      `}
    >
      {/* Avatar com iniciais e cor determinística */}
      <div
        className={`
          w-11 h-11 rounded-full flex items-center justify-center
          shrink-0 text-white text-sm font-bold tracking-wide select-none
          ${avatarColor(tel_client)}
        `}
        aria-hidden="true"
      >
        {avatarInitials(tel_client)}
      </div>

      {/* Conteúdo textual */}
      <div className="flex-1 min-w-0">
        {/* Linha superior: telefone + horário */}
        <div className="flex justify-between items-baseline gap-2">
          <p
            className={`text-sm truncate ${
              hasUnread
                ? "font-bold text-[#111b21]"
                : "font-semibold text-[#111b21]"
            }`}
          >
            {formatPhone(tel_client)}
          </p>
          <span
            className={`text-[11px] shrink-0 ${
              hasUnread ? "text-darkgreen font-semibold" : "text-[#8696a0]"
            }`}
          >
            {formatHora(date_time)}
          </span>
        </div>

        {/* Linha inferior: prévia da mensagem + badge de não lidas */}
        <div className="flex justify-between items-center gap-2 mt-0.5">
          <p className="text-xs text-[#8696a0] truncate">
            {direction === "saida" && (
              <span className="text-[#8696a0] mr-1">Você:</span>
            )}
            {formatPreview(text)}
          </p>

          {/* Badge de mensagens não lidas — estilo WhatsApp */}
          {hasUnread && (
            <span
              className="
                shrink-0 min-w-[20px] h-5 px-1.5
                rounded-full bg-darkgreen text-white
                text-[11px] font-bold
                flex items-center justify-center
                leading-none
              "
              aria-label={`${unread_count} mensagens não lidas`}
            >
              {unread_count > 99 ? "99+" : unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
