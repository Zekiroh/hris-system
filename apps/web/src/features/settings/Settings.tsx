import { useAuth } from "../../context/AuthContext";
import AdminSettings from "./admin/AdminSettings";
import UserSettings from "./user/UserSettings";

export default function Settings() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  return isAdmin ? <AdminSettings /> : <UserSettings />;
}
