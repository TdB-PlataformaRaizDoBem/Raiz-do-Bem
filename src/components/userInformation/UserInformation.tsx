import React, { type ReactNode } from "react";

type InformationProps = {
  children: ReactNode;
};

const UserInformation = ({ children }: InformationProps) => {
  return (
    <div
      className="
      flex flex-col
      w-full max-w-full
      xl:min-w-[500px]
      border-t-4 border-lightgreen
      bg-lightgray
      p-6 pb-0
      relative
      xl:min-h-[550px]
      min-h-full
      z-50
      max-h-[90vh]
      overflow-hidden
      "
    >
      {children}
    </div>
  );
};

export default UserInformation;