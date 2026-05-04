export interface DentistFormData {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  idSexo: string; // "1" = M, "2" = F, "3" = O

  cro: string;
  especialidades: string;

  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
}
