import { useAuth } from "../../context/AuthContext";
import AdminLeaveManagement from "../admin/AdminLeaveManagement";
import UserLeaveManagement from "../user/UserLeaveManagement";

export default function LeaveManagement() {
  const { user } = useAuth();
  const role = user?.role;

  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  return isAdmin ? <AdminLeaveManagement /> : <UserLeaveManagement />;
}