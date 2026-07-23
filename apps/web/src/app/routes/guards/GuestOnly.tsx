import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../app/auth/useAuth";

export default function GuestOnly() {
  const { isLoggedIn } = useAuth();

  // If logged in, don't allow /login
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}