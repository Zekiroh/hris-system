// src/components/DAR/user/SubmissionsTable.tsx
import React from "react";
import { Eye, FileText} from "lucide-react";

interface SubmissionsTableProps {
  submissions: any[];
  subSearch: string;
  setSubSearch: (v: string) => void;
  subFilter: string;
  setSubFilter: (v: string) => void;
  subPage: number;
  setSubPage: React.Dispatch<React.SetStateAction<number>>;
  onView: (s: any) => void;
  onRevise: (s: any) => void;
}

const SUB_PAGE_SIZE = 10;

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  "Approved":           { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Pending Review":     { bg: "bg-amber-50 border border-amber-200",     text: "text-amber-700",   dot: "bg-amber-400"  },
  "Revision Requested": { bg: "bg-blue-50 border border-blue-200",       text: "text-blue-700",    dot: "bg-blue-500"   },
  "Rejected":           { bg: "bg-rose-50 border border-rose-200",       text: "text-rose-700",    dot: "bg-rose-500"   },
};

const ARR_STYLE: Record<string, string> = {
  "On-site": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Remote":  "bg-blue-50 text-blue-700 border border-blue-200",
  "Hybrid":  "bg-amber-50 text-amber-700 border border-amber-200",
};

// Hardcoded sample data removed — submissions now come from backend API

export default function SubmissionsTable({
  submissions, subSearch, setSubSearch, subFilter, setSubFilter,
  subPage, setSubPage, onView, onRevise,
}: SubmissionsTableProps) {

  const allSubmissions = submissions;

  const filtered = allSubmissions.map((s, index) => ({ s, index })).filter(({ s }) => {
    const matchSearch = s.date.includes(subSearch) || (s.project || "").toLowerCase().includes(subSearch.toLowerCase());
    const matchFilter = subFilter === "All Status" || s.status === subFilter;
    return matchSearch && matchFilter;
  });

  const totalSubPages = Math.max(1, Math.ceil(filtered.length / SUB_PAGE_SIZE));
  const currentSubPage = Math.min(subPage, totalSubPages);
  const paginatedSubs = filtered.slice((currentSubPage - 1) * SUB_PAGE_SIZE, currentSubPage * SUB_PAGE_SIZE);
  const canGoPrev = currentSubPage > 1;
  const canGoNext = currentSubPage < totalSubPages;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <input
            className="pro-input pl-10 text-sm"
            placeholder="Search by date or project..."
            value={subSearch}
            onChange={e => setSubSearch(e.target.value)}
          />
        </div>
        <select className="pro-select text-sm" value={subFilter} onChange={e => setSubFilter(e.target.value)} style={{ width: "160px" }}>
          {["All Status", "Approved", "Pending Review", "Revision Requested", "Rejected"].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No submissions yet</p>
          <p className="text-xs mt-1 text-gray-400">Your submitted reports will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="pro-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                {["#", "Date", "Project", "Arrangement", "Tasks", "Checklist", "Submitted At", "Status", "Action"].map(h => (
                  <th key={h} style={{ whiteSpace: "nowrap", textAlign: h === "Project" || h === "Action" ? "center" : undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedSubs.map(({ s, index }, i) => {
                const st = STATUS_STYLE[s.status] || STATUS_STYLE["Pending Review"];
                const ar = ARR_STYLE[s.workArr || "On-site"] || ARR_STYLE["On-site"];
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="text-center text-gray-400 text-xs font-semibold" style={{ width: "36px" }}>{(currentSubPage - 1) * SUB_PAGE_SIZE + i + 1}</td>
                    <td className="text-xs font-semibold text-gray-700" style={{ width: "90px", whiteSpace: "nowrap" }}>{s.date}</td>
                    <td className="text-xs text-gray-600 text-center" style={{ minWidth: "120px" }}>{s.project || "—"}</td>
                    <td style={{ width: "100px" }}>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ar}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {s.workArr || "On-site"}
                      </span>
                    </td>
                    <td className="text-center text-xs text-gray-600" style={{ width: "50px" }}>{s.tasks}</td>
                    <td className="text-center text-xs text-gray-600" style={{ width: "70px" }}>{s.checklist} / 6</td>
                    <td className="text-xs text-gray-500" style={{ width: "90px", whiteSpace: "nowrap" }}>{s.submittedAt}</td>
                    <td style={{ width: "150px", whiteSpace: "nowrap" }}>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {s.status}
                      </span>
                    </td>
                    <td className="text-center" style={{ width: "100px" }}>
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" title="View" onClick={() => onView(s)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg p-1.5 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => s.status === "Revision Requested" ? onRevise(s) : undefined}
                          disabled={s.status !== "Revision Requested"}
                          className={`flex items-center gap-1 text-xs rounded-lg px-2 py-1.5 transition-all border ${
                            s.status === "Revision Requested"
                              ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 cursor-pointer"
                              : "text-gray-300 border-gray-100 cursor-not-allowed"
                          }`}
                          title={s.status === "Revision Requested" ? "Revise this submission" : "Revision not requested"}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button type="button" onClick={() => canGoPrev && setSubPage(p => p - 1)} disabled={!canGoPrev}
              className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
              Prev
            </button>
            <span className="text-gray-500 text-sm font-medium">Page {currentSubPage} / {totalSubPages}</span>
            <button type="button" onClick={() => canGoNext && setSubPage(p => p + 1)} disabled={!canGoNext}
              className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}