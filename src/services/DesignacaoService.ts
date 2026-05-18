import { PedidoAjuda } from "../data/pedidosAjudaData";
import { beneficiariosData, type Beneficiario } from "../data/beneficiariosData";
import { dentistasMock, type Dentista } from "../data/dentistasData";

// GET /api/designacoes/pendentes
export const getBeneficiariosParaDesignacao = async (): Promise<Beneficiario[]> => {
  await new Promise((r) => setTimeout(r, 300));

  const idsJaVinculados = new Set(
    beneficiariosData.map((b) => b.id_pedido_ajuda)
  );

  const pedidosDisponiveis = PedidoAjuda.filter(
    (p) => p.situacao === "Aprovado" && !idsJaVinculados.has(p.id)
  );

  return pedidosDisponiveis.map((p) => ({
    id: p.id + 100,
    id_pedido_ajuda: p.id,
    nome: p.nome_completo,
    email: p.email,
    telefone: p.telefone,

    // mock temporário
    cpf: "000.000.000-00",
    sexo: "Outro",
    dataNascimento: "01/01/2000",

    programaSocial:
      p.id === 10 ? "Turma do Bem" : "Apolônias do Bem",

    cep: "00000-000",
    logradouro: "Verificar Pedido",
    numero: "S/N",
    cidade: p.id === 10 ? "Campinas" : "São Paulo",
    estado: "SP",

    idCoordenadorResponsavel: p.id_coordenador,
  }));
};

export const buscarDentistasProximos = (
  beneficiario: Beneficiario
): Dentista[] => {
  return dentistasMock.filter((d) => {
    // 1. Disponibilidade (CRÍTICO)
    if (d.disponibilidade !== "Sim") return false;

    // Compatibilidade de programa
    const atendePrograma =
      d.programa === "Ambos" ||
      d.programa === beneficiario.programaSocial;

    if (!atendePrograma) return false;

    // Proximidade (cidade > estado)
    const mesmaCidade = d.endereco.cidade === beneficiario.cidade;
    const mesmoEstado = d.endereco.estado === beneficiario.estado;

    return mesmaCidade || mesmoEstado;
  });
};