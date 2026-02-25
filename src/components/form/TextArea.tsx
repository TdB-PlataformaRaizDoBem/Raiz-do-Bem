import React from 'react'

type TextAreaProps = React.ComponentProps<'textarea'> & {
  label: string;
  error?: string | null;
};

const TextArea = ({label, error, ...rest}: TextAreaProps) => {

  const BaseStyleTextarea = `
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
  `

  return (
    <div className='mb-4'>
      <label htmlFor={rest.name} className='block mb-[5px]'>{label}</label>
      <textarea 
      id={rest.name}
      className={BaseStyleTextarea}
      />

    {error && (
        <p className='text-red-600 text-sm mt-1'>
          {error}
        </p>
    )}
    </div>
  )
}

export default TextArea