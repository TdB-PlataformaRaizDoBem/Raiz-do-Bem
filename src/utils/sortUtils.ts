export type SentidoData = "recentes" | "antigos";

/**
 * Comparador por data ISO-8601 (YYYY-MM-DD, que ordena como texto) para `Array.sort`.
 * Datas vazias vão sempre para o fim, qualquer que seja o sentido. Várias datas do sistema não têm hora
 * (ex.: data do pedido), então o empate no mesmo dia se desfaz pelo id: id maior = chegou depois.
 */
export function comparadorPorData<T>(
  getData: (item: T) => string | null | undefined,
  getId: (item: T) => number,
  sentido: SentidoData,
): (a: T, b: T) => number {
  const fator = sentido === "recentes" ? -1 : 1;

  return (a, b) => {
    const dataA = (getData(a) ?? "").trim();
    const dataB = (getData(b) ?? "").trim();

    if (dataA === "" && dataB !== "") return 1;
    if (dataB === "" && dataA !== "") return -1;
    if (dataA !== dataB) return (dataA < dataB ? -1 : 1) * fator;

    return fator * (getId(a) - getId(b));
  };
}
