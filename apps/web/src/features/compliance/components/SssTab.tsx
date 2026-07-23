import { Download } from "lucide-react";

import type { remittanceSchedule, sssData } from "../config/presentation";

type SssTabProps = {
  data: typeof sssData;
  remittanceSchedule: typeof remittanceSchedule;
  statusBadge: Record<string, string>;
  onExportReports: () => void;
};

export const SssTab = ({
  data,
  remittanceSchedule,
  statusBadge,
  onExportReports,
}: SssTabProps) => (
  <div className="space-y-5">
    <div className="flex justify-between items-center">
      <h3 className="text-base font-bold text-gray-800">
        SSS Contributions Monitor
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
              "SSS Number",
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
              <td className="font-mono text-xs">{r.sssNo}</td>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
        <h4 className="text-sm font-bold text-gray-700 mb-3">
          Monthly Summary
        </h4>
        <div className="space-y-2.5">
          {[
            ["Total SSS Contributions", "₱245,000"],
            ["Employee Share", "₱98,000"],
            ["Employer Share", "₱147,000"],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span className="text-gray-500">{l}</span>
              <span className="font-bold text-gray-900">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <h4 className="text-sm font-bold text-gray-700 mb-3">
          Remittance Schedule
        </h4>
        <div className="space-y-2.5">
          {remittanceSchedule.map((r, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{r.month}</span>
              <span className="text-gray-400 text-xs">Due: {r.dueDate}</span>
              <span className={`badge text-[10px] ${statusBadge[r.status]}`}>
                <span className="badge-dot" />
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
