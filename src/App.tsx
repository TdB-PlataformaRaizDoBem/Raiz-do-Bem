import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  matchRoutes,
} from 'react-router-dom';
import { routes, type AppRoute } from './Routes/Routes';
import { AppLayout, AuthLayout, PublicLayout } from './layout/Layout';
import { ProtectedRoutes } from './Routes/ProtectedRoutes';
import ScrollToTop from './layout/ScrollToTop';
import { NotificationProvider } from './components/context/NotificationProvider';
import { AuthProvider } from './context/AuthContext';
import FullScreenLoader from './components/ui/FullScreenLoader';

const Login     = lazy(() => import('./pages/login/Login'));
const Admin     = lazy(() => import('./pages/admin/Admin'));
const Coord     = lazy(() => import('./pages/coord/Coord'));
const Forbidden = lazy(() => import('./pages/forbidden/Forbidden'));

const AppRoutes = () => {
  const location = useLocation();

  React.useEffect(() => {
    const matches = matchRoutes(routes, location);
    if (matches) {
      const lastMatch = matches[matches.length - 1].route as AppRoute;
      document.title = lastMatch.title || 'Raiz do Bem';
    }
  }, [location]);

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>

        {/* Rotas públicas (sem autenticação) */}
        <Route element={<PublicLayout />}>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Autenticação */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>

        {/* Página de acesso proibido */}
        <Route path="/403" element={<Forbidden />} />

        {/* Rotas protegidas — apenas ADMIN */}
        <Route element={<ProtectedRoutes allowedRoles={['ADMIN']} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/*" element={<Admin />} />
          </Route>
        </Route>

        {/* Rotas protegidas — ADMIN e COLABORADOR (coordenadores) */}
        <Route element={<ProtectedRoutes allowedRoles={['ADMIN', 'COLABORADOR']} />}>
          <Route element={<AppLayout />}>
            <Route path="/coord/*" element={<Coord />} />
          </Route>
        </Route>

      </Routes>
    </Suspense>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <ScrollToTop />
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
