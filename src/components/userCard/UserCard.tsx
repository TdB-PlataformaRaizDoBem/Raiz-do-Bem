import { memo, type ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

const UserCard = memo(function UserCard({ children, className }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm
        p-5 lg:grid lg:grid-cols-2 lg:min-h-28 lg:items-center
        transition-shadow hover:shadow-md
        ${className ?? ""}
      `}
    >
      {children}
    </div>
  );
});

export default UserCard;
