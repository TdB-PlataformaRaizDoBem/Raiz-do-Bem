import { useCallback, useMemo, useState, type ReactNode } from "react";
import { readCookieChoice, saveCookieChoice, type CookieChoice } from "../lib/cookieConsent";
import { CookieConsentContext, type CookieConsentValue } from "./cookieConsent";

/** Guarda a escolha sobre cookies opcionais. Envolve só as páginas públicas (ver `PublicLayout`). */
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [escolha, setEscolha] = useState<CookieChoice | null>(() => readCookieChoice());
  const [aberto, setAberto] = useState(() => escolha === null);

  const decidir = useCallback((terceiros: boolean) => {
    setEscolha(saveCookieChoice(terceiros));
    setAberto(false);
  }, []);

  const valor = useMemo<CookieConsentValue>(
    () => ({
      escolha,
      aceitouTerceiros: escolha?.terceiros ?? false,
      aberto,
      aceitar: () => decidir(true),
      recusar: () => decidir(false),
      reabrir: () => setAberto(true),
    }),
    [escolha, aberto, decidir],
  );

  return <CookieConsentContext.Provider value={valor}>{children}</CookieConsentContext.Provider>;
}
