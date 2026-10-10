import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCookieConsent } from "../../context/cookieConsent";

/**
 * Aviso de cookies das páginas públicas. Não bloqueia a página.
 * "Aceitar" e "Recusar" têm o mesmo peso visual (a recusa é tão fácil quanto o aceite) e o que é opcional começa desligado.
 */
export function CookieBanner() {
  const { aberto, escolha, aceitar, recusar } = useCookieConsent();
  const titulo = useRef<HTMLHeadingElement>(null);
  const estavaAberto = useRef(aberto);

  // Ao carregar a página não roubamos o foco; quando o aviso é reaberto (rodapé ou mapa), levamos o foco até ele.
  useEffect(() => {
    if (aberto && !estavaAberto.current) titulo.current?.focus();
    estavaAberto.current = aberto;
  }, [aberto]);

  if (!aberto) return null;

  const botao =
    "min-h-[44px] flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen focus-visible:ring-offset-2";

  return (
    <section
      aria-labelledby="aviso-cookies-titulo"
      className="fixed inset-x-3 bottom-3 z-[900] rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 shadow-xl sm:inset-x-auto sm:left-4 sm:bottom-4 sm:w-[340px]"
    >
      <h2 id="aviso-cookies-titulo" ref={titulo} tabIndex={-1} className="sr-only focus:outline-none">
        Cookies e privacidade
      </h2>
      <p className="text-sm leading-relaxed">
        Usamos só o necessário para o site funcionar. O mapa do Google só carrega se você permitir.{" "}
        <Link to="/privacidade#cookies" className="font-semibold text-darkgreen underline underline-offset-2">
          Saiba mais
        </Link>
      </p>
      {escolha && (
        <p className="mt-1 text-xs text-gray-700">
          Sua escolha atual: {escolha.terceiros ? "cookies opcionais permitidos" : "cookies opcionais recusados"}.
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={recusar} className={`${botao} border border-gray-400 bg-white hover:bg-gray-100`}>
          Recusar opcionais
        </button>
        <button type="button" onClick={aceitar} className={`${botao} bg-darkgreen text-white hover:bg-black`}>
          Aceitar opcionais
        </button>
      </div>
    </section>
  );
}
