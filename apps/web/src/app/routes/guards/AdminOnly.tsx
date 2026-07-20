import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

/**
 * Blocks non-admin roles from accessing admin-only routes.
 */
export default function AdminOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
