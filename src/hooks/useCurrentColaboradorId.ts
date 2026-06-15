import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getColaboradoresCompletos } from '../services/ColaboradorService';

/**
 * Resolve o ID do colaborador logado comparando user.email com a lista
 * retornada por GET /colaborador. Retorna null enquanto a busca está em
 * andamento ou se o e-mail não for encontrado.
 */
export function useCurrentColaboradorId(): number | null {
  const { user } = useAuth();
  const [id, setId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.email) return;

    let cancelled = false;

    getColaboradoresCompletos()
      .then((list) => {
        if (cancelled) return;
        const found = list.find((c) => c.email === user.email);
        setId(found?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  return id;
}
