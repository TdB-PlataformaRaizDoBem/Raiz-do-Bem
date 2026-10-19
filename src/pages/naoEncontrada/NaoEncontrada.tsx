import { Link } from "react-router-dom";

const botao =
  "inline-flex items-center justify-center rounded-xl bg-darkgreen px-6 py-3 font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2";

/**
 * Endereço público que não existe (ex.: digitado errado). Aparece dentro do layout público,
 * com o cabeçalho e o rodapé do site, em vez de uma tela em branco.
 */
const NaoEncontrada = () => (
  <section aria-labelledby="nao-encontrada-titulo" className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
    <span aria-hidden="true" className="mb-2 font-fredoka text-7xl font-bold text-orange">
      404
    </span>
    <h1 id="nao-encontrada-titulo" className="mb-3 font-fredoka text-3xl font-bold text-black">
      Página não encontrada
    </h1>
    <p className="mb-8 max-w-md text-gray">
      O endereço que você abriu não existe ou a página mudou de lugar. Confira se ele foi digitado corretamente ou volte para o início.
    </p>
    <Link to="/" className={botao}>
      Ir para o início
    </Link>
  </section>
);

export default NaoEncontrada;

/**
 * Endereço que não existe dentro da área logada. O título da página ("Página Não Encontrada")
 * já aparece no topo; aqui fica o aviso e o caminho de volta.
 */
export const PaginaInternaNaoEncontrada = ({ voltarPara }: { voltarPara: string }) => (
  <section aria-label="Aviso" className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <p className="mb-5 text-base leading-relaxed text-gray-700">
      Não encontramos esta página. O endereço pode ter sido digitado errado ou a página mudou de lugar. Use o menu ao lado ou volte para o Dashboard.
    </p>
    <Link to={voltarPara} className={botao}>
      Voltar ao Dashboard
    </Link>
  </section>
);
