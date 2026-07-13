import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  ClipboardList, Clock, CheckCircle, RefreshCw, X, Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ViewDarModal, ReviewPanel, SUPERVISOR_OPTIONS, DEPARTMENT_OPTIONS
} from "../../components/DAR/admin/modaladmin";
import type { SubmittedReport, ReportStatus } from "../../components/DAR/admin/modaladmin";
import ReviewTable from "../../components/DAR/admin/reviewTable";
import { useAuth } from "../../context/AuthContext"; // i-adjust ang path base sa aktwal na lokasyon ng AuthContext.tsx

const mockReports: SubmittedReport[] = [
  // ─── Pending Review (4) ───────────────────────────────────────────────
  {
    id: "DAR-2025-001",
    referenceNo: "DAR-2025-001",
    employeeName: "Charleston James S. Cabanatan",
    department: "Frontend Team",
    project: "SIMPLEVIA HRIS",
    date: "2025-07-01",
    submittedAt: "5:00 PM",
    workArrangement: "On-site",
    totalActualHours: 8.5,
    totalEstHours: 8,
    tasksCompleted: 4,
    tasksTotal: 5,
    checklistDone: 5,
    status: "Pending Review",
    assignedSupervisor: "Marivic R. Songalia-Magyaya",
    _raw: {
      taskDetails: [
        {
          id: 1,
          taskType: "Development",
          ticketRef: "SIM-142",
          description: "Implement supervisor dropdown filter across admin DAR tables",
          module: "DAR - Admin",
          status: "done",
          percentDone: 100,
          estHrs: 3,
          actualHrs: 3.5,
          output: "PR #218 merged",
        },
        {
          id: 2,
          taskType: "Bug Fix",
          ticketRef: "SIM-145",
          description: "Fix mock data bug causing empty pending table",
          module: "DAR - Admin",
          status: "done",
          percentDone: 100,
          estHrs: 1,
          actualHrs: 1,
          output: "loadReports() now returns mockReports",
        },
        {
          id: 3,
          taskType: "Development",
          ticketRef: "SIM-149",
          description: "Refactor stat cards to match employee-side UI pattern",
          module: "DAR - Admin",
          status: "done",
          percentDone: 100,
          estHrs: 2,
          actualHrs: 2,
          output: "Updated statCards + card markup",
        },
        {
          id: 4,
          taskType: "Enhancement",
          ticketRef: "SIM-151",
          description: "Add Print/Export and Proceed to Review actions to ViewDarModal",
          module: "DAR - Admin",
          status: "done",
          percentDone: 100,
          estHrs: 1.5,
          actualHrs: 1.5,
          output: "jsPDF single-report export wired up",
        },
        {
          id: 5,
          taskType: "Development",
          ticketRef: "SIM-153",
          description: "Move shared DAR constants to neutral shared file",
          module: "DAR - Shared",
          status: "ip",
          percentDone: 60,
          estHrs: 2,
          actualHrs: 0.5,
          output: "In progress — pending file split",
        },
      ],
      submittedTo: "Marivic R. Songalia-Magyaya",
      timeIn: "9:00 AM",
      timeOut: "5:00 PM",
      gross: "8h",
      net: "8h",
      keyAccomp: "Completed supervisor dropdown filter, fixed mock data bug, revised stat card UI to match employee-side design.",
      planTmr: "Continue moving shared constants (SUPERVISOR_OPTIONS, checklistItems) to a neutral constants file.",
    },
  },
  {
    id: "DAR-2025-002",
    referenceNo: "DAR-2025-002",
    employeeName: "Maria Santos",
    department: "Frontend Team",
    project: "SIMPLEVIA HRIS",
    date: "2025-07-01",
    submittedAt: "6:00 PM",
    workArrangement: "Work From Home",
    totalActualHours: 7,
    totalEstHours: 8,
    tasksCompleted: 3,
    tasksTotal: 4,
    checklistDone: 4,
    status: "Pending Review",
    assignedSupervisor: "Angela Reyes",
  },
  {
    id: "DAR-2025-003",
    referenceNo: "DAR-2025-003",
    employeeName: "Carlo Reyes",
    department: "QA Team",
    project: "SIMPLEVIA HRIS",
    date: "2025-07-01",
    submittedAt: "5:30 PM",
    workArrangement: "Hybrid",
    totalActualHours: 9,
    totalEstHours: 8,
    tasksCompleted: 6,
    tasksTotal: 6,
    checklistDone: 6,
    status: "Pending Review",
    assignedSupervisor: "Roberto Cruz",
  },
  {
    id: "DAR-2025-004",
    referenceNo: "DAR-2025-004",
    employeeName: "Ana Lim",
    department: "Backend Team",
    project: "SIMPLEVIA HRIS",
    date: "2025-07-01",
    submittedAt: "5:55 PM",
    workArrangement: "On-site",
    totalActualHours: 7.5,
    totalEstHours: 8,
    tasksCompleted: 3,
    tasksTotal: 5,
    checklistDone: 3,
    status: "Pending Review",
    assignedSupervisor: "Michael Tan",
  },

  // ─── Reviewed (4) ────────────────────────────────────────────────────
  {
    id: "DAR-2025-005",
    referenceNo: "DAR-2025-005",
    employeeName: "Jose Ramos",
    department: "Frontend Team",
    project: "SIMPLEVIA HRIS",
    date: "2025-06-30",
    submittedAt: "5:45 PM",
    workArrangement: "On-site",
    totalActualHours: 8,
    totalEstHours: 8,
    tasksCompleted: 5,
    tasksTotal: 5,
    checklistDone: 6,
    status: "Approved",
    rating: 5,
    performanceScore: 95,
    supervisorName: "Roberto Cruz",
    supervisorComment: "Excellent work today. All tasks completed on time.",
    taskCompletion: "Exceeds Expectations",
    taskVerification: "Verified",
    attendanceVerified: true,
    acknowledgedByEmployee: true,
    acknowledgedByAdmin: true,
  },
  {
    id: "DAR-2025-006",
    referenceNo: "DAR-2025-006",
    employeeName: "Lea Gonzales",
    department: "QA Team",
    project: "SIMPLEVIA HRIS",
    date: "2025-06-30",
    submittedAt: "6:10 PM",
    workArrangement: "Work From Home",
    totalActualHours: 7.5,
    totalEstHours: 8,
    tasksCompleted: 4,
    tasksTotal: 5,
    checklistDone: 5,
    status: "Revision Requested",
    rating: 3,
    performanceScore: 65,
    supervisorName: "Roberto Cruz",
    supervisorComment: "Please update the ticket references in your task list.",
    taskCompletion: "Meets Expectations",
    taskVerification: "Partially Verified",
    attendanceVerified: true,
    acknowledgedByEmployee: true,
    acknowledgedByAdmin: true,
  },
  {
    id: "DAR-2025-007",
    referenceNo: "DAR-2025-007",
    employeeName: "Mark Villanueva",
    department: "Backend Team",
    project: "SIMPLEVIA HRIS",
    date: "2025-06-29",
    submittedAt: "5:30 PM",
    workArrangement: "On-site",
    totalActualHours: 8,
    totalEstHours: 8,
    tasksCompleted: 5,
    tasksTotal: 5,
    checklistDone: 6,
    status: "Approved",
    rating: 4,
    performanceScore: 85,
    supervisorName: "Roberto Cruz",
    supervisorComment: "Good work. Keep it up.",
    taskCompletion: "Exceeds Expectations",
    taskVerification: "Verified",
    attendanceVerified: true,
    acknowledgedByEmployee: true,
    acknowledgedByAdmin: true,
  },
  {
    id: "DAR-2025-008",
    referenceNo: "DAR-2025-008",
    employeeName: "Nina Torres",
    department: "Frontend Team",
    project: "SIMPLEVIA HRIS",
    date: "2025-06-29",
    submittedAt: "6:05 PM",
    workArrangement: "Hybrid",
    totalActualHours: 6,
    totalEstHours: 8,
    tasksCompleted: 2,
    tasksTotal: 5,
    checklistDone: 2,
    status: "Rejected",
    rating: 1,
    performanceScore: 30,
    supervisorName: "Roberto Cruz",
    supervisorComment: "Report is incomplete. Tasks and checklist not fully accomplished.",
    taskCompletion: "Needs Improvement",
    taskVerification: "Not Verified",
    attendanceVerified: false,
    acknowledgedByEmployee: true,
    acknowledgedByAdmin: true,
  },
];

