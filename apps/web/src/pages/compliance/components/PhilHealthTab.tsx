import { Download } from "lucide-react";

import type { philhealthData } from "../config/presentation";

type PhilHealthTabProps = {
  data: typeof philhealthData;
  statusBadge: Record<string, string>;
  onExportReports: () => void;
};

export const PhilHealthTab = ({
  data,
  statusBadge,
  onExportReports,
}: PhilHealthTabProps) => (
  <div className="space-y-5">
    <div className="flex justify-between items-center">
      <h3 className="text-base font-bold text-gray-800">
        PhilHealth Contributions Monitor
      </h3>
      <button onClick={onExportReports} className="btn btn-primary">
        <Download className="w-4 h-4" /> Export Reports
      </button>
    </div>
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="pro-table">
        <thead>
          <tr>
            {[
              "Employee ID",
              "Employee Name",
              "PhilHealth No.",
              "Rate",
              "Monthly",
              "EE Share",
              "ER Share",
              "Status",
            ].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td className="font-mono text-xs">{r.empId}</td>
              <td className="!font-medium !text-gray-800">{r.name}</td>
              <td className="font-mono text-xs">{r.phNo}</td>
              <td>
                <span className="badge badge-info">
                  <span className="badge-dot" />
                  {r.rate}
                </span>
              </td>
              <td>{r.monthly}</td>
              <td>{r.empShare}</td>
              <td>{r.erShare}</td>
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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
      <h4 className="text-sm font-bold text-gray-700 mb-3">
        PhilHealth Contributions Summary
      </h4>
      <div className="space-y-2.5">
        {[
          ["Total Contributions", "₱128,000"],
          ["Remittance Deadline", "March 10, 2026"],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-sm">
            <span className="text-gray-500">{l}</span>
            <span className="font-bold text-gray-900">{v}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
