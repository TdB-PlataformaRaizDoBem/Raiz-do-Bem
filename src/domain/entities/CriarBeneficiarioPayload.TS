export interface CriarBeneficiarioPayload {
  cpf: string;
  nomeCompleto: string;
  dataNascimento: string;        
  telefone: string;
  email: string;
  idPedidoAjuda?: number;
  idProgramaSocial?: number;
  idEndereco?: number;
}