import React, { forwardRef } from "react";

type InputProps = React.ComponentProps<"input"> & {
  label: string;
  error?: string | null;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...rest }, ref) => {
    const baseStyleInput = `border border-gray-200 block w-full p-3 rounded-md bg-gray-200 focus:outline-none hover:border-[#fb1] transition-all ${error ? "border-red-600" : ""}`;

    return (
      <div className="mb-4">
        <label
          htmlFor={rest.name}
          className="block mb-1 font-medium text-white"
        >
          {label}
        </label>
        <input
          {...rest}
          ref={ref}
          id={rest.name}
          className={baseStyleInput}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
