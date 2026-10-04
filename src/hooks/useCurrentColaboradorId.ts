import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getColaboradoresCompletos } from '../services/ColaboradorService';
import { queryKeys } from './queryKeys';

/**
 * Resolve o ID do colaborador logado comparando user.email com a lista
 * retornada por GET /colaborador (a mesma que a tela de colaboradores usa).
 * Retorna null enquanto a busca está em andamento ou se o e-mail não for encontrado.
 */
export function useCurrentColaboradorId(): number | null {
  const { user } = useAuth();
  const email = user?.email;

  const { data } = useQuery({
    queryKey: queryKeys.colaboradores,
    queryFn: getColaboradoresCompletos,
    select: (lista) => lista.find((c) => c.email === email)?.id ?? null,
    enabled: !!email,
  });

  return data ?? null;
}
