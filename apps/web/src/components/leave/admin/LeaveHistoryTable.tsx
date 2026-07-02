import { useState } from "react";
import type { LeaveHistoryEntry } from "../../../context/LeaveContext";
import type { StatusBadgeMap } from "./LeaveTableTypes";

interface LeaveHistoryTableProps {
  history: LeaveHistoryEntry[];
  allHistory: LeaveHistoryEntry[];
  statusBadge: StatusBadgeMap;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const DEFAULT_PAGE_SIZE = 10;

const createPlaceholderRow = (id: number): LeaveHistoryEntry => ({
  id,
  dateApplied: "--",
  employee: "",
  leaveType: "",
  duration: "--",
  status: "Approved",
  approver: "",
});

const CSV_HEADERS = [
  "Date Applied",
  "Employee",
  "Leave Type",
  "Duration",
  "Status",
  "Approver",
];

const escapeCsvField = (value: string) => {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const rowsToCsv = (rows: LeaveHistoryEntry[]) => {
  const lines = [
    CSV_HEADERS.join(","),
    ...rows.map((r) =>
      [r.dateApplied, r.employee, r.leaveType, r.duration, r.status, r.approver]
        .map((field) => escapeCsvField(String(field)))
        .join(",")
    ),
  ];

  return lines.join("\n");
};

const downloadCsv = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const LeaveHistoryTable = ({
  history,
  allHistory,
  statusBadge,
  page,
  totalPages,
  onPrev,
  onNext,
}: LeaveHistoryTableProps) => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const safePage = Math.max(1, page || 1);
  const safeTotalPages = Math.max(1, totalPages || 1);
  const canPrev = safePage > 1;
  const canNext = safePage < safeTotalPages;
  const hasRecords = history.length > 0;

  const dataRows = hasRecords
    ? [
        ...history,
        ...Array.from(
          { length: Math.max(0, DEFAULT_PAGE_SIZE - history.length) },
          (_, i) => createPlaceholderRow(-(i + 1))
        ),
      ]
    : Array.from({ length: DEFAULT_PAGE_SIZE }, (_, i) =>
        createPlaceholderRow(-(i + 1))
      );

  const handleGenerateReport = () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      alert('"Date From" must be before or equal to "Date To".');
      return;
    }

    const filtered = allHistory.filter((r) => {
      if (dateFrom && r.dateApplied < dateFrom) return false;
      if (dateTo && r.dateApplied > dateTo) return false;
      return true;
    });

    if (filtered.length === 0) {
      alert("No leave history records match that date range.");
      return;
    }

    const csv = rowsToCsv(filtered);
    const rangeSuffix = dateFrom || dateTo ? `_${dateFrom || "start"}_to_${dateTo || "end"}` : "";
    downloadCsv(csv, `leave-history-report${rangeSuffix}.csv`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="pro-label">Date From</label>
          <input
            type="date"
            className="pro-input !w-auto"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="pro-label">Date To</label>
          <input
            type="date"
            className="pro-input !w-auto"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <button className="btn btn-primary h-fit" onClick={handleGenerateReport}>
          Generate Report
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table">
          <thead>
            <tr>
              {[
                "Date Applied",
                "Employee",
                "Leave Type",
                "Duration",
                "Status",
                "Approver",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!hasRecords && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400 italic">
                  No finalized leave records yet. Approve or reject pending requests first.
                </td>
              </tr>
            )}

            {hasRecords &&
              dataRows.map((r) => {
                const isPlaceholder = r.id < 0;

                return (
                  <tr key={isPlaceholder ? `placeholder-${r.id}` : r.id}>
                    <td className={isPlaceholder ? "text-gray-300" : undefined}>
                      {r.dateApplied}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : "!font-medium !text-gray-800"}>
                      {isPlaceholder ? "--" : r.employee}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : undefined}>
                      {isPlaceholder ? "--" : r.leaveType}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : undefined}>
                      {r.duration}
                    </td>
                    <td>
                      {isPlaceholder ? (
                        <span className="text-gray-300">--</span>
                      ) : (
                        <span className={`badge ${statusBadge[r.status]}`}>
                          <span className="badge-dot" />
                          {r.status}
                        </span>
                      )}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : undefined}>
                      {isPlaceholder ? "--" : r.approver}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {hasRecords && (
        <div className="flex items-center justify-between border-t border-gray-100 px-2 py-4">
          <button className="btn btn-secondary" onClick={onPrev} disabled={!canPrev}>
            Prev
          </button>

          <div className="text-sm text-gray-500">
            Page {safePage} of {safeTotalPages}
          </div>

          <button className="btn btn-secondary" onClick={onNext} disabled={!canNext}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveHistoryTable;
