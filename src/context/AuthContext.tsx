import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../services/authService';
import { tokenStore } from '../services/tokenStore';
import { extractAuthUser, isTokenExpired, decodeJwtPayload } from '../services/jwtUtils';
import { registerUnauthenticatedHandler } from '../services/httpClient';
import { AuthContext, type AuthContextValue } from './auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  // tokenStore é síncrono (in-memory) — lazy initializer elimina o useEffect de init.
  const [user, setUser] = useState(() => {
    const token = tokenStore.get();
    if (!token) return null;
    const authUser = extractAuthUser(token);
    if (!authUser) tokenStore.clear();
    return authUser;
  });

  // Sempre false: tokenStore é síncrono, nunca há estado de carregamento.
  const isLoading = false;

  const clearAuthState = useCallback((): void => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const logout = useCallback((): void => {
    clearAuthState();
    navigate('/auth/login', { replace: true });
  }, [clearAuthState, navigate]);

  useEffect(() => {
    registerUnauthenticatedHandler(() => {
      clearAuthState();
      navigate('/auth/login', { replace: true });
    });
  }, [clearAuthState, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = tokenStore.get();
      if (!token) return;

      const payload = decodeJwtPayload(token);
      if (payload && isTokenExpired(payload)) {
        if (import.meta.env.DEV) {
          console.info('[AuthContext] Token expirado detectado — desautenticando.');
        }
        clearAuthState();
        navigate('/auth/login', { replace: true });
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [clearAuthState, navigate]);

  const login = useCallback(
    async (email: string, senha: string): Promise<void> => {
      clearAuthState();

      const { token } = await loginRequest(email, senha);
      const authUser = extractAuthUser(token);

      if (!authUser) {
        throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
      }

      tokenStore.set(token);
      setUser(authUser);

      if (authUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/coord/dashboard', { replace: true });
      }
    },
    [clearAuthState, navigate],
  );

  const contextValue: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
