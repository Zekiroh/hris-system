import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Clock, CheckCircle, AlertTriangle, Lock,
  Send, Eye, FileText, FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../app/auth/AuthContext";
import { getTodayMyAttendanceLog } from "../../../services/api/attendance/attendance";
import {
  ConfirmSubmitModal,
  // SuccessModal,
  DARViewModal,
} from "./components/UserReportModals";
import {
  Section1DeveloperInfo, TasksTable, Section2Availability,
  Section4Summary, Section5Checklist, Section6TomorrowPlan, Section8Acknowledgment,
} from "./daily-report/UserDailyReportSections";
import SubmissionsTable from "./report-history/SubmissionsTable";
import { useDailyReportData } from "./hooks/useDailyReportData";
import { useDailyReportWorkflow } from "./hooks/useDailyReportWorkflow";
import {
  type CreateDailyReportRequest,
  type DailyReportDto,
  type UpdateDailyReportRequest,
} from "../../../services/api/daily-accomplishment/dailyReports";

// Types
type WorkArrangement = "On-site" | "Remote" | "Hybrid";
type StandupAttended = "Yes" | "No" | "N/A";
type Reachable = "Yes" | "Partial" | "No";
type TaskStatus = "" | "done" | "ip" | "blocked" | "todo";
type Priority = "" | "High" | "Medium" | "Low";
type TaskType = "" | "Development" | "Bug Fix" | "Testing" | "Review" | "Documentation" | "Meeting" | "Research";

