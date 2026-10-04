import React, { forwardRef, useState } from "react";

type InputProps = React.ComponentProps<"input"> & {
  label: string;
  error?: string | null;
  labelClassName?: string;
  errorClassName?: string;
  /** Em campos type="password": exibe botão para mostrar/ocultar o texto. */
  showPasswordToggle?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      labelClassName = "text-black",
      error,
      errorClassName = "text-red-800",
      showPasswordToggle = false,
      className,
      ...inputProps
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const hasToggle = showPasswordToggle && inputProps.type === "password";
    const baseStyleInput = `border border-gray-200 block w-full p-3 rounded-md bg-gray-200 focus:outline-none hover:border-[#fb1] transition-all ${
      error ? "border-red-600" : ""
    } ${hasToggle ? "pr-12" : ""} ${className || ""}`;
    const errorId = error ? `${inputProps.name}-error` : undefined;

    return (
      <div className="mb-4 w-full">
        <label
          htmlFor={inputProps.name}
          className={`block mb-1 font-medium ${labelClassName}`}
        >
          {label}
        </label>
        <div className="relative">
          <input
            {...inputProps}
            type={hasToggle && visible ? "text" : inputProps.type}
            ref={ref}
            id={inputProps.name}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={baseStyleInput}
          />
          {hasToggle && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={visible}
              title={visible ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-darkgreen rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/50"
            >
              {visible ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className={`text-[10px] font-bold mt-1 ${errorClassName}`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;