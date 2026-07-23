import AdminDailyAccomplishment from "./admin/AdminDailyAccomplishment";
import UserDailyAccomplishment from "./user/UserDailyAccomplishment";

type DailyAccomplishmentProps = {
  mode: "admin" | "user";
};

export default function DailyAccomplishment({ mode }: DailyAccomplishmentProps) {
  return mode === "admin" ? <AdminDailyAccomplishment /> : <UserDailyAccomplishment />;
}
