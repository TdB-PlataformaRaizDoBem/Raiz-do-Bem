import { type ReactNode } from "react";

const UserActions = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className="
    sticky bottom-0
    -mx-6
    z-10
    bg-cream
    border-t border-gray-200
    px-6 py-4
    flex flex-wrap items-center justify-end gap-3
  "
    >
      {children}
    </div>
  );
};

export default UserActions;
