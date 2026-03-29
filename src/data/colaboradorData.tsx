export interface Colaborador {
  id: number;
  idColaborador: number;
  nomeCompleto: string;
  email: string;
  cpf: string; 
  dataNascimento: string;
  idSexo: number;
  // Endereço (Residencial)
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
  idTipoEndereco: number; 
  // Dados de Contrato
  dataContratacao: string;
  nivelAcesso: "admin" | "colaborador";
}

export const colaboradorData: Colaborador[] = [
  { 
    id: 1, 
    idColaborador: 101,
    nomeCompleto: "Leandro Santos", 
    email: "leandro@raizdobem.com", 
    cpf: "123.456.789-01",
    dataNascimento: "1985-05-20",
    idSexo: 1,
    logradouro: "Av Mateo Bei", 
    numero: "1200", 
    cidade: "São Paulo", 
    estado: "SP", 
    cep: "03949-010", 
    idTipoEndereco: 1,
    dataContratacao: "15/01/2023",
    nivelAcesso: "admin"
  },
  { 
    id: 2, 
    idColaborador: 102,
    nomeCompleto: "Ana Silva", 
    email: "ana.silva@raizdobem.com", 
    cpf: "234.567.890-12",
    dataNascimento: "1992-08-15",
    idSexo: 2,
    logradouro: "Rua Forte do Rio Branco", 
    numero: "45", 
    cidade: "São Paulo", 
    estado: "SP", 
    cep: "08340-140", 
    idTipoEndereco: 1,
    dataContratacao: "10/03/2023",
    nivelAcesso: "colaborador"
  },
  { 
    id: 3, 
    idColaborador: 103,
    nomeCompleto: "Carlos Oliveira", 
    email: "carlos.o@raizdobem.com", 
    cpf: "345.678.901-23",
    dataNascimento: "1978-12-02",
    idSexo: 1,
    logradouro: "Avenida Sapopemba", 
    numero: "8000", 
    cidade: "São Paulo", 
    estado: "SP", 
    cep: "03941-000", 
    idTipoEndereco: 1,
    dataContratacao: "22/05/2022",
    nivelAcesso: "colaborador"
  },
  { 
    id: 4, 
    idColaborador: 104,
    nomeCompleto: "Mariana Costa", 
    email: "mariana.costa@raizdobem.com", 
    cpf: "456.789.012-34",
    dataNascimento: "1990-03-25",
    idSexo: 2,
    logradouro: "Rua Baronesa de Muritiba", 
    numero: "210", 
    cidade: "São Paulo", 
    estado: "SP", 
    cep: "08340-000", 
    idTipoEndereco: 1,
    dataContratacao: "05/11/2023",
    nivelAcesso: "colaborador"
  },
  { 
    id: 5, 
    idColaborador: 105,
    nomeCompleto: "Ricardo Santos", 
    email: "ricardo.s@raizdobem.com", 
    cpf: "567.890.123-45",
    dataNascimento: "1982-07-10",
    idSexo: 1,
    logradouro: "Estrada do Iguatemi", 
    numero: "1500", 
    cidade: "São Paulo", 
    estado: "SP", 
    cep: "08485-580", 
    idTipoEndereco: 1,
    dataContratacao: "12/08/2022",
    nivelAcesso: "admin"
  },
  { 
    id: 6, 
    idColaborador: 106,
    nomeCompleto: "Beatriz Lopes", 
    email: "beatriz.lopes@raizdobem.com", 
    cpf: "678.901.234-56",
    dataNascimento: "1995-01-30",
    idSexo: 2,
    logradouro: "Avenida dos Metalúrgicos", 
    numero: "320", 
    cidade: "São Paulo", 
    estado: "SP", 
    cep: "08471-000", 
    idTipoEndereco: 1,
    dataContratacao: "30/01/2024",
    nivelAcesso: "colaborador"
  },
  { 
    id: 7, 
    idColaborador: 107,
    nomeCompleto: "Fernando Souza", 
    email: "fernando.s@raizdobem.com", 
    cpf: "789.012.345-67",
    dataNascimento: "1988-11-14",
    idSexo: 1,
    logradouro: "Rua Hipólito de Camargo", 
    numero: "98", 
    cidade: "São Paulo", 
    estado: "SP", 
    cep: "08410-030", 
    idTipoEndereco: 1,
    dataContratacao: "14/06/2023",
    nivelAcesso: "colaborador"
  },
  { 
    id: 8, 
    idColaborador: 108,
    nomeCompleto: "Juliana Mendes", 
    email: "juliana.m@raizdobem.com", 
    cpf: "890.123.456-78",
    dataNascimento: "1993-04-20",
    idSexo: 2,
    logradouro: "Rua General Porfírio da Paz", 
    numero: "500", 
    cidade: "São Paulo", 
    estado: "SP", 
    cep: "03918-000", 
    idTipoEndereco: 1,
    dataContratacao: "20/09/2023",
    nivelAcesso: "admin"
  },
];