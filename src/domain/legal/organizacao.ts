/**
 * Dados do controlador (quem decide sobre o tratamento dos dados) usados nos documentos legais.
 *
 * Origem: telefone, endereço e e-mails já publicados no rodapé e na página de contato do site;
 * CNPJ e qualificação (OSCIP) conferidos em bases públicas de CNPJ e no site oficial turmadobem.org.br.
 * A Turma do Bem deve confirmar cada item antes de a versão final ser publicada.
 */
export const CONTROLADOR = {
  nome: "Turma do Bem",
  cnpj: "05.413.029/0001-19",
  qualificacao: "Organização da Sociedade Civil de Interesse Público (OSCIP)",
  endereco: "Rua Maurício Francisco Klabin, 449 — Vila Mariana, São Paulo/SP, CEP 04120-020",
  telefone: "55 11 5084-7276",
  site: "https://turmadobem.org.br",
  contatos: [
    { rotulo: "Presidente", email: "turmadobem@tdb.org.br" },
    { rotulo: "Comunicação", email: "comunicacao@tdb.org.br" },
    { rotulo: "Dúvidas, Críticas ou Sugestões", email: "faleconosco@tdb.org.br" },
  ],
} as const;

/** Canal para pedidos dos titulares (art. 18 da LGPD). Confirmar com a ONG se é o canal oficial de privacidade. */
export const CANAL_TITULAR = "faleconosco@tdb.org.br";

/**
 * Encarregado pelo tratamento de dados pessoais (art. 41 da LGPD).
 * A ONG ainda não divulgou um: enquanto for `null`, os documentos dizem isso e apontam o `CANAL_TITULAR`.
 * Quando houver nome e e-mail, basta preencher aqui.
 */
export const ENCARREGADO = null as { nome: string; email: string } | null;

/**
 * Enquanto for `false`, os documentos legais exibem o aviso de projeto acadêmico.
 * Mude para `true` só se a Turma do Bem e a assessoria jurídica revisarem os textos.
 */
export const DOCUMENTOS_VALIDADOS_PELA_ONG = false;

export const ANPD_URL = "https://www.gov.br/anpd";
