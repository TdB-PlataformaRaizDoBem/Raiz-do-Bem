export type Beneficiario = {
  id: number;
  id_pedido_ajuda: number;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  sexo: "Masculino" | "Feminino" | "Outro";
  dataNascimento: string;
  programaSocial: "Turma do Bem" | "Apolônias do Bem";
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
  // Campos de vínculo (Designação)
  idDentistaDesignado?: number; 
  idCoordenadorResponsavel?: number;
};

export const beneficiariosData: Beneficiario[] = [
  {
    id: 1,
    id_pedido_ajuda: 9, 
    cpf: "123.456.789-00",
    nome: "Ana Oliveira",
    email: "ana.oliveira@email.com",
    telefone: "(11) 98888-7777",
    sexo: "Feminino",
    dataNascimento: "12/10/2006",
    programaSocial: "Apolônias do Bem",
    cep: "03977-000",
    logradouro: "Avenida Sapopemba",
    numero: "1000",
    cidade: "São Paulo",
    estado: "SP",
    idDentistaDesignado: 1,
    idCoordenadorResponsavel: 1 
  },
  {
    id: 3,
    id_pedido_ajuda: 3, 
    cpf: "444.555.666-77",
    nome: "Lucas Pereira",
    email: "lucas.p@email.com",
    telefone: "(21) 97777-8888",
    sexo: "Masculino",
    dataNascimento: "05/03/2010",
    programaSocial: "Turma do Bem",
    cep: "20040-002",
    logradouro: "Rua da Assembleia",
    numero: "100",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    idDentistaDesignado: 2,
    idCoordenadorResponsavel: 8 
  },
  {
    id: 6,
    id_pedido_ajuda: 5, 
    cpf: "222.333.444-55",
    nome: "Carla Diaz",
    email: "carla.diaz@email.com",
    telefone: "(81) 94444-3333",
    sexo: "Feminino",
    dataNascimento: "30/01/1990",
    programaSocial: "Apolônias do Bem",
    cep: "50030-000",
    logradouro: "Av. Boa Viagem",
    numero: "250",
    cidade: "Recife",
    estado: "PE",
    idDentistaDesignado: 7,
    idCoordenadorResponsavel: 6 
  }
];