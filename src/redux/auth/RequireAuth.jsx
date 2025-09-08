import { useUser } from "@stackframe/react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const { user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) return null; // loader/spinner
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
