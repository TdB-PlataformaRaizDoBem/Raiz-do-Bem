import { useState } from "react";
import { useCookieConsent } from "../../context/cookieConsent";

const MAPA_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.402206778434!2d-46.6341499!3d-23.5905244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5a37456d68b9%3A0x6a6d6d8d6d6d6d6d!2sRua%20Maur%C3%ADcio%20Francisco%20Klabin%2C%20449!5e0!3m2!1spt-BR!2sbr!4v1";

const ABRIR_NO_GOOGLE =
  "https://www.google.com/maps/search/?api=1&query=Rua+Maur%C3%ADcio+Francisco+Klabin+449+S%C3%A3o+Paulo";

/**
 * Mapa da sede. O `<iframe>` do Google grava cookies de terceiros assim que carrega, então só aparece
 * se a pessoa permitiu cookies opcionais ou pediu este mapa agora (valendo só para esta visita).
 */
export function GoogleMapEmbed({ className = "" }: { className?: string }) {
  const { aceitouTerceiros, reabrir } = useCookieConsent();
  const [carregarAgora, setCarregarAgora] = useState(false);

  if (aceitouTerceiros || carregarAgora) {
    return (
      <iframe
        src={MAPA_URL}
        title="Mapa com a localização da sede da Turma do Bem"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        className={className}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-cream p-6 text-center ${className}`}
    >
      <p className="max-w-[360px] text-sm text-gray-800">
        O mapa é fornecido pelo Google, que pode gravar cookies no seu navegador. Ele só é carregado com a sua
        permissão.
      </p>
      <button
        type="button"
        onClick={() => setCarregarAgora(true)}
        className="min-h-[44px] rounded-md bg-darkgreen px-4 py-2 text-sm font-bold text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/50 focus-visible:ring-offset-2"
      >
        Carregar o mapa agora
      </button>
      <a
        href={ABRIR_NO_GOOGLE}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-[#7a3f0a] underline underline-offset-2 hover:text-darkgreen"
      >
        Abrir no Google Maps (nova aba)
      </a>
      <button
        type="button"
        onClick={reabrir}
        className="text-xs text-gray-700 underline underline-offset-2 hover:text-darkgreen"
      >
        Mudar preferências de cookies
      </button>
    </div>
  );
}
