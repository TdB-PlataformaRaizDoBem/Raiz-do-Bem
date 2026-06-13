import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import type { MessageResponse } from "../../domain/entities/MessageResponse";
import type { ContactInfo } from "../../hooks/useContactLookup";
import { MessageBubble } from "./Messagebubble";
import { formatPhone } from "../../utils/formatUtils";
import { avatarColor, avatarInitials } from "../../utils/Chatutils";

interface MessageForm {
  text: string;
}

interface ChatWindowProps {
  telefone: string;
  messages: MessageResponse[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  onSend: (text: string) => Promise<void>;
  onClearError: () => void;
  onOpenSidebar: () => void;
  /** Se fornecido, exibe nome e tag de perfil no cabeçalho em vez do número bruto */
  contact?: ContactInfo | null;
}

/**
 * Janela principal do chat.
 * Responsável por: cabeçalho do contato, feed de mensagens e formulário de envio.
 */
export function ChatWindow({
  telefone,
  messages,
  loading,
  sending,
  error,
  onSend,
  onClearError,
  onOpenSidebar,
  contact,
}: ChatWindowProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } =
    useForm<MessageForm>({ defaultValues: { text: "" } });

  const textValue = watch("text");
  const canSend = !!textValue?.trim() && !sending;

  // Scroll automático ao receber novas mensagens
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize do textarea conforme o usuário digita
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 124)}px`;
  }, [textValue]);

  const onSubmit = async (data: MessageForm) => {
    if (!canSend) return;
    await onSend(data.text.trim());
    reset();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  // Desestrutura o ref do RHF para combiná-lo com o nosso
  const { ref: rhfRef, ...textareaProps } = register("text", { required: true });

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-[#efeae2]">

      <header className="bg-[#f0f2f5] border-b border-[#e9edef] px-3 py-2.5 flex items-center gap-3 shrink-0">

        {/* Botão hamburger — abre sidebar no mobile / desktop */}
        <button
          onClick={onOpenSidebar}
          className="p-1.5 -ml-1 rounded-full hover:bg-black/5 transition text-[#54656f]"
          aria-label="Ver conversas"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Avatar do contato */}
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            shrink-0 text-white text-sm font-bold select-none
            ${avatarColor(telefone)}
          `}
          aria-hidden="true"
        >
          {avatarInitials(telefone)}
        </div>

        {/* Identificação */}
        <div className="flex-1 min-w-0">
          {contact ? (
            <>
              <p className="font-semibold text-[#111b21] text-sm leading-tight truncate">
                {contact.nome}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`
                  text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0
                  ${contact.tipo === "beneficiario"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-teal-100 text-teal-700"}
                `}>
                  {contact.tipo === "beneficiario" ? "Beneficiário" : "Dentista"}
                </span>
                <span className="text-[10px] text-[#8696a0] truncate">
                  {formatPhone(telefone)}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#111b21] text-sm leading-tight truncate">
                {formatPhone(telefone)}
              </p>
              <p className="text-[11px] text-[#8696a0] truncate">{telefone}</p>
            </>
          )}
        </div>

        {/* Indicador de polling ativo */}
        <div
          className="w-2 h-2 rounded-full bg-darkgreen animate-pulse shrink-0"
          title="Sincronizando a cada 5 segundos"
        />
      </header>

      {/* Feed de mensagens */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-3"
        style={{
          // Textura sutil de fundo, igual ao WhatsApp Web
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23efeae2'/%3E%3Ccircle cx='60' cy='60' r='1.2' fill='%23d5cfc6' opacity='0.6'/%3E%3Ccircle cx='180' cy='120' r='1.2' fill='%23d5cfc6' opacity='0.6'/%3E%3Ccircle cx='300' cy='60' r='1.2' fill='%23d5cfc6' opacity='0.6'/%3E%3Ccircle cx='120' cy='240' r='1.2' fill='%23d5cfc6' opacity='0.6'/%3E%3Ccircle cx='240' cy='300' r='1.2' fill='%23d5cfc6' opacity='0.6'/%3E%3Ccircle cx='360' cy='180' r='1.2' fill='%23d5cfc6' opacity='0.6'/%3E%3C/svg%3E")`,
        }}
      >
        {/* Loading inicial */}
        {loading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-darkgreen/40 animate-bounce"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Feed vazio */}
        {!loading && messages.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-5 text-center shadow-sm max-w-65">
              <div className="w-12 h-12 rounded-full bg-darkgreen/10 flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-darkgreen">
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-[#111b21]">Nenhuma mensagem ainda</p>
              <p className="text-xs text-[#8696a0] mt-1 leading-relaxed">
                Envie a primeira mensagem para iniciar o atendimento.
              </p>
            </div>
          </div>
        )}

        {/* Mensagens */}
        <div className="space-y-0.5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id_db} msg={msg} />
          ))}
        </div>

        {/* Indicador de "enviando..." */}
        {sending && (
          <div className="flex justify-end mt-1 pr-1">
            <div className="flex gap-1 items-center px-3 py-1.5 bg-[#d9fdd3] rounded-2xl rounded-tr-none shadow-sm">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-darkgreen/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
          <button
            onClick={onClearError}
            className="text-red-400 hover:text-red-600 transition ml-3 p-0.5 shrink-0"
            aria-label="Fechar alerta de erro"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Formulário de envio — pb respeita safe-area em iPhones com notch */}
      <footer
        className="bg-[#f0f2f5] border-t border-[#e9edef] px-3 pt-2 shrink-0"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">

          {/* Campo de texto com auto-resize */}
          <textarea
            {...textareaProps}
            ref={(el) => {
              rhfRef(el);
              textareaRef.current = el;
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Digite uma mensagem"
            disabled={sending}
            aria-invalid={!!errors.text}
            className={`
              flex-1 resize-none rounded-[20px] bg-white border-0 outline-none
              px-4 py-2.5 text-sm text-[#111b21] placeholder-[#8696a0]
              leading-relaxed shadow-sm transition
              focus:ring-2 focus:ring-darkgreen/20
              disabled:opacity-60
              max-h-31 overflow-y-auto
              ${errors.text ? "ring-2 ring-red-300" : ""}
            `}
          />

          {/* Botão de envio */}
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Enviar mensagem"
            className={`
              w-10 h-10 rounded-full flex items-center justify-center shrink-0
              transition-all duration-200
              ${canSend
                ? "bg-darkgreen hover:bg-[#005a40] active:scale-95 shadow-md"
                : "bg-[#8696a0] cursor-not-allowed"
              }
            `}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        <p className="text-[10px] text-[#8696a0] mt-1 text-center select-none">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </footer>
    </div>
  );
}