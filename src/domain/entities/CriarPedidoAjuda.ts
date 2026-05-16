export interface CriarPedidoAjudaPayload {
  cpf: string;
  nome: string;
  dataNascimento: string; // ISO yyyy-MM-dd
  sexo: "M" | "F" | "O";
  telefone: string;
  email: string;
  descricaoProblema: string;
  endereco: { cep: string; numero: string };
}