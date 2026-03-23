export interface DentistFormData {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  idSexo: string; // ID que representa o tipo (Masculino, Feminino, etc)
  
  cro: string;
  especialidades: string;

  cep: string; 
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
}