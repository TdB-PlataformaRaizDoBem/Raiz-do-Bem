import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

import TDB from '../../assets/svgs/TDB_logo.svg'
import Fiap from '../../assets/svgs/fiap.svg'
import Menu from '../../assets/svgs/menu_hamburguer.svg';

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header
      className="
        bg-[var(--color-cream)]
        h-[100px]
        flex
        items-center
        flex-wrap
        px-[5vw]
        gap-5
        relative
      "
    >
      <Link
        to="/"
        className="flex items-center"
        aria-label="Página inicial - Turma do Bem"
      >
        <img
          src={TDB}
          alt="Turma do Bem"
          className="w-[90px] h-[38px] sm:w-[120px] sm:h-[50px]"
        />
        <span className="inline-block w-[2px] h-[50px] mx-5 bg-[#333]" />
      </Link>

      <img
        src={Fiap}
        alt="Logo Fiap"
        className="w-[90px] h-[38px] sm:w-[100px] sm:h-[80px]"
      />

      <nav className="hidden xl:block mx-auto">
        <ul className="flex gap-10">
          <li><Link to="/" className="text-[1.125rem]">Início</Link></li>
          <li><Link to="/sobre" className="text-[1.125rem]">Sobre</Link></li>
          <li><Link to="/integrantes" className="text-[1.125rem]">Integrantes</Link></li>
          <li><Link to="/faq" className="text-[1.125rem]">FAQ</Link></li>
          <li><Link to="/contato" className="text-[1.125rem]">Contato</Link></li>
        </ul>
      </nav>

      <div className="hidden xl:flex">
        <Button className="mr-[15px]">
          Seja Voluntário
        </Button>

        <Button>
          Entrar
        </Button>
      </div>

      {/* Mobile */}
      <button
        className="xl:hidden ml-auto"
        aria-label="Abrir menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src={Menu}
          alt="Menu"
          className="w-6"
        />
      </button>

      {isOpen && (
        <nav
          className="
            xl:hidden
            flex
            flex-col
            absolute
            top-[80px]
            right-0
            w-full
            text-center
            py-8
            z-10
            bg-[rgba(11,61,51,0.8)]
            backdrop-blur-md
            shadow-lg
          "
        >
          <ul className="flex flex-col gap-5 mb-6 text-white">
            <li><Link to="/">Início</Link></li>
            <li><Link to="/sobre">Sobre</Link></li>
            <li><Link to="/integrantes">Integrantes</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contato">Contato</Link></li>
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