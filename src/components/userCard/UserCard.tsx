import React, { type ReactNode } from 'react'

type CardProps = {
  children: ReactNode;
  className?: string
}

const UserCard = ({ children, className } : CardProps) => {
  return (
    <div className={`border-l-4 border-lightgreen p-6 lg:grid lg:grid-cols-2 lg:h-28 lg:items-center bg-lightgray transition-all hover:shadow-md ${className}`}>
      {children}
    </div>
  )
}

export default UserCard