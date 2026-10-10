/**
 * Escolha do visitante sobre cookies opcionais (hoje só o mapa do Google, na página Contato).
 * Fica em `localStorage` porque precisa durar entre visitas; é um dado essencial do próprio aviso.
 */
const KEY = "raiz-do-bem:cookies";
/** Aumente quando o aviso passar a cobrir uma categoria nova: a escolha antiga deixa de valer. */
export const COOKIE_CONSENT_VERSION = 1;
/** Depois de 12 meses o aviso volta a perguntar. */
export const COOKIE_CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export interface CookieChoice {
  v: number;
  /** Autoriza conteúdo de terceiros que pode gravar cookies (mapa do Google). */
  terceiros: boolean;
  /** ISO 8601 de quando a pessoa decidiu. */
  em: string;
}

/** Lê a escolha salva; `null` se não há, está corrompida, é de outra versão ou expirou. */
export function readCookieChoice(agora: number = Date.now()): CookieChoice | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const escolha = JSON.parse(raw) as Partial<CookieChoice>;
    if (
      escolha.v !== COOKIE_CONSENT_VERSION ||
      typeof escolha.terceiros !== "boolean" ||
      typeof escolha.em !== "string"
    ) {
      return null;
    }
    const idade = agora - Date.parse(escolha.em);
    if (Number.isNaN(idade) || idade > COOKIE_CONSENT_MAX_AGE_MS) return null;
    return escolha as CookieChoice;
  } catch {
    return null;
  }
}

/** Salva e devolve a escolha. Se o navegador bloquear o storage, a escolha vale só nesta visita. */
export function saveCookieChoice(terceiros: boolean, agora: Date = new Date()): CookieChoice {
  const escolha: CookieChoice = { v: COOKIE_CONSENT_VERSION, terceiros, em: agora.toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(escolha));
  } catch {
    /* storage indisponível: a escolha não persiste */
  }
  return escolha;
}
