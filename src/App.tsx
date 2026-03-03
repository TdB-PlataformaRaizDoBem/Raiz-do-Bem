import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  matchRoutes,
} from "react-router-dom";
import { routes, type AppRoute } from "./Routes/Routes";
import { AppLayout, AuthLayout, PublicLayout } from "./layout/Layout";
import { ProtectedRoutes } from "./Routes/ProtectedRoutes"

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    const matches = matchRoutes(routes, location);

    if (matches) {
      const lastMatch = matches[matches.length - 1].route as AppRoute;
      document.title = lastMatch.title || "Raiz do Bem";
    }
  }, [location]);

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<div>Página de Login</div>} />
      </Route>

      <Route element={<ProtectedRoutes />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/*" element={<div>Admin</div>} />
          <Route path="/coord/*" element={<div>Coordenador</div>} />
        </Route>
      </Route>
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
