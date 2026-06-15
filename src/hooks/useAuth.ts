import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/auth';

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      '[useAuth] Deve ser usado dentro de <AuthProvider>.\n' +
        'Verifique se <AuthProvider> envolve o componente que chama useAuth().',
    );
  }
  return ctx;
}

export type { AuthUser } from '../domain/types/auth';
