/**
 * Conteúdo da página "Como usar a plataforma".
 *
 * Tudo o que aparece no guia está aqui, em dados simples: para mudar um texto, trocar uma imagem
 * ou incluir um tópico novo não é preciso mexer no desenho da página (Ajuda.tsx).
 *
 * Convenções:
 * - `**texto**` vira negrito. Usamos para o nome exato de botões e campos como aparecem na tela.
 * - As imagens ficam em `src/assets/ajuda/` e têm números azuis desenhados sobre elas;
 *   a lista `marcas` de cada figura segue a mesma numeração.
 * - Escreva sem termos técnicos: "janela", "lista de opções", "botão" — nunca "modal" ou "dropdown".
 */
import imgLogin from "../../assets/ajuda/01-login.webp";
import imgVisaoGeral from "../../assets/ajuda/02-visao-geral.webp";
import imgMenuRecolhido from "../../assets/ajuda/02b-menu-recolhido.webp";
import imgPainel from "../../assets/ajuda/03-painel-geral.webp";
import imgPedidosLista from "../../assets/ajuda/04-pedidos-lista.webp";
import imgPedidosFiltros from "../../assets/ajuda/05-pedidos-filtros.webp";
import imgPedidoDetalhe from "../../assets/ajuda/06-pedido-detalhe.webp";
import imgPedidoAprovar from "../../assets/ajuda/07-pedido-aprovar.webp";
import imgBenefLista from "../../assets/ajuda/09-beneficiarios-lista.webp";
import imgBenefNovo from "../../assets/ajuda/10-beneficiario-novo.webp";
import imgBenefDetalhe from "../../assets/ajuda/11-beneficiario-detalhe.webp";
import imgBenefEditar from "../../assets/ajuda/12-beneficiario-editar.webp";
import imgDentistasLista from "../../assets/ajuda/13-dentistas-lista.webp";
import imgDentistaPerfil from "../../assets/ajuda/14-dentista-perfil.webp";
import imgDentistaCadastro from "../../assets/ajuda/15-dentista-cadastro.webp";
import imgAtendPendentes from "../../assets/ajuda/16-atendimento-pendentes.webp";
import imgAtendDesignar from "../../assets/ajuda/17-atendimento-designar.webp";
import imgAtendConfirmar from "../../assets/ajuda/18-atendimento-confirmar.webp";
import imgAtendAndamento from "../../assets/ajuda/19-atendimento-andamento.webp";
import imgAtendEncerrar from "../../assets/ajuda/20-atendimento-encerrar.webp";
import imgConversasLista from "../../assets/ajuda/22-conversas-lista.webp";
import imgConversasChat from "../../assets/ajuda/23-conversas-chat.webp";
import imgConversasResumo from "../../assets/ajuda/24-conversas-resumo.webp";
import imgColabLista from "../../assets/ajuda/25-colaboradores-lista.webp";
import imgColabNovo from "../../assets/ajuda/26-colaborador-novo.webp";
import imgMapa from "../../assets/ajuda/27-mapa-filtros-abertos.webp";
import imgMapaSimulador from "../../assets/ajuda/29-mapa-simulador.webp";
import imgMapaResultado from "../../assets/ajuda/30-mapa-resultado.webp";
import imgCelularInicio from "../../assets/ajuda/40-mobile-inicio.webp";
import imgCelularMenu from "../../assets/ajuda/41-mobile-menu.webp";
import imgColaborador from "../../assets/ajuda/42-coordenador.webp";

export interface Figura {
  /** Número exibido na legenda ("Figura 7"). Atribuído automaticamente, na ordem do guia. */
  numero: number;
  src: string;
  /** Tamanho real do arquivo — evita o "pulo" da página enquanto a imagem carrega. */
  largura: number;
  altura: number;
  /** Descrição para quem não enxerga a imagem (leitores de tela). */
  alt: string;
  /** Frase curta que identifica a imagem. */
  legenda: string;
  /** Explicação de cada número azul desenhado na imagem, na ordem. */
  marcas?: string[];
}

export interface Pergunta {
  pergunta: string;
  resposta: string;
}

export interface Definicao {
  termo: string;
  significado: string;
}

export interface EtapaFluxo {
  titulo: string;
  texto: string;
}

export type Bloco =
  | { tipo: "texto"; texto: string }
  | { tipo: "subtitulo"; id: string; titulo: string }
  | { tipo: "passos"; titulo?: string; itens: string[] }
  | { tipo: "lista"; titulo?: string; itens: string[] }
  | { tipo: "figura"; figura: Figura }
  | { tipo: "figuras"; figuras: Figura[] }
  | { tipo: "dica"; texto: string }
  | { tipo: "atencao"; texto: string }
  | { tipo: "tabela"; legenda: string; colunas: string[]; linhas: string[][] }
  | { tipo: "fluxo"; titulo: string; etapas: EtapaFluxo[] }
  | { tipo: "perguntas"; itens: Pergunta[] }
  | { tipo: "definicoes"; itens: Definicao[] };

export interface Secao {
  id: string;
  titulo: string;
  /** Uma frase que diz para que serve o tópico (aparece no índice de busca e abaixo do título). */
  resumo: string;
  /** Administradores veem tudo; colaboradores só os tópicos marcados como "todos". */
  perfil: "todos" | "admin";
  /** Palavras que as pessoas costumam procurar e que não estão no título (para a busca). */
  palavras: string[];
  blocos: Bloco[];
}

export interface Atalho {
  titulo: string;
  descricao: string;
  /** `id` de uma seção ou de um subtítulo. */
  destino: string;
  perfil: "todos" | "admin";
}

let contadorFiguras = 0;
const fig = (
  src: string,
  largura: number,
  altura: number,
  alt: string,
  legenda: string,
  marcas?: string[],
): Figura => ({ numero: ++contadorFiguras, src, largura, altura, alt, legenda, marcas });

export const INTRODUCAO = {
  boasVindas:
    "Este guia mostra, passo a passo, como usar a plataforma Raiz do Bem no dia a dia. Você não precisa ler tudo de uma vez: use a busca, os atalhos ou o índice para ir direto ao assunto de que precisa.",
  comoLerImagens:
    "As imagens usam pessoas e dados de exemplo, que não são reais. Os números azuis desenhados nas imagens correspondem à lista numerada logo abaixo delas. Clique em uma imagem para vê-la maior.",
};

