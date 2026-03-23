export type Dentista = {
  id: number;
  nome: string;
  cro: string;
  cpf: string;
  email: string;
  telefone: string;

  sexo: {
    id: number;
    tipo: "Masculino" | "Feminino" | "Outro";
  };

  especialidades: {
    id: number;
    descricao: string;
  }[];

  programa: "Turma do Bem" | "Apolônias do Bem" | "Ambos";
  disponibilidade: "Sim" | "Não";

  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    cidade: string;
    estado: string;
  };
};

export const dentistasMock: Dentista[] = [
  {
    id: 1,
    nome: "Ana Paula Carvalho",
    cro: "SP-99887",
    cpf: "222.333.444-55",
    email: "anapaula@gmail.com",
    telefone: "(11) 97766-5544",

    sexo: {
      id: 2,
      tipo: "Feminino"
    },

    especialidades: [
      { id: 1, descricao: "Odontopediatria" },
      { id: 2, descricao: "Ortodontia" }
    ],

    programa: "Ambos",
    disponibilidade: "Sim",

    endereco: {
      cep: "03310-000",
      logradouro: "Rua Tuiuti",
      numero: "1500",
      cidade: "São Paulo",
      estado: "SP"
    }
  },
  {
    id: 2,
    nome: "Carlos Mendes",
    cro: "RJ-22334",
    cpf: "123.456.789-00",
    email: "carlos@gmail.com",
    telefone: "(21) 98877-1122",

    sexo: {
      id: 1,
      tipo: "Masculino"
    },

    especialidades: [
      { id: 3, descricao: "Endodontia" }
    ],

    programa: "Turma do Bem",
    disponibilidade: "Sim",

    endereco: {
      cep: "20040-002",
      logradouro: "Rua da Assembleia",
      numero: "45",
      cidade: "Rio de Janeiro",
      estado: "RJ"
    }
  },
  {
    id: 3,
    nome: "Fernanda Lima",
    cro: "MG-55667",
    cpf: "987.654.321-11",
    email: "fernanda@gmail.com",
    telefone: "(31) 99911-2233",
    sexo: { id: 2, tipo: "Feminino" },
    especialidades: [
      { id: 3, descricao: "Endodontia" }
    ],
    programa: "Apolônias do Bem",
    disponibilidade: "Não",
    endereco: {
      cep: "30130-110",
      logradouro: "Av. Afonso Pena",
      numero: "900",
      cidade: "Belo Horizonte",
      estado: "MG"
    }
  },
  {
    id: 4,
    nome: "João Ribeiro",
    cro: "RS-77889",
    cpf: "555.666.777-88",
    email: "joao@gmail.com",
    telefone: "(51) 99122-3344",
    sexo: { id: 1, tipo: "Masculino" },
    especialidades: [
      { id: 4, descricao: "Implantodontia" }
    ],
    programa: "Ambos",
    disponibilidade: "Sim",
    endereco: {
      cep: "90010-150",
      logradouro: "Rua dos Andradas",
      numero: "1200",
      cidade: "Porto Alegre",
      estado: "RS"
    }
  },
  {
    id: 5,
    nome: "Mariana Souza",
    cro: "BA-33445",
    cpf: "111.222.333-44",
    email: "mariana@gmail.com",
    telefone: "(71) 98822-1133",
    sexo: { id: 2, tipo: "Feminino" },
    especialidades: [
      { id: 5, descricao: "Periodontia" }
    ],
    programa: "Turma do Bem",
    disponibilidade: "Sim",
    endereco: {
      cep: "40020-000",
      logradouro: "Rua Chile",
      numero: "88",
      cidade: "Salvador",
      estado: "BA"
    }
  },
  {
    id: 6,
    nome: "Ricardo Alves",
    cro: "PR-66778",
    cpf: "444.555.666-77",
    email: "ricardo@gmail.com",
    telefone: "(41) 98888-9999",
    sexo: { id: 1, tipo: "Masculino" },
    especialidades: [
      { id: 6, descricao: "Clínico Geral" }
    ],
    programa: "Ambos",
    disponibilidade: "Não",
    endereco: {
      cep: "80010-000",
      logradouro: "Rua XV de Novembro",
      numero: "300",
      cidade: "Curitiba",
      estado: "PR"
    }
  },
  {
    id: 7,
    nome: "Patrícia Gomes",
    cro: "PE-99876",
    cpf: "777.888.999-00",
    email: "patricia@gmail.com",
    telefone: "(81) 97777-6666",
    sexo: { id: 2, tipo: "Feminino" },
    especialidades: [
      { id: 1, descricao: "Odontopediatria" }
    ],
    programa: "Apolônias do Bem",
    disponibilidade: "Sim",
    endereco: {
      cep: "50030-000",
      logradouro: "Av. Boa Viagem",
      numero: "100",
      cidade: "Recife",
      estado: "PE"
    }
  },
  {
    id: 8,
    nome: "Eduardo Costa",
    cro: "SC-55443",
    cpf: "888.999.000-11",
    email: "eduardo@gmail.com",
    telefone: "(48) 98811-2233",
    sexo: { id: 1, tipo: "Masculino" },
    especialidades: [
      { id: 2, descricao: "Ortodontia" },
      { id: 6, descricao: "Clínico Geral" }
    ],
    programa: "Turma do Bem",
    disponibilidade: "Sim",
    endereco: {
      cep: "88010-400",
      logradouro: "Rua Felipe Schmidt",
      numero: "500",
      cidade: "Florianópolis",
      estado: "SC"
    }
  },
  {
    id: 9,
    nome: "Juliana Martins",
    cro: "CE-11223",
    cpf: "999.000.111-22",
    email: "juliana@gmail.com",
    telefone: "(85) 99988-7766",
    sexo: { id: 2, tipo: "Feminino" },
    especialidades: [
      { id: 3, descricao: "Endodontia" }
    ],
    programa: "Ambos",
    disponibilidade: "Sim",
    endereco: {
      cep: "60060-000",
      logradouro: "Av. Beira Mar",
      numero: "700",
      cidade: "Fortaleza",
      estado: "CE"
    }
  },
  {
    id: 10,
    nome: "Bruno Fernandes",
    cro: "DF-44556",
    cpf: "333.444.555-66",
    email: "bruno@gmail.com",
    telefone: "(61) 99123-4567",
    sexo: { id: 1, tipo: "Masculino" },
    especialidades: [
      { id: 4, descricao: "Implantodontia" }
    ],
    programa: "Ambos",
    disponibilidade: "Não",
    endereco: {
      cep: "70040-010",
      logradouro: "Esplanada",
      numero: "10",
      cidade: "Brasília",
      estado: "DF"
    }
  },
  {
    id: 11,
    nome: "Larissa Teixeira",
    cro: "GO-66789",
    cpf: "111.444.777-00",
    email: "larissa@gmail.com",
    telefone: "(62) 98877-6655",
    sexo: { id: 2, tipo: "Feminino" },
    especialidades: [
      { id: 6, descricao: "Clínico Geral" }
    ],
    programa: "Turma do Bem",
    disponibilidade: "Sim",
    endereco: {
      cep: "74000-000",
      logradouro: "Av. Goiás",
      numero: "200",
      cidade: "Goiânia",
      estado: "GO"
    }
  },
  {
    id: 12,
    nome: "André Oliveira",
    cro: "ES-99881",
    cpf: "222.555.888-11",
    email: "andre@gmail.com",
    telefone: "(27) 99999-0000",
    sexo: { id: 1, tipo: "Masculino" },
    especialidades: [
      { id: 5, descricao: "Periodontia" }
    ],
    programa: "Ambos",
    disponibilidade: "Sim",
    endereco: {
      cep: "29010-000",
      logradouro: "Av. Vitória",
      numero: "350",
      cidade: "Vitória",
      estado: "ES"
    }
  },
  {
    id: 13,
    nome: "Camila Rocha",
    cro: "MT-33221",
    cpf: "444.777.000-22",
    email: "camila@gmail.com",
    telefone: "(65) 98888-7777",
    sexo: { id: 2, tipo: "Feminino" },
    especialidades: [
      { id: 1, descricao: "Odontopediatria" }
    ],
    programa: "Apolônias do Bem",
    disponibilidade: "Sim",
    endereco: {
      cep: "78005-000",
      logradouro: "Av. CPA",
      numero: "600",
      cidade: "Cuiabá",
      estado: "MT"
    }
  },
  {
    id: 14,
    nome: "Lucas Barbosa",
    cro: "AM-55661",
    cpf: "555.888.111-33",
    email: "lucas@gmail.com",
    telefone: "(92) 99111-2222",
    sexo: { id: 1, tipo: "Masculino" },
    especialidades: [
      { id: 2, descricao: "Ortodontia" }
    ],
    programa: "Turma do Bem",
    disponibilidade: "Sim",
    endereco: {
      cep: "69005-000",
      logradouro: "Rua Eduardo Ribeiro",
      numero: "120",
      cidade: "Manaus",
      estado: "AM"
    }
  },
  {
    id: 15,
    nome: "Renata Pires",
    cro: "PB-77882",
    cpf: "666.999.222-44",
    email: "renata@gmail.com",
    telefone: "(83) 98888-1111",
    sexo: { id: 2, tipo: "Feminino" },
    especialidades: [
      { id: 6, descricao: "Clínico Geral" }
    ],
    programa: "Ambos",
    disponibilidade: "Não",
    endereco: {
      cep: "58010-000",
      logradouro: "Av. Epitácio Pessoa",
      numero: "800",
      cidade: "João Pessoa",
      estado: "PB"
    }
  }
];