export type Beneficiario = {
  id: number;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  sexo: "Masculino" | "Feminino" | "Outro";
  data_nascimento: string;
  programaSocial: "Turma do Bem" | "Apolônias do Bem";
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
};

export const beneficiariosData: Beneficiario[] = [
  {
    id: 1,
    cpf: "123.456.789-00",
    nome: "Ana Oliveira",
    email: "ana.oliveira@email.com",
    telefone: "(11) 98888-7777",
    sexo: "Feminino",
    data_nascimento: "12/10/2006",
    programaSocial: "Apolônias do Bem",
    cep: "03977-000",
    logradouro: "Avenida Sapopemba",
    numero: "1000",
    cidade: "São Paulo",
    estado: "SP",
  },
  {
    id: 2,
    cpf: "123.456.789-00",
    nome: "Ryan Costa Santos",
    email: "ryan.santos@email.com",
    telefone: "(11) 98888-7777",
    sexo: "Masculino",
    data_nascimento: "12/10/2012",
    programaSocial: "Turma do Bem",
    cep: "03977-000",
    logradouro: "Avenida Sapopemba",
    numero: "1000",
    cidade: "São Paulo",
    estado: "SP",
  }
];