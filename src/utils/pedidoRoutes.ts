import type { UserRole } from "../domain/types/auth";

/**
 * Endereço da tela de Pedidos de Ajuda já com o modal de um pedido aberto
 * (a tela lê o parâmetro `?id=`). Administrador usa `/admin`; os demais perfis, `/coord`.
 */
export function caminhoDoPedido(role: UserRole | undefined, id: number): string {
  const base = role === "ADMIN" ? "/admin" : "/coord";
  return `${base}/solicitacoes?id=${id}`;
}
