import { useLocation, useNavigate } from "react-router-dom";
import { DOCUMENTOS_VALIDADOS_PELA_ONG, CANAL_TITULAR } from "../../domain/legal/organizacao";
import { DATA_VIGENCIA, DATA_VIGENCIA_EXTENSO, VERSAO_DOCUMENTOS } from "../../domain/legal/consentimento";
import type { LegalBlock, LegalDocument } from "./conteudo/tipos";
import { politicaPrivacidade } from "./conteudo/politicaPrivacidade";
import { termoPedidoAjuda } from "./conteudo/termoPedidoAjuda";
import { termoVoluntario } from "./conteudo/termoVoluntario";

function Bloco({ bloco }: { bloco: LegalBlock }) {
  if (bloco.tipo === "p") {
    return <p className="mb-4 leading-relaxed text-gray-900">{bloco.texto}</p>;
  }
  if (bloco.tipo === "ul") {
    return (
      <ul className="mb-4 list-disc space-y-2 pl-6 leading-relaxed text-gray-900">
        {bloco.itens.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <div className="mb-6 overflow-x-auto" tabIndex={0} role="region" aria-label={bloco.legenda}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm text-gray-900">
        <caption className="sr-only">{bloco.legenda}</caption>
        <thead>
          <tr className="bg-darkgreen text-white">
            {bloco.colunas.map((coluna) => (
              <th key={coluna} scope="col" className="border border-darkgreen px-3 py-2 font-bold">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bloco.linhas.map((linha, i) => (
            <tr key={i} className="odd:bg-white even:bg-cream align-top">
              {linha.map((celula, j) => (
                <td key={j} className="border border-gray-300 px-3 py-2">
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Estrutura comum dos documentos legais: título, versão, aviso de minuta, índice e seções com âncora. */
export function LegalDocumentPage({ documento }: { documento: LegalDocument }) {
  const navigate = useNavigate();
  const { key } = useLocation();
  // key "default" = primeira página da sessão (link direto): não há "anterior", então voltamos para o início.
  const voltar = () => (key === "default" ? navigate("/") : navigate(-1));

  return (
    <article className="mx-auto max-w-[900px] px-6 py-14 lg:py-20">
      <button
        type="button"
        onClick={voltar}
        className="mb-6 inline-flex min-h-[44px] items-center gap-2 rounded-md text-sm font-semibold text-darkgreen hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen"
      >
        <span aria-hidden="true">←</span> Voltar
      </button>
      <h1 className="font-fredoka text-3xl font-bold text-darkgreen md:text-5xl">{documento.titulo}</h1>
      <p className="mt-3 text-lg text-gray-800">{documento.resumo}</p>
      <p className="mt-2 text-sm text-gray-700">
        Versão {VERSAO_DOCUMENTOS} · Em vigor desde <time dateTime={DATA_VIGENCIA}>{DATA_VIGENCIA_EXTENSO}</time>
      </p>

      {!DOCUMENTOS_VALIDADOS_PELA_ONG && (
        <aside role="note" className="mt-6 border-l-4 border-orange bg-cream p-4 text-sm text-gray-900">
          <strong>Projeto acadêmico.</strong> Este documento ilustra a adequação à LGPD de um trabalho acadêmico
          (FIAP). Os dados da Turma do Bem são públicos e o texto não foi revisado por assessoria jurídica. Contato:
          {CANAL_TITULAR}.
        </aside>
      )}

      <nav aria-label="Índice do documento" className="my-8 rounded-lg border border-gray-300 p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-700">Neste documento</h2>
        <ol className="list-none space-y-1 p-0 text-sm">
          {documento.secoes.map((secao) => (
            <li key={secao.id}>
              <a href={`#${secao.id}`} className="text-[#7a3f0a] underline underline-offset-2 hover:text-darkgreen">
                {secao.titulo}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {documento.secoes.map((secao) => (
        <section key={secao.id} id={secao.id} aria-labelledby={`${secao.id}-titulo`} className="mb-10 scroll-mt-24">
          <h2 id={`${secao.id}-titulo`} className="mb-4 font-fredoka text-2xl font-bold text-darkgreen">
            {secao.titulo}
          </h2>
          {secao.blocos.map((bloco, i) => (
            <Bloco key={i} bloco={bloco} />
          ))}
        </section>
      ))}
    </article>
  );
}

export const PoliticaPrivacidadePage = () => <LegalDocumentPage documento={politicaPrivacidade} />;
export const TermoPedidoAjudaPage = () => <LegalDocumentPage documento={termoPedidoAjuda} />;
export const TermoVoluntarioPage = () => <LegalDocumentPage documento={termoVoluntario} />;
