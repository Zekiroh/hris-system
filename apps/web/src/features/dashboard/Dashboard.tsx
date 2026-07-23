import AdminDashboard from "./admin/AdminDashboard";
import UserDashboard from "./user/UserDashboard";
import { useAuth } from "../../app/auth/AuthContext";

const isAdminRole = (role: unknown) => {
  if (typeof role !== "string") return false;

  const normalized = role.trim().toUpperCase();
  return normalized === "ADMIN" || normalized === "SUPER_ADMIN";
};

const Dashboard = () => {
  const { user } = useAuth();

  return isAdminRole(user?.role) ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;