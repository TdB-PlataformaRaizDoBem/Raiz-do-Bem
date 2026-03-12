import React from "react";

type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  variant?: Variant;
}

type Variant = "primary" | "danger" | "secondary";

const variants: Record<Variant, string> = {
  primary: "bg-orange text-white hover:bg-[#e07c1c]",
  danger: "bg-red-500 text-white hover:bg-red-600",
  secondary: "bg-darkgreen hover:bg-green-800 text-white",
};

export function Button({
  children,
  size = "md",
  variant = "primary",
  className = "",
  ...rest
}: ButtonProps) {
  const sizes: Record<Size, string> = {
    sm: "px-5 py-2 text-sm",
    md: "px-4 py-3 text-base",
  };

  return (
    <button
      className={`
        rounded-lg
        font-semibold
        transition-all
        duration-300
        min-w-0
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
}
