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
import { useAuth } from "../../context/AuthContext";
import { useAdminDailyReportData } from "../../components/DAR/hooks/useAdminDailyReportData";
import { useAdminDailyReportWorkflow } from "../../components/DAR/hooks/useAdminDailyReportWorkflow";
import type { DailyReportDto, SupervisorRemarksRequest } from "../../lib/dailyReports";

const REVIEWED_STATUS = "Reviewed" as ReportStatus;

function isReviewedReport(dto: DailyReportDto) {
  return Boolean(
    dto.reviewedBy ||
    dto.dateReviewed ||
    dto.reviewDate ||
    dto.supervisorNotes ||
    dto.performanceRating
  );
}

function parseRating(value: string | null): SubmittedReport["rating"] {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5
    ? parsed as SubmittedReport["rating"]
    : undefined;
}

function formatDateTimeForUi(value: string | null) {
  if (!value) return "";
  const timeOnlyMatch = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  const parsed = timeOnlyMatch
    ? new Date(`1970-01-01T${value}`)
    : new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatHours(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "";

  return `${Number(value.toFixed(2))}h`;
}

function calculateGrossHours(timeIn: string | null, timeOut: string | null) {
  if (!timeIn || !timeOut) return 0;
  const start = new Date(`1970-01-01T${timeIn}`);
  const end = new Date(`1970-01-01T${timeOut}`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const diff = end.getTime() - start.getTime();
  return diff > 0 ? diff / 3_600_000 : 0;
}

function normalizeTaskStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "in progress" || normalized === "in-progress") return "ip";
  if (normalized === "to do" || normalized === "todo") return "todo";
  if (normalized === "blocked") return "blocked";
  if (normalized === "done") return "done";

  return normalized;
}

function mapDailyReportToSubmittedReport(dto: DailyReportDto): SubmittedReport {
  const tasks = dto.tasks ?? [];
  const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
  const totalEstHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  const tasksCompleted = tasks.filter(task => task.status.trim().toLowerCase() === "done").length;
  const checklistDone = dto.checklistCompletedCount || 0;
  const checklistItems = [
    dto.codeCommitted,
    dto.ticketsUpdated,
    dto.pullRequestCreated,
    dto.documentationUpdated,
    dto.testsPassing,
    dto.reportSubmittedOnTime,
  ];
  const grossHours = calculateGrossHours(dto.timeIn, dto.timeOut);
  const netHours = Math.max(0, grossHours - ((dto.breakDurationMinutes || 0) / 60));

  return {
    id: String(dto.id),
    referenceNo: `DAR-${dto.id}`,
    employeeName: dto.employeeName,
    department: dto.teamUnit || "",
    project: dto.project,
    date: dto.reportDate,
    submittedAt: formatDateTimeForUi(dto.submissionTime),
    workArrangement: dto.workArrangement,
    totalActualHours,
    totalEstHours,
    tasksCompleted,
    tasksTotal: tasks.length,
    checklistDone,
    status: isReviewedReport(dto) ? REVIEWED_STATUS : "Pending Review",
    assignedSupervisor: "",
    rating: parseRating(dto.performanceRating),
    supervisorName: dto.reviewedBy || "",
    supervisorComment: dto.supervisorNotes || "",
    finalRemarks: dto.supervisorNotes || "",
    followUpRequired: dto.followUpRequired,
    managerActionItems: dto.managerActionItems || "",
    _raw: {
      backendId: dto.id,
      employeeId: dto.employeeId,
      date: dto.reportDate,
      devName: dto.employeeName,
      workArr: dto.workArrangement,
      project: dto.project,
      sprint: dto.sprintIteration || "",
      team: dto.teamUnit || "",
      submittedTo: dto.submittedToUserId ? String(dto.submittedToUserId) : "",
      timeIn: dto.timeIn || "",
      timeOut: dto.timeOut || "",
      gross: formatHours(grossHours),
      net: formatHours(netHours),
      standup: dto.attendedStandup ? "Yes" : "No",
      reachable: dto.reachableViaComms ? "Yes" : "No",
      avgResponse: dto.avgResponseTime || "",
      connIssues: dto.connectivityIssues || "",
      collabLog: dto.collaborationLog || "",
      taskDetails: tasks.map(task => ({
        id: task.id,
        carryOver: task.isCarryOver ? "Yes" : "No",
        priority: task.priority,
        taskType: task.taskType,
        ticketRef: task.ticketRefNo || "",
        description: task.description,
        module: task.module || "",
        status: normalizeTaskStatus(task.status),
        percentDone: String(task.percentDone),
        estHrs: String(task.estimatedHours),
        actualHrs: String(task.actualHours),
        output: task.outputDeliverable || "",
        commitLink: task.commitPrLink || "",
        remarks: task.blockedByRemarks || "",
      })),
      keyAccomp: dto.keyAccomplishments || "",
      blockers: dto.blockersIssues || "",
      risks: dto.risksEarlyWarnings || "",
      planTmr: dto.planForTomorrow || "",
      escalation: dto.supportEscalationNeeded || "",
      checklistItems,
      checklistDone: checklistItems,
      checklist: checklistDone,
      codeCommitted: dto.codeCommitted,
      ticketsUpdated: dto.ticketsUpdated,
      pullRequestCreated: dto.pullRequestCreated,
      documentationUpdated: dto.documentationUpdated,
      testsPassing: dto.testsPassing,
      reportSubmittedOnTime: dto.reportSubmittedOnTime,
      tmrArr: dto.workArrangementTomorrow || "",
      tmrTimeIn: dto.expectedTimeIn || "",
      leaveNotice: dto.leaveAbsenceNotice || "",
      supervisorNotes: dto.supervisorNotes || "",
      performanceRating: dto.performanceRating || "",
      followUpRequired: dto.followUpRequired,
      reviewDate: dto.reviewDate || "",
      managerActionItems: dto.managerActionItems || "",
      reviewedBy: dto.reviewedBy || "",
      dateReviewed: dto.dateReviewed || "",
      submittedAt: formatDateTimeForUi(dto.submissionTime),
      dateSubmitted: dto.submissionTime,
    },
  };
}

