import { Link } from "react-router-dom";
import { DATA_VIGENCIA_EXTENSO, VERSAO_DOCUMENTOS } from "../../../domain/legal/consentimento";
import { CANAL_TITULAR } from "../../../domain/legal/organizacao";
import { blocoControlador, blocoEncarregado, blocosDireitos } from "./comuns";
import { EmailLink as Email } from "../../../components/legal/EmailLink";
import type { LegalDocument } from "./tipos";

export const termoVoluntario: LegalDocument = {
  titulo: "Termo de Consentimento — Dentista voluntário",
  resumo:
    "O que acontece com os dados que você informa ao se cadastrar como dentista voluntário, e o que você está autorizando ao marcar a caixa do formulário.",
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
            "Nome completo, CPF e sexo;",
            "número do CRO e especialidade;",
            "e-mail e telefone;",
            "CEP e número do endereço do consultório.",
          ],
        },
        { tipo: "p", texto: "Não pedimos dados sensíveis neste cadastro." },
      ],
    },
    {
      id: "finalidades",
      titulo: "3. Para que vamos usar",
      blocos: [
        {
          tipo: "ul",
          itens: [
            "Validar o seu cadastro profissional e a sua identidade.",
            "Entrar em contato por telefone, WhatsApp ou e-mail sobre o voluntariado.",
            "Relacionar você a pessoas atendidas na sua região e designar casos a você.",
            "Gerar relatórios com números agregados, sem identificar você.",
          ],
        },
        { tipo: "p", texto: "Não usaremos os dados para outras finalidades sem pedir uma nova autorização." },
      ],
    },
    {
      id: "compartilhamento",
      titulo: "4. Com quem compartilhamos",
      blocos: [
        {
          tipo: "p",
          texto: (
            <>
              Com a equipe da Turma do Bem e com fornecedores que operam a plataforma. Quando um caso for designado a
              você, a pessoa encaminhada poderá receber o seu nome e o endereço e o contato do seu consultório, para
              conseguir chegar ao atendimento. A lista completa está na{" "}
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
      titulo: "5. Por quanto tempo guardamos",
      blocos: [
        {
          tipo: "p",
          texto:
            "Enquanto você for voluntário(a) da plataforma e pelo tempo necessário para cumprir obrigações legais. Depois, os dados são eliminados ou anonimizados.",
        },
      ],
    },
    {
      id: "direitos",
      titulo: "6. Seus direitos e como revogar",
      blocos: blocosDireitos,
    },
    {
      id: "recusa",
      titulo: "7. E se eu não concordar?",
      blocos: [
        {
          tipo: "p",
          texto: (
            <>
              Você não é obrigado(a) a consentir. Sem a autorização, não conseguimos concluir o cadastro por este
              formulário. Para saber se há outra forma de se voluntariar, fale com a Turma do Bem em{" "}
              <Email endereco={CANAL_TITULAR} />.
            </>
          ),
        },
      ],
    },
    {
      id: "versao",
      titulo: "8. Versão deste termo",
      blocos: [
        {
          tipo: "p",
          texto: `Versão ${VERSAO_DOCUMENTOS}, em vigor desde ${DATA_VIGENCIA_EXTENSO}. Quando o texto mudar, a versão muda.`,
        },
      ],
    },
  ],
};
