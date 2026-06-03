import { apiRequest } from "./api";

export type MonthlyAttendanceTrendDto = {
  month: number;
  monthLabel: string;
  presentCount: number;
  lateCount: number;
  overtimeCount: number;
  absentCount: number;
};

export async function getAttendanceTrends(year: number) {
  return apiRequest<MonthlyAttendanceTrendDto[]>(
    `/dashboard/admin/attendance-trends?year=${year}`
  );
}