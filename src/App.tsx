import React, { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  matchRoutes,
} from 'react-router-dom';
import { routes, type AppRoute } from './Routes/Routes';
import { AuthLayout, PublicLayout } from './layout/Layout';
import { ProtectedRoutes } from './Routes/ProtectedRoutes';
import { DESCRICAO_PADRAO, NOME_DO_SITE, tituloDaAba } from './Routes/titulos';
import ScrollToTop from './layout/ScrollToTop';
import { NotificationProvider } from './components/context/NotificationProvider';
import { AuthProvider } from './context/AuthContext';
import { SpeechProvider } from './context/SpeechContext';
import FullScreenLoader from './components/ui/FullScreenLoader';
import { queryClient } from './lib/queryClient';

// Layout da área logada: fora do bundle de entrada (ver comentário em layout/AppLayout.tsx).
const AppLayout = lazy(() => import('./layout/AppLayout').then((m) => ({ default: m.AppLayout })));
const Login     = lazy(() => import('./pages/login/Login'));
const Admin     = lazy(() => import('./pages/admin/Admin'));
const Coord     = lazy(() => import('./pages/coord/Coord'));
const Forbidden = lazy(() => import('./pages/forbidden/Forbidden'));
const NaoEncontrada = lazy(() => import('./pages/naoEncontrada/NaoEncontrada'));

const AppRoutes = () => {
  const location = useLocation();

  // A aba do navegador sempre acompanha a página aberta: pública (título em Routes.tsx) ou
  // qualquer outra (login, 403, área logada, rota inexistente — ver Routes/titulos.ts).
  React.useEffect(() => {
    const matches = matchRoutes(routes, location);
    const descricao = document.querySelector('meta[name="description"]');

    if (matches) {
      const lastMatch = matches[matches.length - 1].route as AppRoute;
      document.title = lastMatch.title || NOME_DO_SITE;
      if (lastMatch.description) descricao?.setAttribute('content', lastMatch.description);
      return;
    }

    document.title = tituloDaAba(location.pathname);
    descricao?.setAttribute('content', DESCRICAO_PADRAO);
  }, [location]);

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>

        {/* Rotas públicas (sem autenticação) */}
        <Route element={<PublicLayout />}>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          {/* Endereço que não existe: aviso com o cabeçalho e o rodapé do site, em vez de tela em branco */}
          <Route path="*" element={<NaoEncontrada />} />
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
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <SpeechProvider>
          <NotificationProvider>
            <ScrollToTop />
            <AppRoutes />
          </NotificationProvider>
        </SpeechProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
