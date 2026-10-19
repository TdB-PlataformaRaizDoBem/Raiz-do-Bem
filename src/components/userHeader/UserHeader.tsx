import { useLocation } from "react-router-dom";
import { TITULO_NAO_ENCONTRADA, tituloDaPaginaInterna } from "../../Routes/titulos";

const UserHeader = () => {
  const location = useLocation();
  // Mesmo nome usado na aba do navegador (Routes/titulos.ts), sem esperar um render a mais.
  const title = tituloDaPaginaInterna(location.pathname) ?? TITULO_NAO_ENCONTRADA;

  // "admin" e "coord" são nomes de endereço; quem usa a plataforma lê o nome da área.
  const area = location.pathname.split("/")[1]?.toLowerCase();
  const context = area === "admin" ? "Administração" : area === "coord" ? "Coordenação" : "Plataforma";

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
        [word-spacing:0.12em]
      ">
        {title}
      </h1>

      {/* Barra decorativa laranja abaixo do título */}
      <div className="mt-3 lg:mt-4 h-[6px] lg:h-[8px] w-14 lg:w-24 bg-orange rounded-full" />
    </header>
  );
};

export default UserHeader;