// TODO: replace with GET /api/dar/submissions (admin — all employees)
// const loadReports = async () => { ... }
// Temporarily returns empty array; wire up on API integration day
const loadReports = (): SubmittedReport[] => mockReports;

// â”€â”€ Export helpers (Excel + PDF) â”€â”€
function buildExportData(rows: SubmittedReport[], mode: string) {
  const isHistory = mode === "history";
  const headers = isHistory
    ? ["Reference No","Employee","Department","Project","Date","Submitted","Arrangement","Actual Hrs","Est Hrs","Tasks","Checklist","Status","Rating","Score","Supervisor","Task Completion","Remarks"]
    : ["Reference No","Employee","Department","Project","Date","Submitted","Arrangement","Actual Hrs","Est Hrs","Tasks","Checklist","Status"];
  const body = rows.map((r: SubmittedReport) => {
    const base = [
      r.referenceNo, r.employeeName, r.department, r.project, r.date, r.submittedAt,
      r.workArrangement, r.totalActualHours, r.totalEstHours,
      r.tasksCompleted + "/" + r.tasksTotal, r.checklistDone + "/6", r.status,
    ];
    const extra = isHistory ? [
      r.rating || "", r.performanceScore || "", r.supervisorName || "",
      r.taskCompletion || "", r.finalRemarks || r.supervisorComment || "",
    ] : [];
    return base.concat(extra);
  });
  return { headers, body, isHistory };
}

