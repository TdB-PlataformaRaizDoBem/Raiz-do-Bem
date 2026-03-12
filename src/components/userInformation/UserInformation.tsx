import React, { type ReactNode } from 'react'

type InformationProps = {
  children: ReactNode;
}

const UserInformation = ({children} : InformationProps) => {
  return (
    <div className='flex flex-col border-t-4 border-lightgreen bg-lightgray xl:min-h-[650px] p-6 pb-0 relative xl:min-h-[650px] min-h-full z-50'>
      {children}
    </div>
  )
}

export default UserInformation