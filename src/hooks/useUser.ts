import { useAuth } from './useAuth';
import type { AuthUser } from './useAuth';

/** Retorna o perfil público do usuário autenticado, ou null se não autenticado. */
export function useUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}


export function getUser(): AuthUser | null {
  if (import.meta.env.DEV) {
    console.warn(
      '[getUser] Função deprecada. Use o hook useUser() ou useAuth() em componentes React.',
    );
  }
  return null;
}
