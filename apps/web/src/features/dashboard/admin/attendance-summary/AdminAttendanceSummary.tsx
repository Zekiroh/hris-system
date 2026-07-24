import type { ComponentProps } from "react";
import { Bar } from "react-chartjs-2";

type AdminAttendanceSummaryProps = {
  attendanceChartData: ComponentProps<typeof Bar>["data"];
  attendanceChartOptions: ComponentProps<typeof Bar>["options"];
};

const AdminAttendanceSummary = ({
  attendanceChartData,
  attendanceChartOptions,
}: AdminAttendanceSummaryProps) => (
  <div
    className="lg:col-span-2 pro-card p-6 animate-fade-in-up"
    style={{ animationDelay: "0.4s", opacity: 0 }}
  >
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="text-base font-bold text-gray-800">
          Attendance Summary
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Monthly attendance overview for 2026
        </p>
      </div>
    </div>
    <div style={{ height: 320 }}>
      <Bar data={attendanceChartData} options={attendanceChartOptions} />
    </div>
  </div>
);

export default AdminAttendanceSummary;
