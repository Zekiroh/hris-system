import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  X, Star, CheckSquare, Square,
  AlertTriangle, Clock, CheckCircle, ClipboardList, RefreshCw,
  History,
} from "lucide-react";
import { DARViewModal, type DarSubmission } from "../../user/components/UserReportModals";
import { SignaturePad } from "../../user/daily-report/UserDailyReportSections";
import {
  RATING_LABELS,
  statusBadgeClass,
  type Rating,
  type ReportStatus,
  type SubmittedReport,
} from "./AdminReportModals.shared";

// ─── Types ────────────────────────────────────────────────────────────────────


// ─── Shared Sub-components ────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={statusBadgeClass[status]}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

export function StarRow({ rating, interactive = false, hoverRating = 0, onHover, onClick }: {
  rating: number;
  interactive?: boolean;
  hoverRating?: number;
  onHover?: (r: number) => void;
  onClick?: (r: number) => void;
}) {
  const display = hoverRating || rating;
  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i} type="button"
          disabled={!interactive}
          onMouseEnter={() => onHover?.(i)}
          onMouseLeave={() => onHover?.(0)}
          onClick={() => onClick?.(i)}
          className={interactive ? "transition-transform hover:scale-125" : "cursor-default"}
          style={{ background: "none", border: "none", padding: "1px" }}
        >
          <Star className={`w-4 h-4 ${i <= display ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

export function ArrangementBadge({ arr }: { arr: string }) {
  const cls =
    arr === "On-site"        ? "badge badge-success" :
    arr === "Work From Home" ? "badge badge-info" :
                               "badge badge-warning";
  return <span className={cls}><span className="badge-dot" />{arr}</span>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Cutoff time for "late" submission — adjust as needed once backend defines shift end times
const LATE_CUTOFF_HOUR_24 = 18; // 6:00 PM

function isLateSubmission(submittedAt?: string): boolean {
  if (!submittedAt) return false;
  const match = submittedAt.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return false;
  let hour = parseInt(match[1], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour >= LATE_CUTOFF_HOUR_24;
}

// ─── 1. ViewDarModal ──────────────────────────────────────────────────────────
// Thin wrapper sa paligid ng employee-side DARViewModal (mode="view") — kaya
// pareho na ang itsura ng admin view sa employee's own report view, may ilang
// admin-only additions lang (late badge, revision badge, print, proceed-to-review).

interface ViewDarModalProps {
  report: SubmittedReport;
  onClose: () => void;
  onReviewClick?: () => void;
  onRequestRevision?: (reason: string) => void;
}

function reportToDarSubmission(report: SubmittedReport): DarSubmission {
  const sub = report._raw || {};
  const checklistArr: boolean[] = Array.isArray(sub.checklistItems)
    ? sub.checklistItems
    : Array.isArray(sub.checklistDone)
    ? sub.checklistDone
    : Array(6).fill(false).map((_, i) => i < (report.checklistDone || 0));

  return {
    ...sub,
    date: sub.date || report.date,
    devName: sub.devName || report.employeeName,
    workArr: sub.workArr || report.workArrangement,
    project: sub.project || report.project,
    team: sub.team || report.department,
    status: report.status,
    submittedAt: sub.submittedAt || report.submittedAt,
    taskDetails: sub.taskDetails || [],
    checklistDone: checklistArr,
    checklist: checklistArr.filter(Boolean).length,
  };
}

export function ViewDarModal({ report, onClose, onReviewClick, onRequestRevision }: ViewDarModalProps) {
  const submission = reportToDarSubmission(report);
  const [revisionPanelOpen, setRevisionPanelOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState(report.revisionReason || "");
  const [revisionConfirmOpen, setRevisionConfirmOpen] = useState(false);

  const handleConfirmRevision = () => {
    setRevisionConfirmOpen(false);
    setRevisionPanelOpen(false);
    onRequestRevision?.(revisionReason);
    toast.success(`Revision requested for ${report.employeeName}'s report.`);
  };

  const extraBadges = (
    <>
      {isLateSubmission(submission.submittedAt) && (
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-rose-500/90 text-white flex items-center gap-1">
          <Clock className="w-3 h-3" /> Late Submission
        </span>
      )}
      {(report.revisionCount || 0) > 0 && (
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/20 text-white flex items-center gap-1">
          <History className="w-3 h-3" /> Revised {report.revisionCount}×
        </span>
      )}
    </>
  );

  const revisionNote = (report.revisionCount || 0) > 0 ? (
    <div className="mb-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-1.5 flex items-center gap-2">
        <History className="w-3.5 h-3.5" /> Revision History
      </p>
      <p className="text-xs text-blue-800">
        This report has been revised <strong>{report.revisionCount}</strong> time{report.revisionCount === 1 ? "" : "s"}
        {report.lastRevisedAt ? <> — last updated <strong>{report.lastRevisedAt}</strong></> : null}.
      </p>
    </div>
  ) : null;

  return (
    <>
      <DARViewModal
        open={true}
        onClose={onClose}
        mode="view"
        submission={submission}
        title="Daily Accomplishment Report"
        extraBadges={extraBadges}
        beforeAcknowledgment={revisionNote}
        footerLeft={
          onRequestRevision ? (
            <button type="button" onClick={() => setRevisionPanelOpen(true)}
              className="btn flex items-center gap-2 font-semibold px-5 py-2 rounded-xl"
              style={{ background: "white",color:"#d59602", border: "1.5px solid #fadb92" }}>
              <RefreshCw className="w-4 h-4" /> Request Revision
            </button>
          ) : null
        }
        footerRight={onReviewClick ? (
          <button type="button" onClick={onReviewClick}
            className="btn flex items-center gap-2 text-white font-semibold px-5 py-2 rounded-xl"
            style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
            <Star className="w-4 h-4" /> Proceed to Review
          </button>
        ) : null}
        shiftRight={revisionPanelOpen}
      />

      {/* Slide-in Revision Panel (from left, no backdrop — main report stays visible & scrollable) */}
      {revisionPanelOpen && createPortal(
        <div
          className="animate-slide-in-left"
          style={{
            position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 10000,
            width: "420px", maxWidth: "90vw", background: "#fff",
            display: "flex", flexDirection: "column", boxShadow: "8px 0 24px rgba(0,0,0,0.15)",
          }}
        >
            {/* Panel Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.08em" }}>Request Revision</p>
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{report.employeeName} — {report.date}</p>
              </div>
              <button onClick={() => setRevisionPanelOpen(false)} className="btn-ghost btn-icon">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Panel Body */}
            <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
              <label className="pro-label" style={{ marginBottom: 8, display: "block" }}>
                What needs to be revised? <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                className="pro-input"
                rows={10}
                value={revisionReason}
                onChange={e => setRevisionReason(e.target.value)}
                placeholder='e.g. "Task 2 is missing a commit link", "Actual hours don&apos;t match your time log", "Please fill out the Blockers section"'
                style={{ resize: "vertical" }}
              />
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
                Be specific — mention which task or section needs changes so the employee knows exactly what to fix.
              </p>
            </div>

            {/* Panel Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setRevisionPanelOpen(false)}>Cancel</button>
              <button
                type="button"
                disabled={!revisionReason.trim()}
                onClick={() => setRevisionConfirmOpen(true)}
                className="btn flex items-center gap-2 font-semibold px-5 py-2 rounded-xl"
                style={{
                  background: revisionReason.trim() ? "linear-gradient(135deg, #059669, #047857)" : "#e5e7eb", 
                  color: revisionReason.trim() ? "#fff" : "#9ca3af",
                  cursor: revisionReason.trim() ? "pointer" : "not-allowed",
                }}
              >
                <RefreshCw className="w-4 h-4" /> Send for Revision
              </button>
            </div>
        </div>,
        document.body
      )}

      {/* Confirm Revision Modal */}
      {revisionConfirmOpen && createPortal(
        <div className="pro-modal-overlay" style={{ zIndex: 10001 }} onClick={() => setRevisionConfirmOpen(false)}>
          <div className="pro-modal w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Send this back for revision?</p>
                <p className="text-xs text-gray-400">{report.employeeName} will be notified and asked to resubmit this report.</p>
              </div>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setRevisionConfirmOpen(false)} className="btn btn-secondary text-sm">Cancel</button>
              <button type="button" onClick={handleConfirmRevision} className="btn flex items-center gap-2 text-sm text-white font-semibold px-4 py-2 rounded-xl" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
                <RefreshCw className="w-4 h-4" /> Yes, Send
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}





// ─── 2. ReviewPanel ───────────────────────────────────────────────────────────

interface ReviewPanelProps {
  report: SubmittedReport;
  onSave: (updated: Partial<SubmittedReport>) => void;
  onClose: () => void;
  currentAdminName: string; // logged-in admin's name — parehong pattern ng "devName" sa employee side
}

export function ReviewPanel({ report, onSave, onClose, currentAdminName }: ReviewPanelProps) {
  const now = new Date();
  const timeStr = now.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
  const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

  const [activeTab, setActiveTab]           = useState<"s7" | "s8">("s7");
  const [rating, setRating]                 = useState<Rating>(report.rating || 0 as Rating);
  const [hoverRating, setHoverRating]       = useState(0);
  const [supervisorName]                    = useState(report.supervisorName || currentAdminName || "");
  const [comment, setComment]               = useState(report.supervisorComment || "");
  const [perfScore, setPerfScore]           = useState(report.performanceScore || 0);
  const taskVerif                           = report.taskVerification || "Verified";
  const attendVerif                         = report.attendanceVerified ?? true;
  const [taskCompletion, setTaskCompletion]   = useState(report.taskCompletion || "");
  const [decision, setDecision]             = useState<ReportStatus>(
    report.status || "Pending Review"
  );
  const [signature, setSignature]           = useState(report.supervisorSignature || "");
  const finalRemarks                        = report.finalRemarks || "";
  const [followUpRequired, setFollowUpRequired] = useState(report.followUpRequired ?? false);
  const [managerActionItems, setManagerActionItems] = useState(report.managerActionItems || "");
  const [isEditing, setIsEditing]           = useState(report.status === "Pending Review");
  const [confirmOpen, setConfirmOpen]       = useState(false);

  const handleSave = () => {
    if (!taskCompletion) { toast.error("Please select a Task Completion Rate before saving."); return; }
    if (!rating || (rating as number) === 0) { toast.error("Please provide a performance rating before saving."); return; }
    if (!decision || decision === "Pending Review") { toast.error("Please select a Review Decision before saving."); return; }
    if (!signature) { toast.error("Supervisor signature is required before finalizing."); return; }
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    setConfirmOpen(false);
    onSave({ rating, supervisorName, supervisorComment: comment, performanceScore: perfScore, taskVerification: taskVerif, attendanceVerified: attendVerif, taskCompletion, status: decision, supervisorSignature: signature, finalRemarks, followUpRequired, managerActionItems });
    toast.success(`${report.employeeName}'s report has been ${decision.toLowerCase()}.`);
    onClose();
  };

  const goToTab = (key: "s7" | "s8") => {
    if (key === "s8") {
      if (!taskCompletion) { toast.error("Please select a Task Completion Rate first."); return; }
      if (!rating || (rating as number) === 0) { toast.error("Please provide a performance rating first."); return; }
      if (!supervisorName.trim()) { toast.error("Please enter the Supervisor Name."); return; }
    }
    setActiveTab(key);
  };

  const displayRating = hoverRating || rating;
  const decisionColor: Record<ReportStatus, string> = {
    "Approved": "#059669", "Revision Requested": "#2563eb",
    "Rejected": "#dc2626", "Pending Review": "#d97706",
  };
  const scoreColor = perfScore >= 90 ? "#059669" : perfScore >= 70 ? "#d97706" : "#dc2626";

  return (
    <div onClick={onClose} style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0,
      width: "100vw", height: "100vh", zIndex: 9999,
      backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxSizing: "border-box", overflowY: "auto",
    }}>
      <div className="pro-modal" style={{ maxWidth: 740, width: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="pro-modal-header" style={{ background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)", borderRadius: "16px 16px 0 0", padding: "22px 28px", display: "block" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "3px 10px", letterSpacing: "0.04em" }}>
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
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: 0, lineHeight: 1.2 }}>{report.employeeName}</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 3 }}>
              {report.department} · {report.project} · {report.date}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { icon: <Clock className="w-3 h-3" />, label: "Actual hrs", val: `${report.totalActualHours}h` },
              { icon: <CheckCircle className="w-3 h-3" />, label: "Tasks", val: `${report.tasksCompleted}/${report.tasksTotal}` },
              { icon: <ClipboardList className="w-3 h-3" />, label: "Checklist", val: `${report.checklistDone}/6` },
              { icon: <Clock className="w-3 h-3" />, label: "Submitted", val: report.submittedAt },
            ].map(c => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 12px", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{c.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 12, color: "#fff" }}>{c.val}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3">
          <div className="pro-tabs">
            {[
              { key: "s7", label: "Supervisor Review", icon: Star },
              { key: "s8", label: "Final Sign-off", icon: CheckSquare },
            ].map(t => (
              <button key={t.key} onClick={() => goToTab(t.key as "s7" | "s8")} className={`pro-tab flex items-center gap-1.5 ${activeTab === t.key ? "active" : ""}`}>
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="pro-modal-body" style={{ maxHeight: "45vh", overflowY: "auto" }}>

          {/* Section 7 */}
          {activeTab === "s7" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <div>
                  <label className="pro-label" style={{ fontSize: 10 }}>Supervisor Name</label>
                  <input className="pro-input" value={supervisorName} readOnly placeholder="—" style={{ fontSize: 12, padding: "10px", background: "#fff", color: "#374151", cursor: "not-allowed" }} />
                </div>
                <div>
                  <label className="pro-label" style={{ fontSize: 10 }}>Review Date</label>
                  <input className="pro-input" value={dateStr} readOnly style={{ background: "#fff", color: "#374151", cursor: "not-allowed", fontSize: 12, padding: "10px" }} />
                </div>
              </div>
              

              {/* <div style={{ borderLeft: "3px solid #059669", paddingLeft: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>Section 7</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", display: "block" }}>Supervisor Remarks</span>
              </div> */}

              {/* Rating + Score */}
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 14 }}>
                <label className="pro-label" style={{ marginBottom: 8, display: "block", fontWeight: 600, width: "100%" }}>Overall Performance Rating</label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                <div>

                  
                  {/* Task Completion Rate */}
                  <div>
                    <label className="pro-label" style={{ fontSize: 10 }}>Task Completion Rate</label>
                    <select className="pro-select" value={taskCompletion} onChange={e => setTaskCompletion(e.target.value)} disabled={!isEditing}
                      style={{ fontSize: 12, padding: "10px", opacity: !isEditing ? 0.6 : 1, cursor: !isEditing ? "not-allowed" : "pointer", width: "100%" }}>
                      <option value="" disabled>---</option>
                      {["Fully Completed","Mostly Completed","Partially Completed","Not Completed"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  {/* Review Decision */}
                  <div style={{ marginTop: 8 }}>
                    <label className="pro-label" style={{ fontSize: 10 }}>Review Decision <span style={{ color: "#ef4444" }}>*</span></label>
                    <select className="pro-select" value={decision} onChange={e => setDecision(e.target.value as ReportStatus)} disabled={!isEditing}
                      style={{ fontSize: 12, padding: "10px", fontWeight: 700, color: decisionColor[decision], opacity: !isEditing ? 0.6 : 1, cursor: !isEditing ? "not-allowed" : "pointer", width: "100%" }}>
                      <option value="Pending Review" disabled>--- Select Decision ---</option>
                      <option value="Approved">Approved</option>
                      <option value="Revision Requested">Revision Requested</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  {/* Stars container */}
                  <label className="pro-label" style={{ fontSize: 10 }}>Work Quality Rating</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", marginBottom: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(i => (
                        <button key={i} type="button"
                          onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)}
                          onClick={() => { setRating(i as Rating); setPerfScore(i * 20); }}
                          disabled={!isEditing}
                          style={{ background: "none", border: "none", padding: 1, cursor: !isEditing ? "not-allowed" : "pointer", opacity: !isEditing ? 0.6 : 1, transition: "transform 0.1s" }}
                          onMouseDown={e => (e.currentTarget.style.transform = "scale(1.3)")}
                          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}>
                          <Star style={{ width: 18, height: 18, fill: i <= displayRating ? "#f59e0b" : "none", color: i <= displayRating ? "#f59e0b" : "#d1d5db", transition: "all 0.1s" }} />
                        </button>
                      ))}
                    </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", padding: "3px 8px", background: "#dcfce7", borderRadius: 20, border: "1px solid #86efac" }}>
                        {RATING_LABELS[displayRating] ?? "Select a rating"}
                      </span>
                  </div>

                  
                </div>
                    
                {/* Score dial */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, padding: "10px 14px", minWidth: 80, marginTop: 16}}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Score</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {[{ op: "-", fn: () => { const v = Math.max(0, perfScore - 1); setPerfScore(v); setRating((v <= 20 ? 1 : v <= 40 ? 2 : v <= 60 ? 3 : v <= 80 ? 4 : 5) as Rating); }, dis: perfScore <= 0 },
                      { op: "+", fn: () => { const v = Math.min(100, perfScore + 1); setPerfScore(v); setRating((v <= 20 ? 1 : v <= 40 ? 2 : v <= 60 ? 3 : v <= 80 ? 4 : 5) as Rating); }, dis: perfScore >= 100 },
                    ].map(({ op, fn, dis }, idx) => idx === 0 ? (
                      <button key={op} type="button" disabled={!isEditing || dis} onClick={fn} style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid #bbf7d0", background: "#f0fdf4", color: "#059669", fontWeight: 700, fontSize: 14, cursor: !isEditing || dis ? "not-allowed" : "pointer", opacity: !isEditing || dis ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>{op}</button>
                    ) : (
                      <React.Fragment key={op}>
                        <div style={{ fontSize: 32, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{perfScore}</div>
                        <button type="button" disabled={!isEditing || dis} onClick={fn} style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid #bbf7d0", background: "#f0fdf4", color: "#059669", fontWeight: 700, fontSize: 14, cursor: !isEditing || dis ? "not-allowed" : "pointer", opacity: !isEditing || dis ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>{op}</button>
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: "#9ca3af" }}>out of 100</div>
                  <input type="range" min={0} max={100} value={perfScore}
                    onChange={e => { const v = Number(e.target.value); setPerfScore(v); setRating((v <= 20 ? 1 : v <= 40 ? 2 : v <= 60 ? 3 : v <= 80 ? 4 : 5) as Rating); }}
                    disabled={!isEditing}
                    style={{ width: 70, accentColor: "#0b6346", marginTop: 2, opacity: !isEditing ? 0.6 : 1, cursor: !isEditing ? "not-allowed" : "pointer" }} />
                </div>

                </div>
              </div>

              {/* Supervisor Follow-Up */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <label className="pro-label" style={{ marginBottom: 8, display: "block", fontWeight: 600 }}>Supervisor Follow-Up</label>
                  <button type="button" disabled={!isEditing} onClick={() => setFollowUpRequired(v => !v)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderRadius: 10, cursor: !isEditing ? "not-allowed" : "pointer", textAlign: "left", marginTop: 10, border: `1.5px solid ${followUpRequired ? "#fcd34d" : "#e5e7eb"}`, background: followUpRequired ? "#fffbeb" : "#f9fafb", transition: "all 0.15s", opacity: !isEditing ? 0.6 : 1 }}>
                    {followUpRequired ? <CheckSquare style={{ width: 16, height: 16, color: "#d97706", flexShrink: 0 }} /> : <Square style={{ width: 16, height: 16, color: "#9ca3af", flexShrink: 0 }} />}
                    <span style={{ fontSize: 13, fontWeight: 500, color: followUpRequired ? "#92400e" : "#6b7280" }}>Follow-up required with this employee?</span>
                  </button>

                  {followUpRequired && (
                    <div style={{ marginTop: 12 }}>
                      <label className="pro-label" style={{ marginBottom: 6, display: "block" }}>
                        Manager Action Items <span style={{ fontWeight: 400, color: "#9ca3af", textTransform: "none", letterSpacing: 0 }}></span>
                      </label>
                      <textarea className="pro-input" rows={3} value={managerActionItems} onChange={e => setManagerActionItems(e.target.value)}
                        placeholder='e.g. "Schedule 1-on-1 Thursday", "Reassign FMIS-342 to Dev B", "Escalate client delay to PM"'
                        disabled={!isEditing} style={{ resize: "vertical", opacity: !isEditing ? 0.6 : 1, cursor: !isEditing ? "not-allowed" : "text" }} />
                    </div>
                  )}
              </div>

              {/* Comments */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <label className="pro-label" style={{ marginBottom: 8, display: "block", fontWeight: 600 }}>Supervisor Notes / Feedback</label>
                <textarea className="pro-input" rows={4} value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Provide detailed feedback on employee performance..."
                  disabled={!isEditing} style={{ resize: "vertical", marginTop: 4, opacity: !isEditing ? 0.6 : 1, cursor: !isEditing ? "not-allowed" : "text" }} />
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6, fontStyle: "italic" }}>This comment will be visible to the employee once the report is approved.</p>
              </div>

              

            </div>
          )}


          {/* Section 8 */}
          {activeTab === "s8" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* <div style={{ borderLeft: "3px solid #2563eb", paddingLeft: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>Section 8</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", display: "block" }}>Final Acknowledgment & Sign-off</span>
              </div> */}

              {/* Summary card */}
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 18 }}>
                <label className="pro-label" style={{ marginBottom: 8, display: "block", fontWeight: 600 }}>Report Summary</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, background: "#fff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "3px 10px", color: "#1d4ed8" }}>{report.referenceNo}</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{report.date} at {report.submittedAt}</span>
                  {decision ? <StatusBadge status={decision} /> : (
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", padding: "2px 10px", borderRadius: 20, border: "1px solid #e5e7eb" }}>
                      No decision yet
                    </span>
                  )}
                </div>
                {rating > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#fff", borderRadius: 8, padding: "10px 14px", border: "1px solid #bfdbfe" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <StarRow rating={rating} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{RATING_LABELS[rating]}</span>
                      <span style={{ marginLeft: "auto", fontSize: 16, fontWeight: 900, color: scoreColor }}>{perfScore}<span style={{ fontSize: 10, fontWeight: 500, color: "#9ca3af" }}>/100</span></span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 6, borderTop: "1px solid #eff6ff" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>Task Completion</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {taskCompletion}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviewer Info (auto-fetched, same as Section 7) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <div>
                  <label className="pro-label" style={{ fontSize: 10 }}>Supervisor Name</label>
                  <input className="pro-input" value={supervisorName} readOnly placeholder="—" style={{ fontSize: 12, padding: "10px", background: "#fff", color: "#374151", cursor: "not-allowed" }} />
                </div>
                <div>
                  <label className="pro-label" style={{ fontSize: 10 }}>Reviewed Date</label>
                  <input className="pro-input" value={dateStr} readOnly style={{ background: "#fff", color: "#374151", cursor: "not-allowed", fontSize: 12, padding: "10px" }} />
                </div>
              </div>

              {/* Supervisor Signature */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <label className="pro-label" style={{ display: "block", fontWeight: 600 }}>Supervisor Signature</label>
                <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12 }}>
                  Sign below to certify this review is accurate.
                </p>

                <div style={{ opacity: !isEditing ? 0.6 : 1, pointerEvents: !isEditing ? "none" : "auto" }}>
                  <SignaturePad value={signature} onChange={setSignature} />
                </div>

                <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 10 }}>
                  {signature ? `Signed by ${supervisorName || "Supervisor"} · ${timeStr}` : "Awaiting signature"}
                </p>
              </div>

              {/* Warning */}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px" }}>
                <AlertTriangle style={{ width: 15, height: 15, color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11, color: "#92400e", lineHeight: 1.5, fontStyle: "italic" }}>Once submitted, this review will be finalized and the employee will be notified.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pro-modal-footer" style={{ borderTop: "1px solid #f1f5f9", gap: 8 }}>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          {activeTab === "s7" ? (
            <button onClick={() => goToTab("s8")} className="btn btn-primary">Next: Section 8</button>
          ) : isEditing ? (
            <button onClick={handleSave} className="btn flex items-center gap-2 text-white font-semibold px-5 py-2 rounded-xl" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
              <CheckSquare className="w-4 h-4" /> Save & Finalize
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn flex items-center gap-2 text-white font-semibold px-5 py-2 rounded-xl" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
              <RefreshCw className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && createPortal(
        <div className="pro-modal-overlay" onClick={() => setConfirmOpen(false)}>
          <div className="pro-modal w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Save this review?</p>
                <p className="text-xs text-gray-400">This will finalize the review for <strong>{report.employeeName}</strong> and notify them of the result.</p>
              </div>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmOpen(false)} className="btn btn-secondary text-sm">Cancel</button>
              <button type="button" onClick={handleConfirmSave} className="btn btn-primary flex items-center gap-2 text-sm">
                <CheckSquare className="w-4 h-4" /> Yes, Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
