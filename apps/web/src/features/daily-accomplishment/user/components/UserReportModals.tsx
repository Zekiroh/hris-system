import React from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle, X, FileText, Trash2, AlertTriangle, Percent, Clock, PackageCheck, GitCommit, Send, ClipboardList,
  Star, CheckSquare,
} from "lucide-react";

// ─── Types ───────────────────────────

type TaskStatus = string;
type Priority = string;
type TaskType = string;

export interface TaskRow {
  id: number;
  carryOver: "" | "Yes" | "No";
  priority: Priority;
  taskType: TaskType;
  ticketRef: string;
  description: string;
  module: string;
  status: TaskStatus;
  percentDone: string;
  estHrs: string;
  actualHrs: string;
  output: string;
  commitLink: string;
  remarks: string;
  _expanded?: boolean;
}

export interface DarSubmission {
  backendId?: number;
  employeeId?: number | string;
  date?: string;
  devName?: string;
  workArr?: string;
  project?: string;
  sprint?: string;
  team?: string;
  submittedTo?: string;
  timeIn?: string;
  timeOut?: string;
  gross?: string;
  net?: string;
  standup?: string;
  reachable?: string;
  avgResponse?: string;
  connIssues?: string;
  collabLog?: string;
  taskDetails?: TaskRow[];
  checklistItems?: boolean[];
  checklistDone?: boolean[];
  checklist?: number;
  codeCommitted?: boolean;
  ticketsUpdated?: boolean;
  pullRequestCreated?: boolean;
  documentationUpdated?: boolean;
  testsPassing?: boolean;
  reportSubmittedOnTime?: boolean;
  devHrs?: string;
  meetingHrs?: string;
  idleHrs?: string;
  keyAccomp?: string;
  blockers?: string;
  risks?: string;
  planTmr?: string;
  escalation?: string;
  tmrArr?: string;
  tmrTimeIn?: string;
  leaveNotice?: string;
  preparedBy?: string;
  preparedSig?: string;
  dateSubmitted?: string;
  submittedAt?: string;
  status?: string;
  revisionReason?: string;
  rating?: number;
  performanceScore?: number;
  taskCompletion?: string;
  followUpRequired?: boolean;
  managerActionItems?: string;
  supervisorNotes?: string;
  performanceRating?: string;
  reviewedBy?: string;
  supervisorComment?: string;
  supervisorName?: string;
  reviewDate?: string;
  dateReviewed?: string;
  reviewedDate?: string;
  supervisorSignature?: string;
}

// ─── Shared Constants ─────────────────────────────────────────────────────────

const checklistItems = [
  "All code committed & pushed to repository",
  "Tickets / task board updated with current status",
  "Pull request(s) created or reviewed",
  "Documentation updated (if applicable)",
  "Tests passing / QA completed",
  "Daily report submitted on time",
];

const STATUS_BADGE: Record<string, string> = {
  done: "badge-success", ip: "badge-warning", blocked: "badge-danger", todo: "badge-neutral",
};

const STATUS_LABEL: Record<string, string> = {
  done: "Done", ip: "In Progress", blocked: "Blocked", todo: "To Do",
};

const RATING_LABELS: Record<number, string> = {
  1: "Needs Improvement", 2: "Below Expectations", 3: "Meets Expectations",
  4: "Exceeds Expectations", 5: "Outstanding",
};

const TRUNCATE_LIMIT = 30;

