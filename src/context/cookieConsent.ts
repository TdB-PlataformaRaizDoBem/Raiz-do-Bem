import { createContext, useContext } from "react";
import type { CookieChoice } from "../lib/cookieConsent";

export interface CookieConsentValue {
  /** Escolha salva; `null` enquanto a pessoa não decidiu (ou se ela expirou). */
  escolha: CookieChoice | null;
  /** `true` só se a pessoa autorizou cookies opcionais (mapa do Google). */
  aceitouTerceiros: boolean;
  /** O aviso está visível. */
  aberto: boolean;
  aceitar: () => void;
  recusar: () => void;
  /** Reabre o aviso (link "Preferências de cookies" do rodapé). */
  reabrir: () => void;
}

/** Valor padrão fora do provider: tudo recusado e sem aviso, para componentes isolados (e testes) não quebrarem. */
export const CookieConsentContext = createContext<CookieConsentValue>({
  escolha: null,
  aceitouTerceiros: false,
  aberto: false,
  aceitar: () => {},
  recusar: () => {},
  reabrir: () => {},
});

export const useCookieConsent = () => useContext(CookieConsentContext);
