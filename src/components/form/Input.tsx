import React from 'react'

type InputProps = React.ComponentProps<'input'> & {
  label: string;
  error?: string | null;
}

const Input = ({ label, error, ...rest }: InputProps) => {

  const baseStyleInput = `
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
  `

  return (
    <div className="mb-4">
      <label 
        htmlFor={rest.name}
        className="block mb-1 font-medium"
      >
        {label}
      </label>

      <input 
        {...rest}
        id={rest.name}
        className={baseStyleInput}
      />

      {error && (
        <p className='text-red-600 text-sm mt-1'>
          {error}
        </p>
      )}
    </div>
  )
}

export default Input