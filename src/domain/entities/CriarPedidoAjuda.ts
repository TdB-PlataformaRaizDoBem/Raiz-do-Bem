export interface CriarPedidoAjudaPayload {
  nome: string;
  cpf?: string;
  dataNascimento?: string;
  sexo?: string;
  telefone: string;
  email: string;
  descricaoProblema: string;
  endereco?: {
    cep: string;
    numero: string;
  };
}