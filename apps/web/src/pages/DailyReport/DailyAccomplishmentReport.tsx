import { useState, useRef, useEffect } from "react";

type Priority = "High" | "Medium" | "Low";
type TaskStatus = "Done" | "In Progress" | "Blocked" | "Carry Over";
type TaskType = "Feature" | "Bug Fix" | "Review" | "Meeting" | "Documentation" | "Testing" | "Others";

interface Task {
  id: number;
  carryOver: boolean;
  priority: Priority;
  taskType: TaskType;
  ticketRef: string;
  description: string;
  module: string;
  status: TaskStatus;
  percentDone: number;
  estHours: number;
  actualHours: number;
  output: string;
  commitLink: string;
  remarks: string;
}

interface ChecklistItem {
  id: number;
  label: string;
  checked: boolean;
}

const EMPTY_TASK = (): Task => ({
  id: Date.now(),
  carryOver: false,
  priority: "Medium",
  taskType: "Feature",
  ticketRef: "",
  description: "",
  module: "",
  status: "In Progress",
  percentDone: 0,
  estHours: 0,
  actualHours: 0,
  output: "",
  commitLink: "",
  remarks: "",
});

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 1, label: "All code committed & pushed to repository", checked: false },
  { id: 2, label: "Tickets / task board updated with current status", checked: false },
  { id: 3, label: "Pull request(s) created or reviewed", checked: false },
  { id: 4, label: "Documentation updated (if applicable)", checked: false },
  { id: 5, label: "Tests passing / QA completed", checked: false },
  { id: 6, label: "Daily report submitted on time", checked: false },
];

