import React, { type ReactNode } from "react";

const UserActions = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className="mt-auto -mx-6 flex items-center justify-center gap-4 bg-cream h-20 px-6 overflow-hidden"
    >
      {children}
    </div>
  );
};

export default UserActions;