function generateExcel(rows: SubmittedReport[], mode: string) {
  const data = buildExportData(rows, mode);
  const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.body.map(row => row.map(String))]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, data.isHistory ? "Review History" : "Pending");
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, "DAR_" + (data.isHistory ? "History" : "Pending") + "_" + today + ".xlsx");
}

function generatePDF(rows: SubmittedReport[], mode: string) {
  const data = buildExportData(rows, mode);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Daily Accomplishment Report", 14, 15);
  doc.setFontSize(10);
  doc.text((data.isHistory ? "Review History" : "Pending Submissions") + " â€” " + data.body.length + " record(s)", 14, 21);
  doc.setFontSize(8);
  doc.text("Generated: " + new Date().toLocaleString(), 14, 26);
  autoTable(doc, {
    head: [data.headers],
    body: data.body,
    startY: 30,
    styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [5, 150, 105], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
  });
  const today = new Date().toISOString().slice(0, 10);
  doc.save("DAR_" + (data.isHistory ? "History" : "Pending") + "_" + today + ".pdf");
}

const AdminDailyAccomplishmentReport = () => {
  const { user } = useAuth();
  const currentAdminName = user?.fullName || "";

  const [reports, setReports] = useState<SubmittedReport[]>(loadReports);
  const [selectedReport, setSelectedReport] = useState<SubmittedReport | null>(null);
  const [search, setSearch]                 = useState("");
  const [filterStatus, setFilterStatus]     = useState("All");
  const [filterDept, setFilterDept]         = useState("All");
  const [filterSupervisor, setFilterSupervisor] = useState("All");
  const [historySupervisor, setHistorySupervisor] = useState("All");
  const [currentPage, setCurrentPage]       = useState(1);
  const [historyPage, setHistoryPage]       = useState(1);
  const [historySearch, setHistorySearch]   = useState("");
  const [historyStatus, setHistoryStatus]   = useState("All");
  const [activeMainTab, setActiveMainTab]   = useState<"pending" | "history">("pending");
  const [exportOpen, setExportOpen]         = useState(false);
  const [exportRows, setExportRows]         = useState<SubmittedReport[]>([]);
  const [exportMode, setExportMode]         = useState<"pending" | "history">("pending");
  const [exportFormat, setExportFormat]     = useState<"excel" | "pdf">("excel");
  const [viewDarReport, setViewDarReport]   = useState<SubmittedReport | null>(null);

  React.useEffect(() => {
    // TODO: replace with real-time polling or WebSocket/SignalR
    // when employee submits a DAR, admin table should refresh via fetchReports()
  }, []);

  const PAGE_SIZE = 10;

  const openExport = (rows: SubmittedReport[], mode: "pending" | "history") => {
    setExportRows(rows); setExportMode(mode); setExportFormat("excel"); setExportOpen(true);
  };

  const pending  = reports.filter(r => r.status === "Pending Review").length;
  const approved = reports.filter(r => r.status === "Approved").length;
  const revision = reports.filter(r => r.status === "Revision Requested").length;
  const total    = reports.length;

  const departments = ["All", ...DEPARTMENT_OPTIONS];

  const handleSearch      = (v: string) => { setSearch(v);       setCurrentPage(1); };
  const handleFilterDept  = (v: string) => { setFilterDept(v);   setCurrentPage(1); };
  const handleFilterSupervisor = (v: string) => { setFilterSupervisor(v); setCurrentPage(1); };
  const handleHistorySupervisor = (v: string) => { setHistorySupervisor(v); setHistoryPage(1); };

  const activeReports = reports.filter(r => {
    const q = search.toLowerCase();
    return (
      r.status === "Pending Review" &&
      (r.employeeName.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)) &&
      (filterDept === "All" || r.department === filterDept) &&
      (filterSupervisor === "All" || r.assignedSupervisor === filterSupervisor)
    );
  });

  const historyReports = reports.filter(r => {
    if (r.status === "Pending Review") return false;
    const hq = historySearch.toLowerCase();
    const matchSearch =
      r.employeeName.toLowerCase().includes(hq) ||
      r.project.toLowerCase().includes(hq) ||
      r.id.toLowerCase().includes(hq);
    return matchSearch &&
      (historyStatus === "All" || r.status === historyStatus) &&
      (historySupervisor === "All" || r.supervisorName === historySupervisor);
  });

  const totalPages       = Math.max(1, Math.ceil(activeReports.length / PAGE_SIZE));
  const paginated        = activeReports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const historyTotalPages = Math.max(1, Math.ceil(historyReports.length / PAGE_SIZE));
  const historyPaginated  = historyReports.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);

  const currentTabPages    = activeMainTab === "pending" ? totalPages        : historyTotalPages;
  const currentTabPage     = activeMainTab === "pending" ? currentPage       : historyPage;
  const setCurrentTabPage  = activeMainTab === "pending" ? setCurrentPage    : setHistoryPage;

  const handleSaveReview = (updated: Partial<SubmittedReport>) => {
    if (!selectedReport) return;
    setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, ...updated } : r));
  };

  const statCards = [
    { label: "Total Submitted", value: total,    sub: "All submissions",       icon: ClipboardList, gradient: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)" },
    { label: "Pending Review",  value: pending,  sub: "Awaiting action",       icon: Clock,         gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)" },
    { label: "Approved",        value: approved, sub: "Finalized reports",     icon: CheckCircle,   gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)" },
    { label: "Revision Needed", value: revision, sub: "Needs employee update", icon: RefreshCw,     gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Daily Accomplishment Reports</h1>
          <p>Review, rate, and sign off on employee daily accomplishment submissions</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={card.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
            <div className="pro-card !p-0 overflow-hidden">
              <div className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: card.gradient }}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{card.label}</p>
                  <p className="text-base font-bold text-gray-800 mt-0.5">{card.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ReviewTable
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        search={search}
        onSearch={handleSearch}
        filterDept={filterDept}
        onFilterDept={handleFilterDept}
        filterSupervisor={filterSupervisor}
        onFilterSupervisor={handleFilterSupervisor}
        supervisors={SUPERVISOR_OPTIONS}
        departments={departments}
        activeReports={activeReports}
        paginated={paginated}
        onExportPending={() => openExport(activeReports, "pending")}
        historySearch={historySearch}
        onHistorySearch={v => { setHistorySearch(v); setHistoryPage(1); }}
        historyStatus={historyStatus}
        onHistoryStatus={v => { setHistoryStatus(v); setHistoryPage(1); }}
        historySupervisor={historySupervisor}
        onHistorySupervisor={handleHistorySupervisor}
        historyReports={historyReports}
        historyPaginated={historyPaginated}
        onExportHistory={() => openExport(historyReports, "history")}
        onViewDar={setViewDarReport}
        onReview={setSelectedReport}
        currentTabPage={currentTabPage}
        currentTabPages={currentTabPages}
        setCurrentTabPage={setCurrentTabPage}
        PAGE_SIZE={PAGE_SIZE}
      />

      {/* Export Modal */}
      {exportOpen && createPortal(
        <div className="pro-modal-overlay" onClick={() => setExportOpen(false)}>
          <div className="pro-modal w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-gray-800">Generate Report</p>
              <button onClick={() => setExportOpen(false)} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
            </div>
            <div>
              <p className="pro-label" style={{ marginBottom: 6 }}>
                {exportMode === "history" ? "Review History" : "Pending Submissions"} · {exportRows.length} record(s)
              </p>
            </div>
            <div>
              <p className="pro-label" style={{ marginBottom: 8 }}>Format</p>
              <div style={{ display: "flex", gap: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                  <input type="radio" name="exportfmt" checked={exportFormat === "excel"} onChange={() => setExportFormat("excel")} style={{ accentColor: "#059669", width: 16, height: 16 }} /> Excel
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                  <input type="radio" name="exportfmt" checked={exportFormat === "pdf"} onChange={() => setExportFormat("pdf")} style={{ accentColor: "#059669", width: 16, height: 16 }} /> PDF
                </label>
              </div>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setExportOpen(false)} className="btn btn-secondary text-sm">Cancel</button>
              <button
                onClick={() => {
                  if (exportRows.length === 0) { toast.error("No records available to export."); return; }
                  if (exportFormat === "excel") generateExcel(exportRows, exportMode);
                  else generatePDF(exportRows, exportMode);
                  toast.success((exportFormat === "excel" ? "Excel" : "PDF") + " report generated and downloaded.");
                  setExportOpen(false);
                }}
                className="btn btn-primary flex items-center gap-2 text-sm text-white"
                style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
                <Download className="w-4 h-4" /> Generate & Download
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Review Modal */}
      {selectedReport && (
        <ReviewPanel
          report={selectedReport}
          onSave={handleSaveReview}
          onClose={() => setSelectedReport(null)}
          currentAdminName={currentAdminName}
        />
      )}

      {/* View Full DAR Modal */}
      {viewDarReport && (
        <ViewDarModal
          report={viewDarReport}
          onClose={() => setViewDarReport(null)}
          onReviewClick={() => {
            setSelectedReport(viewDarReport);
            setViewDarReport(null);
          }}
          onRequestRevision={(reason) => {
            setReports(prev => prev.map(r =>
              r.id === viewDarReport.id
                ? { ...r, status: "Revision Requested" as ReportStatus, revisionReason: reason }
                : r
            ));
            setViewDarReport(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDailyAccomplishmentReport;