import { useAsync } from "./useAsync";
import { getPedidosAprovadosLivres } from "../services/PedidoService";
import type { BeneficiarioViewModel } from "../domain/mappers/Beneficiariomapper";
import type { PedidoViewModel } from "../domain/mappers/PedidoMapper";

function pedidoParaBeneficiario(pedido: PedidoViewModel): BeneficiarioViewModel {
  return {
    id: pedido.id,
    cpf: pedido.cpf,
    nomeCompleto: pedido.nomeCompleto,
    dataNascimento: pedido.dataNascimento,
    telefone: pedido.telefone,
    email: pedido.email,
    programaSocial: "—",
    programaSocialId: null,
    endereco: pedido.endereco
      ? {
          logradouro: pedido.endereco.logradouro,
          numero: pedido.endereco.numero,
          bairro: pedido.endereco.bairro,
          cidade: pedido.endereco.cidade,
          estado: pedido.endereco.estado,
          cep: pedido.endereco.cep,
        }
      : null,
    pedido: {
      id: pedido.id,
      descricaoProblema: pedido.descricaoProblema,
      statusLabel: pedido.statusLabel,
      dataPedido: pedido.dataPedido,
    },
  };
}

async function getBeneficiariosPendentes(): Promise<BeneficiarioViewModel[]> {
  const pedidos = await getPedidosAprovadosLivres();
  return pedidos.map(pedidoParaBeneficiario);
}

export const useDesignacao = () => {
  const { data, loading, error, refetch } = useAsync(getBeneficiariosPendentes);
  return {
    pendentes: data ?? [],
    loading,
    error,
    refetch,
  };
};