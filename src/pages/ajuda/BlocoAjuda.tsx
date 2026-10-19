import { useCallback, useRef, useState } from "react";
import type { Bloco, Figura as FiguraDados } from "./ajudaData";
import { Lightbox } from "./Lightbox";
import { Texto } from "./texto";

/** Bolinha azul numerada. Tem a mesma cor dos números desenhados nas imagens. */
const Numero = ({ n }: { n: number }) => (
  <span
    aria-hidden="true"
    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1d4ed8] text-xs font-bold text-white"
  >
    {n}
  </span>
);

const Figura = ({ figura }: { figura: FiguraDados }) => {
  const [ampliada, setAmpliada] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const fechar = useCallback(() => {
    setAmpliada(false);
    botao.current?.focus();
  }, []);

  // Imagens estreitas (celular, recortes) não devem ser esticadas até a largura da página.
  const limiteLargura = figura.largura < 900 ? figura.largura : undefined;

  return (
    <figure className="my-6 w-full print:break-inside-avoid" style={{ maxWidth: limiteLargura }}>
      <button
        ref={botao}
        type="button"
        onClick={() => setAmpliada(true)}
        className="block w-full cursor-zoom-in overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
      >
        <img
          src={figura.src}
          alt={figura.alt}
          width={figura.largura}
          height={figura.altura}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
        <span className="sr-only">Clique para ampliar a imagem.</span>
      </button>

      <figcaption className="mt-3">
        <p className="text-sm font-semibold text-black">
          Figura {figura.numero} — {figura.legenda}
        </p>
        {figura.marcas && figura.marcas.length > 0 && (
          <ol className="mt-2 space-y-2">
            {figura.marcas.map((marca, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700">
                <Numero n={i + 1} />
                <span>
                  <Texto>{marca}</Texto>
                </span>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-2 text-xs text-gray print:hidden" aria-hidden="true">
          Clique ou toque na imagem para ampliar.
        </p>
      </figcaption>

      {ampliada && <Lightbox src={figura.src} alt={figura.alt} largura={figura.largura} onClose={fechar} />}
    </figure>
  );
};

const Chamada = ({
  rotulo,
  texto,
  className,
}: {
  rotulo: string;
  texto: string;
  className: string;
}) => (
  <div role="note" aria-label={rotulo} className={`my-5 rounded-xl border-l-4 px-4 py-3 text-sm leading-relaxed text-gray-800 ${className}`}>
    <p>
      <strong className="font-bold text-black">{rotulo}: </strong>
      <Texto>{texto}</Texto>
    </p>
  </div>
);

/** Desenha um pedaço do guia (parágrafo, passos, imagem, tabela…) conforme o seu tipo. */
export const BlocoAjuda = ({ bloco }: { bloco: Bloco }) => {
  switch (bloco.tipo) {
    case "texto":
      return (
        <p className="my-3 text-base leading-relaxed text-gray-700">
          <Texto>{bloco.texto}</Texto>
        </p>
      );

    case "subtitulo":
      return (
        <h3 id={bloco.id} className="mt-8 mb-2 scroll-mt-6 font-fredoka text-xl font-bold text-darkgreen">
          {bloco.titulo}
        </h3>
      );

    case "passos":
      return (
        <div className="my-4">
          {bloco.titulo && <p className="mb-2 font-semibold text-black">{bloco.titulo}</p>}
          <ol className="space-y-3">
            {bloco.itens.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-base leading-relaxed text-gray-700">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-darkgreen text-sm font-bold text-white"
                >
                  {i + 1}
                </span>
                <span>
                  <Texto>{item}</Texto>
                </span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "lista":
      return (
        <div className="my-4">
          {bloco.titulo && <p className="mb-2 font-semibold text-black">{bloco.titulo}</p>}
          <ul className="space-y-2">
            {bloco.itens.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-base leading-relaxed text-gray-700">
                <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-lightgreen" />
                <span>
                  <Texto>{item}</Texto>
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "figura":
      return <Figura figura={bloco.figura} />;

    case "figuras":
      return (
        <div className="grid items-start gap-x-8 sm:grid-cols-2">
          {bloco.figuras.map((f) => (
            <Figura key={f.numero} figura={f} />
          ))}
        </div>
      );

    case "dica":
      return <Chamada rotulo="Dica" texto={bloco.texto} className="border-lightgreen bg-lightgreen/10" />;

    case "atencao":
      return <Chamada rotulo="Atenção" texto={bloco.texto} className="border-orange bg-cream/60" />;

    case "tabela": {
      // No celular a tabela vira uma lista: cada linha é um bloco e, quando há mais de duas colunas, o nome da coluna aparece antes do valor.
      const rotular = bloco.colunas.length > 2;
      return (
        <div className="my-5 overflow-x-auto rounded-xl border border-gray-200">
          <table role="table" className="w-full text-left text-sm max-sm:block">
            <caption className="sr-only">{bloco.legenda}</caption>
            <thead role="rowgroup" className="bg-cream/60 max-sm:sr-only">
              <tr role="row">
                {bloco.colunas.map((coluna) => (
                  <th key={coluna} role="columnheader" scope="col" className="px-4 py-3 font-semibold text-black">
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody role="rowgroup" className="max-sm:block">
              {bloco.linhas.map((linha, i) => (
                <tr
                  key={i}
                  role="row"
                  className="border-t border-gray-100 align-top max-sm:block max-sm:px-4 max-sm:py-3 max-sm:first:border-t-0"
                >
                  {linha.map((celula, j) =>
                    j === 0 ? (
                      <th
                        key={j}
                        role="rowheader"
                        scope="row"
                        className="px-4 py-3 text-left font-normal text-gray-800 max-sm:block max-sm:p-0 max-sm:font-semibold"
                      >
                        <Texto>{celula}</Texto>
                      </th>
                    ) : (
                      <td
                        key={j}
                        role="cell"
                        data-rotulo={rotular ? `${bloco.colunas[j]}: ` : undefined}
                        className="px-4 py-3 text-gray-700 max-sm:block max-sm:p-0 max-sm:pt-1 max-sm:before:font-semibold max-sm:before:text-black max-sm:before:content-[attr(data-rotulo)]"
                      >
                        <Texto>{celula}</Texto>
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "fluxo":
      return (
        <div className="my-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 font-semibold text-black">{bloco.titulo}</p>
          <ol className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {bloco.etapas.map((etapa, i) => (
              <li key={etapa.titulo} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange text-sm font-bold text-black"
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-snug text-gray-700">
                  <strong className="block font-semibold text-black">{etapa.titulo}</strong>
                  {etapa.texto}
                </span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "perguntas":
      return (
        <div className="my-4 space-y-3">
          {bloco.itens.map((item) => (
            <details key={item.pergunta} className="group rounded-xl border border-gray-200 bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-4 py-3 font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange [&::-webkit-details-marker]:hidden">
                <span>{item.pergunta}</span>
                <span aria-hidden="true" className="text-xl leading-none text-darkgreen transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-base leading-relaxed text-gray-700">
                <Texto>{item.resposta}</Texto>
              </p>
            </details>
          ))}
        </div>
      );

    case "definicoes":
      return (
        <dl className="my-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {bloco.itens.map((item) => (
            <div key={item.termo}>
              <dt className="font-semibold text-darkgreen">{item.termo}</dt>
              <dd className="mt-0.5 text-base leading-relaxed text-gray-700">{item.significado}</dd>
            </div>
          ))}
        </dl>
      );
  }
};
