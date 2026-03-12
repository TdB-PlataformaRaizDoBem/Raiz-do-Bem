export interface Coordenador {
  id: number;
  nome: string;
  email: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
  cep: string;
  data_contratacao: string;
}

export const coordenadoresData: Coordenador[] = [
  { id: 1, nome: "Leandro Santos", email: "leandro@raizdobem.com", logradouro: "Av Mateo Bei", numero: "1200", cidade: "São Paulo", estado: "SP", cep: "03949-010", data_contratacao: "15/01/2023" },
  { id: 2, nome: "Ana Silva", email: "ana.silva@raizdobem.com", logradouro: "Rua Forte do Rio Branco", numero: "45", cidade: "São Paulo", estado: "SP", cep: "08340-140", data_contratacao: "10/03/2023" },
  { id: 3, nome: "Carlos Oliveira", email: "carlos.o@raizdobem.com", logradouro: "Avenida Sapopemba", numero: "8000", cidade: "São Paulo", estado: "SP", cep: "03941-000", data_contratacao: "22/05/2022" },
  { id: 4, nome: "Mariana Costa", email: "mariana.costa@raizdobem.com", logradouro: "Rua Baronesa de Muritiba", numero: "210", cidade: "São Paulo", estado: "SP", cep: "08340-000", data_contratacao: "05/11/2023" },
  { id: 5, nome: "Ricardo Santos", email: "ricardo.s@raizdobem.com", logradouro: "Estrada do Iguatemi", numero: "1500", cidade: "São Paulo", estado: "SP", cep: "08485-580", data_contratacao: "12/08/2022" },
  { id: 6, nome: "Beatriz Lopes", email: "beatriz.lopes@raizdobem.com", logradouro: "Avenida dos Metalúrgicos", numero: "320", cidade: "São Paulo", estado: "SP", cep: "08471-000", data_contratacao: "30/01/2024" },
  { id: 7, nome: "Fernando Souza", email: "fernando.s@raizdobem.com", logradouro: "Rua Hipólito de Camargo", numero: "98", cidade: "São Paulo", estado: "SP", cep: "08410-030", data_contratacao: "14/06/2023" },
  { id: 8, nome: "Juliana Mendes", email: "juliana.m@raizdobem.com", logradouro: "Rua General Porfírio da Paz", numero: "500", cidade: "São Paulo", estado: "SP", cep: "03918-000", data_contratacao: "20/09/2023" },
]