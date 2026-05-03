/**
 * Converte data ISO-8601 "YYYY-MM-DD" para "DD/MM/YYYY".
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length !== 3) return "—";
  const [year, month, day] = parts;
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}

/**
 * Converte data ISO-8601 para objeto Date do JavaScript.
 */
export function parseISODate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso + "T00:00:00"); // força parse local sem deslocamento UTC
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Calcula a idade em anos a partir de uma data ISO-8601.
 */
export function calcularIdade(iso: string | null | undefined): number | null {
  const nascimento = parseISODate(iso);
  if (!nascimento) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNasc = nascimento.getMonth();
  if (
    mesAtual < mesNasc ||
    (mesAtual === mesNasc && hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }
  return idade;
}

/**
 * Converte data no formato "DD/MM/YYYY" para ISO-8601 "YYYY-MM-DD".
 */
export function toISODate(brDate: string | null | undefined): string {
  if (!brDate) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(brDate)) return brDate;
  const parts = brDate.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
}