const globalStyle = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .dar-fade { animation: fadeInUp 0.35s ease both; }
  .dar-fade-1 { animation: fadeInUp 0.35s 0.05s ease both; }
  .dar-fade-2 { animation: fadeInUp 0.35s 0.1s ease both; }
  .dar-fade-3 { animation: fadeInUp 0.35s 0.15s ease both; }

  .dar-input, .dar-select, .dar-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1.5px solid #d1d5db;
    border-radius: 8px;
    font-size: 13px;
    color: #111827;
    background: #fff;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: 'Segoe UI', sans-serif;
  }
  .dar-input:focus, .dar-select:focus, .dar-textarea:focus {
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
  }
  .dar-input[type="date"], .dar-input[type="time"] {
    color-scheme: light;
    cursor: pointer;
  }
  .dar-input[type="date"]::-webkit-calendar-picker-indicator,
  .dar-input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(40%) sepia(80%) saturate(400%) hue-rotate(115deg);
    cursor: pointer;
  }
  .dar-select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23059669' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 32px;
    cursor: pointer;
  }
  .dar-textarea { resize: vertical; min-height: 72px; }
  .dar-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
    border-top: 3px solid transparent;
    transition: box-shadow 0.2s, border-top-color 0.2s;
  }
  .dar-card:hover {
    box-shadow: 0 4px 16px rgba(5,150,105,0.12);
    border-top-color: #059669;
  }
  .dar-stat-card {
    border-radius: 12px;
    padding: 20px;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform 0.18s, box-shadow 0.18s;
    cursor: default;
  }
  .dar-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
  .dar-btn-primary {
    background: #059669; color: #fff; border: none; border-radius: 8px;
    padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: background 0.15s, transform 0.1s;
    font-family: 'Segoe UI', sans-serif;
  }
  .dar-btn-primary:hover { background: #047857; transform: translateY(-1px); }
  .dar-btn-outline {
    background: transparent; color: #059669; border: 1.5px solid #059669;
    border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
    font-family: 'Segoe UI', sans-serif;
  }
  .dar-btn-outline:hover { background: #f0fdf4; }
  .dar-btn-danger {
    background: transparent; color: #ef4444; border: none; cursor: pointer;
    font-size: 15px; padding: 2px 6px; border-radius: 4px; transition: background 0.12s;
  }
  .dar-btn-danger:hover { background: #fee2e2; }
  .dar-section-title {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #fff;
    background: linear-gradient(90deg, #059669, #047857);
    padding: 7px 14px; border-radius: 6px; margin-bottom: 20px;
    display: inline-block; text-transform: uppercase;
  }
  .dar-th {
    background: linear-gradient(90deg, #059669, #047857); color: #fff;
    padding: 10px 8px; text-align: left; font-weight: 600;
    font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap;
  }
  .dar-tr:hover td { background: #f0fdf4 !important; }
  .dar-checklist-item {
    display: flex; align-items: center; gap: 10px; padding: 12px 16px;
    border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.15s;
    border: 1.5px solid #e5e7eb; background: #f9fafb; color: #374151;
    font-family: 'Segoe UI', sans-serif; user-select: none;
  }
  .dar-checklist-item:hover { border-color: #6ee7b7; background: #f0fdf4; }
  .dar-checklist-item.checked { background: #f0fdf4; border-color: #6ee7b7; color: #065f46; font-weight: 600; }
  .dar-checklist-item input[type="checkbox"] { width: 16px; height: 16px; accent-color: #059669; cursor: pointer; flex-shrink: 0; }

  /* Signature canvas */
  .sig-canvas {
    border: 1.5px dashed #d1d5db;
    border-radius: 8px;
    cursor: crosshair;
    background: #f9fafb;
    display: block;
    width: 100%;
    transition: border-color 0.15s;
  }
  .sig-canvas:hover { border-color: #059669; }
  .sig-canvas.signed { border-style: solid; border-color: #059669; background: #fff; }
`;

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { bg: string; color: string }> = {
    Done: { bg: "#dcfce7", color: "#15803d" },
    "In Progress": { bg: "#dbeafe", color: "#1d4ed8" },
    Blocked: { bg: "#fee2e2", color: "#b91c1c" },
    "Carry Over": { bg: "#fef3c7", color: "#92400e" },
  };
  const s = map[status];
  return <span style={{ backgroundColor: s.bg, color: s.color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" }}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = { High: "#dc2626", Medium: "#d97706", Low: "#16a34a" };
  return <span style={{ color: map[priority], fontWeight: 700, fontSize: "11px" }}>{priority}</span>;
}

// ─── Signature Canvas Component ──────────────────────────────────────────────
function SignatureCanvas({ onSign }: { onSign: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const dataUrl = canvasRef.current!.toDataURL();
    setHasSignature(true);
    onSign(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSign("");
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={100}
        className={`sig-canvas${hasSignature ? " signed" : ""}`}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
        <span style={{ fontSize: "11px", color: "#9ca3af" }}>Draw your signature above</span>
        {hasSignature && (
          <button onClick={clearCanvas} style={{ fontSize: "11px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}>
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default function DailyAccomplishmentReport() {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const timeStr = today.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const [devName, setDevName] = useState("");
  const [date, setDate] = useState(formattedDate);
  const [workArrangement, setWorkArrangement] = useState("On-site");
  const [submissionTime, setSubmissionTime] = useState(timeStr);
  const [project, setProject] = useState("");
  const [sprint, setSprint] = useState("");
  const [team, setTeam] = useState("");
  const [submittedTo, setSubmittedTo] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [breakDuration, setBreakDuration] = useState(60);
  const [attendedStandup, setAttendedStandup] = useState("Yes");
  const [reachable, setReachable] = useState("Yes");
  const [avgResponseTime, setAvgResponseTime] = useState("");
  const [connectivityIssues, setConnectivityIssues] = useState("");
  const [collaborationLog, setCollaborationLog] = useState("");
  const [tasks, setTasks] = useState<Task[]>([EMPTY_TASK()]);
  const [devHours, setDevHours] = useState(0);
  const [meetingHours, setMeetingHours] = useState(0);
  const [idleHours, setIdleHours] = useState(0);
  const [keyAccomplishments, setKeyAccomplishments] = useState("");
  const [blockers, setBlockers] = useState("");
  const [risks, setRisks] = useState("");
  const [planTomorrow, setPlanTomorrow] = useState("");
  const [supportNeeded, setSupportNeeded] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [arrangementTomorrow, setArrangementTomorrow] = useState("On-site");
  const [expectedTimeIn, setExpectedTimeIn] = useState("");
  const [leaveNotice, setLeaveNotice] = useState("");

  // Section 7 - Prepared By
  const [preparedByName, setPreparedByName] = useState("");
  const [preparedByPosition, setPreparedByPosition] = useState("");
  const [preparedByDate, setPreparedByDate] = useState(formattedDate);
  const [signatureData, setSignatureData] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalActualHours = tasks.reduce((s, t) => s + (t.actualHours || 0), 0);
  const totalEstHours = tasks.reduce((s, t) => s + (t.estHours || 0), 0);
  const variance = totalActualHours - totalEstHours;
  const tasksCompleted = tasks.filter(t => t.status === "Done").length;
  const tasksInProgress = tasks.filter(t => t.status === "In Progress").length;
  const tasksBlocked = tasks.filter(t => t.status === "Blocked").length;
  const tasksCarryOver = tasks.filter(t => t.carryOver).length;
  const checklistDone = checklist.filter(c => c.checked).length;

  const calcDuration = (subtract: number) => {
    if (!timeIn || !timeOut) return "--";
    const [ih, im] = timeIn.split(":").map(Number);
    const [oh, om] = timeOut.split(":").map(Number);
    const mins = (oh * 60 + om) - (ih * 60 + im) - subtract;
    if (mins < 0) return "--";
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const addTask = () => setTasks(prev => [...prev, EMPTY_TASK()]);
  const removeTask = (id: number) => setTasks(prev => prev.filter(t => t.id !== id));
  const updateTask = (id: number, field: keyof Task, value: unknown) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  const toggleChecklist = (id: number) =>
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));

  const handleSubmit = () => {
    if (!preparedByName) { alert("Please fill in your name in the Prepared By section."); return; }
    if (!signatureData) { alert("Please provide your signature before submitting."); return; }

    // Trigger notification sa TopBar
    const notif = {
      id: Date.now(),
      title: "📋 DAR Submitted",
      message: `${preparedByName} submitted a Daily Accomplishment Report for ${date}.`,
      time: "Just now",
      type: "dar_submit",
    };
    localStorage.setItem("attendance_notification", JSON.stringify(notif));
    window.dispatchEvent(new Event("dar_notification"));

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <>
        <style>{globalStyle}</style>
        <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "24px", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", background: "#fff", borderRadius: "16px", padding: "48px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: "480px" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg,#059669,#047857)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "32px" }}>✓</div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Report Submitted!</h2>
            <p style={{ color: "#6b7280", fontSize: "13px", margin: "0 0 24px" }}>Your Daily Accomplishment Report has been submitted and is now awaiting review from your supervisor.</p>
            <div style={{ backgroundColor: "#f0fdf4", borderRadius: "10px", padding: "16px", border: "1px solid #bbf7d0", textAlign: "left", marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", color: "#374151", fontWeight: 600, marginBottom: "8px" }}>Submission Summary</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                <div>Submitted by: <strong style={{ color: "#111827" }}>{preparedByName}</strong></div>
                <div>Date: <strong style={{ color: "#111827" }}>{preparedByDate}</strong></div>
                <div>Tasks Completed: <strong style={{ color: "#059669" }}>{tasksCompleted}</strong></div>
              </div>
            </div>
            <button className="dar-btn-outline" onClick={() => setIsSubmitted(false)}>Back to Report</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyle}</style>
      <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "24px", fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          {/* Header */}
          <div className="dar-fade" style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0 }}>Daily Accomplishment Report</h1>
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Software Development — Individual Submission</p>
          </div>

          {/* Stat Cards */}
          <div className="dar-fade-1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "20px" }}>
            {[
              { label: "Tasks Done", value: tasksCompleted, icon: "✓", bg: "linear-gradient(135deg,#059669,#047857)" },
              { label: "In Progress", value: tasksInProgress, icon: "⟳", bg: "linear-gradient(135deg,#2563eb,#1d4ed8)" },
              { label: "Blocked", value: tasksBlocked, icon: "⚠", bg: "linear-gradient(135deg,#d97706,#b45309)" },
              { label: "Carry Over", value: tasksCarryOver, icon: "↻", bg: "linear-gradient(135deg,#dc2626,#b91c1c)" },
            ].map(s => (
              <div key={s.label} className="dar-stat-card" style={{ background: s.bg }}>
                <div>
                  <div style={{ fontSize: "12px", opacity: 0.85, marginBottom: "4px" }}>{s.label}</div>
                  <div style={{ fontSize: "30px", fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
                </div>
                <span style={{ fontSize: "28px", opacity: 0.5 }}>{s.icon}</span>
              </div>
            ))}
          </div>

          {/* Section 1 */}
          <div className="dar-card dar-fade-2">
            <div className="dar-section-title">Section 1: Developer Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "16px" }}>
              {[
                { label: "Developer Name *", el: <input className="dar-input" value={devName} onChange={e => setDevName(e.target.value)} placeholder="Full name" /> },
                { label: "Date *", el: <input className="dar-input" type="date" value={date} onChange={e => setDate(e.target.value)} /> },
                { label: "Work Arrangement", el: <select className="dar-select" value={workArrangement} onChange={e => setWorkArrangement(e.target.value)}><option>On-site</option><option>Work From Home</option><option>Hybrid</option></select> },
                { label: "Submission Time", el: <input className="dar-input" value={submissionTime} onChange={e => setSubmissionTime(e.target.value)} placeholder="e.g. 5:15 PM" /> },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>{f.label}</label>
                  {f.el}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "16px" }}>
              {[
                { label: "Project / System", el: <input className="dar-input" value={project} onChange={e => setProject(e.target.value)} placeholder="Project name" /> },
                { label: "Sprint / Iteration", el: <input className="dar-input" value={sprint} onChange={e => setSprint(e.target.value)} placeholder="e.g. Sprint 4" /> },
                { label: "Team / Unit", el: <input className="dar-input" value={team} onChange={e => setTeam(e.target.value)} placeholder="Team name" /> },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>{f.label}</label>
                  {f.el}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "16px" }}>
              {[
                { label: "Submitted To", el: <input className="dar-input" value={submittedTo} onChange={e => setSubmittedTo(e.target.value)} placeholder="Supervisor name" /> },
                { label: "Time In", el: <input className="dar-input" type="time" value={timeIn} onChange={e => setTimeIn(e.target.value)} /> },
                { label: "Time Out", el: <input className="dar-input" type="time" value={timeOut} onChange={e => setTimeOut(e.target.value)} /> },
                { label: "Break Duration (mins)", el: <input className="dar-input" type="number" value={breakDuration} onChange={e => setBreakDuration(Number(e.target.value))} /> },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>{f.label}</label>
                  {f.el}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "#f0fdf4", borderRadius: "10px", padding: "16px", border: "1px solid #bbf7d0" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Gross Duration</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>{calcDuration(0)}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Net Productive Hours</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#059669" }}>{calcDuration(breakDuration)}</div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="dar-card dar-fade-2">
            <div className="dar-section-title">Section 2: Availability & Connectivity</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "16px" }}>
              {[
                { label: "Attended Standup?", el: <select className="dar-select" value={attendedStandup} onChange={e => setAttendedStandup(e.target.value)}><option>Yes</option><option>No</option><option>N/A</option></select> },
                { label: "Reachable via Comms?", el: <select className="dar-select" value={reachable} onChange={e => setReachable(e.target.value)}><option>Yes</option><option>No</option><option>Intermittent</option></select> },
                { label: "Avg Response Time", el: <input className="dar-input" value={avgResponseTime} onChange={e => setAvgResponseTime(e.target.value)} placeholder="e.g. Within 5 mins" /> },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>{f.label}</label>
                  {f.el}
                </div>
              ))}
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Connectivity / Environment Issues</label>
              <textarea className="dar-textarea" value={connectivityIssues} onChange={e => setConnectivityIssues(e.target.value)} placeholder="Describe any issues..." />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Collaboration Log</label>
              <textarea className="dar-textarea" value={collaborationLog} onChange={e => setCollaborationLog(e.target.value)} placeholder="Who you worked with today & on what..." />
            </div>
          </div>

          {/* Section 3 */}
          <div className="dar-card dar-fade-3">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div className="dar-section-title" style={{ marginBottom: 0 }}>Section 3: Tasks & Activities</div>
              <button className="dar-btn-primary" onClick={addTask}><span>+</span> Add Task</button>
            </div>
            <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr>
                    {["#","Carry Over","Priority","Task Type","Ticket/Ref","Description","Module","Status","% Done","Est Hrs","Actual Hrs","Output","Commit/PR","Remarks",""].map(h => (
                      <th key={h} className="dar-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <tr key={task.id} className="dar-tr" style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6", textAlign: "center", fontWeight: 600, color: "#6b7280" }}>{idx + 1}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6", textAlign: "center" }}>
                        <input type="checkbox" checked={task.carryOver} onChange={e => updateTask(task.id, "carryOver", e.target.checked)} style={{ accentColor: "#059669", width: "15px", height: "15px" }} />
                      </td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}>
                        <select className="dar-select" style={{ width: "90px" }} value={task.priority} onChange={e => updateTask(task.id, "priority", e.target.value)}>
                          <option>High</option><option>Medium</option><option>Low</option>
                        </select>
                      </td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}>
                        <select className="dar-select" style={{ width: "120px" }} value={task.taskType} onChange={e => updateTask(task.id, "taskType", e.target.value)}>
                          <option>Feature</option><option>Bug Fix</option><option>Review</option><option>Meeting</option><option>Documentation</option><option>Testing</option><option>Others</option>
                        </select>
                      </td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}><input className="dar-input" style={{ width: "90px" }} value={task.ticketRef} onChange={e => updateTask(task.id, "ticketRef", e.target.value)} placeholder="HRIS-001" /></td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}><input className="dar-input" style={{ width: "180px" }} value={task.description} onChange={e => updateTask(task.id, "description", e.target.value)} placeholder="Task description" /></td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}><input className="dar-input" style={{ width: "90px" }} value={task.module} onChange={e => updateTask(task.id, "module", e.target.value)} placeholder="Module" /></td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}>
                        <select className="dar-select" style={{ width: "120px" }} value={task.status} onChange={e => updateTask(task.id, "status", e.target.value as TaskStatus)}>
                          <option>Done</option><option>In Progress</option><option>Blocked</option><option>Carry Over</option>
                        </select>
                      </td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}><input className="dar-input" style={{ width: "60px" }} type="number" min={0} max={100} value={task.percentDone} onChange={e => updateTask(task.id, "percentDone", Number(e.target.value))} /></td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}><input className="dar-input" style={{ width: "60px" }} type="number" min={0} step={0.5} value={task.estHours} onChange={e => updateTask(task.id, "estHours", Number(e.target.value))} /></td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}><input className="dar-input" style={{ width: "60px" }} type="number" min={0} step={0.5} value={task.actualHours} onChange={e => updateTask(task.id, "actualHours", Number(e.target.value))} /></td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}><input className="dar-input" style={{ width: "130px" }} value={task.output} onChange={e => updateTask(task.id, "output", e.target.value)} placeholder="Deliverable" /></td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}><input className="dar-input" style={{ width: "100px" }} value={task.commitLink} onChange={e => updateTask(task.id, "commitLink", e.target.value)} placeholder="Link / PR#" /></td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}><input className="dar-input" style={{ width: "110px" }} value={task.remarks} onChange={e => updateTask(task.id, "remarks", e.target.value)} placeholder="Remarks" /></td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}><button className="dar-btn-danger" onClick={() => removeTask(task.id)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: "20px", backgroundColor: "#f0fdf4", borderRadius: "10px", padding: "16px", border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#065f46", marginBottom: "12px" }}>⏱ Time Breakdown</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
                {[
                  { label: "Dev Hours (coding/testing/review)", val: devHours, set: setDevHours },
                  { label: "Meeting / Admin Hours", val: meetingHours, set: setMeetingHours },
                  { label: "Waiting / Idle Hours", val: idleHours, set: setIdleHours },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>{f.label}</label>
                    <input className="dar-input" type="number" min={0} step={0.5} value={f.val} onChange={e => f.set(Number(e.target.value))} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="dar-card dar-fade-3">
            <div className="dar-section-title">Section 4: End-of-Day Summary</div>

            {/* Hours row - auto computed */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "12px" }}>
              {[
                { label: "Total Actual Hours:", value: totalActualHours.toFixed(1), color: "#059669" },
                { label: "Total Estimated Hours:", value: totalEstHours.toFixed(1), color: "#2563eb" },
                { label: "Variance (Actual – Est.):", value: (variance >= 0 ? "+" : "") + variance.toFixed(1), color: variance > 0 ? "#dc2626" : "#059669" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f9fafb", borderRadius: "8px", padding: "10px 14px", border: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{s.label}</span>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Task counts row - auto computed from tasks table */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "Tasks Completed:", value: tasksCompleted, color: "#059669" },
                { label: "Tasks In Progress:", value: tasksInProgress, color: "#2563eb" },
                { label: "Tasks Blocked:", value: tasksBlocked, color: "#dc2626" },
                { label: "Carry-Over Tasks:", value: tasksCarryOver, color: "#d97706" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f9fafb", borderRadius: "8px", padding: "10px 14px", border: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{s.label}</span>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              {[
                { label: "Key Accomplishments *", val: keyAccomplishments, set: setKeyAccomplishments, ph: "What did you accomplish today?" },
                { label: "Blockers / Issues Encountered", val: blockers, set: setBlockers, ph: "Any blockers or issues?" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>{f.label}</label>
                  <textarea className="dar-textarea" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              {[
                { label: "Risks / Early Warnings", val: risks, set: setRisks, ph: "Upcoming issues, client delays, scope creep..." },
                { label: "Plan for Tomorrow", val: planTomorrow, set: setPlanTomorrow, ph: "What are you working on tomorrow?" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>{f.label}</label>
                  <textarea className="dar-textarea" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} />
                </div>
              ))}
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Support / Escalation Needed</label>
              <textarea className="dar-textarea" style={{ minHeight: "56px" }} value={supportNeeded} onChange={e => setSupportNeeded(e.target.value)} placeholder="Any support needed from supervisor or team?" />
            </div>
          </div>

          {/* Section 5 */}
          <div className="dar-card dar-fade-3">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div className="dar-section-title" style={{ marginBottom: 0 }}>Section 5: End-of-Day Checklist</div>
              <div style={{ backgroundColor: checklistDone === 6 ? "#dcfce7" : "#f3f4f6", color: checklistDone === 6 ? "#15803d" : "#6b7280", padding: "5px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, border: `1.5px solid ${checklistDone === 6 ? "#86efac" : "#e5e7eb"}`, transition: "all 0.2s" }}>
                {checklistDone === 6 ? "✓ " : ""}{checklistDone} / 6 completed
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {checklist.map(item => (
                <label key={item.id} className={`dar-checklist-item${item.checked ? " checked" : ""}`} onClick={() => toggleChecklist(item.id)}>
                  <input type="checkbox" checked={item.checked} onChange={() => toggleChecklist(item.id)} />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Section 6 */}
          <div className="dar-card dar-fade-3">
            <div className="dar-section-title">Section 6: Tomorrow's Plan</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Work Arrangement Tomorrow</label>
                <select className="dar-select" value={arrangementTomorrow} onChange={e => setArrangementTomorrow(e.target.value)}>
                  <option>On-site</option><option>Work From Home</option><option>Hybrid</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Expected Time In</label>
                <input className="dar-input" type="time" value={expectedTimeIn} onChange={e => setExpectedTimeIn(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Leave / Absence Notice</label>
                <input className="dar-input" value={leaveNotice} onChange={e => setLeaveNotice(e.target.value)} placeholder="None" />
              </div>
            </div>
          </div>

          {/* Task Summary */}
          <div className="dar-card dar-fade-3">
            <div className="dar-section-title">Task Summary</div>
            <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr>{["#","Description","Module","Priority","Status","% Done","Est Hrs","Actual Hrs"].map(h => <th key={h} className="dar-th">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {tasks.filter(t => t.description).map((task, idx) => (
                    <tr key={task.id} className="dar-tr">
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6", textAlign: "center", color: "#6b7280" }}>{idx + 1}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>{task.description}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>{task.module || "—"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}><PriorityBadge priority={task.priority} /></td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}><StatusBadge status={task.status} /></td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ flex: 1, height: "6px", backgroundColor: "#e5e7eb", borderRadius: "3px" }}>
                            <div style={{ width: `${task.percentDone}%`, height: "100%", background: "linear-gradient(90deg,#059669,#10b981)", borderRadius: "3px", transition: "width 0.3s" }} />
                          </div>
                          <span style={{ fontSize: "11px", color: "#6b7280", minWidth: "28px" }}>{task.percentDone}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6", textAlign: "center" }}>{task.estHours}h</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6", textAlign: "center" }}>{task.actualHours}h</td>
                    </tr>
                  ))}
                  {tasks.filter(t => t.description).length === 0 && (
                    <tr><td colSpan={8} style={{ padding: "28px", textAlign: "center", color: "#9ca3af", fontStyle: "italic" }}>No tasks added yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 7: Prepared By */}
          <div className="dar-card dar-fade-3" style={{ border: "1px solid #bbf7d0", borderTop: "3px solid transparent", transition: "border-top-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderTopColor = "#059669"}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderTopColor = "transparent"}
          >
            <div className="dar-section-title">Section 7: Prepared By</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Full Name *</label>
                <input className="dar-input" value={preparedByName} onChange={e => setPreparedByName(e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Position / Role</label>
                <input className="dar-input" value={preparedByPosition} onChange={e => setPreparedByPosition(e.target.value)} placeholder="e.g. Frontend Developer" />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Date Signed</label>
                <input className="dar-input" type="date" value={preparedByDate} onChange={e => setPreparedByDate(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
                Digital Signature *
                <span style={{ fontSize: "11px", fontWeight: 400, color: "#9ca3af", marginLeft: "8px" }}>Sign inside the box below</span>
              </label>
              <SignatureCanvas onSign={setSignatureData} />
            </div>

            {/* Signature preview strip */}
            {signatureData && (
              <div style={{ marginTop: "16px", padding: "12px 16px", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>✓</span>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#065f46" }}>Signature captured</div>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>Ready for submission — {preparedByName || "fill in your name above"}</div>
                </div>
              </div>
            )}

            <div style={{ marginTop: "20px", padding: "14px 16px", backgroundColor: "#fffbeb", borderRadius: "8px", border: "1px solid #fde68a", fontSize: "12px", color: "#92400e" }}>
              ⚠ By signing and submitting this report, I certify that the information provided is accurate and reflects my actual work activities for the day.
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingBottom: "32px" }}>
            <button className="dar-btn-outline">Save Draft</button>
            <button className="dar-btn-primary" onClick={handleSubmit}>
              <span>📤</span> Submit Report
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
