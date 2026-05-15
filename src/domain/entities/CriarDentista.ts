export interface CriarDentistaPayload {
  croDentista: string;
  cpf: string;
  nomeCompleto: string;
  sexo: string;
  email: string;
  telefone: string;
  categoria: string;
  disponivel: string;
  endereco: {
    cep: string;
    numero: string;
  };
}