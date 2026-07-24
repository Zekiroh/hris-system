import { Download } from "lucide-react";

import type { historyData } from "../config/presentation";

type HistoryTabProps = {
  data: typeof historyData;
  statusBadge: Record<string, string>;
  onGenerateReports: () => void;
};

export const HistoryTab = ({
  data,
  statusBadge,
  onGenerateReports,
}: HistoryTabProps) => (
  <div className="space-y-5">
    <div className="flex justify-between items-center">
      <h3 className="text-base font-bold text-gray-800">
        Employment Status History (Government Reporting)
      </h3>
      <button onClick={onGenerateReports} className="btn btn-primary">
        <Download className="w-4 h-4" /> Generate Reports
      </button>
    </div>
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="pro-table">
        <thead>
          <tr>
            {["Date", "Employee", "Event", "Reported To", "Status"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td className="!font-medium !text-gray-800">{r.employee}</td>
              <td>{r.event}</td>
              <td>{r.reportedTo}</td>
              <td>
                <span className={`badge ${statusBadge[r.status]}`}>
                  <span className="badge-dot" />
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
