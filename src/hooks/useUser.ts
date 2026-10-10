import { useAuth } from './useAuth';
import type { AuthUser } from './useAuth';

/** Atalho para `useAuth().user`. */
export function useUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}


/** @deprecated Sempre retorna null. Use `useUser()`. */
export function getUser(): AuthUser | null {
  if (import.meta.env.DEV) {
    console.warn(
      '[getUser] Função deprecada. Use o hook useUser() ou useAuth() em componentes React.',
    );
  }
  return null;
}
