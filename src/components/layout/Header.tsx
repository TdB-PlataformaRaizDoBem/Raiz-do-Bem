import React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/Button";

import TDB from "../../assets/svgs/TDB_logo.svg";
import Fiap from "../../assets/svgs/fiap.svg";
import Menu from "../../assets/svgs/menu_hamburguer.svg";

const navLinks = [
  { path: "/", label: "Início" },
  { path: "/sobre", label: "Sobre" },
  { path: "/integrantes", label: "Integrantes" },
  { path: "/faq", label: "FAQ" },
  { path: "/contato", label: "Contato" },
];

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  const NavLinkStyle = `
    font-sans text-[1.125rem] relative transition-colors duration-300 
    [&.active]:text-orange [&.active]:font-bold
    [&.active]:after:content-[''] [&.active]:after:absolute [&.active]:after:bottom-[-5px] 
    [&.active]:after:left-0 [&.active]:after:w-full [&.active]:after:h-[2px] 
    [&.active]:after:bg-orange [&.active]:after:rounded-[2px]
  `;

  const NavLinkMobileStyle = `
    font-sans text-[1.125rem] relative inline-block py-2 [&.active]:text-orange [&.active]:font-bold 
    [&.active]:after:content-[''] [&.active]:after:absolute [&.active]:after:bottom-0 
    [&.active]:after:left-1/2 [&.active]:after:-translate-x-1/2 
    [&.active]:after:w-12 [&.active]:after:h-[2px] [&.active]:after:bg-orange
  `;

  return (
    <header className="bg-cream h-[100px] flex items-center px-[5vw] gap-5 relative">
      <div className="flex place-items-center gap-4 shrink-0">
        <NavLink to="/" className="flex items-center">
          <img
            src={TDB}
            alt="Turma do Bem"
            className="w-[100px] sm:w-[120px] h-auto block pb-4"
          />
        </NavLink>


        <div className="hidden md:flex items-center gap-4">
          <span className="w-[1.5px] h-[60px] bg-black/20" />
          <img
            src={Fiap}
            alt="Logo Fiap"
            className="w-[90px] sm:w-[120px] h-auto block"
          />
        </div>
      </div>

      <nav className="hidden xl:block mx-auto">
        <ul className="flex gap-10">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink to={link.path} className={NavLinkStyle}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="hidden xl:flex gap-[15px]">
        <Button>Seja Voluntário</Button>
        <Button>Entrar</Button>
      </div>

      {/* Mobile */}
      <button
        className="xl:hidden ml-auto"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <img src={Menu} alt="Menu" className="w-6" />
      </button>

      {isOpen && (
        <nav className="xl:hidden flex flex-col absolute top-[100px] left-0 w-full text-center py-8 z-10 bg-darkgreen/85 backdrop-blur-md shadow-lg">
          <ul className="flex flex-col gap-5 mb-6 text-white">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={NavLinkMobileStyle}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex justify-center gap-[30px]">
            <Button size="sm">Seja Voluntário</Button>
            <Button size="sm">Entrar</Button>
          </div>
        </nav>
      )}
    </header>
  );
}
