import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ATALHOS, INTRODUCAO, SECOES, type Secao } from "./ajudaData";
import { BlocoAjuda } from "./BlocoAjuda";
import { filtrarSecoes, subtitulosDaSecao } from "./busca";

const ETIQUETA_ADMIN = "Somente administradores";

const Ajuda = () => {
  const { user } = useAuth();
  const ehAdmin = user?.role === "ADMIN";
  const { hash } = useLocation();

  const [consulta, setConsulta] = useState("");
  const [indiceAberto, setIndiceAberto] = useState(false);
  const [ativo, setAtivo] = useState<string>(SECOES[0].id);

  const permitidas = useMemo(() => SECOES.filter((s) => s.perfil === "todos" || ehAdmin), [ehAdmin]);
  const secoes = useMemo(() => filtrarSecoes(permitidas, consulta), [permitidas, consulta]);
  const atalhos = useMemo(() => ATALHOS.filter((a) => a.perfil === "todos" || ehAdmin), [ehAdmin]);
  const buscando = consulta.trim() !== "";

  // Abre direto no tópico quando o endereço traz um "#tópico" (a página carrega depois do navegador procurar a âncora).
  useEffect(() => {
    if (!hash) return;
    let id = hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // Endereço com símbolos mal formados: procura o id do jeito que veio.
    }
    document.getElementById(id)?.scrollIntoView?.();
  }, [hash]);

  // Destaca no índice o tópico que está na tela.
  const chaveIds = secoes.map((s) => s.id).join("|");
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || chaveIds === "") return;
    const ids = chaveIds.split("|");
    const naTela = new Set<string>();
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => (e.isIntersecting ? naTela.add(e.target.id) : naTela.delete(e.target.id)));
        const primeiro = ids.find((id) => naTela.has(id));
        if (primeiro) {
          setAtivo(primeiro);
        } else if ((document.getElementById(ids[0])?.getBoundingClientRect().top ?? 0) > 0) {
          // Voltou para o começo da página, antes do primeiro tópico.
          setAtivo(ids[0]);
        }
      },
      { rootMargin: "-10% 0px -60% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observador.observe(el);
    });
    return () => observador.disconnect();
  }, [chaveIds]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Boas-vindas e busca */}
      <section
        aria-labelledby="ajuda-boas-vindas"
        className="mb-8 rounded-2xl border border-cream bg-cream/40 p-5 md:p-7 print:border-0 print:bg-transparent print:p-0"
      >
        <h2 id="ajuda-boas-vindas" className="font-fredoka text-2xl font-bold text-black lg:text-3xl">
          Bem-vindo(a) à plataforma Raiz do Bem
        </h2>
        <p className="mt-3 max-w-4xl text-base leading-relaxed text-gray-700">{INTRODUCAO.boasVindas}</p>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-gray-700">{INTRODUCAO.comoLerImagens}</p>

        <div role="search" className="mt-5 max-w-2xl print:hidden">
          <label htmlFor="ajuda-busca" className="mb-1.5 block text-sm font-semibold text-black">
            Procurar um assunto
          </label>
          <div className="flex gap-2">
            <input
              id="ajuda-busca"
              type="search"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              placeholder="Ex.: aprovar pedido, senha, conversa, mapa"
              autoComplete="off"
              aria-describedby="ajuda-busca-status"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-black placeholder:text-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            />
            {buscando && (
              <button
                type="button"
                onClick={() => setConsulta("")}
                className="shrink-0 rounded-xl bg-darkgreen px-4 py-3 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
              >
                Limpar
              </button>
            )}
          </div>
          <p id="ajuda-busca-status" role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-gray">
            {buscando &&
              (secoes.length === 0
                ? "Nenhum tópico encontrado."
                : `${secoes.length} ${secoes.length === 1 ? "tópico encontrado" : "tópicos encontrados"}.`)}
          </p>
        </div>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-12">
        {/* Índice */}
        <div id="indice" className="scroll-mt-6 lg:sticky lg:top-6 print:hidden">
          <button
            type="button"
            onClick={() => setIndiceAberto((a) => !a)}
            aria-expanded={indiceAberto}
            aria-controls="ajuda-indice"
            className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-left font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange lg:hidden"
          >
            Índice do guia
            <span aria-hidden="true" className="text-xl leading-none text-darkgreen">
              {indiceAberto ? "−" : "+"}
            </span>
          </button>

          <nav
            id="ajuda-indice"
            aria-label="Índice do guia"
            className={`${indiceAberto ? "block" : "hidden"} mt-2 rounded-xl border border-gray-200 bg-white p-3 lg:mt-0 lg:block lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto`}
          >
            <p className="hidden px-2 pb-2 text-xs font-bold uppercase tracking-widest text-gray lg:block">Neste guia</p>
            {secoes.length === 0 ? (
              <p className="px-2 py-2 text-sm text-gray">Nenhum tópico corresponde à busca.</p>
            ) : (
              <ol className="space-y-0.5">
                {secoes.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setIndiceAberto(false)}
                      aria-current={ativo === s.id ? "location" : undefined}
                      className={`block rounded-lg px-3 py-2 text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
                        ativo === s.id
                          ? "bg-orange/10 font-semibold text-black"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {s.titulo}
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </nav>
        </div>

        {/* Conteúdo */}
        <div className="min-w-0 space-y-10">
          {!buscando && (
            <section aria-labelledby="ajuda-atalhos" className="print:hidden">
              <h2 id="ajuda-atalhos" className="font-fredoka text-2xl font-bold text-black">
                O que você quer fazer?
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {atalhos.map((a) => (
                  <li key={a.destino}>
                    <a
                      href={`#${a.destino}`}
                      className="block h-full rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-orange hover:bg-orange/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                    >
                      <span className="block font-semibold text-black">{a.titulo}</span>
                      <span className="mt-1 block text-sm leading-snug text-gray">{a.descricao}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {secoes.length === 0 && (
            <div role="status" className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
              <p className="text-base text-gray-700">
                Não encontramos nenhum tópico com <strong className="text-black">“{consulta.trim()}”</strong>. Tente uma palavra
                mais simples, como <em>pedido</em>, <em>senha</em> ou <em>conversa</em>.
              </p>
              <button
                type="button"
                onClick={() => setConsulta("")}
                className="mt-4 rounded-xl bg-darkgreen px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
              >
                Ver todos os tópicos
              </button>
            </div>
          )}

          {secoes.map((s) => (
            <SecaoGuia key={s.id} secao={s} onVoltarAoIndice={() => setIndiceAberto(true)} />
          ))}
        </div>
      </div>
    </div>
  );
};

const SecaoGuia = ({ secao, onVoltarAoIndice }: { secao: Secao; onVoltarAoIndice: () => void }) => {
  const subtitulos = subtitulosDaSecao(secao);
  return (
    <section
      id={secao.id}
      aria-labelledby={`${secao.id}-titulo`}
      className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-8 print:break-before-auto print:border-0 print:p-0 print:shadow-none"
    >
      <header>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 id={`${secao.id}-titulo`} className="font-fredoka text-2xl font-bold text-black lg:text-3xl">
            {secao.titulo}
          </h2>
          {secao.perfil === "admin" && (
            <span className="rounded-full border border-amber bg-cream px-3 py-1 text-xs font-bold text-black">
              {ETIQUETA_ADMIN}
            </span>
          )}
        </div>
        <p className="mt-2 text-base text-gray">{secao.resumo}</p>

        {subtitulos.length > 1 && (
          <div className="mt-4 print:hidden">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray">Neste tópico</p>
            <ul className="flex flex-wrap gap-2">
              {subtitulos.map((sub) => (
                <li key={sub.id}>
                  <a
                    href={`#${sub.id}`}
                    className="inline-block rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 transition-colors hover:border-orange hover:bg-orange/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                  >
                    {sub.titulo}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <div className="mt-2">
        {secao.blocos.map((bloco, i) => (
          <BlocoAjuda key={i} bloco={bloco} />
        ))}
      </div>

      <a
        href="#indice"
        onClick={onVoltarAoIndice}
        className="mt-6 inline-block text-sm font-semibold text-darkgreen underline underline-offset-4 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange lg:hidden print:hidden"
      >
        ↑ Voltar ao índice
      </a>
    </section>
  );
};

export default Ajuda;
