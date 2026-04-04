import { PedidoAjuda } from "./pedidosAjudaData";
import { beneficiariosData, type Beneficiario } from "./beneficiariosData";

// Pega os IDs de pedidos que já estão vinculados a alguém
const idsJaVinculados = beneficiariosData.map(b => b.id_pedido_ajuda);

const pedidosParaDesignar = PedidoAjuda.filter(p => 
  p.situacao === "Aprovado" && !idsJaVinculados.includes(p.id)
);

//  Transformamos esses pedidos em um formato que a sua tela de Beneficiário entende
export const designacaoData: Beneficiario[] = pedidosParaDesignar.map(p => ({
  id: p.id + 100,
  id_pedido_ajuda: p.id,
  nome: p.nome_completo,
  email: p.email,
  telefone: p.telefone,
  cpf: "000.000.000-00",
  sexo: "Outro", 
  dataNascimento: "01/01/2000",
  programaSocial: p.id === 10 ? "Turma do Bem" : "Apolônias do Bem",
  cep: "00000-000",
  logradouro: "Verificar Pedido",
  numero: "S/N",
  cidade: p.id === 10 ? "Campinas" : "São Paulo",
  estado: p.id === 10 ? "SP" : "SP",
  idCoordenadorResponsavel: p.id_coordenador
}));