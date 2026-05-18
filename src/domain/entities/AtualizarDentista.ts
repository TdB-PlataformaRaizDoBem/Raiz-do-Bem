export interface AtualizarDentistaPayload {
  telefone?: string;
  email?: string;
  categoriaDentista?: string;
  idEspecialidade?: number;
  disponivel?: string;
  endereco?: {
    cep: string;
    numero: string;
  };
}