export const FLUXO_PEDIDO: EtapaFluxo[] = [
  { titulo: "Pedido de ajuda", texto: "A família ou o solicitante envia o pedido através do site." },
  { titulo: "Em análise", texto: "A equipe entra em contato e encaminha o caso para o mutirão mais próximo ou para uma consulta odontológica online." },
  { titulo: "Avaliação técnica", texto: "Após a avaliação técnica do profissional de saúde, o colaborador aprova ou encerra o pedido no sistema." },
  { titulo: "Beneficiário", texto: "O solicitante aprovado é oficialmente cadastrado como beneficiário do projeto." },
  { titulo: "Dentista indicado", texto: "Um dentista voluntário é designado para o atendimento." },
  { titulo: "Em atendimento", texto: "O tratamento é iniciado e acompanhado pela equipe." },
  { titulo: "Concluído", texto: "O atendimento é finalizado com o registro de encerramento (por maioridade ou conclusão do caso)." },
];


export const ATALHOS: Atalho[] = [
  { titulo: "Entrar na plataforma", descricao: "E-mail, senha e como sair com segurança.", destino: "primeiros-passos", perfil: "todos" },
  { titulo: "Aprovar ou recusar um pedido de ajuda", descricao: "Analise o pedido e escolha o dentista responsável.", destino: "pedidos-aprovar", perfil: "todos" },
  { titulo: "Cadastrar um beneficiário", descricao: "Transforme um pedido aprovado em cadastro.", destino: "beneficiarios-cadastrar", perfil: "todos" },
  { titulo: "Cadastrar um dentista", descricao: "Inclua um novo dentista voluntário.", destino: "dentistas-cadastrar", perfil: "todos" },
  { titulo: "Indicar um dentista para atender", descricao: "Passo a passo da designação.", destino: "atendimentos-designar", perfil: "todos" },
  { titulo: "Encerrar um atendimento", descricao: "Registre o resultado e conclua o caso.", destino: "atendimentos-encerrar", perfil: "todos" },
  { titulo: "Responder uma conversa", descricao: "Leia e envie mensagens para beneficiários e dentistas.", destino: "conversas", perfil: "todos" },
  { titulo: "Cadastrar um colaborador", descricao: "Dê acesso à plataforma para alguém da equipe.", destino: "colaboradores-cadastrar", perfil: "admin" },
  { titulo: "Ver onde a ajuda é mais necessária", descricao: "Mapa do país e simulador de mutirão.", destino: "mapa", perfil: "admin" },
  { titulo: "Tirar uma dúvida", descricao: "Perguntas que mais aparecem no dia a dia.", destino: "perguntas-frequentes", perfil: "todos" },
];

