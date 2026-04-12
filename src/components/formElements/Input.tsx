import React, { forwardRef } from "react";

type InputProps = React.ComponentProps<"input"> & {
  label: string;
  error?: string | null;
  labelClassName?: string;
  errorClassName?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      labelClassName = "text-black",
      error,
      errorClassName = "text-red-500",
      className,
      ...inputProps
    },
    ref
  ) => {
    const baseStyleInput = `border border-gray-200 block w-full p-3 rounded-md bg-gray-200 focus:outline-none hover:border-[#fb1] transition-all ${
      error ? "border-red-600" : ""
    } ${className || ""}`;

    return (
      <div className="mb-4 w-full">
        <label
          htmlFor={inputProps.name}
          className={`block mb-1 font-medium ${labelClassName}`}
        >
          {label}
        </label>
        <input
          {...inputProps}
          ref={ref}
          id={inputProps.name}
          className={baseStyleInput}
        />
        {error && <p className={`text-[10px] font-bold mt-1 ${errorClassName}`}>{error}</p>}
      </div>  
    );
  }
);

Input.displayName = "Input";
export default Input;