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
  "/admin/relatorios": "Relatórios e Estátisticas",
  "/coord/relatorios": "Relatórios e Estátisticas",
};

const UserHeader = () => {
  const [title, setTitle] = React.useState<string>("");
  const location = useLocation();

  React.useEffect(() => {
    const currentTitle = titles[location.pathname] || "Página Não Encontrada";
    setTitle(currentTitle);
  }, [location.pathname]);

  const context = location.pathname.split("/")[1] || "Plataforma";

  const titleStyles = `
    relative font-fredoka font-bold text-black uppercase tracking-tighter
    text-3xl md:text-4xl lg:text-5xl xl:text-6xl
    
    after:content-[''] after:block after:rounded-full after:bg-orange
    after:h-[6px] lg:after:h-[8px] 
    after:w-14 lg:after:after:w-24 
    after:mt-3 lg:after:mt-4
  `

  return (
    <header className="mb-8 lg:mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
      <span className="text-[10px] lg:text-[12px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-2 block italic">
        Raiz do Bem / {context}
      </span>

      <div className="flex flex-col gap-2">
        <h1
          className={titleStyles}
        >
          {title}
        </h1>
      </div>
    </header>
  );
};

export default UserHeader;
