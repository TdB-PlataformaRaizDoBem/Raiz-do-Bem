/** Formata um ISO date string para "HH:MM" no locale pt-BR */
export function formatHora(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** Trunca um texto longo para preview da sidebar */
export function formatPreview(text: string | null, maxLen = 40): string {
  if (!text) return "…";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

/** Normaliza qualquer formato de telefone para +55XXXXXXXXXXX */
export function normalizeTel(raw: string): string {
  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith("+")) return decoded;
  const digits = decoded.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  return `+55${digits}`;
}

/** Constrói a URL interna do chat a partir de um número de telefone */
export function buildChatUrl(tel: string): string {

  const digits = tel.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? `+${digits}` : `+55${digits}`;

  const currentPath = window.location.pathname;
  let prefix = "";
  if (currentPath.includes("/admin")) {
    prefix = "/admin";
  } else if (currentPath.includes("/coord")) {
    prefix = "/coord";
  }

  return `${prefix}/chat/${encodeURIComponent(normalized)}`;
}

/** Constrói a URL da Central de Atendimentos passando o telefone como query param */
export function buildGlobalChatUrl(tel: string): string {
  const digits = tel.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? `+${digits}` : `+55${digits}`;

  const currentPath = window.location.pathname;
  let prefix = "";
  if (currentPath.includes("/admin")) prefix = "/admin";
  else if (currentPath.includes("/coord")) prefix = "/coord";

  return `${prefix}/chat?phone=${encodeURIComponent(normalized)}`;
}


const AVATAR_COLORS = [
  "bg-teal-600",
  "bg-darkgreen",
  "bg-sky-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-cyan-600",
  "bg-indigo-600",
];

export function avatarColor(tel: string): string {
  const digits = tel.replace(/\D/g, "");
  const seed = parseInt(digits.slice(-3) || "0", 10);
  return AVATAR_COLORS[seed % AVATAR_COLORS.length];
}

/** Extrai as iniciais de um número de telefone para o avatar (últimos 4 dígitos) */
export function avatarInitials(tel: string): string {
  const digits = tel.replace(/\D/g, "");
  return digits.slice(-4, -2);
}