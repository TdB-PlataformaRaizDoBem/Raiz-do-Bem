import React, { useState } from "react";
import Search from "./Search";

interface FilterBarProps {
  children: React.ReactNode;
  onSearchChange?: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onClearFilters?: () => void;
}

export const FilterBar = ({
  children,
  onSearchChange,
  searchPlaceholder,
  searchValue,
  onClearFilters,
}: FilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5 mb-8 w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        {/* Área de ações */}
        <div className="relative flex items-center gap-3">

          {/* Botão de filtros */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="
              flex items-center gap-2
              h-11
              px-4
              border border-gray-300
              bg-white
              hover:bg-gray-50
              hover:border-gray-400
              rounded-lg
              transition-all duration-200
              text-sm font-medium text-gray-700
            "
          >
            {/* Ícone */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5h18M6 12h12M10 19h4"
              />
            </svg>

            <span>Filtros</span>

            {/* Seta */}
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

          {/* Limpar filtros */}
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="
                flex items-center justify-center
                w-11 h-11
                border border-gray-300
                rounded-lg
                bg-white
                hover:bg-red-50
                hover:border-red-300
                transition-all duration-200
                text-gray-500 hover:text-red-500
              "
              title="Limpar filtros"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 7h12M9 7V4h6v3m-7 4v6m4-6v6m5 5H7a2 2 0 01-2-2V7h14v12a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          )}

          {/* Dropdown */}
          {isOpen && React.Children.count(children) > 0 && (
            <div
              className="
                absolute top-14 left-0
                z-50
                w-[700px]
                max-w-[95vw]

                bg-white
                border border-gray-200
                rounded-xl
                shadow-xl

                p-6
              "
            >
              {/* Grid dos filtros */}
              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  gap-5
                "
              >
                {children}
              </div>
            </div>
          )}
        </div>

        {/* Busca */}
        <div className="w-full lg:max-w-md">
          <Search
            placeholder={
              searchPlaceholder || "Pesquisar..."
            }
            onChange={onSearchChange}
            value={searchValue}
          />
        </div>
      </div>
    </div>
  );
};