export interface DentistaAPI {
  id: number;
  croDentista: string;
  cpf: string;
  nomeCompleto: string;
  sexo: string;
  email: string;
  telefone: string;
  categoria: string | null;
  disponivel: string;
  especialidades: string[];
  programasSociais: string[];
  logradouro: string | null;
  numero: string | null;
  cidade: string | null;
  estado: string | null;
}