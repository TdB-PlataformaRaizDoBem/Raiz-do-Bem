import React, { forwardRef } from 'react';

type TextAreaProps = React.ComponentProps<'textarea'> & {
  label: string;
  error?: string | null;
  labelClassName?: string;
  errorClassName?: string;
  /** Quantos caracteres já foram digitados. Com `maxLength`, mostra o contador "atual/máximo" ao vivo. */
  caracteres?: number;
};

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      labelClassName = "text-white",
      errorClassName = "text-white",
      caracteres,
      className,
      ...rest
    },
    ref
  ) => {
    const errorId = error ? `${rest.name}-error` : undefined;
    const limite = rest.maxLength;
    const contadorId = limite ? `${rest.name}-contador` : undefined;
    const atual = caracteres ?? 0;
    const noLimite = limite !== undefined && atual >= limite;
    const describedBy = [errorId, contadorId].filter(Boolean).join(" ") || undefined;
    const baseStyleTextarea = `
      border 
      border-gray-200
      block
      w-full
      text-base
      p-3
      rounded-md 
      bg-gray-200
      transition
      focus:outline-none 
      hover:border-[#fb1]
      hover:bg-white
      hover:shadow-[0_0_0_3px_#fea]
      resize-none
      ${error ? 'border-red-600 shadow-[0_0_0_1px_red]' : ''}
      ${className || ''}
    `;

    return (
      <div className="mb-4">
        <label
          htmlFor={rest.name}
          className={`block mb-1 font-medium ${labelClassName}`}
        >
          {label}
        </label>

        <textarea
          {...rest}
          id={rest.name}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={baseStyleTextarea}
        />

        {limite !== undefined && (
          <div className={`mt-1 flex justify-between gap-2 text-xs ${labelClassName}`}>
            <span id={contadorId}>Máximo de {limite} caracteres</span>
            <span aria-hidden="true" data-testid={`${rest.name}-contagem`} className={noLimite ? "font-bold" : ""}>
              {atual}/{limite}
            </span>
          </div>
        )}

        {error && (
          <p id={errorId} role="alert" className={`text-sm mt-1 ${errorClassName}`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;