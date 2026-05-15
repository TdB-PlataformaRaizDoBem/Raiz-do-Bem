export interface AtualizarDentistaPayload {
  telefone?: string;
  email?: string;
  categoriaDentista?: string;
  endereco?: {
    cep: string;
    numero: string;
  };
  disponivel?: string;
}