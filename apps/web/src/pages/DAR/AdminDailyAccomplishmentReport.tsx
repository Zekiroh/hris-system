import { useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  RefreshCw,
  Star,
  Eye,
  Download,
  Search,
  X,
  CheckSquare,
  Square,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportStatus = "Pending Review" | "Approved" | "Revision Requested" | "Rejected";
type Rating = 1 | 2 | 3 | 4 | 5;

interface SubmittedReport {
  id: string;
  employeeName: string;
  department: string;
  project: string;
  date: string;
  submittedAt: string;
  workArrangement: string;
  totalActualHours: number;
  totalEstHours: number;
  tasksCompleted: number;
  tasksTotal: number;
  checklistDone: number;
  status: ReportStatus;
  rating?: Rating;
  supervisorName?: string;
  supervisorComment?: string;
  performanceScore?: number;
  taskVerification?: string;
  attendanceVerified?: boolean;
  outputQuality?: string;
  acknowledgedByEmployee?: boolean;
  acknowledgedByAdmin?: boolean;
  finalRemarks?: string;
  referenceNo: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_REPORTS: SubmittedReport[] = [
  {
    id: "DAR-2026-0521-001", referenceNo: "DAR-2026-0521-001",
    employeeName: "Dela Cruz, Juan", department: "Software Development", project: "HRIS System",
    date: "2026-05-21", submittedAt: "05:58 PM", workArrangement: "On-site",
    totalActualHours: 7.5, totalEstHours: 8, tasksCompleted: 3, tasksTotal: 4,
    checklistDone: 5, status: "Pending Review",
  },
  {
    id: "DAR-2026-0521-002", referenceNo: "DAR-2026-0521-002",
    employeeName: "Santos, Maria", department: "QA & Testing", project: "HRIS System",
    date: "2026-05-21", submittedAt: "06:02 PM", workArrangement: "Work From Home",
    totalActualHours: 8, totalEstHours: 8, tasksCompleted: 5, tasksTotal: 5,
    checklistDone: 6, status: "Approved", rating: 5,
    supervisorName: "Reyes, Antonio", supervisorComment: "Excellent work. All tasks completed on time.",
    performanceScore: 95, taskVerification: "Verified", attendanceVerified: true,
    outputQuality: "Exceeds Expectations", acknowledgedByEmployee: true, acknowledgedByAdmin: true,
    finalRemarks: "Great performance. Keep it up!",
  },
  {
    id: "DAR-2026-0521-003", referenceNo: "DAR-2026-0521-003",
    employeeName: "Reyes, Jose", department: "Software Development", project: "Client Portal",
    date: "2026-05-21", submittedAt: "06:15 PM", workArrangement: "On-site",
    totalActualHours: 6, totalEstHours: 8, tasksCompleted: 2, tasksTotal: 5,
    checklistDone: 3, status: "Revision Requested", rating: 2,
    supervisorName: "Reyes, Antonio", supervisorComment: "Please provide more detail on blockers encountered.",
  },
  {
    id: "DAR-2026-0521-004", referenceNo: "DAR-2026-0521-004",
    employeeName: "Garcia, Ana", department: "UI/UX Design", project: "Mobile App",
    date: "2026-05-21", submittedAt: "05:45 PM", workArrangement: "Hybrid",
    totalActualHours: 8.5, totalEstHours: 8, tasksCompleted: 4, tasksTotal: 4,
    checklistDone: 6, status: "Pending Review",
  },
  {
    id: "DAR-2026-0521-005", referenceNo: "DAR-2026-0521-005",
    employeeName: "Fernandez, Rosa", department: "Backend Development", project: "HRIS System",
    date: "2026-05-21", submittedAt: "06:00 PM", workArrangement: "Work From Home",
    totalActualHours: 7, totalEstHours: 7.5, tasksCompleted: 3, tasksTotal: 3,
    checklistDone: 6, status: "Approved", rating: 4,
    supervisorName: "Reyes, Antonio", supervisorComment: "Good work. Minor improvements needed on documentation.",
    performanceScore: 87, taskVerification: "Verified", attendanceVerified: true,
    outputQuality: "Meets Expectations", acknowledgedByEmployee: true, acknowledgedByAdmin: true,
    finalRemarks: "Solid performance.",
  },
  {
    id: "DAR-2026-0521-006", referenceNo: "DAR-2026-0521-006",
    employeeName: "Torres, Carlo", department: "Software Development", project: "Client Portal",
    date: "2026-05-21", submittedAt: "05:50 PM", workArrangement: "On-site",
    totalActualHours: 8, totalEstHours: 8, tasksCompleted: 4, tasksTotal: 4,
    checklistDone: 6, status: "Pending Review",
  },
  {
    id: "DAR-2026-0521-007", referenceNo: "DAR-2026-0521-007",
    employeeName: "Villanueva, Lea", department: "QA & Testing", project: "Mobile App",
    date: "2026-05-21", submittedAt: "06:10 PM", workArrangement: "Work From Home",
    totalActualHours: 7.5, totalEstHours: 8, tasksCompleted: 3, tasksTotal: 4,
    checklistDone: 5, status: "Approved", rating: 3,
    supervisorName: "Reyes, Antonio", supervisorComment: "Meets expectations. Continue improving test coverage.",
    performanceScore: 78, taskVerification: "Verified", attendanceVerified: true,
    outputQuality: "Meets Expectations", acknowledgedByEmployee: true, acknowledgedByAdmin: true,
    finalRemarks: "Keep up the good work.",
  },
  {
    id: "DAR-2026-0521-008", referenceNo: "DAR-2026-0521-008",
    employeeName: "Mendoza, Rico", department: "UI/UX Design", project: "HRIS System",
    date: "2026-05-21", submittedAt: "05:55 PM", workArrangement: "Hybrid",
    totalActualHours: 8.5, totalEstHours: 8, tasksCompleted: 5, tasksTotal: 5,
    checklistDone: 6, status: "Approved", rating: 5,
    supervisorName: "Reyes, Antonio", supervisorComment: "Outstanding output. Design deliverables exceeded expectations.",
    performanceScore: 98, taskVerification: "Verified", attendanceVerified: true,
    outputQuality: "Exceeds Expectations", acknowledgedByEmployee: true, acknowledgedByAdmin: true,
    finalRemarks: "Excellent work this sprint.",
  },
  {
    id: "DAR-2026-0521-009", referenceNo: "DAR-2026-0521-009",
    employeeName: "Cruz, Patricia", department: "Backend Development", project: "Client Portal",
    date: "2026-05-21", submittedAt: "06:20 PM", workArrangement: "On-site",
    totalActualHours: 6.5, totalEstHours: 8, tasksCompleted: 2, tasksTotal: 4,
    checklistDone: 4, status: "Revision Requested", rating: 2,
    supervisorName: "Reyes, Antonio", supervisorComment: "Please clarify the blockers and update the task board.",
  },
  {
    id: "DAR-2026-0521-010", referenceNo: "DAR-2026-0521-010",
    employeeName: "Bautista, Mark", department: "Software Development", project: "Mobile App",
    date: "2026-05-21", submittedAt: "05:48 PM", workArrangement: "Work From Home",
    totalActualHours: 8, totalEstHours: 8, tasksCompleted: 4, tasksTotal: 4,
    checklistDone: 6, status: "Pending Review",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RATING_LABELS: Record<number, string> = {
  1: "Needs Improvement", 2: "Below Expectations", 3: "Meets Expectations",
  4: "Exceeds Expectations", 5: "Outstanding",
};

// Maps to the project's existing badge CSS classes
const statusBadgeClass: Record<ReportStatus, string> = {
  "Pending Review":     "badge badge-warning",
  "Approved":           "badge badge-success",
  "Revision Requested": "badge badge-info",
  "Rejected":           "badge badge-danger",
};


function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={statusBadgeClass[status]}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

function StarRow({ rating, interactive = false, hoverRating = 0, onHover, onClick }: {
  rating: number;
  interactive?: boolean;
  hoverRating?: number;
  onHover?: (r: number) => void;
  onClick?: (r: number) => void;
}) {
  const display = hoverRating || rating;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => onHover?.(i)}
          onMouseLeave={() => onHover?.(0)}
          onClick={() => onClick?.(i)}
          className={interactive ? "transition-transform hover:scale-125" : "cursor-default"}
          style={{ background: "none", border: "none", padding: "1px" }}
        >
          <Star
            className={`w-4 h-4 ${i <= display ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

function ArrangementBadge({ arr }: { arr: string }) {
  const cls =
    arr === "On-site"        ? "badge badge-success" :
    arr === "Work From Home" ? "badge badge-info" :
                               "badge badge-warning";
  return <span className={cls}><span className="badge-dot" />{arr}</span>;
}

// ─── Review Panel (Section 7 + Section 8) ────────────────────────────────────

function ReviewPanel({
  report,
  onSave,
  onClose,
}: {
  report: SubmittedReport;
  onSave: (updated: Partial<SubmittedReport>) => void;
  onClose: () => void;
}) {
  const now = new Date();
  const timeStr = now.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });

  const [activeTab, setActiveTab]           = useState<"s7" | "s8">("s7");
  const [rating, setRating]                 = useState<Rating>(report.rating || 3);
  const [hoverRating, setHoverRating]       = useState(0);
  const [supervisorName, setSupervisorName] = useState(report.supervisorName || "");
  const [comment, setComment]               = useState(report.supervisorComment || "");
  const [perfScore, setPerfScore]           = useState(report.performanceScore || 80);
  const [taskVerif, setTaskVerif]           = useState(report.taskVerification || "Verified");
  const [attendVerif, setAttendVerif]       = useState(report.attendanceVerified ?? true);
  const [outputQuality, setOutputQuality]   = useState(report.outputQuality || "Meets Expectations");
  const [decision, setDecision]             = useState<ReportStatus>(
    report.status === "Pending Review" ? "Approved" : report.status
  );
  const [empAck, setEmpAck]                 = useState(report.acknowledgedByEmployee ?? false);
  const [adminAck, setAdminAck]             = useState(report.acknowledgedByAdmin ?? false);
  const [finalRemarks, setFinalRemarks]     = useState(report.finalRemarks || "");

  const handleSave = () => {
    onSave({
      rating, supervisorName, supervisorComment: comment,
      performanceScore: perfScore, taskVerification: taskVerif,
      attendanceVerified: attendVerif, outputQuality,
      status: decision,
      acknowledgedByEmployee: empAck, acknowledgedByAdmin: adminAck,
      finalRemarks,
    });

    // Trigger notification sa TopBar
    const notif = {
      id: Date.now(),
      title: decision === "Approved"
        ? "✓ Report Approved"
        : decision === "Revision Requested"
        ? "↩ Revision Requested"
        : decision === "Rejected"
        ? "✕ Report Rejected"
        : "Report Reviewed",
      message: `${report.employeeName}'s DAR (${report.referenceNo}) has been ${decision.toLowerCase()} by ${supervisorName || "Supervisor"}.`,
      time: "Just now",
      type: "system",
    };
    localStorage.setItem("attendance_notification", JSON.stringify(notif));

    onClose();
  };

  const displayRating = hoverRating || rating;

  const decisionColor: Record<ReportStatus, string> = {
    "Approved":           "#059669",
    "Revision Requested": "#2563eb",
    "Rejected":           "#dc2626",
    "Pending Review":     "#d97706",
  };

  const scoreColor = perfScore >= 90 ? "#059669" : perfScore >= 70 ? "#d97706" : "#dc2626";

  return (
    <div className="pro-modal-overlay" onClick={onClose}>
      <div
        className="pro-modal"
        style={{ maxWidth: 740, width: "95vw" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="pro-modal-header"
          style={{
            background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
            borderRadius: "16px 16px 0 0",
            padding: "22px 28px",
            display: "block",
          }}
        >
          {/* Top row: ref + status + close */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontFamily: "monospace", fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6,
                padding: "3px 10px", letterSpacing: "0.04em",
              }}>
                {report.referenceNo}
              </span>
              <span className={statusBadgeClass[report.status]} style={{ fontSize: 11 }}>
                <span className="badge-dot" />{report.status}
              </span>
            </div>
            <button onClick={onClose} className="btn-ghost btn-icon" style={{ color: "rgba(255,255,255,0.8)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Employee info */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: 0, lineHeight: 1.2 }}>
              {report.employeeName}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 3 }}>
              {report.department} &nbsp;·&nbsp; {report.project} &nbsp;·&nbsp; {report.date}
            </p>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex", gap: 6, flexWrap: "wrap",
          }}>
            {[
              { icon: <Clock className="w-3 h-3" />, label: "Actual hrs", val: `${report.totalActualHours}h` },
              { icon: <CheckCircle className="w-3 h-3" />, label: "Tasks", val: `${report.tasksCompleted}/${report.tasksTotal}` },
              { icon: <ClipboardList className="w-3 h-3" />, label: "Checklist", val: `${report.checklistDone}/6` },
              { icon: <Clock className="w-3 h-3" />, label: "Submitted", val: report.submittedAt },
            ].map(c => (
              <div key={c.label} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.1)", borderRadius: 8,
                padding: "5px 12px", border: "1px solid rgba(255,255,255,0.15)",
              }}>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{c.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 12, color: "#fff" }}>{c.val}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="px-6 pt-3">
          <div className="pro-tabs">
            {[
              { key: "s7", label: "Section 7: Supervisor Review" },
              { key: "s8", label: "Section 8: Final Sign-off" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as "s7" | "s8")}
                className={`pro-tab ${activeTab === t.key ? "active" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="pro-modal-body" style={{ maxHeight: "58vh", overflowY: "auto" }}>

          {/* ══ SECTION 7 ══ */}
          {activeTab === "s7" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Section label — left border accent style */}
              <div style={{
                borderLeft: "3px solid #059669", paddingLeft: 12,
                display: "flex", flexDirection: "column", gap: 1,
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Section 7
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                  Supervisor / Admin Review
                </span>
              </div>

              {/* ── Rating + Score side by side ── */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr auto", gap: 16,
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 12, padding: 20,
              }}>
                {/* Left: stars + fields */}
                <div>
                  <p className="pro-label" style={{ marginBottom: 10 }}>Overall Performance Rating</p>

                  {/* Stars */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1,2,3,4,5].map(i => (
                        <button
                          key={i} type="button"
                          onMouseEnter={() => setHoverRating(i)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(i as Rating)}
                          style={{ background: "none", border: "none", padding: 2, cursor: "pointer",
                            transition: "transform 0.1s" }}
                          onMouseDown={e => (e.currentTarget.style.transform = "scale(1.3)")}
                          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                        >
                          <Star style={{
                            width: 26, height: 26,
                            fill: i <= displayRating ? "#f59e0b" : "none",
                            color: i <= displayRating ? "#f59e0b" : "#d1d5db",
                            transition: "all 0.1s",
                          }} />
                        </button>
                      ))}
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: "#059669", padding: "4px 12px",
                      background: "#dcfce7", borderRadius: 20,
                      border: "1px solid #86efac",
                    }}>
                      {RATING_LABELS[displayRating]}
                    </span>
                  </div>

                  {/* Supervisor + Date */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label className="pro-label">Supervisor Name</label>
                      <input className="pro-input" value={supervisorName}
                        onChange={e => setSupervisorName(e.target.value)}
                        placeholder="Enter supervisor name" />
                    </div>
                    <div>
                      <label className="pro-label">Review Date & Time</label>
                      <input className="pro-input" value={timeStr} readOnly
                        style={{ background: "#f9fafb", color: "#9ca3af", cursor: "not-allowed" }} />
                    </div>
                  </div>
                </div>

                {/* Right: Score dial */}
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 8,
                  background: "#fff", border: "1px solid #bbf7d0",
                  borderRadius: 12, padding: "16px 24px", minWidth: 120,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Score
                  </div>
                  <div style={{ fontSize: 44, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                    {perfScore}
                  </div>
                  <div style={{ fontSize: 10, color: "#9ca3af" }}>out of 100</div>
                  <input type="range" min={0} max={100} value={perfScore}
                    onChange={e => setPerfScore(Number(e.target.value))}
                    style={{ width: 90, accentColor: "#059669", marginTop: 4 }} />
                </div>
              </div>

              {/* ── Verification & Decision ── */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Verification & Decision
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {[
                    { label: "Task Verification", val: taskVerif, set: setTaskVerif,
                      opts: ["Verified","Partially Verified","Not Verified","Pending Verification"] },
                    { label: "Output Quality", val: outputQuality, set: setOutputQuality,
                      opts: ["Exceeds Expectations","Meets Expectations","Below Expectations","Needs Improvement"] },
                    { label: "Review Decision", val: decision,
                      set: (v: string) => setDecision(v as ReportStatus),
                      opts: ["Approved","Revision Requested","Rejected","Pending Review"],
                      color: decisionColor[decision] },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="pro-label">{f.label}</label>
                      <select className="pro-select"
                        value={f.val} onChange={e => f.set(e.target.value)}
                        style={f.color ? { color: f.color, fontWeight: 700 } : {}}
                      >
                        {f.opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Attendance toggle */}
                <button type="button" onClick={() => setAttendVerif(v => !v)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    border: `1.5px solid ${attendVerif ? "#6ee7b7" : "#e5e7eb"}`,
                    background: attendVerif ? "#f0fdf4" : "#f9fafb",
                    transition: "all 0.15s",
                  }}
                >
                  {attendVerif
                    ? <CheckSquare style={{ width: 16, height: 16, color: "#059669", flexShrink: 0 }} />
                    : <Square style={{ width: 16, height: 16, color: "#9ca3af", flexShrink: 0 }} />
                  }
                  <span style={{ fontSize: 13, fontWeight: 500, color: attendVerif ? "#065f46" : "#6b7280" }}>
                    Attendance & time log verified against system records
                  </span>
                </button>
              </div>

              {/* ── Comments ── */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <label className="pro-label" style={{ marginBottom: 8, display: "block" }}>
                  Supervisor Comments & Feedback
                </label>
                <textarea className="pro-input" rows={4} value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Provide detailed feedback on employee performance, quality of work, areas for improvement..."
                  style={{ resize: "vertical", marginTop: 4 }}
                />
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                  This comment will be visible to the employee once the report is approved.
                </p>
              </div>
            </div>
          )}

          {/* ══ SECTION 8 ══ */}
          {activeTab === "s8" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Section label */}
              <div style={{ borderLeft: "3px solid #2563eb", paddingLeft: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>
                  Section 8
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", display: "block" }}>
                  Final Acknowledgment & Sign-off
                </span>
              </div>

              {/* Summary card */}
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 18 }}>
                <p className="pro-label" style={{ marginBottom: 10 }}>Report Summary</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <span style={{
                    fontFamily: "monospace", fontSize: 11, fontWeight: 700,
                    background: "#fff", border: "1px solid #bfdbfe",
                    borderRadius: 6, padding: "3px 10px", color: "#1d4ed8",
                  }}>{report.referenceNo}</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {report.date} at {report.submittedAt}
                  </span>
                  <StatusBadge status={decision} />
                </div>
                {rating > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#fff", borderRadius: 8, padding: "10px 14px",
                    border: "1px solid #bfdbfe",
                  }}>
                    <StarRow rating={rating} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
                      {RATING_LABELS[rating]}
                    </span>
                    <span style={{
                      marginLeft: "auto", fontSize: 16, fontWeight: 900,
                      color: scoreColor,
                    }}>{perfScore}<span style={{ fontSize: 10, fontWeight: 500, color: "#9ca3af" }}>/100</span></span>
                  </div>
                )}
              </div>

              {/* Final remarks */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <label className="pro-label" style={{ display: "block", marginBottom: 8 }}>
                  Final Remarks <span style={{ fontWeight: 400, color: "#9ca3af", textTransform: "none", letterSpacing: 0 }}>(Optional)</span>
                </label>
                <textarea className="pro-input" rows={3} value={finalRemarks}
                  onChange={e => setFinalRemarks(e.target.value)}
                  placeholder="Any final remarks or instructions for the employee..."
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* Dual sign-off */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <p className="pro-label" style={{ marginBottom: 14 }}>Digital Sign-off</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { title: "Employee Acknowledgment", checked: empAck, toggle: () => setEmpAck(v => !v),
                      label: "Employee confirms report accuracy", sigName: report.employeeName.split(",")[0] },
                    { title: "Supervisor Sign-off", checked: adminAck, toggle: () => setAdminAck(v => !v),
                      label: "I certify this review is accurate", sigName: supervisorName || "Supervisor" },
                  ].map(sig => (
                    <div key={sig.title}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>{sig.title}</p>
                      <button type="button" onClick={sig.toggle} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 8,
                        padding: "9px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                        marginBottom: 8, fontSize: 12, fontWeight: 500,
                        border: `1.5px solid ${sig.checked ? "#6ee7b7" : "#e5e7eb"}`,
                        background: sig.checked ? "#f0fdf4" : "#f9fafb",
                        color: sig.checked ? "#065f46" : "#6b7280",
                        transition: "all 0.15s",
                      }}>
                        {sig.checked
                          ? <CheckSquare style={{ width: 15, height: 15, color: "#059669", flexShrink: 0 }} />
                          : <Square style={{ width: 15, height: 15, color: "#9ca3af", flexShrink: 0 }} />
                        }
                        {sig.label}
                      </button>
                      <div style={{
                        borderRadius: 10, padding: "14px 12px", textAlign: "center",
                        minHeight: 64, display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 4,
                        border: `1.5px ${sig.checked ? "solid #6ee7b7" : "dashed #e5e7eb"}`,
                        background: sig.checked ? "#f0fdf4" : "#fafafa",
                        transition: "all 0.2s",
                      }}>
                        {sig.checked ? (
                          <>
                            <p style={{ fontWeight: 800, fontStyle: "italic", color: "#065f46", fontSize: 15 }}>
                              {sig.sigName}
                            </p>
                            <p style={{ fontSize: 10, color: "#9ca3af" }}>✓ Acknowledged · {timeStr}</p>
                          </>
                        ) : (
                          <p style={{ fontSize: 12, color: "#9ca3af" }}>Awaiting acknowledgment</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                background: "#fffbeb", border: "1px solid #fde68a",
                borderRadius: 10, padding: "12px 16px",
              }}>
                <AlertTriangle style={{ width: 15, height: 15, color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
                  Once submitted, this review will be finalized and the employee will be notified.
                  Ensure all information is accurate before saving.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="pro-modal-footer" style={{ borderTop: "1px solid #f1f5f9", gap: 8 }}>
          {activeTab === "s8" && (
            <button onClick={() => setActiveTab("s7")} className="btn btn-secondary">
              ← Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          {activeTab === "s7" ? (
            <button
              onClick={() => setActiveTab("s8")}
              className="btn btn-primary"
            >
              Next → Section 8
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="btn flex items-center gap-2 text-white font-semibold px-5 py-2 rounded-xl"
              style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
            >
              <CheckSquare className="w-4 h-4" /> Save & Finalize
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

const AdminDailyAccomplishmentReport = () => {
  const [reports, setReports]               = useState<SubmittedReport[]>(MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState<SubmittedReport | null>(null);
  const [search, setSearch]                 = useState("");
  const [filterStatus, setFilterStatus]     = useState("All");
  const [filterDept, setFilterDept]         = useState("All");

  const pending  = reports.filter(r => r.status === "Pending Review").length;
  const approved = reports.filter(r => r.status === "Approved").length;
  const revision = reports.filter(r => r.status === "Revision Requested").length;
  const total    = reports.length;

  const departments = ["All", ...Array.from(new Set(reports.map(r => r.department)))];

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    return (
      (r.employeeName.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)) &&
      (filterStatus === "All" || r.status === filterStatus) &&
      (filterDept   === "All" || r.department === filterDept)
    );
  });

  const handleSaveReview = (updated: Partial<SubmittedReport>) => {
    if (!selectedReport) return;
    setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, ...updated } : r));
  };

  const statCards = [
    {
      label: "Total Submitted",
      value: total,
      icon: ClipboardList,
      gradient: "linear-gradient(135deg, #0f766e, #0d9488)",
    },
    {
      label: "Pending Review",
      value: pending,
      icon: Clock,
      gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
    },
    {
      label: "Approved",
      value: approved,
      icon: CheckCircle,
      gradient: "linear-gradient(135deg, #059669, #10b981)",
    },
    {
      label: "Revision Needed",
      value: revision,
      icon: RefreshCw,
      gradient: "linear-gradient(135deg, #2563eb, #3b82f6)",
    },
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="stat-card animate-fade-in-up"
            style={{
              background: card.gradient,
              animationDelay: `${i * 0.1}s`,
              opacity: 0,
            }}
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="stat-label">{card.label}</p>
                <p className="stat-value">{card.value}</p>
              </div>
              <div className="stat-icon">
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="pro-card animate-fade-in-up" style={{ animationDelay: "0.4s", opacity: 0 }}>

        {/* Card Header — title left, all filters right, single row */}
        <div
          className="px-6 py-4 border-b border-gray-100"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
        >
          {/* Left: title + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>Submitted Reports</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#b45309",
              background: "#fef3c7", borderRadius: 20, padding: "2px 8px",
            }}>
              {filtered.length}
            </span>
          </div>

          {/* Right: filters in one row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search style={{
                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                width: 14, height: 14, color: "#9ca3af", pointerEvents: "none",
              }} />
              <input
                className="pro-input"
                style={{ paddingLeft: 32, width: 200, boxSizing: "border-box" }}
                placeholder="Search employee, project..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Status dropdown */}
            <select
              className="pro-select"
              style={{ width: 150, boxSizing: "border-box" }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              {["Pending Review", "Approved", "Revision Requested", "Rejected"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>

            {/* Department dropdown */}
            <select
              className="pro-select"
              style={{ width: 150, boxSizing: "border-box" }}
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
            >
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>

            {/* Export */}
            <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              <Download className="w-3.5 h-3.5" /> Export
            </button>

          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="pro-table" style={{ tableLayout: "auto", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap", width: 130 }}>Ref #</th>
                  <th style={{ whiteSpace: "nowrap" }}>Employee</th>
                  <th style={{ whiteSpace: "nowrap" }}>Department</th>
                  <th style={{ whiteSpace: "nowrap" }}>Project</th>
                  <th style={{ whiteSpace: "nowrap" }}>Date</th>
                  <th style={{ whiteSpace: "nowrap" }}>Submitted</th>
                  <th style={{ whiteSpace: "nowrap" }}>Arrangement</th>
                  <th style={{ whiteSpace: "nowrap" }}>Hours</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Tasks</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Checklist</th>
                  <th style={{ whiteSpace: "nowrap" }}>Rating</th>
                  <th style={{ whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-8 text-gray-400 italic">
                      No reports found matching your filters.
                    </td>
                  </tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className="cursor-pointer" onClick={() => setSelectedReport(r)}>
                    {/* Ref # — styled like AST-001 */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#374151",
                        letterSpacing: "0.03em",
                      }}>
                        {r.referenceNo}
                      </span>
                    </td>

                    {/* Employee */}
                    <td style={{ whiteSpace: "nowrap", fontWeight: 600, color: "#111827" }}>
                      {r.employeeName}
                    </td>

                    {/* Department */}
                    <td style={{ whiteSpace: "nowrap", color: "#6b7280", fontSize: 13 }}>
                      {r.department}
                    </td>

                    {/* Project */}
                    <td style={{ whiteSpace: "nowrap", color: "#374151", fontSize: 13 }}>
                      {r.project}
                    </td>

                    {/* Date */}
                    <td style={{ whiteSpace: "nowrap", fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>
                      {r.date}
                    </td>

                    {/* Submitted */}
                    <td style={{ whiteSpace: "nowrap", fontSize: 13, color: "#6b7280" }}>
                      {r.submittedAt}
                    </td>

                    {/* Arrangement */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      <ArrangementBadge arr={r.workArrangement} />
                    </td>

                    {/* Hours */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar" style={{ width: 52 }}>
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${Math.min(100, (r.totalActualHours / 9) * 100)}%`,
                              background: "linear-gradient(90deg,#059669,#10b981)",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                          {r.totalActualHours}h
                        </span>
                      </div>
                    </td>

                    {/* Tasks */}
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: r.tasksCompleted === r.tasksTotal ? "#059669" : "#374151",
                      }}>
                        {r.tasksCompleted}/{r.tasksTotal}
                      </span>
                    </td>

                    {/* Checklist */}
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: r.checklistDone === 6 ? "#059669"
                          : r.checklistDone >= 4 ? "#d97706" : "#ef4444",
                      }}>
                        {r.checklistDone}/6
                      </span>
                    </td>

                    {/* Rating */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      {r.rating
                        ? <StarRow rating={r.rating} />
                        : <span style={{ color: "#d1d5db", fontSize: 13 }}>—</span>
                      }
                    </td>

                    {/* Status */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedReport(r)}
                        className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"
                        title={r.status === "Pending Review" ? "Review" : "View"}
                      >
                        {r.status === "Pending Review"
                          ? <Star className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-400">
              Showing {filtered.length} of {total} submissions
            </span>
            <div className="flex gap-1">
              {[
                { label: <ChevronLeft className="w-4 h-4" />, active: false },
                { label: "1", active: true },
                { label: <ChevronRight className="w-4 h-4" />, active: false },
              ].map((b, i) => (
                <button
                  key={i}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center transition-colors ${
                    b.active
                      ? "text-white border-transparent"
                      : "text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                  style={b.active ? { background: "linear-gradient(90deg,#059669,#047857)" } : {}}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <ReviewPanel
          report={selectedReport}
          onSave={handleSaveReview}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

export default AdminDailyAccomplishmentReport;