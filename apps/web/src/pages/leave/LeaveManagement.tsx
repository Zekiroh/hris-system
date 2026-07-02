import { useAuth } from "../../context/AuthContext";
import AdminLeaveManagement from "../../components/leave/admin/AdminLeaveManagement";
import UserLeaveManagement from "../../components/leave/user/UserLeaveManagement";

export default function LeaveManagement() {
  const { user } = useAuth();
  const role = user?.role;

  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  return isAdmin ? <AdminLeaveManagement /> : <UserLeaveManagement />;
}