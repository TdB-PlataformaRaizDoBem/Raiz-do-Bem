import React, { forwardRef } from 'react';

type TextAreaProps = React.ComponentProps<'textarea'> & {
  label: string;
  error?: string | null;
  labelClassName?: string;
};

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, ...rest }, ref) => {
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
    `;

    return (
      <div className="mb-4">
        <label htmlFor={rest.name} className="block mb-1 font-medium text-white">
          {label}
        </label>
        
        <textarea
          {...rest}
          id={rest.name}
          ref={ref}
          className={baseStyleTextarea}
        />

        {error && (
          <p className="text-red-600 text-sm mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;