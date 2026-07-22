// src/components/DAR/admin/reviewTable.tsx
import React from "react";
import {
  Clock, CheckCircle, Star, Eye, Download, Search, FileText,
} from "lucide-react";
import { StatusBadge, ArrangementBadge, StarRow } from "./modaladmin";
import type { SubmittedReport } from "./modaladmin";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewTableProps {
  // Tab
  activeMainTab: "pending" | "history";
  setActiveMainTab: (tab: "pending" | "history") => void;

  // Pending tab
  search: string;
  onSearch: (v: string) => void;
  filterDept: string;
  onFilterDept: (v: string) => void;
  filterSupervisor: string;
  onFilterSupervisor: (v: string) => void;
  supervisors: string[];
  departments: string[];
  activeReports: SubmittedReport[];
  paginated: SubmittedReport[];
  onExportPending: () => void;

  // History tab
  historySearch: string;
  onHistorySearch: (v: string) => void;
  historyStatus: string;
  onHistoryStatus: (v: string) => void;
  historySupervisor: string;
  onHistorySupervisor: (v: string) => void;
  historyReports: SubmittedReport[];
  historyPaginated: SubmittedReport[];
  onExportHistory: () => void;

  // Actions
  onViewDar: (r: SubmittedReport) => void;
  onReview: (r: SubmittedReport) => void;

  // Pagination
  currentTabPage: number;
  currentTabPages: number;
  setCurrentTabPage: (fn: (p: number) => number) => void;

  PAGE_SIZE: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReviewTable({
  activeMainTab, setActiveMainTab,
  search, onSearch, filterDept, onFilterDept, filterSupervisor, onFilterSupervisor, supervisors, departments,
  activeReports, paginated, onExportPending,
  historySearch, onHistorySearch, historyStatus, onHistoryStatus, historySupervisor, onHistorySupervisor,
  historyReports, historyPaginated, onExportHistory,
  onViewDar, onReview,
  currentTabPage, currentTabPages, setCurrentTabPage,
  PAGE_SIZE,
}: ReviewTableProps) {
  return (
    <div className="pro-card animate-fade-in-up" style={{ animationDelay: "0.4s", opacity: 0 }}>

      {/* ── Tabs ── */}
      <div className="px-6 pt-4 flex">
        <div className="overflow-x-auto scrollbar-none">
          <div className="pro-tabs">
            {([
              { id: "pending" as const, label: "Pending Submissions", icon: <Clock className="w-4 h-4" /> },
              { id: "history" as const, label: "Reviewed",            icon: <CheckCircle className="w-4 h-4" /> },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
                className={`pro-tab flex items-center gap-2 whitespace-nowrap shrink-0 w-auto !flex-none${activeMainTab === tab.id ? " active" : ""}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-6 py-4 border-b border-gray-100">
        {activeMainTab === "pending" && (
          <>
            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af", pointerEvents: "none" }} />
                <input className="pro-input" style={{ paddingLeft: 32, width: "100%", boxSizing: "border-box" }}
                  placeholder="Search employee, project..." value={search} onChange={e => onSearch(e.target.value)} />
              </div>
              <select className="pro-select" style={{ width: 180, flexShrink: 0, boxSizing: "border-box" }}
                value={filterDept} onChange={e => onFilterDept(e.target.value)}>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
              <select className="pro-select" style={{ width: 250, flexShrink: 0, boxSizing: "border-box" }}
                value={filterSupervisor} onChange={e => onFilterSupervisor(e.target.value)}>
                <option value="All">All Supervisors</option>
                {supervisors.map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={onExportPending} className="btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}>
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            {/* Mobile */}
            <div className="flex flex-col gap-2 lg:hidden">
              <div style={{ position: "relative" }}>
                <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af", pointerEvents: "none" }} />
                <input className="pro-input" style={{ paddingLeft: 32, width: "100%", boxSizing: "border-box" }}
                  placeholder="Search employee, project..." value={search} onChange={e => onSearch(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select className="pro-select" style={{ flex: 1, minWidth: 130, boxSizing: "border-box" }}
                  value={filterDept} onChange={e => onFilterDept(e.target.value)}>
                  {departments.map(d => <option key={d}>{d}</option>)}
                </select>
                <select className="pro-select" style={{ flex: 1, minWidth: 250, boxSizing: "border-box" }}
                  value={filterSupervisor} onChange={e => onFilterSupervisor(e.target.value)}>
                  <option value="All">All Supervisors</option>
                  {supervisors.map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={onExportPending} className="btn btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>
            </div>
          </>
        )}

        {activeMainTab === "history" && (
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af", pointerEvents: "none" }} />
              <input className="pro-input" style={{ paddingLeft: 32, width: "100%", boxSizing: "border-box" }}
                placeholder="Search reviewed employee, project..." value={historySearch}
                onChange={e => onHistorySearch(e.target.value)} />
            </div>
            <select className="pro-select" style={{ width: 180, flexShrink: 0, boxSizing: "border-box" }}
              value={historyStatus} onChange={e => onHistoryStatus(e.target.value)}>
              <option value="All">All Reviewed</option>
              {["Approved", "Revision Requested", "Rejected"].map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="pro-select" style={{ width: 180, flexShrink: 0, boxSizing: "border-box" }}
              value={historySupervisor} onChange={e => onHistorySupervisor(e.target.value)}>
              <option value="All">All Supervisors</option>
              {supervisors.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={onExportHistory} className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}>
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="p-6">
        <div className="overflow-x-auto rounded-xl border border-gray-100">

          {/* Pending Table */}
          {activeMainTab === "pending" && (
            <table className="pro-table" style={{ tableLayout: "auto", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Employee</th>
                  <th className="hidden md:table-cell" style={{ whiteSpace: "nowrap" }}>Project</th>
                  <th style={{ whiteSpace: "nowrap" }}>Arrangement</th>
                  <th className="hidden md:table-cell" style={{ whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeReports.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 italic">No reports found matching your filters.</td></tr>
                ) : paginated.map(r => (
                  <tr key={r.id} className="cursor-pointer">
                    <td style={{ whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg, #059669, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>
                          {r.employeeName.trim().charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", lineHeight: 1.2 }}>{r.employeeName}</p>
                          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{r.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell" style={{ whiteSpace: "nowrap", color: "#374151", fontSize: 13 }}>{r.project}</td>
                    <td style={{ whiteSpace: "nowrap", textAlign: "center" }}><ArrangementBadge arr={r.workArrangement} /></td>
                    <td className="hidden md:table-cell" style={{ whiteSpace: "nowrap", textAlign: "center" }}><StatusBadge status={r.status} /></td>
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => onViewDar(r)} title="View Full DAR"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "5px 8px", borderRadius: 8, cursor: "pointer", border: "1.5px solid #d1fae5", background: "#ecfdf5", color: "#059669", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#059669"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#ecfdf5"; e.currentTarget.style.color = "#059669"; }}>
                          <FileText className="w-4 h-4" />
                        </button>
                        <button onClick={() => onReview(r)} title="Review"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "5px 8px", borderRadius: 8, cursor: "pointer", border: "1.5px solid #fde68a", background: "#fffbeb", color: "#f59e0b", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#f59e0b"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#fffbeb"; e.currentTarget.style.color = "#f59e0b"; }}>
                          <Star className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeReports.length > 0 && paginated.length < PAGE_SIZE &&
                  Array.from({ length: PAGE_SIZE - paginated.length }).map((_, i) => (
                    <tr key={`ph-${i}`}>
                      <td className="text-gray-300">--</td>
                      <td className="hidden md:table-cell text-gray-300">--</td>
                      <td className="text-gray-300">--</td>
                      <td className="hidden md:table-cell text-gray-300">--</td>
                      <td className="text-gray-300 text-center">--</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}

          {/* History Table */}
          {activeMainTab === "history" && (
            <table className="pro-table" style={{ tableLayout: "auto", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Employee</th>
                  <th className="hidden md:table-cell" style={{ whiteSpace: "nowrap" }}>Project</th>
                  <th className="hidden md:table-cell" style={{ whiteSpace: "nowrap" }}>Rating</th>
                  <th style={{ whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyReports.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 italic">No reviewed reports yet.</td></tr>
                ) : historyPaginated.map(r => (
                  <tr key={r.id} className="cursor-pointer">
                    <td style={{ whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg, #059669, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>
                          {r.employeeName.trim().charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", lineHeight: 1.2 }}>{r.employeeName}</p>
                          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{r.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell" style={{ whiteSpace: "nowrap", color: "#374151", fontSize: 13 }}>{r.project}</td>
                    <td className="hidden md:table-cell" style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                      {r.rating ? <StarRow rating={r.rating} /> : <span style={{ color: "#d1d5db", fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ whiteSpace: "nowrap", textAlign: "center" }}><StatusBadge status={r.status} /></td>
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => onViewDar(r)} title="View Full DAR"
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 8px", borderRadius: 8, cursor: "pointer", border: "1.5px solid #d1fae5", background: "#ecfdf5", color: "#059669", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#059669"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#ecfdf5"; e.currentTarget.style.color = "#059669"; }}>
                          <FileText className="w-4 h-4" />
                        </button>
                        <button onClick={() => onReview(r)} title="View Review"
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 8px", borderRadius: 8, cursor: "pointer", border: "1.5px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}>
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {historyReports.length > 0 && historyPaginated.length < PAGE_SIZE &&
                  Array.from({ length: PAGE_SIZE - historyPaginated.length }).map((_, i) => (
                    <tr key={`hph-${i}`}>
                      <td className="text-gray-300">--</td>
                      <td className="hidden md:table-cell text-gray-300">--</td>
                      <td className="hidden md:table-cell text-gray-300">--</td>
                      <td className="text-gray-300">--</td>
                      <td className="text-gray-300 text-center">--</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 px-2">
          <button type="button" onClick={() => setCurrentTabPage(p => Math.max(1, p - 1))}
            disabled={currentTabPage === 1}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            Prev
          </button>
          <span className="text-gray-500 font-medium">Page {currentTabPage} / {currentTabPages}</span>
          <button type="button" onClick={() => setCurrentTabPage(p => Math.min(currentTabPages, p + 1))}
            disabled={currentTabPage === currentTabPages}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}