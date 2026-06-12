import type { MessageResponse } from "../../domain/entities/MessageResponse";
import { formatHora } from "../../utils/Chatutils";

interface MessageBubbleProps {
  msg: MessageResponse;
}

export function MessageBubble({ msg }: MessageBubbleProps) {
  const isSaida = msg.direction === "saida";

  return (
    <div className={`flex ${isSaida ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`
          relative max-w-[75%] md:max-w-[62%] px-3 pt-2 pb-6 shadow-sm
          text-sm leading-relaxed break-words
          ${
            isSaida
              ? "bg-[#d9fdd3] rounded-2xl rounded-tr-none text-[#111b21]"
              : "bg-white      rounded-2xl rounded-tl-none text-[#111b21]"
          }
        `}
      >
        {/* Texto da mensagem */}
        <p className="whitespace-pre-wrap">{msg.text ?? ""}</p>

        {/* Rodapé interno da bolha */}
        <div
          className={`
            absolute bottom-1.5 flex items-center gap-1 text-[10px] text-[#8696a0]
            ${isSaida ? "right-2.5" : "left-2.5"}
          `}
        >
          <span>{formatHora(msg.date_time)}</span>

          {/* Auditoria: só aparece em mensagens de saída com colaborador */}
          {isSaida && msg.id_colaborador != null && (
            <span className="font-semibold text-darkgreen/60">
              · #{msg.id_colaborador}
            </span>
          )}

          {/* Ícone de "enviado" para mensagens de saída */}
          {isSaida && (
            <svg
              width="14"
              height="9"
              viewBox="0 0 16 11"
              fill="none"
              className="ml-0.5 text-[#53bdeb]"
            >
              <path
                d="M1 5.5L5 9.5L15 1.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 5.5L9 9.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
