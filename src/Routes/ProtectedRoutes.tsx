import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoutes = () => {
  const isAuthenticated = !!localStorage.getItem('@RaizDoBem:token'); 
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};