interface TaskRow {
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

// Helpers

function createEmptyTask(id: number): TaskRow {
  return { id, carryOver: "", priority: "", taskType: "", ticketRef: "", description: "", module: "", status: "", percentDone: "", estHrs: "", actualHrs: "", output: "", commitLink: "", remarks: "", _expanded: false };
}

interface DarSubmission {
  id: number;
  date: string;
  project: string;
  tasks: number;
  checklist: number;
  status: string;
  submittedAt: string;
  workArr: string;
  devName: string;
  sprint?: string;
  team?: string;
  submittedTo?: string;
  timeIn?: string;
  timeOut?: string;
  breakMins?: number;
  gross?: string;
  net?: string;
  keyAccomp?: string;
  blockers?: string;
  risks?: string;
  planTmr?: string;
  revisionReason?: string;
  checklistItems?: boolean[];
  checklistDone?: boolean[];
  taskDetails?: unknown[];
  rating?: number;
  performanceScore?: number;
  taskCompletion?: string;
  supervisorComment?: string;
  supervisorName?: string;
  reviewedDate?: string;
  supervisorSignature?: string;
  followUpRequired?: boolean;
  managerActionItems?: string;
  [key: string]: unknown;
}

function calcHours(timeIn: string, timeOut: string, breakMins: number) {
  if (!timeIn || !timeOut) return { gross: "", net: "" };
  const [ih, im] = timeIn.split(":").map(Number);
  const [oh, om] = timeOut.split(":").map(Number);
  const grossMins = oh * 60 + om - (ih * 60 + im);
  if (grossMins <= 0) return { gross: "", net: "" };
  const netMins = grossMins - breakMins;
  const fmt = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
  return { gross: fmt(grossMins), net: netMins > 0 ? fmt(netMins) : "0h 0m" };
}

function to24Hour(time: string): string {
  if (!time || time === "-") return "";
  const trimmed = time.trim();

  // Already HH:mm
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;

  // Format: HH:mm:ss or HH:mm:ss.fffffff (from backend)
  if (/^\d{2}:\d{2}:\d{2}/.test(trimmed)) {
    const [h, m] = trimmed.split(":");
    return `${h.padStart(2, "0")}:${m}`;
  }

  // Format: HH:mm AM/PM
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";
  let hours = parseInt(match[1], 10);
  const mins = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${mins}`;
}

function formatSubmissionTime(value: string | null) {
  if (!value) return "";
  const timePart = value.includes("T") ? value.split("T")[1] : value;
  const normalized = to24Hour(timePart);
  if (!normalized) return value;

  const [hoursValue, minutes] = normalized.split(":").map(Number);
  const period = hoursValue >= 12 ? "PM" : "AM";
  const displayHours = hoursValue % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function parseRating(value: string | null) {
  if (!value) return undefined;
  const rating = Number.parseFloat(value);
  return Number.isFinite(rating) ? rating : undefined;
}

function hasReview(dto: DailyReportDto) {
  return Boolean(
    dto.reviewedBy ||
    dto.dateReviewed ||
    dto.reviewDate ||
    dto.supervisorNotes ||
    dto.performanceRating
  );
}

function mapDailyReportToSubmission(dto: DailyReportDto): DarSubmission {
  const checklistItems = [
    dto.codeCommitted,
    dto.ticketsUpdated,
    dto.pullRequestCreated,
    dto.documentationUpdated,
    dto.testsPassing,
    dto.reportSubmittedOnTime,
  ];
  const { gross, net } = calcHours(dto.timeIn || "", dto.timeOut || "", dto.breakDurationMinutes);
  const rating = parseRating(dto.performanceRating);

  return {
    id: dto.id,
    date: dto.reportDate,
    project: dto.project,
    tasks: dto.tasks.length,
    checklist: dto.checklistCompletedCount,
    status: hasReview(dto) ? "Reviewed" : "Pending Review",
    submittedAt: formatSubmissionTime(dto.submissionTime),
    workArr: dto.workArrangement,
    devName: dto.employeeName,
    sprint: dto.sprintIteration || "",
    team: dto.teamUnit || "",
    submittedTo: "",
    timeIn: dto.timeIn || "",
    timeOut: dto.timeOut || "",
    breakMins: dto.breakDurationMinutes,
    gross,
    net,
    standup: dto.attendedStandup ? "Yes" : "No",
    reachable: dto.reachableViaComms ? "Yes" : "No",
    avgResponse: dto.avgResponseTime || "",
    connIssues: dto.connectivityIssues || "",
    collabLog: dto.collaborationLog || "",
    taskDetails: dto.tasks.map(task => ({
      id: task.id,
      carryOver: task.isCarryOver ? "Yes" : "No",
      priority: task.priority,
      taskType: task.taskType,
      ticketRef: task.ticketRefNo || "",
      description: task.description,
      module: task.module || "",
      status: task.status,
      percentDone: String(task.percentDone),
      estHrs: String(task.estimatedHours),
      actualHrs: String(task.actualHours),
      output: task.outputDeliverable || "",
      commitLink: task.commitPrLink || "",
      remarks: task.blockedByRemarks || "",
      _expanded: false,
    })),
    keyAccomp: dto.keyAccomplishments || "",
    blockers: dto.blockersIssues || "",
    risks: dto.risksEarlyWarnings || "",
    planTmr: dto.planForTomorrow || "",
    escalation: dto.supportEscalationNeeded || "",
    checklistItems,
    checklistDone: checklistItems,
    tmrArr: dto.workArrangementTomorrow || "",
    tmrTimeIn: dto.expectedTimeIn || "",
    leaveNotice: dto.leaveAbsenceNotice || "",
    preparedBy: dto.employeeName,
    dateSubmitted: dto.reportDate,
    supervisorComment: dto.supervisorNotes || "",
    supervisorName: dto.reviewedBy || "",
    reviewedDate: dto.dateReviewed || dto.reviewDate || "",
    followUpRequired: dto.followUpRequired,
    managerActionItems: dto.managerActionItems || "",
    ...(rating === undefined ? {} : { rating }),
  };
}

// --- Sub-components -----------------------------------------------------------

function SectionCard({ title, amber, children = 0, action, defaultOpen = true }: { 
  title: string; amber?: boolean; children: React.ReactNode; delay?: number; action?: React.ReactNode; defaultOpen?: boolean;
  }) {
    const [open, setOpen] = useState(() => {
      const saved = localStorage.getItem(`section_open_${title}`);
      if (saved !== null) return saved === "true";
      return defaultOpen;
    });

    React.useEffect(() => {
      localStorage.setItem(`section_open_${title}`, String(open));
    }, [open, title]);

    const handleToggle = () => setOpen(v => !v);
    return (
      <div className="px-6 py-4 border-t border-gray-100">
        <div className={`rounded-xl border overflow-hidden ${amber ? "border-amber-200" : "border-gray-200"}`}>
          <button type="button" aria-expanded={open} className={`w-full flex items-center justify-between px-5 py-4 cursor-pointer select-none ${amber ? "bg-amber-50" : "bg-gray-50"}`} onClick={handleToggle}>
            <div className="flex items-center gap-3">
              {amber && <div className="w-1 h-4 rounded-full bg-amber-400 shrink-0" />}
              <span className={`text-xs font-bold uppercase tracking-widest ${amber ? "text-amber-800" : "text-emerald-800"}`}>{title}</span>
            </div>
            <div className="flex items-center gap-2">
              {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
              <span className="text-gray-400 text-xs" style={{ display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>?</span>
            </div>
          </button>
          {open && <div className="px-5 py-5 bg-white border-t border-gray-100">{children}</div>}
        </div>
      </div>
    );
  }

// --- Main Component -----------------------------------------------------------

export default function UserDailyAccomplishment() {
  const today = new Date().toISOString().split("T")[0];
  const { user } = useAuth();
  const { reports, error: reportsError, refresh } = useDailyReportData({ page: 1, pageSize: 100 });
  const { isSubmitting, isUpdating, submitReport, updateReport } = useDailyReportWorkflow();
  const lastReportsErrorRef = useRef<string | null>(null);

  // -- State --

  const [devName, setDevName] = useState(user?.fullName || "");
  const [date, setDate] = useState(today);
  const [workArr, setWorkArr] = useState<WorkArrangement>("On-site");
  const [project, setProject] = useState("");
  const [sprint, setSprint] = useState("");
  const [team, setTeam] = useState("");
  const [submittedTo, setSubmittedTo] = useState("");

  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [breakMins, setBreakMins] = useState(60);
  const [, setSubTime] = useState("");

  const [standup, setStandup] = useState<StandupAttended>("Yes");
  const [reachable, setReachable] = useState<Reachable>("Yes");
  const [avgResponse, setAvgResponse] = useState("");
  const [connIssues, setConnIssues] = useState("");
  const [collabLog, setCollabLog] = useState("");

  const [tasks, setTasks] = useState<TaskRow[]>(() => [createEmptyTask(1)]);
  const [devHrs, setDevHrs] = useState("");
  const [meetingHrs, setMeetingHrs] = useState("");
  const [idleHrs, setIdleHrs] = useState("");

  const [keyAccomp, setKeyAccomp] = useState("");
  const [blockers, setBlockers] = useState("");
  const [risks, setRisks] = useState("");
  const [planTmr, setPlanTmr] = useState("");
  const [escalation, setEscalation] = useState("");

  const [checklist, setChecklist] = useState<boolean[]>(Array(6).fill(false));
  const [tmrArr, setTmrArr] = useState<WorkArrangement>("On-site");
  const [tmrTimeIn, setTmrTimeIn] = useState("");
  const [leaveNotice, setLeaveNotice] = useState("");

  const [preparedBy, setPreparedBy] = useState(user?.fullName || "");
  const [preparedSig, setPreparedSig] = useState("");
  const [dateSubmitted, setDateSubmitted] = useState(today);

  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [, setSuccessSnapshot] = useState({ date: "", submitTime: "", taskCount: 0, checkCount: 0 });
  const [selectedSub, setSelectedSub] = React.useState<DarSubmission | null>(null);
  const [subSearch, setSubSearch] = React.useState("");
  const [subFilter, setSubFilter] = React.useState("All Status");
  const [subPage, setSubPage] = React.useState(1);
  
  const [, setSubmitTime] = useState("");
  const [activeTab, setActiveTab] = useState<"dar" | "submissions">("dar");
  const [isRevising, setIsRevising] = useState(false);
  const [, setRevisingDate] = useState<string | null>(null);
  const [revisingReason, setRevisingReason] = useState<string>("");

  const submissions = useMemo(
    () => reports.map(mapDailyReportToSubmission),
    [reports]
  );
  const hasSubmittedForDate = submissions.some(s => s.date === date);
  const isSavingReport = isSubmitting || isUpdating;

  useEffect(() => {
    if (!reportsError) {
      lastReportsErrorRef.current = null;
      return;
    }
    if (lastReportsErrorRef.current === reportsError) return;
    lastReportsErrorRef.current = reportsError;
    toast.error(reportsError);
  }, [reportsError]);
  // --- Auto-fetch today's attendance from backend ------------------------
  useEffect(() => {
    let cancelled = false;

    async function fetchTodayAttendance() {
      try {
        const log = await getTodayMyAttendanceLog();
        if (cancelled || !log) return;

        // Time In � from actual attendance record
        if (log.timeIn) {
          const converted = to24Hour(log.timeIn);
          if (converted) setTimeIn(converted);
        }

        // Time Out � use shiftEndTime as default
        // If OT is Approved, add overtimeMinutes on top of shiftEndTime
        if (log.shiftEndTime) {
          const shiftEnd = to24Hour(log.shiftEndTime);
          if (shiftEnd) {
            if (log.overtimeStatus === "Approved" && log.overtimeMinutes && log.overtimeMinutes > 0) {
              const [h, m] = shiftEnd.split(":").map(Number);
              const totalMins = h * 60 + m + log.overtimeMinutes;
              const otH = Math.floor(totalMins / 60) % 24;
              const otM = totalMins % 60;
              setTimeOut(`${String(otH).padStart(2, "0")}:${String(otM).padStart(2, "0")}`);
            } else {
              setTimeOut(shiftEnd);
            }
          }
        }

        // Break Duration � compute from breakStartTime and breakEndTime
        if (log.breakStartTime && log.breakEndTime) {
          const bStart = to24Hour(log.breakStartTime);
          const bEnd   = to24Hour(log.breakEndTime);
          if (bStart && bEnd) {
            const [bsh, bsm] = bStart.split(":").map(Number);
            const [beh, bem] = bEnd.split(":").map(Number);
            const breakDuration = (beh * 60 + bem) - (bsh * 60 + bsm);
            if (breakDuration > 0) setBreakMins(breakDuration);
          }
        }

      } catch {
        // Silently ignore � fields remain at their defaults
      }
    }

    fetchTodayAttendance();
    return () => { cancelled = true; };
  }, []);

  // -- Computed --

  const { gross, net } = calcHours(timeIn, timeOut, breakMins);

  const tasksDone    = tasks.filter(t => t.status === "done").length;
  const tasksIP      = tasks.filter(t => t.status === "ip").length;
  const tasksBlocked = tasks.filter(t => t.status === "blocked").length;
  const tasksCarry   = tasks.filter(t => t.carryOver === "Yes").length;
  const totalActual  = tasks.reduce((s, t) => s + (parseFloat(t.actualHrs) || 0), 0);
  const totalEst     = tasks.reduce((s, t) => s + (parseFloat(t.estHrs) || 0), 0);
  const variance     = totalActual - totalEst;
  const checkCount   = checklist.filter(Boolean).length;
  const checkPct     = Math.round((checkCount / 6) * 100);

  const updateTask = useCallback((id: number, field: keyof TaskRow, value: string | boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }, []);

  const nextIdRef = React.useRef(2);
  const addRow = () => setTasks(prev => {
    const id = nextIdRef.current++;
    return [...prev, createEmptyTask(id)];
  });
  const deleteRow = (id: number) => setTasks(prev => prev.filter(t => t.id !== id));

  const toggleCheck = (i: number) => setChecklist(prev => prev.map((v, idx) => idx === i ? !v : v));

  

  const getFieldSuggestions = (field: string, val: string): string[] => {
    if (val.length < 1) return [];
    try {
      return Array.from(new Set(
        submissions
          .map(s => s[field])
          .filter((v): v is string => typeof v === "string" && v.toLowerCase().includes(val.toLowerCase()))
      ));
    } catch { return []; }
  };

  

  const handleSubmit = async () => {
    if (isSavingReport) return;

    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const timeStr = `${h}:${String(m).padStart(2, "0")} ${ampm}`;
    setSubmitTime(timeStr);
    setSubTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);

    const filledTasks = tasks.filter(t => t.description || t.ticketRef || t.status);
    const trimOrNull = (value: string) => {
      const trimmed = value.trim();
      return trimmed ? trimmed : null;
    };

    const createRequest: CreateDailyReportRequest = {
      reportDate: date,
      workArrangement: workArr,
      project,
      sprintIteration: trimOrNull(sprint),
      teamUnit: trimOrNull(team),
      submittedToUserId: null,
      timeIn: timeIn || null,
      timeOut: timeOut || null,
      breakDurationMinutes: breakMins,
      attendedStandup: standup === "Yes",
      reachableViaComms: reachable === "Yes",
      avgResponseTime: trimOrNull(avgResponse),
      connectivityIssues: trimOrNull(connIssues),
      collaborationLog: trimOrNull(collabLog),
      tasks: filledTasks.map((task, index) => ({
        taskNumber: index + 1,
        isCarryOver: task.carryOver === "Yes",
        priority: task.priority,
        taskType: task.taskType,
        ticketRefNo: trimOrNull(task.ticketRef),
        description: task.description,
        module: trimOrNull(task.module),
        status: task.status,
        percentDone: Number.parseFloat(task.percentDone) || 0,
        estimatedHours: Number.parseFloat(task.estHrs) || 0,
        actualHours: Number.parseFloat(task.actualHrs) || 0,
        outputDeliverable: trimOrNull(task.output),
        commitPrLink: trimOrNull(task.commitLink),
        blockedByRemarks: trimOrNull(task.remarks),
      })),
    };

    const updateRequest: UpdateDailyReportRequest = {
      keyAccomplishments: keyAccomp,
      blockersIssues: blockers,
      risksEarlyWarnings: risks,
      planForTomorrow: planTmr,
      supportEscalationNeeded: trimOrNull(escalation),
      codeCommitted: checklist[0],
      ticketsUpdated: checklist[1],
      pullRequestCreated: checklist[2],
      documentationUpdated: checklist[3],
      testsPassing: checklist[4],
      reportSubmittedOnTime: checklist[5],
      workArrangementTomorrow: tmrArr,
      expectedTimeIn: tmrTimeIn || null,
      leaveAbsenceNotice: trimOrNull(leaveNotice),
    };

    let createdReportId: number | null = null;

    try {
      const createdReport = await submitReport(createRequest);
      createdReportId = createdReport.id;
      await updateReport(createdReportId, updateRequest);
      await refresh();
      setIsRevising(false);
      setRevisingDate(null);
      setRevisingReason("");
      setShowConfirm(false);
      setSuccessSnapshot({
        date,
        submitTime: timeStr,
        taskCount: filledTasks.length,
        checkCount: checklist.filter(Boolean).length,
      });
      toast.success(`DAR submitted successfully`);

      // Reset all fields � delay para makita muna ng SuccessModal ang values
      setTimeout(() => {
      setDevName(user?.fullName || "");
      setDate(today);
      setWorkArr("On-site");
      setProject("");
      setSprint("");
      setTeam("");
      setSubmittedTo("");
      setTimeIn("08:00");
      setTimeOut("17:00");
      setBreakMins(60);
      setSubTime("");
      setStandup("Yes");
      setReachable("Yes");
      setAvgResponse("");
      setConnIssues("");
      setCollabLog("");
      nextIdRef.current = 2;
      setTasks([createEmptyTask(1)]);
      setDevHrs("");
      setMeetingHrs("");
      setIdleHrs("");
      setKeyAccomp("");
      setBlockers("");
      setRisks("");
      setPlanTmr("");
      setEscalation("");
      setChecklist(Array(6).fill(false));
      setTmrArr("On-site");
      setTmrTimeIn("08:00");
      setLeaveNotice("");
      setPreparedBy(user?.fullName || "");
      setPreparedSig("");
      setDateSubmitted(today);
      }, 300);
    } catch (error) {
      setShowConfirm(false);
      if (createdReportId !== null) {
        await refresh();
        toast.error("The DAR was created, but some report details could not be saved. Please refresh and contact an administrator if the issue continues.");
        return;
      }
      toast.error(error instanceof Error ? error.message : "Unable to submit DAR. Please try again.");
    }
  };
  const handleTrySubmit = () => {
    if (isSavingReport) return;

    const errs: string[] = [];

    // -- Section 1: Developer Info --
    if (!project.trim())      errs.push("Section 1: Project / System is required.");
    if (!team.trim())         errs.push("Section 1: Team / Unit is required.");
    if (!sprint.trim())       errs.push("Section 1: Sprint / Iteration is required.");
    if (!submittedTo.trim())  errs.push("Section 1: Submitted To is required.");
    if (!timeOut)             errs.push("Section 1: Time Out is required.");

    // -- Section 3: Tasks & Activities --
    const filledTasks = tasks.filter(t => t.description || t.ticketRef || t.status);
    if (filledTasks.length === 0) {
      errs.push("Tasks & Activities: At least one task is required.");
    } else {
      filledTasks.forEach((t, i) => {
        const n = i + 1;
        if (!t.priority)              errs.push(`Task #${n}: Priority is required.`);
        if (!t.taskType)              errs.push(`Task #${n}: Task Type is required.`);
        if (!t.ticketRef.trim())      errs.push(`Task #${n}: Ticket / Ref is required.`);
        if (!t.description.trim())    errs.push(`Task #${n}: Task Description is required.`);
        if (!t.module.trim())         errs.push(`Task #${n}: Module is required.`);
        if (!t.status)                errs.push(`Task #${n}: Status is required.`);
        if (!t.percentDone)           errs.push(`Task #${n}: % Done is required.`);
        if (!t.estHrs)                errs.push(`Task #${n}: Estimated Hours is required.`);
        if (!t.actualHrs)             errs.push(`Task #${n}: Actual Hours is required.`);
        if (!t.output.trim())         errs.push(`Task #${n}: Output / Deliverable is required.`);
        if (!t.commitLink.trim())     errs.push(`Task #${n}: Commit / PR Link is required.`);
        if (!t.remarks.trim())        errs.push(`Task #${n}: Remarks is required.`);
      });
    }

    // -- Section 4: End-of-Day Summary --
    if (!keyAccomp.trim())  errs.push("End-of-Day Summary: Key Accomplishments is required.");
    if (!blockers.trim())   errs.push("End-of-Day Summary: Blockers / Issues is required.");
    if (!risks.trim())      errs.push("End-of-Day Summary: Risks / Early Warnings is required.");
    if (!planTmr.trim())    errs.push("End-of-Day Summary: Plan for Tomorrow is required.");

    // -- Section 2: Availability & Connectivity --
    if (!avgResponse.trim())  errs.push("Availability: Avg Response Time is required.");
    if (!connIssues.trim())   errs.push("Availability: Connectivity / Environment Issues is required.");
    if (!collabLog.trim())    errs.push("Availability: Collaboration Log is required.");

    // -- Section 6: Tomorrow's Plan --
    if (!tmrTimeIn)  errs.push("Tomorrow's Plan: Expected Time In is required.");

    // -- Section 8: Acknowledgment --
    if (!preparedSig)  errs.push("Acknowledgment: Signature is required or upload your signature.");

    if (errs.length > 0) {
      errs.forEach(e => toast.error(e));
      return;
    }

    if (hasSubmittedForDate && !isRevising) {
      toast.error("You have already submitted a DAR for today. Only one submission per day is allowed.");
      return;
    }
    setShowConfirm(true);
  };

  const handleRevise = useCallback(() => {
    toast.error("Revision updates are not available for submitted reports yet.");
  }, []);
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="page-header animate-fade-in-up">
        <h1>Daily Accomplishment Report</h1>
        <p>Software Development � Individual Submission. Submit before end of work day.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Tasks Done",    value: tasksDone,                   sub: `${tasksIP} In Progress`,          icon: CheckCircle, gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)" },
          { label: "Actual Hours",  value: totalActual.toFixed(1) + "h", sub: `Est. ${totalEst.toFixed(1)}h`,   icon: Clock,        gradient: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)" },
          { label: "Blocked",       value: tasksBlocked,                sub: `${tasksCarry} Carry-Over`,        icon: AlertTriangle, gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)" },
          { label: "Checklist",     value: `${checkCount} / 6`,         sub: `${checkPct}% completed`,          icon: Lock,          gradient: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)" },
        ].map((card) => (
          <div key={card.label} className="pro-card !p-0 overflow-hidden">
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
        ))}
      </div>

      {/* -- Single Card Wrapper -- */}
      <div className="pro-card !p-0 overflow-hidden animate-fade-in-up">

        {/* Tab Bar */}
        <div className="px-6 pt-4 mb-4">
          <div className="pro-tabs">
            {([
              { key: "dar", label: "Daily Report", icon: FileText },
              { key: "submissions", label: "Report History", icon: FolderOpen },
            ] as const).map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`pro-tab whitespace-nowrap shrink-0 w-auto !flex-none flex items-center gap-1.5${activeTab === tab.key ? " active" : ""}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

      {activeTab === "dar" && <>

        {isRevising && (
          <div className="mx-6 mb-2 mt-2 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-800 font-medium">
                You are revising your DAR for <strong>{date}</strong>. Make your changes and re-submit when ready.
              </p>
            </div>
            {revisingReason && (
              <div className="mt-2.5 pt-2.5 border-t border-blue-100 pl-7">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Supervisor's Feedback</p>
                <p className="text-xs text-blue-900 leading-relaxed">{revisingReason}</p>
              </div>
            )}
          </div>
        )}

        {/* Section 1: Developer Info */}
        <SectionCard title="Developer Information" delay={0.1}>
          <Section1DeveloperInfo
            devName={devName}
            date={date}
            project={project}
            setProject={setProject}
            team={team}
            setTeam={setTeam}
            sprint={sprint}
            setSprint={setSprint}
            submittedTo={submittedTo}
            setSubmittedTo={setSubmittedTo}
            timeIn={timeIn}
            timeOut={timeOut}
            setTimeOut={setTimeOut}
            breakMins={breakMins}
            setBreakMins={setBreakMins}
            workArr={workArr}
            setWorkArr={setWorkArr}
            gross={gross}
            net={net}
            getFieldSuggestions={getFieldSuggestions}
          />
        </SectionCard>

        {/* Section 3: Tasks */}
        <SectionCard title="Tasks & Activities" delay={0.3}>
          <TasksTable
            tasks={tasks}
            onAddRow={addRow}
            onDeleteRow={deleteRow}
            onUpdateTask={updateTask}
          />
        </SectionCard>

        <SectionCard title="End-of-Day Summary" delay={0.4}>
          <Section4Summary
            totalActual={totalActual} totalEst={totalEst} variance={variance}
            tasksDone={tasksDone} tasksIP={tasksIP} tasksBlocked={tasksBlocked} tasksCarry={tasksCarry}
            keyAccomp={keyAccomp} setKeyAccomp={setKeyAccomp}
            blockers={blockers} setBlockers={setBlockers}
            risks={risks} setRisks={setRisks}
            planTmr={planTmr} setPlanTmr={setPlanTmr}
            escalation={escalation} setEscalation={setEscalation}
          />
        </SectionCard>

        <SectionCard title="End-of-Day Checklist" delay={0.5}>
          <Section5Checklist checklist={checklist} toggleCheck={toggleCheck} checkCount={checkCount} checkPct={checkPct} />
        </SectionCard>

        <SectionCard title="Availability & Connectivity" delay={0.2}>
          <Section2Availability
            standup={standup} setStandup={setStandup}
            reachable={reachable} setReachable={setReachable}
            avgResponse={avgResponse} setAvgResponse={setAvgResponse}
            connIssues={connIssues} setConnIssues={setConnIssues}
            collabLog={collabLog} setCollabLog={setCollabLog}
          />
        </SectionCard>

        <SectionCard title="Tomorrow's Plan" delay={0.6}>
          <Section6TomorrowPlan
            tmrArr={tmrArr} setTmrArr={setTmrArr}
            tmrTimeIn={tmrTimeIn} setTmrTimeIn={setTmrTimeIn}
            leaveNotice={leaveNotice} setLeaveNotice={setLeaveNotice}
          />
        </SectionCard>

        <SectionCard title="Acknowledgement" delay={0.7}>
          <Section8Acknowledgment
            preparedBy={preparedBy} setPreparedBy={setPreparedBy}
            preparedSig={preparedSig} setPreparedSig={setPreparedSig}
            dateSubmitted={dateSubmitted} setDateSubmitted={setDateSubmitted}
          />
        </SectionCard>
      </>} {/* end activeTab === "dar" */}

      {/* Report History */}
      {activeTab === "submissions" && (
        <div className="px-6 py-4">
          <SubmissionsTable
            submissions={submissions}
            subSearch={subSearch}
            setSubSearch={setSubSearch}
            subFilter={subFilter}
            setSubFilter={setSubFilter}
            subPage={subPage}
            setSubPage={setSubPage}
            onView={setSelectedSub}
            onRevise={handleRevise}
          />
        </div>
      )} {/* end activeTab === "submissions" */}

      </div> {/* end single pro-card wrapper */}

      {/* Submit Bar � now outside the bond paper container */}
      {activeTab === "dar" && (
        <div className="pro-card !p-0 overflow-hidden border-t-4 border-t-emerald-600">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 py-5">
            {hasSubmittedForDate && !isRevising ? (
              <p className="text-xs text-amber-600 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                You have already submitted a DAR for today. No further submissions are allowed.
              </p>
            ) : (
              <div className="text-xs text-gray-400 flex items-center gap-1.5 italic">
                <div>
                  <strong className="font-bold not-italic text-black">Reminder:</strong> Please review your work carefully using the preview button before submission to ensure all details are correct.
                </div>
              </div>
            )}
            <div className="flex gap-3 flex-shrink-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPreview(true)}
                disabled={(hasSubmittedForDate && !isRevising) || isSavingReport}
              >
                <Eye className="w-5 h-5" /> Preview
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleTrySubmit}
                disabled={(hasSubmittedForDate && !isRevising) || isSavingReport}
                style={(hasSubmittedForDate && !isRevising) || isSavingReport ? { cursor: "not-allowed", opacity: 0.5 } : {}}
              >
                <Send className="w-5 h-5" /> Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    {/* --- Modals --- */}
      <ConfirmSubmitModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
      />
      {/* <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        date={successSnapshot.date}
        submitTime={successSnapshot.submitTime}
        taskCount={successSnapshot.taskCount}
        checkCount={successSnapshot.checkCount}
      /> */}
      {/* View Modal � for submitted reports */}
      <DARViewModal
        open={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        mode="view"
        submission={selectedSub}
        onRevise={handleRevise}
      />

      {/* Preview Modal � before submitting */}
      <DARViewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        mode="preview"
        onSubmit={handleTrySubmit}
        date={date}
        devName={devName}
        workArr={workArr}
        project={project}
        sprint={sprint}
        team={team}
        submittedTo={submittedTo}
        timeIn={timeIn}
        timeOut={timeOut}
        gross={gross}
        net={net}
        standup={standup}
        reachable={reachable}
        avgResponse={avgResponse}
        connIssues={connIssues}
        collabLog={collabLog}
        tasks={tasks}
        devHrs={devHrs}
        meetingHrs={meetingHrs}
        idleHrs={idleHrs}
        keyAccomp={keyAccomp}
        blockers={blockers}
        risks={risks}
        planTmr={planTmr}
        escalation={escalation}
        checklist={checklist}
        checkCount={checkCount}
        checkPct={checkPct}
        tasksDone={tasksDone}
        tasksBlocked={tasksBlocked}
        totalActual={totalActual}
        tmrArr={tmrArr}
        tmrTimeIn={tmrTimeIn}
        leaveNotice={leaveNotice}
        preparedBy={preparedBy}
        preparedSig={preparedSig}
        dateSubmitted={dateSubmitted}
      />

    </div>
  );
}