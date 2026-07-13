import { Download } from "lucide-react";

import type { pagibigData } from "../config/presentation";

type PagIbigTabProps = {
  data: typeof pagibigData;
  statusBadge: Record<string, string>;
  onExportReports: () => void;
};

export const PagIbigTab = ({
  data,
  statusBadge,
  onExportReports,
}: PagIbigTabProps) => (
  <div className="space-y-5">
    <div className="flex justify-between items-center">
      <h3 className="text-base font-bold text-gray-800">
        Pag-IBIG Fund (HDMF) Monitor
      </h3>
      <button onClick={onExportReports} className="btn btn-primary">
        <Download className="w-4 h-4" /> Export Reports
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
      <div className="pro-card !shadow-none border border-gray-100 p-5">
        <h4 className="text-sm font-bold text-gray-700 mb-2">
          Contribution Rates
        </h4>
        <div className="space-y-1.5 text-sm">
          <p className="text-gray-600">
            Employee Rate: <strong>2%</strong>
          </p>
          <p className="text-gray-600">
            Employer Rate: <strong>2%</strong>
          </p>
          <span className="badge badge-info mt-2 inline-flex">
            <span className="badge-dot" />
            Max Limit Applied
          </span>
        </div>
      </div>
      <div className="pro-card !shadow-none border border-gray-100 p-5">
        <h4 className="text-sm font-bold text-gray-700 mb-2">
          MP2 Savings Program
        </h4>
        <p className="text-3xl font-bold text-emerald-600">45</p>
        <p className="text-xs text-gray-500">Employees Enrolled</p>
      </div>
    </div>
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="pro-table">
        <thead>
          <tr>
            {[
              "Employee",
              "MID Number",
              "Mandatory",
              "MP2 Savings",
              "Total",
              "Status",
            ].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td className="!font-medium !text-gray-800">{r.name}</td>
              <td className="font-mono text-xs">{r.midNo}</td>
              <td>{r.mandatory}</td>
              <td>{r.mp2}</td>
              <td className="!font-bold">{r.total}</td>
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
