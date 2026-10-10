import { Link } from "react-router-dom";
import { DATA_VIGENCIA_EXTENSO, VERSAO_DOCUMENTOS } from "../../../domain/legal/consentimento";
import { blocoControlador, blocoEncarregado, blocosDireitos } from "./comuns";
import { CANAL_TITULAR } from "../../../domain/legal/organizacao";
import { EmailLink as Email } from "../../../components/legal/EmailLink";
import type { LegalDocument } from "./tipos";

export const termoPedidoAjuda: LegalDocument = {
  titulo: "Termo de Consentimento — Pedido de ajuda",
  resumo:
    "O que acontece com os dados que você informa ao pedir atendimento odontológico gratuito, e o que você está autorizando ao marcar as caixas do formulário.",
  secoes: [
    {
      id: "quem-trata",
      titulo: "1. Quem trata os seus dados",
      blocos: [blocoControlador, blocoEncarregado],
    },
    {
      id: "dados",
      titulo: "2. Quais dados pedimos",
      blocos: [
        {
          tipo: "ul",
          itens: [
            "Nome completo, CPF, data de nascimento e sexo de quem vai receber o atendimento;",
            "e-mail e telefone para contato;",
            "CEP e número do endereço, para encontrar um dentista voluntário perto;",
            "descrição do problema de saúde bucal (dado sensível);",
            "para mulheres com 18 anos ou mais, a resposta sobre situação de violência (dado sensível), porque o programa Apolônias do Bem atende essas mulheres.",
          ],
        },
        { tipo: "p", texto: "Pedimos só o que é preciso para a triagem. Não escreva no relato nada além do necessário." },
      ],
    },
    {
      id: "finalidades",
      titulo: "3. Para que vamos usar",
      blocos: [
        {
          tipo: "ul",
          itens: [
            "Verificar se o perfil se encaixa nos programas: Dentista do Bem (crianças e adolescentes de 11 a 17 anos em vulnerabilidade social) e Apolônias do Bem (mulheres que sofreram violência).",
            "Encaminhar o caso a um dentista voluntário.",
            "Entrar em contato por telefone, WhatsApp ou e-mail, inclusive para agendar e confirmar o atendimento.",
            "Guardar o histórico da conversa e gerar, com inteligência artificial, um resumo para a equipe. A decisão sobre o pedido é sempre de uma pessoa.",
            "Gerar relatórios com números agregados, sem identificar você.",
          ],
        },
        { tipo: "p", texto: "Não usaremos os dados para outras finalidades sem pedir uma nova autorização." },
      ],
    },
    {
      id: "sensiveis",
      titulo: "4. Dados sensíveis",
      blocos: [
        {
          tipo: "p",
          texto:
            "A descrição do problema de saúde e a resposta sobre violência exigem uma autorização separada e específica (art. 11, I da LGPD). Por isso o formulário tem uma caixa só para elas. Os dados sensíveis são vistos apenas por quem precisa deles para o atendimento.",
        },
      ],
    },
    {
      id: "menores",
      titulo: "5. Menores de 18 anos",
      blocos: [
        {
          tipo: "p",
          texto:
            "Se a pessoa a ser atendida tem menos de 18 anos, o pedido deve ser feito por pai, mãe ou responsável legal, que dá o consentimento em nome dela e no melhor interesse dela (art. 14, §1º). O formulário mostra uma declaração extra quando a data de nascimento indica menoridade. Se você tem menos de 18 anos, peça para o seu responsável preencher ou acompanhar o pedido. Se você preenche por outra pessoa adulta, ela precisa ter autorizado.",
        },
      ],
    },
    {
      id: "compartilhamento",
      titulo: "6. Com quem compartilhamos",
      blocos: [
        {
          tipo: "p",
          texto: (
            <>
              Com a equipe da Turma do Bem, com o dentista voluntário designado ao caso e com fornecedores que operam a
              plataforma (hospedagem, servidores e WhatsApp). A lista completa está na{" "}
              <Link to="/privacidade#compartilhamento" className="font-bold text-[#7a3f0a] underline underline-offset-2 hover:text-darkgreen">
                Política de Privacidade
              </Link>
              . Não vendemos dados.
            </>
          ),
        },
      ],
    },
    {
      id: "prazo",
      titulo: "7. Por quanto tempo guardamos",
      blocos: [
        {
          tipo: "p",
          texto:
            "Pelo tempo necessário para triar, encaminhar e acompanhar o atendimento e para cumprir obrigações legais. Depois, os dados são eliminados ou anonimizados.",
        },
      ],
    },
    {
      id: "direitos",
      titulo: "8. Seus direitos e como revogar",
      blocos: blocosDireitos,
    },
    {
      id: "recusa",
      titulo: "9. E se eu não concordar?",
      blocos: [
        {
          tipo: "p",
          texto: (
            <>
              Você não é obrigado(a) a consentir. Sem a autorização, não conseguimos receber o pedido por este
              formulário, porque precisamos dos dados para a triagem. Você pode falar com a Turma do Bem pelos canais
              de contato (<Email endereco={CANAL_TITULAR} />) para saber se existe outra forma de pedir ajuda.
            </>
          ),
        },
      ],
    },
    {
      id: "versao",
      titulo: "10. Versão deste termo",
      blocos: [
        {
          tipo: "p",
          texto: `Versão ${VERSAO_DOCUMENTOS}, em vigor desde ${DATA_VIGENCIA_EXTENSO}. Quando o texto mudar, a versão muda.`,
        },
      ],
    },
  ],
};
