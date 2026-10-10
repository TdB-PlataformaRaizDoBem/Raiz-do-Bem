import { EmailLink as Email } from "../../../components/legal/EmailLink";
import { ANPD_URL, CANAL_TITULAR, CONTROLADOR, ENCARREGADO } from "../../../domain/legal/organizacao";
import type { LegalBlock } from "./tipos";

/** Quem é o controlador, em uma frase. */
export const blocoControlador: LegalBlock = {
  tipo: "p",
  texto: (
    <>
      O controlador dos dados tratados nesta plataforma é a <strong>{CONTROLADOR.nome}</strong> (CNPJ{" "}
      {CONTROLADOR.cnpj}), {CONTROLADOR.qualificacao}, com sede na {CONTROLADOR.endereco}. Telefone:{" "}
      {CONTROLADOR.telefone}.
    </>
  ),
};

/** Encarregado (art. 41): mostra o nome, se houver, ou diz com franqueza que ainda não foi divulgado. */
export const blocoEncarregado: LegalBlock = {
  tipo: "p",
  texto: ENCARREGADO ? (
    <>
      Encarregado pelo tratamento de dados pessoais: <strong>{ENCARREGADO.nome}</strong>,{" "}
      <Email endereco={ENCARREGADO.email} />.
    </>
  ) : (
    <>
      A Turma do Bem ainda não divulgou um encarregado pelo tratamento de dados pessoais (art. 41 da LGPD). Até lá,
      envie qualquer pedido sobre seus dados para <Email endereco={CANAL_TITULAR} />.
    </>
  ),
};

/** Direitos do titular (art. 18) e como exercê-los. */
export const blocosDireitos: LegalBlock[] = [
  {
    tipo: "ul",
    itens: [
      "confirmar se tratamos dados seus e acessá-los;",
      "corrigir dados incompletos, inexatos ou desatualizados;",
      "pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários ou tratados fora da lei;",
      "pedir a portabilidade dos dados;",
      "pedir a eliminação dos dados tratados com o seu consentimento;",
      "saber com quais entidades compartilhamos seus dados;",
      "saber que pode não dar o consentimento e quais as consequências;",
      "revogar o consentimento a qualquer momento, de forma gratuita e simples (art. 8º, §5º).",
    ],
  },
  {
    tipo: "p",
    texto: (
      <>
        <strong>Como pedir:</strong> escreva para <Email endereco={CANAL_TITULAR} /> contando o que deseja e qual
        nome, e-mail ou telefone você usou no formulário. Não envie seu CPF por e-mail: se precisarmos confirmar
        quem você é, diremos como fazer com segurança. A confirmação de que tratamos seus dados é imediata; a
        declaração completa sai em até 15 dias (art. 19). Revogar o consentimento não desfaz o que já foi feito e
        pode impedir a continuidade do atendimento.
      </>
    ),
  },
  {
    tipo: "p",
    texto: (
      <>
        Se achar que seus direitos não foram respeitados, você também pode reclamar à Autoridade Nacional de
        Proteção de Dados (ANPD):{" "}
        <a
          href={ANPD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[#7a3f0a] underline underline-offset-2 hover:text-darkgreen"
        >
          gov.br/anpd
        </a>
        .
      </>
    ),
  },
];
