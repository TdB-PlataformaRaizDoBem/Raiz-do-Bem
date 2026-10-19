/**
 * Títulos da aba do navegador das páginas que NÃO são públicas.
 *
 * As páginas públicas (Home, Sobre, FAQ…) têm o título e a descrição em `Routes.tsx`.
 * Aqui ficam a tela de login, o acesso negado, as páginas da área logada (`/admin` e `/coord`)
 * e as rotas que não existem. Assim a aba nunca fica com o nome da página anterior —
 * por exemplo, quem entra no login a partir de "Sobre" não continua com a aba "Sobre | Raiz do Bem".
 *
 * Cada página interna tem o seu próprio nome: quem tem várias abas abertas, ou usa leitor de tela,
 * identifica a página só pelo título (WCAG 2.4.2).
 */

export const NOME_DO_SITE = "Raiz do Bem";

/** Mesmo título e mesma descrição do `index.html`: valem até a primeira página carregar. */
export const TITULO_PADRAO = `${NOME_DO_SITE} | Plataforma da Turma do Bem`;
export const DESCRICAO_PADRAO =
  "Raiz do Bem é a plataforma da Turma do Bem que conecta dentistas voluntários a crianças, jovens e mulheres em vulnerabilidade social que precisam de tratamento odontológico gratuito.";

export const TITULO_NAO_ENCONTRADA = "Página Não Encontrada";

/** Páginas que existem para os dois perfis (`/admin/...` e `/coord/...`). */
const PAGINAS_COMUNS: Record<string, string> = {
  dashboard: "Dashboard",
  dentistas: "Gerenciar Dentistas",
  beneficiarios: "Gerenciar Beneficiários",
  solicitacoes: "Pedidos de Ajuda",
  atendimento: "Gerenciar Atendimentos",
  chat: "Conversas",
  ajuda: "Como Usar a Plataforma",
};

/** Exclusivas do administrador. O coordenador não tem essas rotas. */
const PAGINAS_DO_ADMIN: Record<string, string> = {
  colaboradores: "Gerenciar Colaboradores",
  mapa: "Mapa de Vulnerabilidade",
};

const PAGINAS: Record<"admin" | "coord", Record<string, string>> = {
  admin: { ...PAGINAS_COMUNS, ...PAGINAS_DO_ADMIN },
  coord: PAGINAS_COMUNS,
};

/** `/Admin/Dashboard/` → ["admin", "dashboard"]. As rotas do React Router não diferenciam maiúsculas nem a barra final. */
const partesDoCaminho = (pathname: string) =>
  pathname
    .split("/")
    .filter(Boolean)
    .map((parte) => parte.toLowerCase());

/**
 * Nome de uma página da área logada, igual ao título grande mostrado no topo dela.
 * Devolve `undefined` quando o caminho não é uma página que exista.
 */
export const tituloDaPaginaInterna = (pathname: string): string | undefined => {
  const [area, pagina, ...resto] = partesDoCaminho(pathname);
  if (area !== "admin" && area !== "coord") return undefined;

  // /admin/chat/5511999999999 — a conversa aberta. O telefone não vai para o título da aba.
  if (pagina === "chat" && resto.length === 1) return "Conversa";
  if (resto.length > 0) return undefined;

  // hasOwn: "/admin/constructor" não pode achar um método herdado do objeto.
  return Object.hasOwn(PAGINAS[area], pagina) ? PAGINAS[area][pagina] : undefined;
};

/** Título completo da aba (`Dashboard | Raiz do Bem`) para qualquer rota que não seja pública. */
export const tituloDaAba = (pathname: string): string => {
  const partes = partesDoCaminho(pathname).join("/");

  let nome: string;
  if (partes === "auth/login") nome = "Login";
  else if (partes === "403") nome = "Acesso Negado";
  else nome = tituloDaPaginaInterna(pathname) ?? TITULO_NAO_ENCONTRADA;

  return `${nome} | ${NOME_DO_SITE}`;
};