function DescriptionCell({ text, label = "Details" }: { text: string; label?: string }) {
  const [open, setOpen] = React.useState(false);
  const isLong = text.length > TRUNCATE_LIMIT;

  if (!text) return <span className="text-gray-300">—</span>;

  return (
    <>
      <div className="flex items-center gap-1">
        <span className="text-xs leading-relaxed flex-1">
          {isLong ? text.slice(0, TRUNCATE_LIMIT) + "..." : text}
        </span>
        {isLong && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 text-gray-300 hover:text-emerald-600 transition-colors"
            title="View full"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        )}
      </div>

      {open && createPortal(
        <div
          className="pro-modal-overlay"
          style={{ zIndex: 99999, position: "fixed", inset: 0 }}
          onClick={() => setOpen(false)}
        >
          <div
            className="pro-modal"
            style={{ maxWidth: "380px", width: "100%", padding: "1.5rem" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                {label}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
        </div>
      </div>,
      document.body
    )}
  </>
  );
}

// ─── TaskTableReadOnly (shared by Preview and View modals, and admin ViewDarModal) ─

export function TaskTableReadOnly({ tasks, emptyText = "No tasks entered" }: { tasks: TaskRow[]; emptyText?: string }) {
  const filtered = tasks.filter(t => t.description || t.ticketRef || t.status);
  if (filtered.length === 0) {
    return <div className="text-center text-gray-400 py-4 text-xs">{emptyText}</div>;
  }
  return (
    <div className="space-y-0 rounded-xl overflow-hidden border border-gray-100">
      {filtered.map((t, tIdx) => {
        return (
        <table key={t.id} className="pro-table text-xs w-full">
          <thead>
            <tr>{["#", "Carry Over", "Priority", "Type", "Ticket", "Description", "Module", "Status"].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center text-gray-400">{tIdx + 1}</td>
              <td className="text-center text-xs">{t.carryOver || "—"}</td>
              <td className="text-center text-xs">{t.priority || "—"}</td>
              <td>{t.taskType || "—"}</td>
              <td className="font-mono">{t.ticketRef || "—"}</td>
              <td style={{ maxWidth: "90px" }}>
                <div className="h-[36px] flex items-center overflow-hidden">
                  <DescriptionCell text={t.description} label="Task Description" />
                </div>
              </td>
              <td>{t.module || "—"}</td>
              <td>
                {t.status
                  ? <span className={`badge ${STATUS_BADGE[t.status]}`}><span className="badge-dot" />{STATUS_LABEL[t.status]}</span>
                  : "—"}
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td colSpan={8} className="px-3 pb-3 pt-2 border-b border-gray-100">
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { lbl: "Done", val: t.percentDone ? t.percentDone + "%" : "", icon: Percent },
                      { lbl: "Est. Hrs", val: t.estHrs, icon: Clock },
                      { lbl: "Actual Hrs", val: t.actualHrs, icon: Clock },
                    ]).map(({ lbl, val, icon: Icon }) => (
                      <div key={lbl}>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-center gap-1">
                          <Icon className="w-3 h-3 text-gray-400" /> {lbl}
                        </p>
                        <p className="text-xs text-center font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-h-[36px] leading-relaxed flex items-center justify-center">
                          {val || <span className="text-gray-300 italic font-normal">—</span>}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-gray-100" />

                  {/* Output / Remarks row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <PackageCheck className="w-3 h-3 text-sky-500" /> Output / Deliverable
                      </p>
                      <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 h-[36px] flex items-center gap-1 overflow-hidden">
                        {t.output ? <DescriptionCell text={t.output} label="Output / Deliverable" /> : <span className="text-gray-300 italic">Not provided</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <GitCommit className="w-3 h-3 text-violet-500" /> Commit / PR Link
                      </p>
                      <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 h-[36px] flex items-center gap-1 overflow-hidden">
                        {t.commitLink ? <DescriptionCell text={t.commitLink} label="Commit / PR Link" /> : <span className="text-gray-300 italic">Not provided</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Remarks
                      </p>
                     <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 h-[36px] flex items-center gap-1 overflow-hidden">
                        {t.remarks ? <DescriptionCell text={t.remarks} label="Remarks" /> : <span className="text-gray-300 italic">Not provided</span>}
                      </div>
                    </div>
                  </div>

                </div>
              </td>
            </tr>
          </tbody>
        </table>
        );
      })}
    </div>
  );
}

// ─── 1. ConfirmSubmitModal ────────────────────────────────────────────────────

interface ConfirmSubmitModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmSubmitModal({ open, onClose, onConfirm }: ConfirmSubmitModalProps) {
  if (!open) return null;
  return createPortal(
    <div className="pro-modal-overlay" style={{ zIndex: 9999, position: "fixed", inset: 0 }} onClick={onClose}>
      <div className="pro-modal" style={{ maxWidth: "420px", width: "100%", padding: "1.5rem" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CheckCircle style={{ width: "22px", height: "22px", color: "#16a34a" }} />
          </div>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>Submit this report?</p>
            <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>Are you sure you want to submit this daily accomplishment report?</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            <CheckCircle className="w-4 h-4" /> Yes, save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── 3. DeleteConfirmModal ────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ open, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!open) return null;
  return createPortal(
    <div className="pro-modal-overlay" style={{ zIndex: 9999, position: "fixed", inset: 0 }} onClick={onClose}>
      <div className="pro-modal" style={{ maxWidth: "420px", width: "100%", padding: "1.5rem" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Trash2 style={{ width: "22px", height: "22px", color: "#dc2626" }} />
          </div>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>Delete Submission?</p>
            <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>Are you sure you want to delete this? This action cannot be undone.</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            <Trash2 className="w-4 h-4" /> Yes, delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── 4 & 5. DARViewModal (unified Preview + View) ────────────────────────────

interface DARViewModalProps {
  open: boolean;
  onClose: () => void;
  mode: "preview" | "view";
  // view mode
  submission?: DarSubmission;
  onRevise?: (sub: DarSubmission) => void;
  // preview mode / shared fields
  onSubmit?: () => void;
  date?: string;
  devName?: string;
  workArr?: string;
  project?: string;
  sprint?: string;
  team?: string;
  submittedTo?: string;
  timeIn?: string;
  timeOut?: string;
  gross?: string;
  net?: string;
  standup?: string;
  reachable?: string;
  avgResponse?: string;
  connIssues?: string;
  collabLog?: string;
  tasks?: TaskRow[];
  devHrs?: string;
  meetingHrs?: string;
  idleHrs?: string;
  keyAccomp?: string;
  blockers?: string;
  risks?: string;
  planTmr?: string;
  escalation?: string;
  checklist?: boolean[];
  checkCount?: number;
  checkPct?: number;
  tasksDone?: number;
  tasksBlocked?: number;
  totalActual?: number;
  tmrArr?: string;
  tmrTimeIn?: string;
  leaveNotice?: string;
  preparedBy?: string;
  preparedSig?: string;
  dateSubmitted?: string;
  // Admin-view extensions (optional — walang epekto sa employee preview/history)
  title?: string;
  extraBadges?: React.ReactNode;
  beforeAcknowledgment?: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  shiftRight?: boolean;
}

export function DARViewModal({
  open, onClose, mode, submission, onRevise, onSubmit,
  date: dateProp, devName: devNameProp, workArr: workArrProp,
  project: projectProp, sprint: sprintProp, team: teamProp,
  submittedTo: submittedToProp, timeIn: timeInProp, timeOut: timeOutProp,
  gross: grossProp, net: netProp, standup: standupProp,
  reachable: reachableProp, avgResponse: avgResponseProp,
  connIssues: connIssuesProp, collabLog: collabLogProp,
  tasks: tasksProp, devHrs: devHrsProp, meetingHrs: meetingHrsProp,
  idleHrs: idleHrsProp, keyAccomp: keyAccompProp,
  blockers: blockersProp, risks: risksProp, planTmr: planTmrProp,
  escalation: escalationProp, checklist: checklistProp,
  checkCount: checkCountProp, checkPct: checkPctProp,
  tasksDone: tasksDoneProp,
  totalActual: totalActualProp, tmrArr: tmrArrProp,
  tmrTimeIn: tmrTimeInProp, leaveNotice: leaveNoticeProp,
  preparedBy: preparedByProp, preparedSig: preparedSigProp,
  dateSubmitted: dateSubmittedProp,
  title, extraBadges, beforeAcknowledgment, footerLeft, footerRight, shiftRight,
}: DARViewModalProps) {
  if (!open) return null;

  // Resolve data — "view" mode pulls from submission object, "preview" from props
  const isView = mode === "view";
  const s: DarSubmission = submission ?? {};

  const date         = isView ? s.date          : dateProp         ?? "";
  const devName      = isView ? s.devName        : devNameProp      ?? "";
  const workArr      = isView ? s.workArr        : workArrProp      ?? "";
  const project      = isView ? s.project        : projectProp      ?? "";
  const sprint       = isView ? s.sprint         : sprintProp       ?? "";
  const team         = isView ? s.team           : teamProp         ?? "";
  const submittedTo  = isView ? s.submittedTo    : submittedToProp  ?? "";
  const timeIn       = isView ? s.timeIn         : timeInProp       ?? "";
  const timeOut      = isView ? s.timeOut        : timeOutProp      ?? "";
  const gross        = isView ? s.gross          : grossProp        ?? "";
  const net          = isView ? s.net            : netProp          ?? "";
  const standup      = isView ? s.standup        : standupProp      ?? "";
  const reachable    = isView ? s.reachable      : reachableProp    ?? "";
  const avgResponse  = isView ? s.avgResponse    : avgResponseProp  ?? "";
  const connIssues   = isView ? s.connIssues     : connIssuesProp   ?? "";
  const collabLog    = isView ? s.collabLog      : collabLogProp    ?? "";
  const tasks: TaskRow[] = isView ? (s.taskDetails   ?? []) : tasksProp ?? [];
  const devHrs       = isView ? s.devHrs         : devHrsProp       ?? "";
  const meetingHrs   = isView ? s.meetingHrs     : meetingHrsProp   ?? "";
  const idleHrs      = isView ? s.idleHrs        : idleHrsProp      ?? "";
  const keyAccomp    = isView ? s.keyAccomp      : keyAccompProp    ?? "";
  const blockers     = isView ? s.blockers       : blockersProp     ?? "";
  const risks        = isView ? s.risks          : risksProp        ?? "";
  const planTmr      = isView ? s.planTmr        : planTmrProp      ?? "";
  const escalation   = isView ? s.escalation     : escalationProp   ?? "";
  const checklistArr = isView ? (s.checklistDone ?? []) : checklistProp ?? [];
  const checkCount   = isView ? s.checklist      : checkCountProp   ?? 0;
  const checkPct     = isView
    ? Math.round(((s.checklist ?? 0) / 6) * 100)
    : checkPctProp ?? 0;
  const tasksDone    = isView
    ? tasks.filter((t: TaskRow) => t.status === "done").length
    : tasksDoneProp ?? 0;
  const totalActual  = isView
    ? tasks.reduce((sum: number, t: TaskRow) => sum + (parseFloat(t.actualHrs) || 0), 0)
    : totalActualProp ?? 0;
  const tmrArr       = isView ? s.tmrArr         : tmrArrProp       ?? "";
  const tmrTimeIn    = isView ? s.tmrTimeIn      : tmrTimeInProp    ?? "";
  const leaveNotice  = isView ? s.leaveNotice    : leaveNoticeProp  ?? "";
  const preparedBy   = isView ? s.preparedBy     : preparedByProp   ?? "";
  const preparedSig  = isView ? s.preparedSig    : preparedSigProp  ?? "";
  const dateSubmitted = isView ? s.dateSubmitted  : dateSubmittedProp ?? "";
  const submittedAt  = isView ? s.submittedAt    : "";
  const subStatus    = isView ? s.status         : "";

  return createPortal(
    <div className="pro-modal-overlay" style={{ zIndex: 9999, position: "fixed", inset: 0 }} onClick={onClose}>
      <div className="pro-modal" style={{ maxWidth: "860px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", transition: "transform 0.25s ease", transform: shiftRight ? "translateX(220px)" : "translateX(0)" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="pro-modal-header" style={{ background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)", borderRadius: "16px 16px 0 0", padding: "22px 28px", display: "block" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "3px 10px", letterSpacing: "0.04em" }}>
                SIMPLEVIA HRIS
              </span>
              {isView && subStatus && (
                <span className={`badge ${
                  subStatus === "Approved"           ? "badge-success" :
                  subStatus === "Rejected"           ? "badge-danger" :
                  subStatus === "Revision Requested" ? "badge-info" :
                  "badge-warning"
                }`}>
                  <span className="badge-dot" />{subStatus}
                </span>
              )}
              {extraBadges}
            </div>
            <button onClick={onClose} className="btn-ghost btn-icon" style={{ color: "rgba(255,255,255,0.8)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: 0, lineHeight: 1.2 }}>
              {title
                ? title
                : isView
                ? "Daily Accomplishment Report"
                : "Daily Accomplishment Report - Preview"}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 3 }}>
              {[devName, workArr, project, date].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { icon: <Clock className="w-3 h-3" />, label: "Actual hrs", val: `${totalActual.toFixed(1)}h` },
              { icon: <CheckCircle className="w-3 h-3" />, label: "Tasks", val: `${tasksDone}/${tasks.length}` },
              { icon: <ClipboardList className="w-3 h-3" />, label: "Checklist", val: `${checkCount}/6` },
              { icon: <Clock className="w-3 h-3" />, label: "Submitted", val: isView ? (submittedAt || "—") : (timeOut || "—") },
            ].map(c => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 12px", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{c.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 12, color: "#fff" }}>{c.val}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pro-modal-body overflow-y-auto" style={{ flex: 1 }}>

          {/* Revision Reason — shown when supervisor requested changes */}
          {isView && subStatus === "Revision Requested" && s.revisionReason && (
            <div className="mb-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-1.5 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Supervisor's Feedback
              </p>
              <p className="text-xs text-blue-900 leading-relaxed">{s.revisionReason}</p>
            </div>
          )}

          {/* Supervisor Review — shown once the report has been Approved, unified "Report Summary" card */}
          {isView && subStatus === "Approved" && (
            <div className="mb-4 rounded-xl p-4" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#1d4ed8" }}>Report Summary</p>

              {/* Date + Status */}
              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                {date && <span className="text-xs" style={{ color: "#64748b" }}>{date}{submittedAt ? ` at ${submittedAt}` : ""}</span>}
                <span className="badge badge-success"><span className="badge-dot" />Approved</span>
              </div>

              {/* Rating + Score + Task Completion — laging nakikita, blangko/"---" lang kapag walang laman */}
              <div className="bg-white rounded-lg p-3 mb-3" style={{ border: "1px solid #bfdbfe" }}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= (s.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  {s.rating ? (
                    <span className="text-xs font-medium text-gray-700">{RATING_LABELS[s.rating]}</span>
                  ) : null}
                  {s.performanceScore ? (
                    <span className="ml-auto text-base font-black" style={{ color: s.performanceScore >= 90 ? "#059669" : s.performanceScore >= 70 ? "#d97706" : "#dc2626" }}>
                      {s.performanceScore}<span className="text-[10px] font-medium text-gray-400">/100</span>
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 pt-2 mt-2" style={{ borderTop: "1px solid #eff6ff" }}>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Task Completion</span>
                  <span className="text-xs font-medium text-gray-700">{s.taskCompletion || "---"}</span>
                </div>
              </div>

              {/* Supervisor Follow-Up — lalabas lang kapag meron */}
              {s.followUpRequired && s.managerActionItems ? (
                <div className="bg-amber-50 rounded-lg p-3 mb-3 border border-amber-200">
                  <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <CheckSquare className="w-3 h-3" /> Supervisor Follow-Up
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">{s.managerActionItems}</p>
                </div>
              ) : null}

              {/* Supervisor Notes / Feedback — lalabas lang kapag meron */}
              {s.supervisorComment ? (
                <div className="bg-white rounded-lg p-3 mb-3" style={{ border: "1px solid #bfdbfe" }}>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Supervisor Notes / Feedback</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{s.supervisorComment}</p>
                </div>
              ) : null}

              {/* Supervisor Name + Reviewed Date */}
              <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: "1px solid #bfdbfe" }}>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Supervisor Name</p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{s.supervisorName || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Reviewed Date</p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{s.reviewedDate || "—"}</p>
                </div>
              </div>

              {/* Supervisor Signature */}
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid #bfdbfe" }}>
                <p className="text-[10px] text-gray-400 font-medium mb-2">Supervisor Signature</p>
                {s.supervisorSignature && s.supervisorSignature.startsWith("data:image")
                  ? <img src={s.supervisorSignature} alt="Supervisor Signature" className="max-h-[60px] max-w-[200px] object-contain border border-white rounded-lg bg-white px-2 py-1" />
                  : <p className="text-xs text-gray-400 italic">Not signed</p>}
              </div>
            </div>
          )}

          {/* Section 1: Developer Info */}
          <div className="mb-4 border border-gray-200 p-2 rounded-xl">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Developer Information</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {([
                ["Project", project], ["Sprint", sprint], ["Team", team], ["Submitted To", submittedTo],
                ["Time In", timeIn], ["Time Out", timeOut], ["Gross Hours", gross], ["Net Hours", net],
                ["Standup", standup], ["Reachable", reachable], ["Avg Response", avgResponse], ["Work Arrangement", workArr],
              ] as [string, string][]).map(([lbl, val]) => (
                <div key={lbl} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium">{lbl}</p>
                  <p className="text-gray-800 font-semibold text-xs mt-0.5">{val || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Tasks */}
          {tasks.length > 0 && (
            <div className="mb-4 border border-gray-200 p-2 rounded-xl">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Tasks & Activities</p>
              <TaskTableReadOnly tasks={tasks} />
              {!isView && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {([["Dev Hours", devHrs], ["Meeting Hours", meetingHrs], ["Idle Hours", idleHrs]] as [string, string][]).map(([lbl, val]) => (
                    <div key={lbl} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 text-center">
                      <p className="text-[10px] text-gray-400 font-medium">{lbl}</p>
                      <p className="text-gray-800 font-bold text-sm mt-0.5">{val || "0"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 4: End-of-Day Summary */}
          <div className="mb-4 border border-gray-200 p-2 rounded-xl">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-2">End-of-Day Summary</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {([
                ["Key Accomplishments", keyAccomp],
                ["Blockers / Issues", blockers],
                ["Risks / Early Warnings", risks],
                ["Plan for Tomorrow", planTmr],
              ] as [string, string][]).map(([lbl, val]) => (
                <div key={lbl} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{lbl}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{val || <span className="text-gray-300 italic">Not provided</span>}</p>
                </div>
              ))}
              {escalation && (
                <div className="md:col-span-2 bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide mb-1">Support / Escalation Needed</p>
                  <p className="text-xs text-gray-700">{escalation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Checklist */}
          <div className="mb-4 border border-gray-200 p-2 rounded-xl">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-2">
              End-of-Day Checklist — {checkCount}/6
            </p>
            <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${checkPct}%` }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {checklistItems.map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${checklistArr[i] ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${checklistArr[i] ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                    {checklistArr[i] ? "✓" : "○"}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Availability & Connectivity */}
          <div className="mb-4 border border-gray-200 p-2 rounded-xl">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Availability & Connectivity</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              {([
                ["Attended Standup?", standup],
                ["Reachable via Comms?", reachable],
                ["Avg Response Time", avgResponse],
              ] as [string, string][]).map(([lbl, val]) => (
                <div key={lbl} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium">{lbl}</p>
                  <p className="text-gray-800 font-semibold text-xs mt-0.5">{val || "—"}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {([
                ["Connectivity / Environment Issues", connIssues],
                ["Collaboration Log", collabLog],
              ] as [string, string][]).map(([lbl, val]) => (
                <div key={lbl} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{lbl}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{val || <span className="text-gray-300 italic">Not provided</span>}</p>
                </div>
              ))}
            </div>
          </div>

          {beforeAcknowledgment}

          {/* Tomorrow + Acknowledgment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-gray-200 p-2 rounded-xl">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Tomorrow's Plan</p>
              <div className="space-y-1 text-xs text-gray-700">
                <p><span className="text-gray-400">Arrangement:</span> {tmrArr || "—"}</p>
                <p><span className="text-gray-400">Expected In:</span> {tmrTimeIn || "—"}</p>
                <p><span className="text-gray-400">Leave Notice:</span> {leaveNotice || "—"}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Acknowledgment</p>
              <div className="space-y-1 text-xs text-gray-700">
                <p><span className="text-gray-400">Prepared by:</span> {preparedBy || "—"}</p>
                <div className="flex items-start gap-2 mt-0.5">
                  <span className="text-gray-400 text-xs shrink-0">Signature:</span>
                  {preparedSig && preparedSig.startsWith("data:image")
                    ? <img src={preparedSig} alt="Signature" className="max-h-[60px] max-w-[200px] object-contain border border-gray-100 rounded-lg bg-white px-2 py-1" />
                    : preparedSig
                    ? <span className="text-xs italic font-semibold text-gray-700">{preparedSig}</span>
                    : <span className="text-xs text-gray-700">—</span>}
                </div>
                <p><span className="text-gray-400">Date Submitted:</span> {dateSubmitted || "—"}</p>
                {isView && submittedAt && (
                  <p><span className="text-gray-400">Submitted At:</span> {submittedAt}</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ─── Modal Footer ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 border-t border-gray-100 p-4">
          <div className="flex items-center gap-2">{footerLeft}</div>
          <div className="flex items-center gap-2">
            {!footerRight && (
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            )}
            {!isView && onSubmit && (
              <button type="button" className="btn btn-primary" onClick={onSubmit}>
                <Send className="w-4 h-4" /> Submit Report
              </button>
            )}
            {isView && subStatus === "Revision Requested" && onRevise && (
              <button type="button" className="btn btn-primary" onClick={() => onRevise(s)}>
                <FileText className="w-4 h-4" /> Revise Report
              </button>
            )}
            {footerRight}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
