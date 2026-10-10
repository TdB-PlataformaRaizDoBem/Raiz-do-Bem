import { useState } from "react";

interface YouTubeFacadeProps {
  /** ID do vídeo, a parte depois de `v=` na URL. */
  videoId: string;
  /** Título lido por leitores de tela, no botão e no iframe. */
  title: string;
  /** Miniatura local (recomendado). Sem ela, usa a miniatura pública do YouTube. */
  thumbnail?: string;
  className?: string;
}

/**
 * Mostra só a miniatura e carrega o player depois do clique.
 *
 * Por quê: o `<iframe>` do YouTube baixa ~470 KB de JavaScript, grava ~35 cookies
 * de terceiros e puxa scripts de anúncio assim que a página abre. Com a fachada,
 * nada disso acontece até a pessoa pedir o vídeo. Depois do clique usamos o domínio
 * `youtube-nocookie.com`, que não grava cookies até a reprodução.
 */
export function YouTubeFacade({ videoId, title, thumbnail, className = "" }: YouTubeFacadeProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className={`w-full h-full ${className}`}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Assistir ao vídeo: ${title}`}
      className={`group relative block w-full h-full bg-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white ${className}`}
    >
      <img
        src={thumbnail ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        width={480}
        height={360}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover opacity-90 motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 m-auto flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-orange-strong text-white shadow-xl motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-110"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
