import React, { type ReactNode } from "react";

const UserActions = ({ children }: { children: ReactNode }) => {
  return (
    <div
       className="mt-auto -mx-6 flex flex-wrap items-center justify-center gap-4 bg-cream px-6 py-4 overflow-x-hidden "
    >
      {children}
    </div>
  );
};

export default UserActions;
