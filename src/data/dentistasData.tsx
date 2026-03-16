export type Dentista = {
  id: number;
  nome: string;
  cro: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: "Feminino" | "Masculino" | "Outro";
  especialidade: string;
  programa: "Turma do Bem" | "Apolônias do Bem" | "Ambos";
  disponibilidade: string;
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
};

export const dentistasMock: Dentista[] = [
  {
    id: 1,
    nome: "Ana Paula Carvalho",
    cro: "SP-99887",
    cpf: "222.333.444-55",
    email: "anapaula.odontologia@gmail.com",
    telefone: "(11) 97766-5544",
    sexo: "Feminino",
    especialidade: "Odontopediatria",
    programa: "Ambos",
    disponibilidade: "S",
    cep: "03310-000",
    logradouro: "Rua Tuiuti",
    numero: "1500",
    cidade: "São Paulo",
    estado: "SP"
  }
];