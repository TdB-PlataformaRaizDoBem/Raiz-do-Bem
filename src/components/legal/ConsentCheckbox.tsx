import React, { forwardRef } from "react";

type ConsentCheckboxProps = Omit<React.ComponentProps<"input">, "type" | "children"> & {
  /** Texto da autorização; pode conter links para os termos. */
  children: React.ReactNode;
  error?: string | null;
  /** `dark` para fundo verde-escuro (formulário de pedido de ajuda). */
  tone?: "light" | "dark";
};

/**
 * Caixa de seleção de consentimento. Nasce desmarcada (nunca pré-marcada), tem o texto como rótulo clicável,
 * alvo de toque de 24 px e liga a mensagem de erro por `aria-describedby`.
 */
const ConsentCheckbox = forwardRef<HTMLInputElement, ConsentCheckboxProps>(
  ({ children, error, tone = "light", className, ...rest }, ref) => {
    const id = rest.name;
    const errorId = error ? `${id}-error` : undefined;
    const dark = tone === "dark";

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-3">
          <input
            {...rest}
            ref={ref}
            id={id}
            type="checkbox"
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={`mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-orange-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 ${className ?? ""}`}
          />
          <label htmlFor={id} className={`cursor-pointer text-sm leading-relaxed ${dark ? "text-white" : "text-black"}`}>
            {children}
          </label>
        </div>
        {error && (
          <p id={errorId} role="alert" className={`pl-9 text-xs font-bold ${dark ? "text-white" : "text-red-800"}`}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

ConsentCheckbox.displayName = "ConsentCheckbox";
export default ConsentCheckbox;
