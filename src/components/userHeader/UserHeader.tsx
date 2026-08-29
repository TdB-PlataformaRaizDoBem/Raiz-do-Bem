import React from "react";
import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/coord/dashboard": "Dashboard",
  "/admin/colaboradores": "Gerenciar Colaboradores",
  "/admin/dentistas": "Gerenciar Dentistas",
  "/coord/dentistas": "Gerenciar Dentistas",
  "/admin/beneficiarios": "Gerenciar Beneficiários",
  "/coord/beneficiarios": "Gerenciar Beneficiários",
  "/admin/solicitacoes": "Pedidos de Ajuda",
  "/coord/solicitacoes": "Pedidos de Ajuda",
  "/admin/atendimento": "Gerenciar Atendimentos",
  "/coord/atendimento": "Gerenciar Atendimentos",
};

const UserHeader = () => {
  const [title, setTitle] = React.useState<string>("");
  const location = useLocation();

  React.useEffect(() => {
    const currentTitle = titles[location.pathname] || "Página Não Encontrada";
    setTitle(currentTitle);
  }, [location.pathname]);

  const context = location.pathname.split("/")[1] || "Plataforma";

  return (
    <header className="mb-8 lg:mb-10">
      <span className="text-[10px] lg:text-[11px] uppercase tracking-[0.18em] text-gray-400 font-bold mb-1.5 block">
        Raiz do Bem / {context}
      </span>

      <h1 className="
        font-fredoka font-bold text-black uppercase tracking-tighter
        text-3xl md:text-4xl lg:text-5xl xl:text-6xl
        leading-none
        relative
      ">
        {title}
      </h1>

      {/* Barra decorativa laranja abaixo do título */}
      <div className="mt-3 lg:mt-4 h-[6px] lg:h-[8px] w-14 lg:w-24 bg-orange rounded-full" />
    </header>
  );
};

export default UserHeader;
