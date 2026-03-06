import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoutes = ({
  allowedRoles,
}: {
  allowedRoles?: string[];
}) => {
  const token = localStorage.getItem("@RaizDoBem:token");
  const user = JSON.parse(localStorage.getItem("@RaizDoBem:user") || "{}");

  if (!token) return <Navigate to="/auth/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};
