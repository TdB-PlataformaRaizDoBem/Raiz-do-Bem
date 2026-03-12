import React from "react";
import Search from "./Search";

interface FilterBarProps {
  children: React.ReactNode;
  searchLabel?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
}

export const FilterBar = ({
  children,
  onSearchChange,
  searchPlaceholder,
}: FilterBarProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-6 mb-10 w-full">
      <div className="flex flex-col gap-4">
        <span className="font-sans text-[1.125rem] font-medium text-gray-700">Opções e Filtros: </span>
        <div className="flex flex-wrap gap-4">{children}</div>
      </div>
      <div className="flex justify-end w-full">
        <div className="w-full m-auto md:max-w-lg"> 
          <Search 
            placeholder={searchPlaceholder || "Pesquisar por nome..."} 
            onChange={onSearchChange} 
          />
        </div>
      </div>
    </div>
  );
};
