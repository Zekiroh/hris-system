import { AlertTriangle, Palmtree, Stethoscope, type LucideIcon } from "lucide-react";

export const formatLeaveDate = (value: string) => {
  if (!value || value === "--") return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export const getLeaveTypeIcon = (leaveType: string): LucideIcon => {
  if (leaveType.startsWith("Vacation")) return Palmtree;
  if (leaveType.startsWith("Sick")) return Stethoscope;
  if (leaveType.startsWith("Emergency")) return AlertTriangle;
  return Palmtree;
};

export const getLeaveTypeColor = (leaveType: string) => {
  if (leaveType.startsWith("Vacation")) return "text-emerald-500";
  if (leaveType.startsWith("Sick")) return "text-amber-500";
  if (leaveType.startsWith("Emergency")) return "text-rose-500";
  return "text-slate-400";
};
