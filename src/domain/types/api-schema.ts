export type SexoAPI = "M" | "F" | "O";
 
export type StatusPedidoAPI = "PENDENTE" | "APROVADO" | "REJEITADO";
 
export type TipoEnderecoAPI = "RESIDENCIAL" | "PROFISSIONAL";

export type DisponibilidadeAPI = "S" | "N";
export interface ProgramaSocialAPI {
  id: number;
  programa: string;
}

export interface EspecialidadeAPI {
  id: number;
  descricao: string;
}