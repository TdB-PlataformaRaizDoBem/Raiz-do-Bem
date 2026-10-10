import { Outlet } from "react-router-dom";
import { Header } from "../components/header/Header";
import Footer from "../components/footer/Footer";

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1000] focus:rounded-lg focus:bg-darkgreen focus:px-4 focus:py-2 focus:font-bold focus:text-white focus:outline-none focus:ring-2 focus:ring-white"
      >
        Ir para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className="focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const AuthLayout = () => {
  return (
    <main className="min-h-screen bg-white">
      <Outlet />
    </main>
  );
};
