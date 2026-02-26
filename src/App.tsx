import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, matchRoutes } from "react-router-dom";
import { routes, type AppRoute } from "./Routes/Routes";

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    const matches = matchRoutes(routes, location);

    if(matches) {
      const lastMatch = matches[matches.length -1].route as AppRoute;
      document.title = lastMatch.title || 'Raiz do Bem';
    }
  }, [location])
  

  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
    </Routes>
  );
}

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;