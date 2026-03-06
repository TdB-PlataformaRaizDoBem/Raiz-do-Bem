export interface DentistFormData {
  nome: string;
  cpf: string;
  email: string;
  celular: string;
  pais: string;
  estado: string;
  cidade: string;
  cep: string;
  cro: string;
  especialidades: string;
  publicoAtendido: "criancas" | "mulheres" | "ambos";
  qtdCriancas: number;
  qtdMulheres: number;
}