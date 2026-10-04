import React from "react";

type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  variant?: Variant;
}

type Variant = "primary" | "danger" | "secondary" | "outline";

const variants: Record<Variant, string> = {
  primary: "bg-orange text-white hover:bg-[#e07c1c]",
  danger: "bg-red-500 text-white hover:bg-red-600",
  secondary: "bg-darkgreen hover:bg-green-800 text-white",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400",
};

export function Button({
  children,
  size = "md",
  variant = "primary",
  className = "",
  ...rest
}: ButtonProps) {
  const sizes: Record<Size, string> = {
    sm: "px-4 py-1.5 text-xs",
    md: "h-10 px-4 text-sm",
  };

  return (
    <button
      className={`
        rounded-lg
        font-semibold
        transition-all
        duration-300
        min-w-0
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-orange/50
        focus-visible:ring-offset-1
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
