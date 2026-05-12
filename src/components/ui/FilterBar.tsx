import React from "react";
import Search from "./Search";

interface FilterBarProps {
  children: React.ReactNode;
  searchLabel?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  /** Valor controlado do campo de busca (para filtros inteligentes) */
  searchValue?: string;
}

export const FilterBar = ({
  children,
  onSearchChange,
  searchPlaceholder,
  searchValue,
}: FilterBarProps) => {
  return (
    <div className="flex flex-col gap-6 mb-10 w-full">
      {/* Linha superior: busca */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-sans text-[1.125rem] font-medium text-gray-700">
            Opções e Filtros:
          </span>
        </div>
        <div className="flex justify-end w-full">
          <div className="w-full m-auto md:max-w-lg">
            <Search
              placeholder={searchPlaceholder || "Pesquisar por nome..."}
              onChange={onSearchChange}
              value={searchValue}
            />
          </div>
        </div>
      </div>

      {/* Linha dos filtros contextuais */}
      {React.Children.count(children) > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">
          {children}
        </div>
      )}
    </div>
  );
};