export const SECOES: Secao[] = [
  /* ------------------------------------------------------------------ */
  {
    id: "primeiros-passos",
    titulo: "Primeiros passos: entrar e sair",
    resumo: "Como acessar a plataforma e como sair dela com segurança.",
    perfil: "todos",
    palavras: ["login", "acessar", "senha", "e-mail", "email", "entrar", "sair", "logout", "esqueci"],
    blocos: [
      { tipo: "subtitulo", id: "primeiros-passos-entrar", titulo: "Entrar na plataforma" },
      {
        tipo: "passos",
        itens: [
          "Abra a página de entrada da plataforma. A coordenação informa o endereço quando você começa.",
          "Digite o seu **E-mail** e a sua **Senha**. Quem criou o seu acesso (um administrador) informa os dois.",
          "Se quiser conferir o que digitou na senha, clique no ícone de olho no final do campo.",
          "Clique em **Entrar no Sistema**. Você será levado ao Painel Geral.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgLogin, 800, 780,
          "Tela de entrada com os campos E-mail e Senha e o botão laranja Entrar no Sistema.",
          "Tela de entrada",
          ["Campo **E-mail**.", "Campo **Senha**, com o ícone de olho para mostrar ou esconder o que foi digitado.", "Botão **Entrar no Sistema**."],
        ),
      },
      {
        tipo: "dica",
        texto: "O botão vermelho **Voltar ao Início** leva você de volta ao site público. Ele não desfaz nada, é só um caminho de volta.",
      },
      { tipo: "subtitulo", id: "primeiros-passos-sair", titulo: "Sair da plataforma" },
      {
        tipo: "texto",
        texto: "Quando terminar, clique em **Sair da Conta**, o último botão do menu à esquerda. Faça isso sempre que usar um computador que não é só seu.",
      },
      {
        tipo: "atencao",
        texto: "Se a plataforma não aceitar o seu e-mail ou a sua senha, confira se não há espaço sobrando ou letra trocada. Se continuar sem entrar, peça a um administrador para conferir o seu cadastro.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "conhecendo-a-tela",
    titulo: "Conhecendo a tela e o menu",
    resumo: "Para que serve cada botão do menu e o que muda para cada tipo de acesso.",
    perfil: "todos",
    palavras: ["menu", "navegação", "barra lateral", "celular", "perfil", "administrador", "colaborador", "coordenador", "permissão", "acesso"],
    blocos: [
      {
        tipo: "texto",
        texto: "O **menu fica sempre à esquerda**. A página em que você está aparece destacada em laranja. No alto da página, o título confirma onde você está.",
      },
      {
        tipo: "figura",
        figura: fig(
          imgVisaoGeral, 1600, 1000,
          "Painel Geral com o menu lateral à esquerda: seu nome no alto, a lista de áreas e, no rodapé, Como usar a plataforma e Sair da Conta.",
          "Menu lateral e partes principais da tela",
          [
            "Seu nome e seu e-mail, para você conferir com qual acesso entrou.",
            "As áreas da plataforma. Clique em uma delas para abri-la.",
            "Botão para **recolher** o menu e ganhar espaço na tela.",
            "**Como usar a plataforma**: este guia.",
            "**Sair da Conta**.",
            "Título da página em que você está.",
          ],
        ),
      },
      { tipo: "subtitulo", id: "menu-itens", titulo: "O que cada item do menu faz" },
      {
        tipo: "tabela",
        legenda: "Itens do menu e para que servem",
        colunas: ["Item do menu", "Para que serve"],
        linhas: [
          ["**Painel Geral**", "Resumo com números e gráficos do projeto. Só para consultar."],
          ["**Colaboradores** (só administradores)", "Cadastro das pessoas da equipe que usam a plataforma."],
          ["**Conversas**", "Troca de mensagens com beneficiários e dentistas. O número verde no ícone mostra quantas conversas têm mensagem nova."],
          ["**Dentistas**", "Lista e cadastro dos dentistas voluntários."],
          ["**Beneficiários**", "Lista e cadastro das pessoas que recebem o atendimento."],
          ["**Pedidos de Ajuda**", "Pedidos enviados pelas famílias pelo site, aguardando análise."],
          ["**Atendimento**", "Indicar um dentista para cada pessoa e acompanhar o tratamento até o fim."],
          ["**Mapa de Vulnerabilidade** (só administradores)", "Mapa do país com as regiões onde a ajuda é mais necessária."],
        ],
      },
      { tipo: "subtitulo", id: "menu-recolher", titulo: "Recolher o menu" },
      {
        tipo: "texto",
        texto: "Clique na seta ao lado do seu nome para deixar o menu só com os ícones, que seguem a mesma ordem do menu completo. Clique de novo na seta para voltar ao menu com os nomes.",
      },
      {
        tipo: "figura",
        figura: fig(
          imgMenuRecolhido, 420, 1000,
          "Menu lateral recolhido, mostrando só os ícones das áreas.",
          "Menu recolhido: apenas os ícones",
        ),
      },
      { tipo: "subtitulo", id: "menu-celular", titulo: "Usando no celular" },
      {
        tipo: "texto",
        texto: "No celular, o menu fica numa barra na parte de baixo da tela, com os atalhos mais usados. Toque no **botão verde do meio** (três riscos) para abrir o menu completo. Para ver todos os itens, role a lista para baixo.",
      },
      {
        tipo: "figuras",
        figuras: [
          fig(imgCelularInicio, 390, 844, "Painel Geral no celular, com a barra de atalhos na parte de baixo e o botão verde de menu no centro.", "Barra de atalhos no celular"),
          fig(
            imgCelularMenu, 390, 1180,
            "Menu completo aberto no celular, com todas as áreas em lista e, no final, Como usar a plataforma e Sair da Conta.",
            "Menu completo no celular",
            ["**Como usar a plataforma**, logo acima de **Sair da Conta**."],
          ),
        ],
      },
      { tipo: "subtitulo", id: "menu-perfis", titulo: "Administrador ou colaborador: o que muda" },
      {
        tipo: "texto",
        texto: "Existem dois tipos de acesso. O seu depende do que o administrador escolheu quando criou o seu cadastro. Quem tem acesso de **colaborador** (chamado de coordenador na plataforma) usa um menu mais enxuto.",
      },
      {
        tipo: "tabela",
        legenda: "Diferenças entre administrador e colaborador",
        colunas: ["O que você pode fazer", "Administrador", "Colaborador"],
        linhas: [
          ["Ver o Painel Geral, Pedidos de Ajuda, Conversas, Beneficiários, Dentistas e Atendimento", "Sim", "Sim"],
          ["Aprovar pedidos, cadastrar e editar beneficiários e dentistas, designar e encerrar atendimentos", "Sim", "Sim"],
          ["Baixar listas em planilha (**Exportar CSV**)", "Sim", "Não"],
          ["Excluir cadastros (botão **Deletar**)", "Sim", "Não"],
          ["Cadastrar e consultar a equipe (**Colaboradores**)", "Sim", "Não"],
          ["Usar o **Mapa de Vulnerabilidade**", "Sim", "Não"],
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgColaborador, 1600, 1000,
          "Painel Geral visto por um colaborador: o menu tem seis itens, sem Colaboradores e sem Mapa de Vulnerabilidade.",
          "Menu de quem tem acesso de colaborador",
          ["Menu com seis áreas.", "**Como usar a plataforma**, também disponível para quem é colaborador."],
        ),
      },
      {
        tipo: "dica",
        texto: "Não está vendo um item que um colega vê? Provavelmente é só uma diferença de acesso. Se achar que o seu acesso deveria ser maior, fale com um administrador.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "painel-geral",
    titulo: "Painel Geral",
    resumo: "Uma fotografia do projeto hoje, com números, gráficos e os pedidos que esperam há mais tempo.",
    perfil: "todos",
    palavras: ["dashboard", "painel", "gráfico", "números", "resumo", "indicadores", "ranking", "estado", "pedidos críticos", "voluntariado"],
    blocos: [
      {
        tipo: "texto",
        texto: "É a primeira tela depois de entrar. Ela serve só para **consultar**: não há nada para preencher aqui. Os números mostram o que está cadastrado no momento em que você abre a página.",
      },
      {
        tipo: "figura",
        figura: fig(
          imgPainel, 1600, 1780,
          "Painel Geral com quatro cartões de resumo no alto, três gráficos no meio e a lista dos pedidos sem resposta há mais tempo no final.",
          "Painel Geral completo",
          [
            "**Resumo de impacto**: quatro números em destaque (explicados abaixo).",
            "**Gráficos de desempenho**: a divisão dos beneficiários por programa, a situação dos pedidos e o ranking por estado.",
            "**Pedidos críticos**: os pedidos de ajuda que estão sem resposta há mais tempo.",
          ],
        ),
      },
      {
        tipo: "tabela",
        legenda: "O que cada número do Painel Geral significa",
        colunas: ["Onde aparece", "O que mostra"],
        linhas: [
          ["**Total Beneficiários**", "Quantas pessoas já estão cadastradas como beneficiárias."],
          ["**Pedidos de Ajuda**", "Quantos pedidos esperam a primeira análise (triagem)."],
          ["**Voluntários**", "Quantos dentistas estão disponíveis."],
          ["**Horas de Voluntariado**", "Estimativa das horas de serviço oferecidas pelos voluntários."],
          ["**Proporção de beneficiários**", "Como os beneficiários se dividem entre os programas Turma do Bem e Apolônias."],
          ["**Status dos pedidos**", "Quantos pedidos estão aprovados, pendentes e negados."],
          ["**Ranking por Estado**", "Os cinco estados com mais beneficiários."],
          ["**Pedidos de ajuda sem resposta há mais tempo**", "Os dez pedidos mais antigos que ainda não foram respondidos."],
        ],
      },
      {
        tipo: "dica",
        texto: "Comece o dia pelo final do Painel Geral: os pedidos mais antigos sem resposta são os que mais precisam da sua atenção.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "pedidos-de-ajuda",
    titulo: "Pedidos de Ajuda",
    resumo: "Onde chegam os pedidos das famílias e onde você decide se eles seguem adiante.",
    perfil: "todos",
    palavras: ["pedido", "solicitação", "solicitacao", "protocolo", "aprovar", "suspender", "negar", "triagem", "analisar", "imprimir", "relatório", "status", "pendente"],
    blocos: [
      {
        tipo: "texto",
        texto: "Cada pedido recebido pelo site vira um cartão com um **número de protocolo** e uma situação: **Pendente** (esperando análise), **Aprovado** ou **Negado**. O seu trabalho aqui é analisar cada pedido pendente e decidir.",
      },
      {
        tipo: "fluxo",
        titulo: "O caminho de um pedido até o fim do tratamento",
        etapas: FLUXO_PEDIDO,
      },
      { tipo: "subtitulo", id: "pedidos-encontrar", titulo: "Encontrar um pedido" },
      {
        tipo: "figura",
        figura: fig(
          imgPedidosLista, 1600, 1000,
          "Lista de pedidos de ajuda em cartões, com campo de busca, botão Filtros e, em cada cartão, o nome, o protocolo, a situação e o botão Analisar Pedido.",
          "Lista de pedidos de ajuda",
          [
            "Campo de **busca**: digite o nome da pessoa para achar o pedido.",
            "Botão **Filtros**: escolha ver só uma situação ou só um dentista.",
            "Troca entre ver os pedidos em **cartões** ou em **tabela** (lista com uma linha por pedido).",
            "**Situação** do pedido. Amarelo é pendente, verde é aprovado e vermelho é negado.",
            "**Analisar Pedido**: abre todos os detalhes.",
          ],
        ),
      },
      {
        tipo: "figura",
        figura: fig(
          imgPedidosFiltros, 760, 300,
          "Menu de filtros aberto, com duas listas de opções: Status e Dentista.",
          "Filtros por situação e por dentista",
        ),
      },
      { tipo: "subtitulo", id: "pedidos-analisar", titulo: "Analisar um pedido" },
      {
        tipo: "passos",
        itens: [
          "Clique em **Analisar Pedido** no cartão da pessoa.",
          "Leia as informações: situação, data do envio, CPF, data de nascimento, a descrição do problema, os contatos, o endereço e o dentista responsável (se já houver).",
          "Se precisar falar com a família, clique em **Abrir chat de atendimento**, no quadro do telefone. A conversa abre na área de Conversas.",
          "Para guardar ou imprimir o pedido, clique em **Imprimir Relatório**. Na janela de impressão você também pode escolher salvar como PDF.",
          "Quando terminar, clique em **Fechar**.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgPedidoDetalhe, 1600, 1000,
          "Janela com os detalhes do pedido de Ana Clara Ferreira e, na parte de baixo, os botões Aprovar, Suspender, Imprimir Relatório e Fechar.",
          "Detalhes de um pedido",
          [
            "**Aprovar**: o pedido segue adiante.",
            "**Suspender**: o pedido não segue adiante e passa a aparecer como Negado.",
            "**Imprimir Relatório**.",
            "**Abrir chat de atendimento**: conversa com a família.",
          ],
        ),
      },
      {
        tipo: "atencao",
        texto: "Os botões **Aprovar** e **Suspender** só aparecem em pedidos que ainda estão **Pendentes**. Em pedidos já decididos você só consulta e imprime.",
      },
      { tipo: "subtitulo", id: "pedidos-aprovar", titulo: "Aprovar ou suspender um pedido" },
      {
        tipo: "passos",
        itens: [
          "Abra o pedido com **Analisar Pedido**.",
          "Clique em **Aprovar** (para seguir adiante) ou em **Suspender** (para não seguir).",
          "Na janela de confirmação, escolha o **dentista responsável**. Se a lista for grande, digite parte do nome no campo **Filtrar por nome** para achar mais rápido.",
          "Clique em **Aprovar** (ou **Suspender**) para confirmar. Aparece uma mensagem verde dizendo que deu certo e a situação do pedido muda na hora.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgPedidoAprovar, 1600, 1000,
          "Janela Confirmar Aprovação com o campo Filtrar por nome, a lista de dentistas com Camila Ribeiro Andrade escolhida e os botões Cancelar e Aprovar.",
          "Confirmação da aprovação",
          [
            "Campo para **filtrar a lista pelo nome** do dentista.",
            "Lista de dentistas: escolha o **dentista responsável**.",
            "Botão que **confirma** a decisão.",
          ],
        ),
      },
      {
        tipo: "atencao",
        texto: "Sem escolher um dentista a plataforma não conclui a ação e mostra a mensagem \"Erro ao executar ação\". Escolha um dentista e confirme de novo.",
      },
      {
        tipo: "dica",
        texto: "Aprovar não é o último passo. Depois de aprovar, cadastre a pessoa em **Beneficiários** e, em seguida, indique um dentista em **Atendimento**.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "beneficiarios",
    titulo: "Beneficiários",
    resumo: "As pessoas que tiveram o pedido aprovado e recebem ou vão receber atendimento.",
    perfil: "todos",
    palavras: ["beneficiário", "beneficiaria", "paciente", "cadastro", "cadastrar", "programa", "editar", "excluir", "deletar", "exportar", "csv", "cep"],
    blocos: [
      {
        tipo: "texto",
        texto: "Beneficiário é a pessoa que será atendida pelo projeto. Todo beneficiário nasce de um **pedido de ajuda aprovado**: por isso o cadastro começa escolhendo esse pedido.",
      },
      { tipo: "subtitulo", id: "beneficiarios-lista", titulo: "Ver e procurar beneficiários" },
      {
        tipo: "figura",
        figura: fig(
          imgBenefLista, 1600, 1000,
          "Lista de beneficiários em cartões, com campo de busca, Filtros, Criar Conta, Exportar CSV e o botão Visualizar Detalhes em cada cartão.",
          "Lista de beneficiários",
          [
            "Campo de **busca** por nome.",
            "Botão **Filtros**.",
            "**Criar Conta**: cadastra um novo beneficiário.",
            "**Exportar CSV**: baixa a lista em planilha (só administradores).",
            "**Visualizar Detalhes**: abre a ficha completa da pessoa.",
          ],
        ),
      },
      { tipo: "subtitulo", id: "beneficiarios-cadastrar", titulo: "Cadastrar um beneficiário" },
      {
        tipo: "passos",
        itens: [
          "Clique em **Criar Conta**.",
          "Em **Pedido de Ajuda Aprovado**, escolha o pedido da pessoa. A lista só mostra pedidos aprovados que ainda não viraram cadastro.",
          "Em **Programa Social**, escolha o programa em que a pessoa será atendida. Se tiver dúvida de qual usar, pergunte à coordenação.",
          "Confira o quadro **Pedido selecionado**: ele mostra o nome, o relato e a data do pedido.",
          "Clique em **Cadastrar Beneficiário**.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgBenefNovo, 1600, 1000,
          "Janela Novo Beneficiário com a lista de pedidos aprovados, a lista de programas, o resumo do pedido selecionado e o botão Cadastrar Beneficiário.",
          "Cadastro de um novo beneficiário",
          [
            "Lista de **pedidos aprovados** disponíveis.",
            "Lista de **programas sociais**.",
            "Botão **Cadastrar Beneficiário**.",
          ],
        ),
      },
      {
        tipo: "dica",
        texto: "O pedido que você procura não aparece na lista? Ele ainda não foi aprovado ou já virou cadastro. Confira em **Pedidos de Ajuda**.",
      },
      { tipo: "subtitulo", id: "beneficiarios-detalhes", titulo: "Ver a ficha e conversar" },
      {
        tipo: "texto",
        texto: "A ficha reúne o programa, os dados pessoais, o telefone, o e-mail, o endereço e o pedido que deu origem ao cadastro.",
      },
      {
        tipo: "figura",
        figura: fig(
          imgBenefDetalhe, 1600, 1000,
          "Ficha de Maria Eduarda Santos com programa vinculado, dados pessoais, telefone, e-mail, localização e o pedido de inclusão. Embaixo, os botões Deletar, Editar Dados e Fechar.",
          "Ficha de um beneficiário",
          [
            "**Iniciar conversa**: abre uma conversa com a pessoa na área de Conversas.",
            "**Editar Dados**: corrige ou atualiza as informações.",
            "**Deletar**: exclui o cadastro (só administradores).",
          ],
        ),
      },
      { tipo: "subtitulo", id: "beneficiarios-editar", titulo: "Corrigir ou atualizar os dados" },
      {
        tipo: "passos",
        itens: [
          "Na ficha, clique em **Editar Dados**.",
          "Altere o que for preciso. Ao digitar o **CEP**, a plataforma preenche rua, cidade e estado sozinha. Confira e complete o número.",
          "Clique em **Salvar Alterações**. Enquanto nada for alterado, o botão fica apagado e mostra **Sem mudanças**.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgBenefEditar, 1600, 1000,
          "Janela Editar Beneficiário com o campo Telefone alterado e o botão laranja Salvar Alterações.",
          "Edição dos dados de um beneficiário",
          ["Campo que foi alterado.", "Botão **Salvar Alterações**."],
        ),
      },
      {
        tipo: "atencao",
        texto: "O botão **Deletar** remove o cadastro e só aparece para administradores. Use apenas quando for realmente necessário e, na dúvida, converse com a coordenação antes.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "dentistas",
    titulo: "Dentistas",
    resumo: "O cadastro dos dentistas voluntários: consultar, cadastrar e atualizar.",
    perfil: "todos",
    palavras: ["dentista", "voluntário", "cro", "especialidade", "profissional", "consultório", "cadastrar", "perfil", "disponibilidade"],
    blocos: [
      { tipo: "subtitulo", id: "dentistas-lista", titulo: "Ver e procurar dentistas" },
      {
        tipo: "figura",
        figura: fig(
          imgDentistasLista, 1600, 1000,
          "Lista de dentistas em cartões, mostrando nome, número do CRO, especialidade e o programa de cada um, com o botão Visualizar Perfil.",
          "Lista de dentistas",
          [
            "Campo de **busca** por nome.",
            "**Criar Conta**: cadastra um novo dentista.",
            "**Visualizar Perfil**: abre a ficha do dentista.",
          ],
        ),
      },
      { tipo: "subtitulo", id: "dentistas-perfil", titulo: "Ver o perfil de um dentista" },
      {
        tipo: "texto",
        texto: "O perfil mostra os dados de contato, a especialidade e o endereço do consultório. Dali você também pode conversar com o dentista ou corrigir os dados.",
      },
      {
        tipo: "figura",
        figura: fig(
          imgDentistaPerfil, 1600, 1000,
          "Janela com o perfil de Camila Ribeiro Andrade e, embaixo, os botões Deletar, Editar Dados e Fechar.",
          "Perfil de um dentista",
          ["**Iniciar conversa**: abre uma conversa com o dentista.", "**Editar Dados**: atualiza as informações."],
        ),
      },
      { tipo: "subtitulo", id: "dentistas-cadastrar", titulo: "Cadastrar um dentista" },
      {
        tipo: "passos",
        itens: [
          "Clique em **Criar Conta**.",
          "Preencha os dados pessoais: nome completo, CRO (o número de registro do dentista), CPF, e-mail, telefone e sexo.",
          "Escolha a **Categoria** e se o dentista está disponível para receber pessoas (**Disponibilidade**).",
          "Escolha a **Especialidade**. Esse campo é obrigatório e vem marcado com um asterisco vermelho.",
          "Em **Endereço do Consultório**, digite o **CEP** e o **Número**. A plataforma completa o restante do endereço.",
          "Clique em **Cadastrar**.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgDentistaCadastro, 1600, 1000,
          "Janela Cadastrar Dentista com todos os campos preenchidos com dados de exemplo e os botões Cancelar e Cadastrar.",
          "Cadastro de um novo dentista",
          ["Campo **Especialidade** (obrigatório).", "Campo **CEP** do consultório.", "Botão **Cadastrar**."],
        ),
      },
      {
        tipo: "dica",
        texto: "Mantenha o endereço do consultório correto. Ao indicar um dentista para um atendimento, a plataforma escolhe o dentista disponível **mais próximo** da pessoa.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "atendimentos",
    titulo: "Atendimento",
    resumo: "Indicar um dentista para cada beneficiário e acompanhar o tratamento até o encerramento.",
    perfil: "todos",
    palavras: ["atendimento", "designar", "designação", "dentista", "prontuário", "prontuario", "encerrar", "concluir", "andamento", "pendentes", "concluídos"],
    blocos: [
      {
        tipo: "texto",
        texto: "É aqui que a plataforma liga uma pessoa já cadastrada a um dentista voluntário e acompanha o caso. A tela tem quatro abas:",
      },
      {
        tipo: "lista",
        itens: [
          "**Pendentes**: pessoas que ainda esperam um dentista.",
          "**Em atendimento**: pessoas que já têm dentista e estão em tratamento.",
          "**Concluídos**: atendimentos encerrados.",
          "**Todos**: tudo junto.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgAtendPendentes, 1600, 1000,
          "Tela Gerenciar Atendimentos na aba Pendentes, com dois cartões de beneficiários e o botão Designar Dentista em cada um.",
          "Aba Pendentes",
          ["As **abas** para trocar de situação.", "**Designar Dentista**: inicia a indicação de um dentista."],
        ),
      },
      { tipo: "subtitulo", id: "atendimentos-designar", titulo: "Indicar um dentista para uma pessoa" },
      {
        tipo: "passos",
        itens: [
          "Na aba **Pendentes**, clique em **Designar Dentista** no cartão da pessoa.",
          "Confira os dados da pessoa: nome, CPF, contato, programa e endereço.",
          "No campo **Prontuário inicial**, descreva o caso: o que a pessoa sente, há quanto tempo, se tem alergias e qualquer informação importante.",
          "Clique em **Designar dentista**.",
          "Na janela de confirmação, leia o resumo e clique em **Confirmar designação**. A plataforma escolhe sozinha o dentista disponível mais próximo.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgAtendDesignar, 1600, 1000,
          "Janela com os dados da beneficiária Larissa Vitória Gomes, o campo Prontuário inicial preenchido e os botões Fechar e Designar dentista.",
          "Preenchendo o prontuário inicial",
          ["Campo **Prontuário inicial**.", "Botão **Designar dentista**."],
        ),
      },
      {
        tipo: "figura",
        figura: fig(
          imgAtendConfirmar, 1600, 1000,
          "Janela Confirmar Designação com o resumo da beneficiária, o prontuário inicial e os botões Cancelar e Confirmar designação.",
          "Confirmação da designação",
          ["Botão **Confirmar designação**.", "Botão **Cancelar**, para voltar sem designar."],
        ),
      },
      {
        tipo: "dica",
        texto: "Escreva o prontuário com frases curtas e claras. Ele é o registro que acompanha o caso e será lido por outras pessoas da equipe.",
      },
      { tipo: "subtitulo", id: "atendimentos-acompanhar", titulo: "Acompanhar os atendimentos" },
      {
        tipo: "texto",
        texto: "Na aba **Em atendimento**, cada cartão mostra a pessoa, o dentista, o prontuário e a data em que o atendimento começou. Clique em **Ver detalhes** para abrir o caso.",
      },
      {
        tipo: "figura",
        figura: fig(
          imgAtendAndamento, 1600, 1000,
          "Aba Em atendimento com cartões de atendimentos em andamento, cada um com a data de início e o botão Ver detalhes.",
          "Aba Em atendimento",
          ["A aba **Em atendimento** selecionada.", "**Ver detalhes**: abre o caso.", "**Exportar CSV**: baixa a lista em planilha (só administradores)."],
        ),
      },
      { tipo: "subtitulo", id: "atendimentos-encerrar", titulo: "Encerrar um atendimento" },
      {
        tipo: "passos",
        itens: [
          "Na aba **Em atendimento**, clique em **Ver detalhes** no caso que terminou.",
          "Confira o dentista responsável e o prontuário atual. Se precisar falar com o dentista, clique em **Chat de atendimento**.",
          "No campo **Prontuário de encerramento**, descreva como o atendimento terminou, o que foi feito e as observações finais.",
          "Veja o **Colaborador responsável**: ele é preenchido sozinho com o seu nome de acesso.",
          "Clique em **Encerrar atendimento** e, na janela de confirmação, confirme.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgAtendEncerrar, 1600, 1000,
          "Janela com os dados do atendimento de Davi Lucas Cardoso, o dentista responsável, o campo Prontuário de encerramento preenchido e o botão Encerrar atendimento.",
          "Encerrando um atendimento",
          ["**Chat de atendimento**: conversa com o dentista.", "Campo **Prontuário de encerramento**.", "Botão **Encerrar atendimento**."],
        ),
      },
      {
        tipo: "atencao",
        texto: "O botão **Encerrar atendimento** fica apagado enquanto o prontuário de encerramento estiver vazio. Depois de encerrado, o caso vai para a aba **Concluídos**, onde ainda é possível abri-lo e atualizar o prontuário.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "conversas",
    titulo: "Conversas",
    resumo: "Ler e enviar mensagens para beneficiários e dentistas, e pedir um resumo da conversa.",
    perfil: "todos",
    palavras: ["chat", "mensagem", "whatsapp", "conversa", "resumo", "inteligência artificial", "ia", "responder", "não lida", "telefone"],
    blocos: [
      {
        tipo: "texto",
        texto: "A área de Conversas reúne as mensagens trocadas com beneficiários e dentistas. As mensagens que você envia chegam ao celular da pessoa, e as respostas aparecem aqui.",
      },
      { tipo: "subtitulo", id: "conversas-lista", titulo: "Ver as conversas" },
      {
        tipo: "figura",
        figura: fig(
          imgConversasLista, 1600, 1000,
          "Central de Atendimentos com a lista de conversas à esquerda e um aviso para selecionar uma conversa à direita.",
          "Lista de conversas",
          [
            "Uma conversa: mostra o contato e o início da última mensagem.",
            "**Horário** da última mensagem e **bolinha verde** com o número de mensagens ainda não lidas.",
          ],
        ),
      },
      { tipo: "subtitulo", id: "conversas-responder", titulo: "Ler e responder" },
      {
        tipo: "passos",
        itens: [
          "Clique na conversa que quer abrir. O histórico aparece ao lado: as mensagens da pessoa ficam em balões brancos e as suas, em balões verdes.",
          "Escreva na caixa **Digite uma mensagem**.",
          "Aperte **Enter** ou clique no botão de **enviar** (o avião de papel). Para pular de linha sem enviar, aperte **Shift + Enter**.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgConversasChat, 1600, 1000,
          "Conversa aberta com Maria Eduarda Santos, mostrando as mensagens trocadas e uma resposta escrita na caixa de mensagem, pronta para enviar.",
          "Conversa aberta",
          [
            "Conversa selecionada.",
            "Quem é o contato: nome, etiqueta (por exemplo, **Beneficiário**) e telefone.",
            "Botão de **resumo por inteligência artificial**.",
            "Caixa onde você escreve a mensagem.",
            "Botão **Enviar**.",
          ],
        ),
      },
      {
        tipo: "atencao",
        texto: "Releia a mensagem antes de enviar: ela chega diretamente à pessoa. Escreva em linguagem simples e cordial, e não peça informações que o atendimento não exige.",
      },
      { tipo: "subtitulo", id: "conversas-resumo", titulo: "Pedir um resumo da conversa" },
      {
        tipo: "texto",
        texto: "Quando a conversa ficar longa, clique no botão de resumo (a estrelinha no canto de cima). A plataforma usa inteligência artificial para mostrar, em poucas linhas, a **necessidade principal** da pessoa, a **situação atual** e os **próximos passos** sugeridos. O botão **Gerar novamente** cria um resumo novo.",
      },
      {
        tipo: "figura",
        figura: fig(
          imgConversasResumo, 1600, 1000,
          "Conversa com o painel Resumo do atendimento aberto à direita, com os títulos Necessidade principal, Status atual e Próximos passos.",
          "Painel de resumo da conversa",
        ),
      },
      {
        tipo: "atencao",
        texto: "O resumo é uma ajuda e pode errar. A própria plataforma avisa: confira antes de agir.",
      },
      {
        tipo: "dica",
        texto: "Você também chega a uma conversa pelos botões **Iniciar conversa** (nas fichas de beneficiários e dentistas) e **Abrir chat de atendimento** (nos pedidos de ajuda).",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "colaboradores",
    titulo: "Colaboradores",
    resumo: "Cadastro da equipe que usa a plataforma e escolha do tipo de acesso de cada pessoa.",
    perfil: "admin",
    palavras: ["colaborador", "equipe", "usuário", "acesso", "senha inicial", "administrador", "permissão", "cadastrar"],
    blocos: [
      {
        tipo: "texto",
        texto: "Só administradores veem esta área. Ela serve para dar acesso à plataforma para novas pessoas da equipe e para consultar quem já tem acesso.",
      },
      {
        tipo: "figura",
        figura: fig(
          imgColabLista, 1600, 1000,
          "Lista de colaboradores em cartões, com o botão Criar Conta e o botão Visualizar Perfil em cada cartão.",
          "Lista de colaboradores",
          ["**Criar Conta**: cadastra uma nova pessoa.", "**Visualizar Perfil**: abre a ficha."],
        ),
      },
      { tipo: "subtitulo", id: "colaboradores-cadastrar", titulo: "Cadastrar um colaborador" },
      {
        tipo: "passos",
        itens: [
          "Clique em **Criar Conta**.",
          "Preencha o nome completo, o CPF, a data de nascimento, o e-mail e a data de contratação.",
          "Escolha o **Nível de Acesso**: **Colaborador** (menu enxuto) ou **Administrador** (acesso a tudo).",
          "Defina a **Senha Inicial** e clique em **Cadastrar**.",
          "Passe o e-mail e a senha para a pessoa por um meio seguro. É com eles que ela vai entrar.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgColabNovo, 1600, 1000,
          "Janela Novo Colaborador com os campos preenchidos com dados de exemplo e o botão Cadastrar.",
          "Cadastro de um novo colaborador",
          ["Lista **Nível de Acesso**.", "Campo **Senha Inicial**.", "Botão **Cadastrar**."],
        ),
      },
      {
        tipo: "atencao",
        texto: "Dê o acesso de **Administrador** só a quem realmente precisa dele: administradores podem excluir cadastros e ver o mapa e a equipe.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "mapa",
    titulo: "Mapa de Vulnerabilidade",
    resumo: "Veja em quais estados a ajuda odontológica é mais necessária e simule o efeito de um mutirão.",
    perfil: "admin",
    palavras: ["mapa", "vulnerabilidade", "estado", "região", "simulador", "mutirão", "atenção", "risco", "filtros", "satélite"],
    blocos: [
      {
        tipo: "texto",
        texto: "Só administradores veem esta área. O mapa pinta cada estado conforme o **nível de atenção** que ele precisa: cores claras indicam menos necessidade e cores mais escuras e quentes indicam mais. Ele ajuda a decidir para onde levar os esforços.",
      },
      {
        tipo: "figura",
        figura: fig(
          imgMapa, 1600, 1180,
          "Mapa do Brasil colorido por nível de atenção, com o painel Filtros à esquerda, a escolha do tipo de mapa no alto, o Simulador de mutirão e o Índice Geral de Atenção à direita e a legenda de cores embaixo.",
          "Mapa de Vulnerabilidade",
          [
            "**Filtros**: marque os níveis de urgência que quer ver. Sem nenhum marcado, o mapa mostra todos.",
            "**Buscar estado**: digite o nome ou a sigla e escolha o resultado para aproximar o mapa.",
            "Tipo de mapa: **Claro**, **Ruas** ou **Satélite**.",
            "**Simulador de mutirão**.",
            "**Índice Geral de Atenção** do Brasil, com o nível de risco.",
            "**Legenda** das cores. Clique em uma faixa para isolar só os estados daquele nível.",
          ],
        ),
      },
      { tipo: "subtitulo", id: "mapa-simulador", titulo: "Simular um mutirão" },
      {
        tipo: "passos",
        itens: [
          "No **Simulador de mutirão**, escolha um estado na lista.",
          "Digite quantos **dentistas voluntários** participariam.",
          "Clique em **Aplicar**.",
          "Veja o resultado: o quadro **Cenário salvo** mostra quanto da necessidade do estado seria coberta, e o **Índice Geral de Atenção** e o mapa se ajustam.",
          "Para recomeçar, use **Limpar tudo** no quadro do cenário.",
        ],
      },
      {
        tipo: "figura",
        figura: fig(
          imgMapaSimulador, 1600, 1180,
          "Simulador com o estado Maranhão escolhido, 900 dentistas digitados e o botão Aplicar pronto para ser clicado.",
          "Preenchendo o simulador",
          ["Lista de **estados**.", "Quantidade de **dentistas voluntários**.", "Botão **Aplicar**."],
        ),
      },
      {
        tipo: "figura",
        figura: fig(
          imgMapaResultado, 1600, 1180,
          "Depois de aplicar, o simulador mostra o Cenário salvo para o Maranhão e o Índice Geral de Atenção do Brasil já recalculado.",
          "Resultado da simulação",
          ["**Cenário salvo**: o que foi simulado e quanto da necessidade ele cobre.", "**Índice Geral de Atenção** recalculado."],
        ),
      },
      {
        tipo: "atencao",
        texto: "A simulação é só uma conta de apoio ao planejamento: ela não altera cadastros, pedidos nem atendimentos. Se o mapa mostrar o aviso amarelo de **dados parcialmente estimados**, trate os números como referência e não os use como dado oficial em relatórios.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "boas-praticas",
    titulo: "Cuidados e boas práticas",
    resumo: "Hábitos simples que protegem as pessoas atendidas e a sua conta.",
    perfil: "todos",
    palavras: ["privacidade", "lgpd", "segurança", "dados pessoais", "senha", "sigilo", "cuidados", "confidencial"],
    blocos: [
      {
        tipo: "texto",
        texto: "A plataforma guarda informações pessoais e de saúde. Essas informações são sensíveis e protegidas por lei (a Lei Geral de Proteção de Dados, a LGPD). Por isso:",
      },
      {
        tipo: "lista",
        itens: [
          "**Use os dados só para o atendimento.** Não copie nem envie nomes, CPFs, telefones, endereços ou relatos para fora da plataforma.",
          "**Não compartilhe imagens da tela** com dados de pessoas, nem em grupos de mensagens.",
          "**Guarde a sua senha só para você** e não deixe a tela aberta quando sair de perto. Use **Sair da Conta** ao terminar.",
          "**Confira antes de confirmar.** Aprovar, designar, encerrar e deletar mudam o andamento de um caso; leia o resumo da janela antes de clicar.",
          "**Escreva registros claros.** Prontuários e mensagens devem ter fatos, em linguagem simples, sem opiniões pessoais.",
          "**Fale com respeito** em todas as conversas: do outro lado há alguém pedindo ajuda.",
          "**Na dúvida, pergunte.** Fale com a coordenação ou com um administrador antes de fazer algo que não tem como desfazer.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "perguntas-frequentes",
    titulo: "Dúvidas frequentes",
    resumo: "Respostas rápidas para os problemas mais comuns.",
    perfil: "todos",
    palavras: ["problema", "erro", "não consigo", "ajuda", "dúvida", "não aparece", "sumiu", "senha", "esqueci"],
    blocos: [
      {
        tipo: "perguntas",
        itens: [
          {
            pergunta: "Esqueci a minha senha. O que faço?",
            resposta: "Procure um administrador. Ele confere o seu cadastro e orienta como recuperar o seu acesso.",
          },
          {
            pergunta: "Um colega vê um item no menu que eu não vejo. Por quê?",
            resposta: "O menu muda conforme o tipo de acesso. **Colaboradores** e **Mapa de Vulnerabilidade** aparecem só para administradores. Veja o quadro de diferenças em \"Conhecendo a tela e o menu\".",
          },
          {
            pergunta: "Não encontro o pedido ou a pessoa que procuro.",
            resposta: "Apague o texto da busca e confira os **Filtros**: se algum estiver escolhido, a lista mostra só aquele grupo. Tente também buscar só pelo primeiro nome. Se ainda assim não achar, recarregue a página.",
          },
          {
            pergunta: "Os botões Aprovar e Suspender não aparecem.",
            resposta: "Eles só aparecem em pedidos **Pendentes**. Um pedido já aprovado ou negado só pode ser consultado e impresso.",
          },
          {
            pergunta: "Apareceu a mensagem \"Erro ao executar ação\" ao aprovar ou suspender.",
            resposta: "Quase sempre é porque nenhum dentista foi escolhido na janela de confirmação. Escolha o **dentista responsável** e confirme de novo. Se continuar, recarregue a página e tente outra vez; se não resolver, avise um administrador.",
          },
          {
            pergunta: "Ao cadastrar um beneficiário, aparece \"Nenhum pedido aprovado disponível\" ou o pedido não está na lista.",
            resposta: "Só aparecem pedidos **aprovados** que ainda não viraram cadastro. Confira em **Pedidos de Ajuda** se o pedido foi aprovado. Se foi, procure o nome em **Beneficiários**: a pessoa pode já ter sido cadastrada. Se ainda assim não aparecer, recarregue a página.",
          },
          {
            pergunta: "O botão Encerrar atendimento (ou Designar dentista) está apagado.",
            resposta: "Os botões ficam apagados até que o campo de prontuário seja preenchido. Escreva o prontuário e o botão fica disponível.",
          },
          {
            pergunta: "Apareceu \"Não foi possível consultar o CEP agora\" ou \"CEP não encontrado\".",
            resposta: "No primeiro caso, a busca do endereço está fora do ar naquele momento: aguarde um pouco e digite o CEP de novo. No segundo, confira se os oito números estão corretos.",
          },
          {
            pergunta: "Uma conversa não atualizou ou uma mensagem nova não apareceu.",
            resposta: "Recarregue a página. O número verde no ícone de **Conversas** mostra quantas conversas têm mensagem ainda não lida.",
          },
          {
            pergunta: "Como baixo uma lista em planilha?",
            resposta: "Em **Beneficiários**, **Dentistas** e **Atendimento**, administradores têm o botão **Exportar CSV**. O arquivo baixado abre no Excel ou no Google Planilhas.",
          },
          {
            pergunta: "Posso usar a plataforma no celular?",
            resposta: "Pode. No celular o menu fica numa barra na parte de baixo da tela; toque no botão verde do meio para abrir o menu completo.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "glossario",
    titulo: "Palavras que você vai encontrar",
    resumo: "O significado das palavras mais usadas na plataforma.",
    perfil: "todos",
    palavras: ["glossário", "significado", "o que é", "termo", "definição", "prontuário", "protocolo", "triagem", "cro", "csv", "programa"],
    blocos: [
      {
        tipo: "definicoes",
        itens: [
          { termo: "Administrador", significado: "Pessoa com acesso a todas as áreas da plataforma, inclusive Colaboradores e Mapa de Vulnerabilidade." },
          { termo: "Atendimento", significado: "O acompanhamento de uma pessoa por um dentista, da indicação do dentista até o encerramento do caso." },
          { termo: "Beneficiário", significado: "Pessoa que teve o pedido de ajuda aprovado e foi cadastrada para receber o atendimento." },
          { termo: "Colaborador", significado: "Pessoa da equipe com acesso ao dia a dia da plataforma. Na plataforma também aparece como coordenador." },
          { termo: "CRO", significado: "Número de registro do dentista no Conselho Regional de Odontologia." },
          { termo: "CSV", significado: "Tipo de arquivo de planilha, que abre no Excel ou no Google Planilhas." },
          { termo: "Designar", significado: "Indicar qual dentista vai atender uma pessoa. A plataforma escolhe o dentista disponível mais próximo." },
          { termo: "Pedido de ajuda", significado: "Solicitação feita por uma família pelo site, pedindo atendimento odontológico." },
          { termo: "Programa social", significado: "A iniciativa em que a pessoa é atendida. Hoje há dois: Turma do Bem (em algumas telas aparece como Dentista do Bem) e Apolônias do Bem." },
          { termo: "Prontuário", significado: "Registro escrito do caso: o que a pessoa sente, o que foi feito e as observações importantes." },
          { termo: "Protocolo", significado: "Número que identifica cada pedido de ajuda, como #12." },
          { termo: "Triagem", significado: "Primeira análise de um pedido, para decidir se ele segue adiante." },
        ],
      },
    ],
  },
];

/** Quantidade de imagens do guia (usada nos testes para garantir que nenhuma ficou sem descrição). */
export const TOTAL_FIGURAS = contadorFiguras;
