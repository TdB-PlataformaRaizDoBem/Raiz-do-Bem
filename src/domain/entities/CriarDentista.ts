export interface CriarDentistaPayload {
  croDentista: string;
  cpf: string;
  nomeCompleto: string;
  sexo: "M" | "F" | "O";
  email: string;
  telefone: string;
  categoria?: "CLINICO" | "COORDENADOR";
  idEspecialidade: number;
  disponivel: "S" | "N";
  endereco: {
    cep: string;
    numero: string;
  };
}