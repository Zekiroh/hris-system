// apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx

import { useState, useCallback } from "react";
import {
  ClipboardList, Clock, CheckCircle, AlertTriangle, Lock,
  Plus, Send, Save, Eye, ChevronDown,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type WorkArrangement = "On-site" | "Remote" | "Hybrid";
type StandupAttended  = "Yes" | "No" | "N/A";
type Reachable        = "Yes" | "Partial" | "No";
type TaskStatus       = "" | "done" | "ip" | "blocked" | "todo";
type Priority         = "" | "High" | "Medium" | "Low";
type TaskType         = "" | "Development" | "Bug Fix" | "Testing" | "Review" | "Documentation" | "Meeting" | "Research";

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
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createEmptyTask(id: number): TaskRow {
  return { id, carryOver: "", priority: "", taskType: "", ticketRef: "", description: "", module: "", status: "", percentDone: "", estHrs: "", actualHrs: "", output: "", commitLink: "", remarks: "" };
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

// ─── Radio Pills ──────────────────────────────────────────────────────────────

function RadioPills<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-2 flex-wrap mt-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            value === opt
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "border-gray-200 text-gray-600 hover:border-emerald-400 hover:bg-emerald-50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ num, title, amber, children }: { num: number; title: string; amber?: boolean; children: React.ReactNode }) {
  return (
    <div className={`pro-card overflow-hidden ${amber ? "border-l-4 border-l-amber-400" : ""}`}>
      <div className={`flex items-center gap-3 px-6 py-3 border-b border-gray-100 ${amber ? "bg-amber-50" : "bg-gray-50"}`}>
        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ${amber ? "bg-amber-500" : "bg-emerald-600"}`}>
          {num}
        </span>
        <span className={`text-xs font-bold uppercase tracking-widest ${amber ? "text-amber-800" : "text-emerald-800"}`}>
          {title}
          {amber && <span className="ml-1 text-amber-500 normal-case font-normal tracking-normal">(Manager Use Only)</span>}
        </span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────

function Field({ label, hint, children, col2 }: { label: string; hint?: string; children: React.ReactNode; col2?: boolean }) {
  return (
    <div className={col2 ? "col-span-2" : ""}>
      <label className="pro-label">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DailyAccomplishmentReport() {
  const today = new Date().toISOString().split("T")[0];

  // ── State ──
  const [devName, setDevName]           = useState("");
  const [date, setDate]                 = useState(today);
  const [workArr, setWorkArr]           = useState<WorkArrangement>("On-site");
  const [project, setProject]           = useState("");
  const [sprint, setSprint]             = useState("");
  const [team, setTeam]                 = useState("");
  const [submittedTo, setSubmittedTo]   = useState("");
  const [timeIn, setTimeIn]             = useState("08:00");
  const [timeOut, setTimeOut]           = useState("17:00");
  const [breakMins, setBreakMins]       = useState(60);
  const [subTime, setSubTime]           = useState("");

  const [standup, setStandup]           = useState<StandupAttended>("Yes");
  const [reachable, setReachable]       = useState<Reachable>("Yes");
  const [avgResponse, setAvgResponse]   = useState("");
  const [connIssues, setConnIssues]     = useState("");
  const [collabLog, setCollabLog]       = useState("");

  const [tasks, setTasks]               = useState<TaskRow[]>(() => Array.from({ length: 5 }, (_, i) => createEmptyTask(i + 1)));
  const [devHrs, setDevHrs]             = useState("");
  const [meetingHrs, setMeetingHrs]     = useState("");
  const [idleHrs, setIdleHrs]           = useState("");

  const [keyAccomp, setKeyAccomp]       = useState("");
  const [blockers, setBlockers]         = useState("");
  const [risks, setRisks]               = useState("");
  const [planTmr, setPlanTmr]           = useState("");
  const [escalation, setEscalation]     = useState("");

  const [checklist, setChecklist]       = useState<boolean[]>(Array(6).fill(false));

  const [tmrArr, setTmrArr]             = useState<WorkArrangement>("On-site");
  const [tmrTimeIn, setTmrTimeIn]       = useState("08:00");
  const [leaveNotice, setLeaveNotice]   = useState("");

  const [supNotes, setSupNotes]         = useState("");
  const [rating, setRating]             = useState(0);
  const [followUp, setFollowUp]         = useState<"No"|"Yes">("No");
  const [reviewDate, setReviewDate]     = useState("");
  const [actionItems, setActionItems]   = useState("");

  const [preparedBy, setPreparedBy]     = useState("");
  const [preparedSig, setPreparedSig]   = useState("");
  const [dateSubmitted, setDateSubmitted] = useState(today);
  const [reviewedBy, setReviewedBy]     = useState("");
  const [reviewedSig, setReviewedSig]   = useState("");
  const [dateReviewed, setDateReviewed] = useState("");

  // ── Computed ──
  const { gross, net } = calcHours(timeIn, timeOut, breakMins);
  const tasksDone     = tasks.filter(t => t.status === "done").length;
  const tasksIP       = tasks.filter(t => t.status === "ip").length;
  const tasksBlocked  = tasks.filter(t => t.status === "blocked").length;
  const tasksCarry    = tasks.filter(t => t.carryOver === "Yes").length;
  const totalActual   = tasks.reduce((s, t) => s + (parseFloat(t.actualHrs) || 0), 0);
  const totalEst      = tasks.reduce((s, t) => s + (parseFloat(t.estHrs) || 0), 0);
  const variance      = totalActual - totalEst;
  const checkCount    = checklist.filter(Boolean).length;
  const checkPct      = Math.round((checkCount / 6) * 100);

  const updateTask = useCallback((id: number, field: keyof TaskRow, value: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }, []);

  const addRow = () => setTasks(prev => [...prev, createEmptyTask(prev.length + 1)]);

  const toggleCheck = (i: number) => setChecklist(prev => prev.map((v, idx) => idx === i ? !v : v));

  const handleSubmit = async () => {
    try {
      await fetch("http://localhost:5169/api/daily-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devName, date, workArr, project, sprint, team, submittedTo, timeIn, timeOut, breakMins, tasks, checklist }),
      });
      alert("Report submitted successfully!");
    } catch {
      alert("Could not reach server. Check your connection.");
    }
  };

  const checklistItems = [
    "All code committed & pushed to repository",
    "Tickets / task board updated with current status",
    "Pull request(s) created or reviewed",
    "Documentation updated (if applicable)",
    "Tests passing / QA completed",
    "Daily report submitted on time",
  ];

  const statusBadge: Record<string, string> = {
    done: "badge-success", ip: "badge-warning", blocked: "badge-danger", todo: "badge-neutral",
  };
  const statusLabel: Record<string, string> = {
    done: "Done", ip: "In Progress", blocked: "Blocked", todo: "To Do",
  };

  // ── Render ──
  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="page-header animate-fade-in-up">
        <h1>Daily Accomplishment Report</h1>
        <p>Software Development — Individual Submission. Submit before end of work day.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tasks Done",    value: tasksDone,                     icon: CheckCircle,  gradient: "linear-gradient(135deg, #059669, #10b981)" },
          { label: "Actual Hours",  value: totalActual.toFixed(1) + "h",  icon: Clock,        gradient: "linear-gradient(135deg, #6366f1, #818cf8)" },
          { label: "Blocked",       value: tasksBlocked,                  icon: AlertTriangle,gradient: "linear-gradient(135deg, #dc2626, #ef4444)" },
          { label: "Checklist",     value: `${checkCount}/6`,             icon: Lock,         gradient: "linear-gradient(135deg, #0891b2, #22d3ee)" },
        ].map((card, i) => (
          <div key={card.label} className="stat-card animate-fade-in-up" style={{ background: card.gradient, animationDelay: `${i * 0.1}s`, opacity: 0 }}>
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

      {/* ── Section 1: Developer Info ── */}
      <SectionCard num={1} title="Developer Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Developer Name">
            <input className="pro-input" type="text" placeholder="Enter full name" value={devName} onChange={e => setDevName(e.target.value)} />
          </Field>
          <Field label="Date">
            <input className="pro-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </Field>
          <Field label="Work Arrangement">
            <RadioPills options={["On-site","Remote","Hybrid"] as WorkArrangement[]} value={workArr} onChange={setWorkArr} />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Field label="Project / System">
            <input className="pro-input" type="text" placeholder="e.g. SIMPLEVIA HRIS" value={project} onChange={e => setProject(e.target.value)} />
          </Field>
          <Field label="Sprint / Iteration">
            <input className="pro-input" type="text" placeholder="e.g. Sprint 14" value={sprint} onChange={e => setSprint(e.target.value)} />
          </Field>
          <Field label="Team / Unit">
            <input className="pro-input" type="text" placeholder="e.g. Backend Team" value={team} onChange={e => setTeam(e.target.value)} />
          </Field>
          <Field label="Submitted To">
            <input className="pro-input" type="text" placeholder="Supervisor name" value={submittedTo} onChange={e => setSubmittedTo(e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Field label="Time In">
            <input className="pro-input" type="time" value={timeIn} onChange={e => setTimeIn(e.target.value)} />
          </Field>
          <Field label="Time Out">
            <input className="pro-input" type="time" value={timeOut} onChange={e => setTimeOut(e.target.value)} />
          </Field>
          <Field label="Break Duration (mins)">
            <input className="pro-input" type="number" min={0} value={breakMins} onChange={e => setBreakMins(parseInt(e.target.value) || 0)} />
          </Field>
          <Field label="Submission Time" hint="Record exact time of submission">
            <input className="pro-input" type="text" placeholder="e.g. 5:15 PM" value={subTime} onChange={e => setSubTime(e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Field label="Gross Duration">
            <input className="pro-input bg-gray-50" type="text" readOnly value={gross} placeholder="Auto-calculated" />
          </Field>
          <Field label="Net Productive Hours">
            <input className="pro-input bg-emerald-50 text-emerald-700 font-semibold" type="text" readOnly value={net} placeholder="Auto-calculated" />
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 2: Availability ── */}
      <SectionCard num={2} title="Availability & Connectivity">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Attended Standup?">
            <RadioPills options={["Yes","No","N/A"] as StandupAttended[]} value={standup} onChange={setStandup} />
          </Field>
          <Field label="Reachable via Comms?">
            <RadioPills options={["Yes","Partial","No"] as Reachable[]} value={reachable} onChange={setReachable} />
          </Field>
          <Field label="Avg Response Time">
            <input className="pro-input" type="text" placeholder="e.g. <5 minutes" value={avgResponse} onChange={e => setAvgResponse(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Field label="Connectivity / Environment Issues">
            <textarea className="pro-input resize-none" rows={3} placeholder="Describe any technical or connectivity issues…" value={connIssues} onChange={e => setConnIssues(e.target.value)} />
          </Field>
          <Field label="Collaboration Log">
            <textarea className="pro-input resize-none" rows={3} placeholder="Who you worked with today and on what…" value={collabLog} onChange={e => setCollabLog(e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 3: Tasks ── */}
      <SectionCard num={3} title="Tasks & Activities">
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="pro-table">
            <thead>
              <tr>
                {["#","C/O","Priority","Task Type","Ticket / Ref","Task Description","Module","Status","% Done","Est. Hrs","Actual Hrs","Output / Deliverable","Commit / PR","Remarks"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td className="text-center text-gray-400 font-semibold text-xs w-8">{task.id}</td>
                  <td>
                    <select className="pro-select text-xs py-1" value={task.carryOver} onChange={e => updateTask(task.id, "carryOver", e.target.value)}>
                      <option value="">—</option><option>Yes</option><option>No</option>
                    </select>
                  </td>
                  <td>
                    <select className="pro-select text-xs py-1" value={task.priority} onChange={e => updateTask(task.id, "priority", e.target.value)}>
                      <option value="">—</option><option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </td>
                  <td>
                    <select className="pro-select text-xs py-1" value={task.taskType} onChange={e => updateTask(task.id, "taskType", e.target.value)}>
                      <option value="">—</option><option>Development</option><option>Bug Fix</option><option>Testing</option><option>Review</option><option>Documentation</option><option>Meeting</option><option>Research</option>
                    </select>
                  </td>
                  <td><input className="pro-input py-1 text-xs" type="text" placeholder="PROJ-101" value={task.ticketRef} onChange={e => updateTask(task.id, "ticketRef", e.target.value)} /></td>
                  <td><input className="pro-input py-1 text-xs min-w-[160px]" type="text" placeholder="Describe task…" value={task.description} onChange={e => updateTask(task.id, "description", e.target.value)} /></td>
                  <td><input className="pro-input py-1 text-xs" type="text" placeholder="Module" value={task.module} onChange={e => updateTask(task.id, "module", e.target.value)} /></td>
                  <td>
                    <select className="pro-select text-xs py-1" value={task.status} onChange={e => updateTask(task.id, "status", e.target.value)}>
                      <option value="">—</option><option value="done">Done</option><option value="ip">In Progress</option><option value="blocked">Blocked</option><option value="todo">To Do</option>
                    </select>
                    {task.status && (
                      <span className={`badge mt-1 ${statusBadge[task.status]}`}>
                        <span className="badge-dot" />{statusLabel[task.status]}
                      </span>
                    )}
                  </td>
                  <td><input className="pro-input py-1 text-xs text-center w-16" type="number" min={0} max={100} step={5} placeholder="0" value={task.percentDone} onChange={e => updateTask(task.id, "percentDone", e.target.value)} /></td>
                  <td><input className="pro-input py-1 text-xs text-center w-16" type="number" min={0} step={0.5} placeholder="0" value={task.estHrs} onChange={e => updateTask(task.id, "estHrs", e.target.value)} /></td>
                  <td><input className="pro-input py-1 text-xs text-center w-16" type="number" min={0} step={0.5} placeholder="0" value={task.actualHrs} onChange={e => updateTask(task.id, "actualHrs", e.target.value)} /></td>
                  <td><input className="pro-input py-1 text-xs min-w-[130px]" type="text" placeholder="Output description" value={task.output} onChange={e => updateTask(task.id, "output", e.target.value)} /></td>
                  <td><input className="pro-input py-1 text-xs min-w-[110px]" type="text" placeholder="Commit/PR URL" value={task.commitLink} onChange={e => updateTask(task.id, "commitLink", e.target.value)} /></td>
                  <td><input className="pro-input py-1 text-xs min-w-[110px]" type="text" placeholder="Remarks" value={task.remarks} onChange={e => updateTask(task.id, "remarks", e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" onClick={addRow} className="btn btn-secondary mt-3 text-sm">
          <Plus className="w-4 h-4" /> Add Task Row
        </button>

        {/* Time Breakdown */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Time Breakdown</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ["Dev Hours (coding / testing / review)", devHrs, setDevHrs],
              ["Meeting / Admin Hours", meetingHrs, setMeetingHrs],
              ["Waiting / Idle Hours", idleHrs, setIdleHrs],
            ].map(([lbl, val, setter]) => (
              <div key={lbl as string} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <label className="pro-label">{lbl as string}</label>
                <input className="pro-input mt-1" type="number" min={0} step={0.5} placeholder="0.0" value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Section 4: End-of-Day Summary ── */}
      <SectionCard num={4} title="End-of-Day Summary">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { val: totalActual.toFixed(1), lbl: "Total Actual Hours", hi: true },
            { val: totalEst.toFixed(1),    lbl: "Total Estimated Hours" },
            { val: (variance >= 0 ? "+" : "") + variance.toFixed(1), lbl: "Variance" },
            { val: tasksDone,  lbl: "Tasks Completed" },
            { val: tasksIP,    lbl: "In Progress" },
            { val: tasksBlocked, lbl: "Blocked" },
            { val: tasksCarry, lbl: "Carry-Over" },
          ].map(({ val, lbl, hi }) => (
            <div key={lbl} className={`rounded-xl p-4 text-center border ${hi ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-100"}`}>
              <p className={`text-2xl font-bold ${hi ? "text-emerald-700" : "text-gray-800"}`}>{val}</p>
              <p className="text-xs text-gray-500 mt-1">{lbl}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Key Accomplishments">
            <textarea className="pro-input resize-none" rows={3} placeholder="Summarize what was accomplished today…" value={keyAccomp} onChange={e => setKeyAccomp(e.target.value)} />
          </Field>
          <Field label="Blockers / Issues Encountered">
            <textarea className="pro-input resize-none" rows={3} placeholder="Describe blockers, errors, or issues…" value={blockers} onChange={e => setBlockers(e.target.value)} />
          </Field>
          <Field label="Risks / Early Warnings">
            <textarea className="pro-input resize-none" rows={2} placeholder="Upcoming issues, client delays, scope creep…" value={risks} onChange={e => setRisks(e.target.value)} />
          </Field>
          <Field label="Plan for Tomorrow">
            <textarea className="pro-input resize-none" rows={2} placeholder="What will you focus on next working day…" value={planTmr} onChange={e => setPlanTmr(e.target.value)} />
          </Field>
          <Field label="Support / Escalation Needed" col2>
            <textarea className="pro-input resize-none" rows={2} placeholder="Any escalations or support required…" value={escalation} onChange={e => setEscalation(e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 5: Checklist ── */}
      <SectionCard num={5} title="End-of-Day Checklist">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistItems.map((item, i) => (
            <label
              key={item}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                checklist[i]
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-gray-50 border-gray-100 hover:border-emerald-200"
              }`}
            >
              <input
                type="checkbox"
                checked={checklist[i]}
                onChange={() => toggleCheck(i)}
                className="accent-emerald-600 w-4 h-4 flex-shrink-0"
              />
              <span className={`text-sm ${checklist[i] ? "text-emerald-700 font-medium" : "text-gray-600"}`}>{item}</span>
            </label>
          ))}
        </div>
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{checkCount} / 6 items checked</span>
            <span>{checkPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${checkPct}%` }} />
          </div>
        </div>
      </SectionCard>

      {/* ── Section 6: Tomorrow's Plan ── */}
      <SectionCard num={6} title="Tomorrow's Plan">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Work Arrangement Tomorrow">
            <RadioPills options={["On-site","Remote","Hybrid"] as WorkArrangement[]} value={tmrArr} onChange={setTmrArr} />
          </Field>
          <Field label="Expected Time In">
            <input className="pro-input" type="time" value={tmrTimeIn} onChange={e => setTmrTimeIn(e.target.value)} />
          </Field>
          <Field label="Leave / Absence Notice">
            <input className="pro-input" type="text" placeholder="e.g. Half-day leave in afternoon" value={leaveNotice} onChange={e => setLeaveNotice(e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 7: Supervisor Remarks ── */}
      <SectionCard num={7} title="Supervisor Remarks" amber>
        <Field label="Supervisor Notes / Feedback">
          <textarea className="pro-input resize-none" rows={3} placeholder="Manager comments, guidance, or observations…" value={supNotes} onChange={e => setSupNotes(e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Field label="Performance Rating">
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  className={`text-2xl transition-colors ${rating >= n ? "text-amber-400" : "text-gray-200"}`}>★</button>
              ))}
            </div>
          </Field>
          <Field label="Follow-Up Required?">
            <RadioPills options={["No","Yes"]} value={followUp} onChange={v => setFollowUp(v as "No"|"Yes")} />
          </Field>
          <Field label="Review Date">
            <input className="pro-input" type="date" value={reviewDate} onChange={e => setReviewDate(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Manager Action Items">
            <textarea className="pro-input resize-none" rows={2} placeholder='e.g. "Schedule 1-on-1 Thursday", "Reassign FMIS-342 to Dev B"' value={actionItems} onChange={e => setActionItems(e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 8: Acknowledgment ── */}
      <SectionCard num={8} title="Acknowledgment">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Prepared by">
            <input className="pro-input" type="text" placeholder="Developer's full name" value={preparedBy} onChange={e => setPreparedBy(e.target.value)} />
          </Field>
          <Field label="Signature (type full name)">
            <input className="pro-input" type="text" placeholder="Type name as signature" value={preparedSig} onChange={e => setPreparedSig(e.target.value)} />
          </Field>
          <Field label="Date Submitted">
            <input className="pro-input" type="date" value={dateSubmitted} onChange={e => setDateSubmitted(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Field label="Reviewed by">
            <input className="pro-input" type="text" placeholder="Supervisor's full name" value={reviewedBy} onChange={e => setReviewedBy(e.target.value)} />
          </Field>
          <Field label="Signature (type full name)">
            <input className="pro-input" type="text" placeholder="Type name as signature" value={reviewedSig} onChange={e => setReviewedSig(e.target.value)} />
          </Field>
          <Field label="Date Reviewed">
            <input className="pro-input" type="date" value={dateReviewed} onChange={e => setDateReviewed(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-500 leading-relaxed">
          <strong className="text-gray-700">Note:</strong> Submit this report to your immediate supervisor before end of work day. Late submissions must be justified. Submission timestamp is mandatory.
        </div>
      </SectionCard>

      {/* ── Submit Bar ── */}
      <div className="pro-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          <strong className="text-gray-700">Reminder:</strong> Submit before end of work day. Late submissions must include justification.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button type="button" className="btn btn-secondary"><Save className="w-4 h-4" /> Save Draft</button>
          <button type="button" className="btn btn-secondary"><Eye className="w-4 h-4" /> Preview</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}><Send className="w-4 h-4" /> Submit Report</button>
        </div>
      </div>

    </div>
  );
}