export interface FaqItem {
  q: string;
  r: string;
}

export interface FaqCategory {
  title: string;
  questions: FaqItem[];
}

export const faqCategories : FaqCategory[] = [
  {
    title: "Beneficiários",
    questions: [
      {
        q: "Quem pode participar dos programas da Turma do Bem?",
        r: "Crianças e adolescentes de 11 a 17 anos em situação de vulnerabilidade social e mulheres que tiveram a dentição comprometida por situações de violência.",
      },
      {
        q: "Como faço para me inscrever no Dentista do Bem?",
        r: "A inscrição acontece por meio das triagens realizadas em escolas, instituições parceiras ou eventos da TdB.",
      },
      {
        q: "Existe algum custo para receber atendimento?",
        r: "Não. Todos os atendimentos oferecidos pela Turma do Bem são 100% gratuitos.",
      },
      {
        q: "Até que idade o atendimento é oferecido?",
        r: "Os jovens atendidos permanecem no programa até completarem 18 anos. Mulheres beneficiadas pelo Apolônias do Bem seguem o tratamento até a conclusão dos casos.",
      },
      {
        q: "Como funciona o processo de triagem?",
        r: "As pessoas passam por uma avaliação simples, sem procedimentos invasivos, para identificar a urgência e gravidade dos problemas bucais.",
      },
      {
        q: "Quanto tempo demora para ser chamado?",
        r: "O tempo varia conforme a fila de espera e a disponibilidade de dentistas voluntários na região.",
      },
      {
        q: "O que acontece se eu mudar de cidade durante o tratamento?",
        r: "O caso pode ser transferido para outro dentista voluntário próximo à nova cidade, conforme disponibilidade.",
      },
    ],
  },
  {
    title: "Voluntários",
    questions: [
      {
        q: "Como posso me tornar um dentista voluntário?",
        r: "Basta preencher o formulário de inscrição disponível no site da TdB e aguardar o contato da equipe.",
      },
      {
        q: "Existe algum treinamento ou preparação antes de começar?",
        r: "Sim. O voluntário recebe orientações sobre os programas e materiais de apoio da TdB.",
      },
      {
        q: "Quanto tempo de dedicação é esperado?",
        r: "O tempo é flexível. Cada dentista voluntário decide a quantidade de casos que pode atender.",
      },
      {
        q: "Posso escolher os casos que vou atender?",
        r: "Os pacientes são encaminhados pela TdB, mas o dentista pode avaliar se consegue assumir o tratamento.",
      },
      {
        q: "A ONG fornece materiais ou eu uso os do meu consultório?",
        r: "O atendimento acontece no próprio consultório do voluntário, com seus materiais e recursos.",
      },
      {
        q: "Como recebo informações sobre os pacientes encaminhados?",
        r: "A equipe da TdB envia os dados e histórico do paciente diretamente para o dentista voluntário.",
      },
    ],
  },
  {
    title: "Doadores e Apoiadores",
    questions: [
      {
        q: "Como faço uma doação?",
        r: "As doações podem ser realizadas diretamente no site oficial da TdB ou por campanhas parceiras.",
      },
      {
        q: "Posso doar mensalmente (doação recorrente)?",
        r: "Sim. É possível configurar doações mensais automáticas no site da TdB.",
      },
      {
        q: "Minha doação é dedutível no imposto de renda?",
        r: "Algumas modalidades de doação permitem dedução. Consulte um contador ou a equipe da TdB para confirmar.",
      },
      {
        q: "Onde vejo os resultados das minhas doações?",
        r: "O impacto das doações é divulgado em relatórios, redes sociais e no site da TdB.",
      },
      {
        q: "Além de dinheiro, posso doar materiais ou serviços?",
        r: "Sim. A TdB aceita contribuições de materiais odontológicos e serviços de apoio.",
      },
      {
        q: "Como minha empresa pode se tornar parceira da TdB?",
        r: "A empresa pode entrar em contato pelo site para firmar parcerias institucionais e de responsabilidade social.",
      },
    ],
  },
  {
    title: "Público Geral",
    questions: [
      {
        q: "O que é a Turma do Bem?",
        r: "É uma organização da sociedade civil que oferece atendimento odontológico gratuito a pessoas em vulnerabilidade social.",
      },
      {
        q: "Quais programas a ONG oferece?",
        r: "O Dentista do Bem (para jovens de 11 a 17 anos) e o Apolônias do Bem (para mulheres vítimas de violência).",
      },
      {
        q: "Em quais regiões do Brasil vocês atuam?",
        r: "A TdB está presente em todo o Brasil, por meio de dentistas voluntários espalhados em centenas de cidades.",
      },
      {
        q: "Como posso acompanhar os projetos e resultados?",
        r: "Pelo site oficial, relatórios anuais e redes sociais da TdB.",
      },
      {
        q: "Como entrar em contato com a equipe?",
        r: "Pelo formulário de contato no site oficial ou pelos canais de atendimento informados nas redes sociais.",
      },
      {
        q: "Vocês atuam fora do Brasil?",
        r: "Sim. A Turma do Bem conta com voluntários em 12 países além do Brasil.",
      },
    ],
  },
];
