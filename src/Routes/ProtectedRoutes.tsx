import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../domain/types/auth';
import FullScreenLoader from '../components/ui/FullScreenLoader';

interface ProtectedRoutesProps {
  /**
   * Roles com permissão para as rotas filhas.
   * Se omitido, qualquer usuário autenticado tem acesso.
   */
  allowedRoles?: UserRole[];
}

export const ProtectedRoutes = ({ allowedRoles }: ProtectedRoutesProps) => {
  const { isLoading, isAuthenticated, user } = useAuth();

  // 1. Inicialização em curso — aguarda verificação client-side do token
  //    (síncrona nesta versão, mas isLoading=true durante o tick inicial do React)
  if (isLoading) {
    return <FullScreenLoader />;
  }

  // 2. Sem sessão — F5, token expirado ou nunca logou
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 3. Role insuficiente para esta rota específica
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // 4. Autenticado e autorizado
  return <Outlet />;
};
