import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getColaboradoresCompletos } from '../services/ColaboradorService';
import { queryKeys } from './queryKeys';

/** Id do colaborador logado (o JWT só traz o e-mail). `null` se não encontrado. */
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
