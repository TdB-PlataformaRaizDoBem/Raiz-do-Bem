import type { Bloco, Figura, Secao } from "./ajudaData";

/** Tira acentos e maiúsculas, para a busca achar "pedido" digitando "PÉDIDO". */
export const normalizar = (texto: string): string =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Remove os `**` de negrito: usado quando só importa o texto puro (busca). */
export const semMarcacao = (texto: string): string => texto.replace(/\*\*/g, "");

const textosDaFigura = (f: Figura): string[] => [f.legenda, f.alt, ...(f.marcas ?? [])];

function textosDoBloco(bloco: Bloco): string[] {
  switch (bloco.tipo) {
    case "texto":
    case "dica":
    case "atencao":
      return [bloco.texto];
    case "subtitulo":
      return [bloco.titulo];
    case "passos":
    case "lista":
      return [bloco.titulo ?? "", ...bloco.itens];
    case "figura":
      return textosDaFigura(bloco.figura);
    case "figuras":
      return bloco.figuras.flatMap(textosDaFigura);
    case "tabela":
      return [bloco.legenda, ...bloco.colunas, ...bloco.linhas.flat()];
    case "fluxo":
      return [bloco.titulo, ...bloco.etapas.flatMap((e) => [e.titulo, e.texto])];
    case "perguntas":
      return bloco.itens.flatMap((i) => [i.pergunta, i.resposta]);
    case "definicoes":
      return bloco.itens.flatMap((i) => [i.termo, i.significado]);
  }
}

const cache = new WeakMap<Secao, string>();

/** Todo o texto de um tópico, sem acentos e em minúsculas, pronto para a busca. */
export function textoIndexavel(secao: Secao): string {
  let texto = cache.get(secao);
  if (texto === undefined) {
    texto = normalizar(
      semMarcacao(
        [secao.titulo, secao.resumo, ...secao.palavras, ...secao.blocos.flatMap(textosDoBloco)].join(" "),
      ),
    );
    cache.set(secao, texto);
  }
  return texto;
}

/**
 * Mantém só os tópicos que contêm todas as palavras digitadas (em qualquer ordem).
 * Sem texto na busca, devolve todos.
 */
export function filtrarSecoes(secoes: Secao[], consulta: string): Secao[] {
  const termos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return secoes;
  return secoes.filter((secao) => {
    const texto = textoIndexavel(secao);
    return termos.every((termo) => texto.includes(termo));
  });
}

/** Subtítulos de um tópico, usados nos atalhos "Neste tópico". */
export function subtitulosDaSecao(secao: Secao): { id: string; titulo: string }[] {
  return secao.blocos.flatMap((b) => (b.tipo === "subtitulo" ? [{ id: b.id, titulo: b.titulo }] : []));
}
