import { type ReactNode } from "react";

type InformationProps = {
  children: ReactNode;
};

const UserInformation = ({ children }: InformationProps) => {
  return (
    <div
      className="
      flex flex-col
      w-full
      border-t-4 border-lightgreen
      bg-lightgray
      p-4 sm:p-6 pb-0 sm:pb-0
      relative
      rounded-2xl
      lg:rounded-lg
      overflow-hidden
      shadow-2xl
      z-50
      max-h-[90vh]
      "
    >
      {children}
    </div>
  );
};

export default UserInformation;