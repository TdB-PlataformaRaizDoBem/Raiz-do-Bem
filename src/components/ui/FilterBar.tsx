import React, { useEffect, useRef, useState } from "react";

interface FilterBarProps {
  children: React.ReactNode;
}

export const FilterBar = ({
  children,
}: FilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Fecha ao clicar fora (botão ou dropdown) — inclusive no mobile, onde o
   * dropdown é `fixed` e some visualmente do botão, mas continua dentro
   * deste contêiner no DOM. */
  useEffect(() => {
    if (!isOpen) return;

    const aoClicarFora = (evento: MouseEvent) => {
      if (!containerRef.current?.contains(evento.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [isOpen]);

  if (!React.Children.count(children)) {
    return null;
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Botão */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          h-10
          px-4

          flex items-center gap-2

          border border-gray-300
          bg-white

          rounded-lg

          text-sm font-medium text-gray-700

          hover:bg-gray-50
          hover:border-gray-400

          focus-visible:ring-2 focus-visible:ring-orange/30 focus-visible:outline-none

          transition-colors
        "
      >
        <span>Filtros</span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`
            w-4 h-4
            transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            fixed left-1/2 top-21 z-50 w-[calc(100vw-2rem)] max-w-[320px] -translate-x-1/2

            md:absolute md:top-12 md:left-0 md:translate-x-0 md:w-[320px] md:max-w-none

            bg-white
            border border-gray-200
            rounded-md
            shadow-md
            p-4
            flex flex-col
            gap-4
          "
        >
          {children}
        </div>
      )}
    </div>
  );
};