function trimmedOrNull(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function toIsoDateOrNull(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
}

// Export helpers (Excel + PDF)
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
  doc.text((data.isHistory ? "Review History" : "Pending Submissions") + " - " + data.body.length + " record(s)", 14, 21);
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
  const {
    reports: backendReports,
    error: dataError,
    refresh,
  } = useAdminDailyReportData({ page: 1, pageSize: 100 });
  const {
    isSavingReview,
    error: workflowError,
    saveSupervisorRemarks,
  } = useAdminDailyReportWorkflow();
  const lastDataErrorRef = React.useRef<string | null>(null);

  const [selectedReport, setSelectedReport] = useState<SubmittedReport | null>(null);
  const [search, setSearch]                 = useState("");
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
    if (!dataError) {
      lastDataErrorRef.current = null;
      return;
    }

    if (lastDataErrorRef.current !== dataError) {
      toast.error(dataError);
      lastDataErrorRef.current = dataError;
    }
  }, [dataError]);

  const PAGE_SIZE = 10;

  const reports = React.useMemo(
    () => backendReports.map(mapDailyReportToSubmittedReport),
    [backendReports]
  );

  const openExport = (rows: SubmittedReport[], mode: "pending" | "history") => {
    setExportRows(rows); setExportMode(mode); setExportFormat("excel"); setExportOpen(true);
  };

  const pending  = reports.filter(r => r.status === "Pending Review").length;
  const reviewed = reports.filter(r => r.status === REVIEWED_STATUS).length;
  const revision = 0;
  const total    = reports.length;

  const departments = React.useMemo(() => {
    const values = reports.map(r => r.department).filter(Boolean);
    return ["All", ...Array.from(new Set([...values, ...DEPARTMENT_OPTIONS]))];
  }, [reports]);

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

  const handleSaveReview = async (updated: Partial<SubmittedReport>) => {
    if (!selectedReport || isSavingReview) return;

    const reportId = Number(selectedReport.id);
    if (!Number.isSafeInteger(reportId)) {
      toast.error("Unable to save supervisor remarks.");
      return;
    }

    const request: SupervisorRemarksRequest = {
      supervisorNotes: trimmedOrNull(updated.supervisorComment) ?? trimmedOrNull(updated.finalRemarks),
      performanceRating: updated.rating ? String(updated.rating) : null,
      followUpRequired: typeof updated.followUpRequired === "boolean" ? updated.followUpRequired : null,
      reviewDate: toIsoDateOrNull(selectedReport._raw?.reviewDate) ?? new Date().toISOString().slice(0, 10),
      managerActionItems: trimmedOrNull(updated.managerActionItems),
    };

    try {
      await saveSupervisorRemarks(reportId, request);
      await refresh();
      setSelectedReport(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : workflowError || "Unable to save supervisor remarks."
      );
    }
  };

  const statCards = [
    { label: "Total Submitted", value: total,    sub: "All submissions",       icon: ClipboardList, gradient: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)" },
    { label: "Pending Review",  value: pending,  sub: "Awaiting action",       icon: Clock,         gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)" },
    { label: "Approved",        value: reviewed, sub: "Reviewed reports",      icon: CheckCircle,   gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)" },
    { label: "Revision Needed", value: revision, sub: "Not supported",         icon: RefreshCw,     gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)" },
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
            void reason;
            toast.error("Revision requests are not supported by the current DAR backend.");
            setViewDarReport(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDailyAccomplishmentReport;