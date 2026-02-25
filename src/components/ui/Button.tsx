import React from "react";

type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
}

export function Button({
  children,
  size = "md",
  className = "",
  ...rest
}: ButtonProps) {
  const sizes: Record<Size, string> = {
    sm: "px-5 py-2 text-sm",
    md: "px-8 py-3 text-base",
  };

  return (
    <button
      className={`
        bg-[var(--color-orange)]
        text-[var(--color-white)]
        rounded-lg
        font-semibold
        transition-all
        duration-300
        hover:bg-[#e07c1c]
        px-[15px]
        py-[10px]
        ${sizes[size]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
}
