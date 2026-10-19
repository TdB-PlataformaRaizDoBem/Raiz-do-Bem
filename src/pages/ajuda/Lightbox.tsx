import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "../../hooks/useScrollLock";

interface LightboxProps {
  src: string;
  alt: string;
  /** Largura original da imagem, em pixels. No celular ela é mostrada maior que a tela e a pessoa rola para os lados. */
  largura?: number;
  onClose: () => void;
}

/** Largura mínima da imagem ampliada no celular. Só vale para imagens largas (telas inteiras). */
const LARGURA_MINIMA_CELULAR = 900;

/** Imagem ampliada sobre a página. Fecha com Esc, com o botão ou clicando fora da imagem. */
export const Lightbox = ({ src, alt, largura, onClose }: LightboxProps) => {
  const botaoFechar = useRef<HTMLButtonElement>(null);
  useScrollLock(true, true);
  const imagemLarga = largura !== undefined && largura > LARGURA_MINIMA_CELULAR;

  useEffect(() => {
    botaoFechar.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Só há um elemento focável na janela: mantém o foco nele em vez de deixá-lo escapar para a página de trás.
      if (e.key === "Tab") {
        e.preventDefault();
        botaoFechar.current?.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Imagem ampliada. ${alt}`}
      className="fixed inset-0 z-[1100] flex flex-col bg-black/85"
      onClick={onClose}
    >
      <div className="flex justify-end p-3">
        <button
          ref={botaoFechar}
          type="button"
          onClick={onClose}
          className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-black shadow-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
        >
          Fechar imagem
        </button>
      </div>
      <div className="flex-1 overflow-auto px-3 pb-6">
        <img
          src={src}
          alt={alt}
          className={`mx-auto h-auto rounded-lg bg-white shadow-2xl ${
            imagemLarga ? "w-[900px] max-w-none sm:w-auto sm:max-w-full" : "max-w-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>,
    document.body,
  );
};
