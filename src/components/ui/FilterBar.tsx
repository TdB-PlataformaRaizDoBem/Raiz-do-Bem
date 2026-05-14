import React from "react";

interface FilterBarProps {
  children: React.ReactNode;
}

export const FilterBar = ({
  children,
}: FilterBarProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!React.Children.count(children)) {
    return null;
  }

  return (
    <div className="relative">
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

          rounded-md

          text-sm font-medium text-gray-700

          hover:bg-gray-50
          hover:border-gray-400

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
            absolute
            top-12
            left-0
            z-50
            w-[320px]
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