import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBeneficiariosCompletos } from "../services/Beneficiarioservice";
import { getPedidosCompletos, type PedidoCompleto } from "../services/PedidoService";
import { queryKeys } from "./queryKeys";
import { useDomainQuery, type DomainQueryState } from "./useDomainQuery";

/** Pedidos de ajuda (GET /pedido-ajuda). Só leitura: escritas ficam em `PedidoService` e invalidam o cache. */
export const usePedidos = () =>
  useDomainQuery<PedidoCompleto[]>({
    queryKey: queryKeys.pedidos,
    queryFn: getPedidosCompletos,
  });

/** Pedido por id (seleciona da lista em cache; não há GET por id). */
export const usePedido = (id: number) =>
  useDomainQuery<PedidoCompleto[], PedidoCompleto | null>({
    queryKey: queryKeys.pedidos,
    queryFn: getPedidosCompletos,
    select: (lista) => lista.find((p) => p.id === id) ?? null,
  });

/** Pedidos APROVADOS que ainda não viraram beneficiário. */
export const usePedidosAprovadosLivres = (): DomainQueryState<PedidoCompleto[]> => {
  const pedidos = usePedidos();
  const beneficiarios = useQuery({ queryKey: queryKeys.beneficiarios, queryFn: getBeneficiariosCompletos });

  const livres = useMemo(() => {
    if (!pedidos.data) return null;
    const vinculados = new Set(
      (beneficiarios.data ?? []).map((b) => b.pedido?.id).filter(Boolean) as number[],
    );
    return pedidos.data.filter((p) => p.statusAPI === "APROVADO" && !vinculados.has(p.id));
  }, [pedidos.data, beneficiarios.data]);

  const loading = pedidos.loading || (beneficiarios.isPending && beneficiarios.fetchStatus !== "idle");

  return {
    status: pedidos.error ? "error" : loading || !livres ? "loading" : "success",
    data: livres,
    error: pedidos.error,
    loading,
    refetch: () => Promise.all([pedidos.refetch(), beneficiarios.refetch({ cancelRefetch: false })]),
  };
};
