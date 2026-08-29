import React from "react";
import { Link, NavLink } from "react-router-dom";

import TDB  from "../../assets/svgs/TDB_logo.svg";
import Fiap from "../../assets/svgs/fiap.svg";
import Menu from "../../assets/svgs/menu_hamburguer.svg";

const navLinks = [
  { path: "/",           label: "Início" },
  { path: "/sobre",      label: "Sobre" },
  { path: "/integrantes",label: "Integrantes" },
  { path: "/faq",        label: "FAQ" },
  { path: "/contato",    label: "Contato" },
];

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  const close = () => setIsOpen(false);

  const navLinkStyle = `
    font-sans text-[1.125rem] relative transition-colors duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 rounded
    [&.active]:text-orange [&.active]:font-bold
    [&.active]:after:content-[''] [&.active]:after:absolute [&.active]:after:bottom-[-5px]
    [&.active]:after:left-0 [&.active]:after:w-full [&.active]:after:h-[2px]
    [&.active]:after:bg-orange [&.active]:after:rounded-[2px]
  `;

  const navLinkMobileStyle = `
    font-sans text-[1.125rem] relative inline-block py-2
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 rounded
    [&.active]:text-orange [&.active]:font-bold
    [&.active]:after:content-[''] [&.active]:after:absolute [&.active]:after:bottom-0
    [&.active]:after:left-1/2 [&.active]:after:-translate-x-1/2
    [&.active]:after:w-12 [&.active]:after:h-[2px] [&.active]:after:bg-orange
  `;

  const ctaStyle = `
    bg-orange text-white rounded-lg font-semibold
    transition-all duration-200 motion-safe:hover:-translate-y-0.5 active:scale-95
    hover:bg-[#e07c1c] px-[15px] py-[10px]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50
  `;

  return (
    <header className="bg-cream h-[70px] sm:h-[100px] w-full flex items-center sticky top-0 z-50 border-b-2 border-lightgreen">
      <div className="container mx-auto px-6 md:px-4 flex items-center justify-between relative h-full">

        {/* Logos */}
        <div className="flex items-center gap-4 shrink-0">
          <NavLink to="/" className="flex items-center" aria-label="Ir para página inicial">
            <img
              src={TDB}
              alt="Turma do Bem"
              className="w-[100px] sm:w-[120px] h-auto block pb-4"
            />
          </NavLink>
          <div className="hidden md:flex items-center gap-4">
            <span className="w-[1.5px] h-[60px] bg-black/20" aria-hidden="true" />
            <img src={Fiap} alt="FIAP" className="w-[90px] sm:w-[120px] h-auto block" />
          </div>
        </div>

        {/* Nav Desktop */}
        <nav className="hidden xl:block mx-auto" aria-label="Navegação principal">
          <ul className="flex gap-10">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink to={link.path} end={link.path === "/"} className={navLinkStyle}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTAs Desktop */}
        <div className="hidden xl:flex gap-[15px]">
          <Link to="/voluntario" className={ctaStyle}>
            Seja um Voluntário
          </Link>
          <Link to="/auth/login" className={ctaStyle}>
            Entrar
          </Link>
        </div>

        {/* Hamburguer Mobile */}
        <button
          className="xl:hidden ml-auto p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          <img src={Menu} alt="" aria-hidden="true" className="w-6" />
        </button>

        {/* Nav Mobile */}
        {isOpen && (
          <nav
            id="mobile-nav"
            className="xl:hidden flex flex-col fixed top-[70px] sm:top-[100px] left-0 w-screen text-center py-8 z-50 bg-darkgreen shadow-lg"
            aria-label="Navegação mobile"
          >
            <ul className="flex flex-col gap-5 mb-6 text-white">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    end={link.path === "/"}
                    className={navLinkMobileStyle}
                    onClick={close}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="flex justify-center gap-[30px]">
              <Link to="/voluntario" className={ctaStyle} onClick={close}>
                Seja um Voluntário
              </Link>
              <Link to="/auth/login" className={ctaStyle} onClick={close}>
                Entrar
              </Link>
            </div>
          </nav>
        )}

      </div>
    </header>
  );
}
