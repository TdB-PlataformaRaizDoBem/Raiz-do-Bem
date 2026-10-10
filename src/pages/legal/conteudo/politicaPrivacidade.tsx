import { Link } from "react-router-dom";
import { CONTROLADOR } from "../../../domain/legal/organizacao";
import { blocoControlador, blocoEncarregado, blocosDireitos } from "./comuns";
import { EmailLink as Email } from "../../../components/legal/EmailLink";
import type { LegalDocument } from "./tipos";

export const politicaPrivacidade: LegalDocument = {
  titulo: "Política de Privacidade",
  resumo:
    "Explicamos, em linguagem simples, quais dados a plataforma Raiz do Bem trata, para quê, com quem compartilha e como você pode controlar tudo isso.",
  secoes: [
    {
      id: "quem-somos",
      titulo: "1. Quem é o responsável pelos seus dados",
      blocos: [
        blocoControlador,
        {
          tipo: "p",
          texto:
            "A plataforma Raiz do Bem foi desenvolvida por estudantes da FIAP, no TdB Challenge, em parceria com a Turma do Bem, para organizar pedidos de ajuda e o trabalho de dentistas voluntários.",
        },
        blocoEncarregado,
      ],
    },
    {
      id: "dados",
      titulo: "2. Quais dados tratamos e para quê",
      blocos: [
        {
          tipo: "tabela",
          legenda: "Dados tratados, finalidades e bases legais",
          colunas: ["Onde você informa", "Dados", "Para quê", "Base legal (LGPD)"],
          linhas: [
            [
              "Pedido de ajuda (página Contato)",
              "Nome, CPF, data de nascimento, sexo, e-mail, telefone, CEP e número do endereço, descrição do problema bucal e, para mulheres adultas, a resposta sobre situação de violência",
              "Verificar se o perfil se encaixa nos programas, encaminhar a um dentista voluntário, entrar em contato e acompanhar o atendimento",
              "Consentimento (art. 7º, I). Para dados de saúde e de violência, consentimento específico e destacado (art. 11, I). Para menores de 18 anos, consentimento de pai, mãe ou responsável (art. 14, §1º)",
            ],
            [
              "Cadastro de dentista voluntário (página Seja Voluntário)",
              "Nome, CPF, CRO, e-mail, telefone, sexo, especialidade, CEP e número do consultório",
              "Validar o cadastro profissional, entrar em contato e relacionar você a pessoas atendidas na sua região",
              "Consentimento (art. 7º, I)",
            ],
            [
              "Conversas por WhatsApp",
              "Número de telefone, conteúdo das mensagens, data, hora e situação de entrega",
              "Falar com você sobre o atendimento (orientações, agendamento e confirmações) e manter o histórico da conversa",
              "Mesma base do pedido de ajuda: consentimento",
            ],
            [
              "Login da equipe interna",
              "E-mail e dados da sessão de acesso",
              "Controlar quem acessa o painel de administradores e coordenadores",
              "Legítimo interesse (art. 7º, IX)",
            ],
            [
              "Acesso ao site",
              "Endereço IP, data, hora e navegador, registrados pela hospedagem e pelos servidores",
              "Manter o site seguro e funcionando",
              "Legítimo interesse (art. 7º, IX)",
            ],
          ],
        },
      ],
    },
    {
      id: "sensiveis-e-menores",
      titulo: "3. Dados sensíveis, crianças e adolescentes",
      blocos: [
        {
          tipo: "p",
          texto:
            "A descrição do problema de saúde bucal e a informação sobre violência são dados pessoais sensíveis (art. 5º, II). Só os tratamos com o seu consentimento específico e destacado, dado separadamente no formulário (art. 11, I), e usamos apenas o necessário para analisar o pedido.",
        },
        {
          tipo: "p",
          texto:
            "Os programas atendem principalmente pessoas de 11 a 17 anos. Dados de menores de 18 anos só são tratados com o consentimento de pai, mãe ou responsável legal e sempre no melhor interesse da criança ou do adolescente (art. 14). O formulário pede essa declaração quando a data de nascimento indica menoridade.",
        },
      ],
    },
    {
      id: "compartilhamento",
      titulo: "4. Com quem compartilhamos",
      blocos: [
        {
          tipo: "ul",
          itens: [
            "A equipe da Turma do Bem (administradores e coordenadores), que analisa os pedidos e acompanha o atendimento.",
            "Dentistas voluntários designados ao caso, que recebem os dados necessários para o atendimento.",
            "Fornecedores que operam a plataforma em nosso nome: hospedagem do site (Vercel), servidores e bancos de dados das APIs e o serviço de mensagens do WhatsApp (Twilio).",
            "Um recurso de inteligência artificial que resume o histórico das conversas para a equipe. O resumo é apoio ao trabalho das pessoas; a aprovação de pedidos é sempre decisão humana.",
            "ViaCEP: ao digitar o CEP, ele é enviado ao serviço para preencher o endereço.",
            "Google (mapa da página Contato, só se você permitir) e YouTube (vídeo da página inicial, só depois de apertar play).",
            "VLibras, do Governo Federal: tradução para Libras, carregada em segundo plano nas páginas públicas.",
            "Autoridades, quando a lei exigir.",
          ],
        },
        { tipo: "p", texto: "Não vendemos nem alugamos dados pessoais." },
      ],
    },
    {
      id: "transferencia-internacional",
      titulo: "5. Transferência para fora do Brasil",
      blocos: [
        {
          tipo: "p",
          texto:
            "Alguns fornecedores (como Twilio, Vercel e Google) podem armazenar ou processar dados fora do Brasil. Nesses casos, a transferência segue o art. 33 da LGPD.",
        },
      ],
    },
    {
      id: "retencao",
      titulo: "6. Por quanto tempo guardamos",
      blocos: [
        {
          tipo: "p",
          texto:
            "Guardamos os dados pelo tempo necessário para triar, encaminhar e acompanhar o atendimento e para cumprir obrigações legais. Quando deixam de ser necessários, são eliminados ou anonimizados (arts. 15 e 16). Rascunhos de formulário ficam só na aba do seu navegador e são apagados ao fechá-la ou ao enviar.",
        },
      ],
    },
    {
      id: "direitos",
      titulo: "7. Seus direitos",
      blocos: [{ tipo: "p", texto: "Você pode, a qualquer momento:" }, ...blocosDireitos],
    },
    {
      id: "seguranca",
      titulo: "8. Como protegemos",
      blocos: [
        {
          tipo: "p",
          texto:
            "Usamos conexão criptografada (HTTPS), acesso ao painel interno apenas com login e por perfil (administrador ou coordenador) e evitamos guardar dados sensíveis no seu navegador: CPF e relato de saúde não entram nos rascunhos. Nenhum sistema é totalmente imune a falhas. Se houver um incidente que possa causar risco ou dano relevante, comunicaremos você e a ANPD (art. 48).",
        },
      ],
    },
    {
      id: "cookies",
      titulo: "9. Cookies e armazenamento no navegador",
      blocos: [
        {
          tipo: "p",
          texto:
            "Não usamos cookies de publicidade nem ferramentas de análise de audiência. Esta tabela lista tudo o que o site grava ou carrega no seu navegador:",
        },
        {
          tipo: "tabela",
          legenda: "Cookies e armazenamento local",
          colunas: ["Item", "Para quê", "Quando", "Duração"],
          linhas: [
            ["Sua escolha sobre cookies (raiz-do-bem:cookies)", "Lembrar a decisão tomada no aviso de cookies", "Sempre (essencial)", "12 meses"],
            [
              "Rascunho dos formulários (sessionStorage)",
              "Não perder o que foi digitado se a página recarregar. Não guarda CPF, relato de saúde nem as autorizações",
              "Ao preencher os formulários",
              "Até fechar a aba",
            ],
            ["Leitura em voz alta (raiz-do-bem:tts)", "Lembrar se você ligou a leitura em voz alta", "Ao ligar ou desligar o recurso", "Até você limpar os dados do navegador"],
            ["Sessão da equipe interna", "Manter o login de administradores e coordenadores", "Só depois do login", "Até sair ou expirar"],
            ["Google Maps (cookies de terceiros)", "Mostrar o mapa da sede", "Só se você permitir cookies opcionais ou pedir o mapa", "Definida pelo Google"],
            ["YouTube (youtube-nocookie.com)", "Tocar o vídeo da página inicial", "Só depois de apertar play", "Definida pelo YouTube"],
            ["VLibras (vlibras.gov.br)", "Tradução para Libras", "Carregado em segundo plano nas páginas públicas", "Definida pelo VLibras"],
          ],
        },
        {
          tipo: "p",
          texto:
            "Para mudar sua escolha, use “Preferências de cookies” no rodapé do site. Você também pode apagar os dados do site nas configurações do navegador.",
        },
      ],
    },
    {
      id: "mudancas",
      titulo: "10. Mudanças nesta política",
      blocos: [
        {
          tipo: "p",
          texto:
            "Podemos atualizar esta política. A versão e a data aparecem no topo da página. Se a mudança alterar a forma de usar seus dados, pediremos um novo consentimento quando a lei exigir (art. 8º, §6º).",
        },
      ],
    },
    {
      id: "contato",
      titulo: "11. Fale com a gente",
      blocos: [
        {
          tipo: "ul",
          itens: [
            <>Endereço: {CONTROLADOR.endereco}</>,
            <>Telefone: {CONTROLADOR.telefone}</>,
            ...CONTROLADOR.contatos.map((c) => (
              <>
                {c.rotulo}: <Email endereco={c.email} />
              </>
            )),
          ],
        },
        {
          tipo: "p",
          texto: (
            <>
              Os termos de consentimento dos formulários estão em{" "}
              <Link to="/consentimento/pedido-de-ajuda" className="font-bold text-[#7a3f0a] underline underline-offset-2 hover:text-darkgreen">
                Pedido de ajuda
              </Link>{" "}
              e{" "}
              <Link to="/consentimento/voluntario" className="font-bold text-[#7a3f0a] underline underline-offset-2 hover:text-darkgreen">
                Dentista voluntário
              </Link>
              .
            </>
          ),
        },
      ],
    },
  ],
};
