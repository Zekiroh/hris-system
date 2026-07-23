import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../app/auth/AuthContext";

type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

// minimal shape we need from AuthContext user
type AuthUser = {
  role?: Role;
};

export default function RequireAuth({ allow }: { allow?: Role[] }) {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  // Not logged in -> force login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role restricted
  if (allow?.length) {
    const role = (user as AuthUser).role;

    if (!role || !allow.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}