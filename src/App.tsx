import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  matchRoutes,
} from "react-router-dom";
import { routes, type AppRoute } from "./Routes/Routes";
import { AppLayout, AuthLayout, PublicLayout } from "./layout/Layout";
import { ProtectedRoutes } from "./Routes/ProtectedRoutes";
import ScrollToTop from "./layout/ScrollToTop";
import Login from "./pages/login/Login";
import Admin from "./pages/admin/Admin";
import Coord from "./pages/coord/Coord";
import { NotificationProvider } from "./components/context/NotificationProvider";

const AppRoutes = () => {
  const location = useLocation();

  React.useEffect(() => {
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
        <Route path="login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoutes />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/coord/*" element={<Coord />} />
        </Route>
      </Route>
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <NotificationProvider>
      <ScrollToTop />
      <AppRoutes />
    </NotificationProvider>
  </BrowserRouter>
);

export default App;
