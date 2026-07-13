import { Download, Mail } from "lucide-react";

import type { birData } from "../config/presentation";

type BirTabProps = {
  data: typeof birData;
  statusBadge: Record<string, string>;
  onExport: () => void;
  onAlphalist: () => void;
};

export const BirTab = ({
  data,
  statusBadge,
  onExport,
  onAlphalist,
}: BirTabProps) => (
  <div className="space-y-5">
    <div className="flex justify-between items-center flex-wrap gap-2">
      <h3 className="text-base font-bold text-gray-800">BIR Form 2316</h3>
      <div className="flex gap-2">
        <button onClick={onExport} className="btn btn-primary">
          <Download className="w-4 h-4" /> Export
        </button>
        <button className="btn btn-secondary">
          <Mail className="w-4 h-4" /> Email All
        </button>
        <button onClick={onAlphalist} className="btn btn-secondary">
          Alphalist
        </button>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4 mb-2">
      <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
        <p className="text-xl font-bold text-emerald-700">233/245</p>
        <p className="text-xs text-gray-500">Signed Forms</p>
      </div>
      <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
        <p className="text-xl font-bold text-orange-600">12</p>
        <p className="text-xs text-gray-500">Pending Signature</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
        <p className="text-xl font-bold text-blue-600">₱1.25M</p>
        <p className="text-xs text-gray-500">Total Tax Withheld YTD</p>
      </div>
    </div>
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="pro-table">
        <thead>
          <tr>
            {[
              "Employee",
              "TIN",
              "Taxable Income",
              "Tax Withheld",
              "Form Status",
              "Action",
            ].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td className="!font-medium !text-gray-800">{r.name}</td>
              <td className="font-mono text-xs">{r.tin}</td>
              <td>{r.taxableIncome}</td>
              <td>{r.taxWithheld}</td>
              <td>
                <span className={`badge ${statusBadge[r.formStatus]}`}>
                  <span className="badge-dot" />
                  {r.formStatus}
                </span>
              </td>
              <td>
                <div className="flex gap-1">
                  <button className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
