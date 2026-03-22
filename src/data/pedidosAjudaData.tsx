export type PedidoAjudaData = {
  id: number;
  nome_completo: string;
  email: string;
  telefone: string;
  descricao_problema: string;
  data: string;
  id_status_pedido: number;
  situacao: string;
}

export const PedidoAjuda: PedidoAjudaData[] = [
  {
    id: 1,
    nome_completo: "João Silva",
    email: "joao.s@email.com",
    telefone: "(11) 98888-7777",
    descricao_problema: "Meus dentes da frente quebraram em uma briga em casa e não consigo nem sorrir ou falar direito. Dói muito quando bebo água.",
    data: "19/03/2026",
    id_status_pedido: 1,
    situacao: "Pendente",
  },
  {
    id: 2,
    nome_completo: "Mariana Souza",
    email: "mari.souza@email.com",
    telefone: "(21) 97777-6666",
    descricao_problema: "Sinto muita dor no fundo da boca e meu rosto está inchado faz três dias. Não tenho condições de pagar um dentista agora.",
    data: "18/03/2026",
    id_status_pedido: 2,
    situacao: "Pendente",
  },
  {
    id: 3,
    nome_completo: "Lorrany Mendes",
    email: "lorrany.m@email.com",
    telefone: "(31) 96666-5555",
    descricao_problema: "Perdi vários dentes por falta de cuidado no passado e sinto muita vergonha. Preciso de uma prótese para conseguir um emprego.",
    data: "17/03/2026",
    id_status_pedido: 3,
    situacao: "Aprovado",
  },
  {
    id: 4,
    nome_completo: "Pedro Henrique Vaz",
    email: "pedrinho.v@email.com",
    telefone: "(41) 95555-4444",
    descricao_problema: "Meu dente está com um buraco enorme e lateja a noite inteira. Já tomei remédio mas a dor não passa.",
    data: "16/03/2026",
    id_status_pedido: 1,
    situacao: "Pendente",
  },
  {
    id: 5,
    nome_completo: "Carla Beatriz",
    email: "carla.b@email.com",
    telefone: "(51) 94444-3333",
    descricao_problema: "Minha boca estala muito e dói quando tento abrir para comer. Acho que desencaixou depois de um soco que levei.",
    data: "15/03/2026",
    id_status_pedido: 4,
    situacao: "Aprovado",
  },
  {
    id: 6,
    nome_completo: "Gabriel Oliveira",
    email: "gabi.oliva@email.com",
    telefone: "(61) 93333-2222",
    descricao_problema: "Tenho vergonha de ir na escola porque meus dentes estão todos pretos e estragados. Dói muito quando como doce.",
    data: "14/03/2026",
    id_status_pedido: 2,
    situacao: "Pendente",
  },
  {
    id: 7,
    nome_completo: "Samanta Lima",
    email: "sam.lima@email.com",
    telefone: "(71) 92222-1111",
    descricao_problema: "Um dente da frente caiu e o outro está mole. Preciso de ajuda urgente para não perder o outro também.",
    data: "13/03/2026",
    id_status_pedido: 1,
    situacao: "Pendente",
  },
  {
    id: 8,
    nome_completo: "Beatriz Nogueira",
    email: "bia.nog@email.com",
    telefone: "(81) 91111-0000",
    descricao_problema: "Minha gengiva sangra o tempo todo e meus dentes estão ficando moles. Tenho medo de perder todos eles.",
    data: "12/03/2026",
    id_status_pedido: 5,
    situacao: "Negado",
  },
  {
    id: 9,
    nome_completo: "Lucas Gabriel",
    email: "lucas.g@email.com",
    telefone: "(11) 90000-9999",
    descricao_problema: "Cai e bati a boca no chão, quebrou a metade do dente e está aparecendo o nervo. Não aguento de dor.",
    data: "11/03/2026",
    id_status_pedido: 3,
    situacao: "Aprovado",
  },
  {
    id: 10,
    nome_completo: "Isabela Meireles",
    email: "isabela.m@email.com",
    telefone: "(19) 99887-7665",
    descricao_problema: "Faz muito tempo que não consigo mastigar do lado esquerdo porque os dentes quebraram. Preciso de canal ou arrancar.",
    data: "10/03/2026",
    id_status_pedido: 2,
    situacao: "Aprovado",
  }
];