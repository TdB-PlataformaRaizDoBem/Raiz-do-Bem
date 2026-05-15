export interface AtualizarBeneficiarioPayload {
  telefone?: string;
  email?: string;
  endereco?: {
    cep: string;
    numero: string;
  };
}