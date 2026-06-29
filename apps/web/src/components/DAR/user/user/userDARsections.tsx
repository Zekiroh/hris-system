// src/components/DAR/user/userDARsections.tsx
import React from "react";
import { Plus, X, Percent, Clock, PackageCheck, GitCommit, AlertTriangle } from "lucide-react";

// ─── Shared Types ─────────────────────────────────────────────────────────────

type WorkArrangement = "On-site" | "Remote" | "Hybrid";
type StandupAttended = "Yes" | "No" | "N/A";
type Reachable = "Yes" | "Partial" | "No";
type TaskStatus = "" | "done" | "ip" | "blocked" | "todo";
type Priority = "" | "High" | "Medium" | "Low";
type TaskType = "" | "Development" | "Bug Fix" | "Testing" | "Review" | "Documentation" | "Meeting" | "Research";

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

// ─── Shared Sub-components ─────────────────────────────────────────────────────

export function RadioPills<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-2 flex-wrap mt-1">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            value === opt
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "border-gray-200 text-gray-600 hover:border-emerald-400 hover:bg-emerald-50"
          }`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export function SignaturePad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [tab, setTab] = React.useState<"draw" | "upload">("draw");
  const [source, setSource] = React.useState<"draw" | "upload" | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isDrawing = React.useRef(false);

  // Redraw saved signature onto the canvas kapag bumalik sa "Draw" tab
  React.useEffect(() => {
    if (tab !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (source === "draw" && value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    } else if (!value) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [tab, value, source]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
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
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    isDrawing.current = true;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    e.preventDefault();
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current; if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
    setSource("draw");
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
    setSource(null);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target?.result as string);
      setSource("upload");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex border-b border-gray-100">
        {(["draw", "upload"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${tab === t ? "bg-white text-emerald-700 border-b-2 border-emerald-600" : "bg-gray-50 text-gray-400 hover:text-gray-600"}`}>
            {t === "draw" ? "Draw Signature" : "Upload Image"}
          </button>
        ))}
      </div>

      {tab === "draw" && (
        <div className="p-3 bg-white">
          <canvas
            ref={canvasRef}
            width={480} height={120}
            className="w-full border border-gray-100 rounded-lg bg-white cursor-crosshair touch-none"
            style={{ touchAction: "none" }}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-gray-400">Sign above using your mouse or finger</p>
            <button type="button" onClick={clearCanvas} className="text-[10px] text-rose-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors">
              Clear
            </button>
          </div>
          {value && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <p className="text-[10px] text-emerald-600 font-medium">Signature captured</p>
            </div>
          )}
        </div>
      )}

      {tab === "upload" && (
        <div className="p-3 bg-white">
          <label className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all">
            {value && source === "upload" ? (
              <img src={value} alt="Signature" className="max-h-[100px] object-contain" />
            ) : (
              <>
                <p className="text-xs text-gray-400 font-medium">Click to upload signature image</p>
                <p className="text-[10px] text-gray-300 mt-1">PNG, JPG accepted</p>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
          {value && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <p className="text-[10px] text-emerald-600 font-medium">Image uploaded</p>
              </div>
              <button type="button" onClick={() => { onChange(""); setSource(null); }} className="text-[10px] text-rose-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors">
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section 1: Developer Info ────────────────────────────────────────────────

interface Section1Props {
  devName: string;
  date: string;
  project: string;
  setProject: (v: string) => void;
  team: string;
  setTeam: (v: string) => void;
  sprint: string;
  setSprint: (v: string) => void;
  submittedTo: string;
  setSubmittedTo: (v: string) => void;
  timeIn: string;
  timeOut: string;
  setTimeOut: (v: string) => void;
  breakMins: number;
  setBreakMins: (v: number) => void;
  workArr: WorkArrangement;
  setWorkArr: (v: WorkArrangement) => void;
  gross: string;
  net: string;
  getFieldSuggestions: (field: string, val: string) => string[];
}

export function Section1DeveloperInfo({
  devName, date, project, setProject, team, setTeam,
  sprint, setSprint, submittedTo, setSubmittedTo,
  timeIn, timeOut, setTimeOut, breakMins, setBreakMins,
  workArr, setWorkArr, gross, net, getFieldSuggestions,
}: Section1Props) {

  const [projectSug, setProjectSug] = React.useState<string[]>([]);
  const [showProjectSug, setShowProjectSug] = React.useState(false);
  const [teamSug, setTeamSug] = React.useState<string[]>([]);
  const [showTeamSug, setShowTeamSug] = React.useState(false);
  const [sprintSug, setSprintSug] = React.useState<string[]>([]);
  const [showSprintSug, setShowSprintSug] = React.useState(false);
  const [submittedToSug, setSubmittedToSug] = React.useState<string[]>([]);
  const [showSubmittedToSug, setShowSubmittedToSug] = React.useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Left Side */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Developer Name</label>
            <input className="pro-input w-full bg-gray-50 text-gray-400 cursor-not-allowed" type="text" value={devName} readOnly autoComplete="off" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <input className="pro-input w-full bg-gray-50 text-gray-400 cursor-not-allowed" type="date" value={date} readOnly />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Project / System</label>
            <div className="relative">
              <input className="pro-input w-full" type="text" placeholder="e.g. SIMPLEVIA HRIS" value={project} autoComplete="off"
                onChange={e => { setProject(e.target.value); const s = getFieldSuggestions("project", e.target.value); setProjectSug(s); setShowProjectSug(s.length > 0); }}
                onBlur={() => setTimeout(() => setShowProjectSug(false), 150)} />
              {showProjectSug && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {projectSug.map(v => <button key={v} type="button" onMouseDown={() => { setProject(v); setShowProjectSug(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">{v}</button>)}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Team / Unit</label>
            <div className="relative">
              <input className="pro-input w-full" type="text" placeholder="e.g. Backend Team" value={team} autoComplete="off"
                onChange={e => { setTeam(e.target.value); const s = getFieldSuggestions("team", e.target.value); setTeamSug(s); setShowTeamSug(s.length > 0); }}
                onBlur={() => setTimeout(() => setShowTeamSug(false), 150)} />
              {showTeamSug && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {teamSug.map(v => <button key={v} type="button" onMouseDown={() => { setTeam(v); setShowTeamSug(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">{v}</button>)}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sprint / Iteration</label>
            <div className="relative">
              <input className="pro-input w-full" type="text" placeholder="e.g. Sprint 14" value={sprint} autoComplete="off"
                onChange={e => { setSprint(e.target.value); const s = getFieldSuggestions("sprint", e.target.value); setSprintSug(s); setShowSprintSug(s.length > 0); }}
                onBlur={() => setTimeout(() => setShowSprintSug(false), 150)} />
              {showSprintSug && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {sprintSug.map(v => <button key={v} type="button" onMouseDown={() => { setSprint(v); setShowSprintSug(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">{v}</button>)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Submitted To</label>
          <div className="relative">
            <input className="pro-input w-full" type="text" placeholder="Supervisor name" value={submittedTo} autoComplete="off"
              onChange={e => { setSubmittedTo(e.target.value); const s = getFieldSuggestions("submittedTo", e.target.value); setSubmittedToSug(s); setShowSubmittedToSug(s.length > 0); }}
              onBlur={() => setTimeout(() => setShowSubmittedToSug(false), 150)} />
            {showSubmittedToSug && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                {submittedToSug.map(v => <button key={v} type="button" onMouseDown={() => { setSubmittedTo(v); setShowSubmittedToSug(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">{v}</button>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Time In</label>
            {timeIn ? (
              <input className="pro-input w-full bg-gray-50 text-gray-400 cursor-not-allowed" type="time" value={timeIn} readOnly />
            ) : (
              <div className="pro-input w-full bg-gray-50 text-gray-300 cursor-not-allowed flex items-center text-sm">
                — not yet timed in —
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Time Out</label>
            <input className="pro-input w-full" type="time" value={timeOut} onChange={e => setTimeOut(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Break (mins)</label>
            <input className="pro-input w-full" type="number" min={0} value={breakMins} onChange={e => setBreakMins(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Work Arrangement</label>
            <RadioPills options={["On-site", "Remote", "Hybrid"] as WorkArrangement[]} value={workArr} onChange={setWorkArr} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Gross Duration</label>
            <input className="pro-input w-full bg-gray-50" type="text" readOnly value={gross} placeholder="Auto-calculated" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Productive Hours</label>
            <input className="pro-input w-full bg-emerald-50 text-emerald-700 font-semibold" type="text" readOnly value={net} placeholder="Auto-calculated" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2: Availability & Connectivity ───────────────────────────────────

interface Section2Props {
  standup: StandupAttended;
  setStandup: (v: StandupAttended) => void;
  reachable: Reachable;
  setReachable: (v: Reachable) => void;
  avgResponse: string;
  setAvgResponse: (v: string) => void;
  connIssues: string;
  setConnIssues: (v: string) => void;
  collabLog: string;
  setCollabLog: (v: string) => void;
}

export function Section2Availability({
  standup, setStandup, reachable, setReachable,
  avgResponse, setAvgResponse, connIssues, setConnIssues,
  collabLog, setCollabLog,
}: Section2Props) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Attended Standup?</label>
          <RadioPills options={["Yes", "No", "N/A"] as StandupAttended[]} value={standup} onChange={setStandup} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Reachable via Comms?</label>
          <RadioPills options={["Yes", "Partial", "No"] as Reachable[]} value={reachable} onChange={setReachable} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Avg Response Time</label>
          <input className="pro-input w-full" type="text" placeholder="e.g. <5 minutes" value={avgResponse} onChange={e => setAvgResponse(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Connectivity / Environment Issues</label>
          <textarea className="pro-input w-full resize-none" rows={3} placeholder="Describe any technical or connectivity issues…" value={connIssues} onChange={e => setConnIssues(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Collaboration Log</label>
          <textarea className="pro-input w-full resize-none" rows={3} placeholder="Who you worked with today and on what…" value={collabLog} onChange={e => setCollabLog(e.target.value)} />
        </div>
      </div>
    </>
  );
}

// ─── Section 3: Tasks Table ───────────────────────────────────────────────────

interface TasksTableProps {
  tasks: TaskRow[];
  onAddRow: () => void;
  onDeleteRow: (id: number) => void;
  onUpdateTask: (id: number, field: keyof TaskRow, value: string | boolean) => void;
}

export function TasksTable({ tasks, onAddRow, onDeleteRow, onUpdateTask }: TasksTableProps) {
  return (
    <div>
      <div className="flex justify-end mb-3">
        <button type="button" onClick={onAddRow} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Task Row
        </button>
      </div>
      <div className="space-y-0 rounded-xl overflow-hidden border border-gray-100" style={{ overflowX: "auto" }}>
        <table className="pro-table" style={{ width: "100%", minWidth: "1050px" }}>
          <thead>
            <tr>
              {["#", "Carry Over", "Priority", "Task Type", "Ticket / Ref", "Task Description", "Module", "Status", "Action"].map((h) => (
                <th key={h} style={{ whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, taskIdx) => {
              const estN = parseFloat(task.estHrs);
              const actN = parseFloat(task.actualHrs);
              const diff = !isNaN(estN) && !isNaN(actN) && task.estHrs && task.actualHrs ? actN - estN : null;
              const detailsOpen = task._expanded ?? false;

              return (
                <React.Fragment key={task.id}>
                  <tr>
                    <td className="text-center text-gray-400 font-semibold text-xs" style={{ width: "36px" }}>{taskIdx + 1}</td>

                    <td style={{ width: "64px" }}>
                      <div className="flex flex-col gap-1 items-start">
                        {(["Yes", "No"] as const).map(v => (
                          <label key={v} className="flex items-center gap-1 text-xs cursor-pointer">
                            <input type="checkbox"
                              className={`w-3.5 h-3.5 ${v === "Yes" ? "accent-emerald-600" : "accent-rose-500"}`}
                              checked={task.carryOver === v}
                              onChange={() => onUpdateTask(task.id, "carryOver", task.carryOver === v ? "" : v)}
                            />
                            <span className="text-gray-600">{v}</span>
                          </label>
                        ))}
                      </div>
                    </td>

                    <td style={{ width: "140px" }}>
                      <select className="pro-select text-xs py-1 w-full" value={task.priority} onChange={e => onUpdateTask(task.id, "priority", e.target.value)}>
                        <option value="">--</option>
                        {["High", "Medium", "Low"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>

                    <td style={{ width: "160px" }}>
                      <select className="pro-select text-xs py-1 w-full" value={task.taskType} onChange={e => onUpdateTask(task.id, "taskType", e.target.value)}>
                        <option value="">--</option>
                        {["Development", "Bug Fix", "Testing", "Review", "Documentation", "Meeting", "Research"].map(o => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </td>

                    <td style={{ width: "120px" }}>
                      <input className="pro-input py-1 text-xs w-full" type="text" placeholder="PROJ-101" value={task.ticketRef} onChange={e => onUpdateTask(task.id, "ticketRef", e.target.value)} />
                    </td>

                    <td style={{ minWidth: "150px" }}>
                      <input className="pro-input py-1 text-xs w-full" type="text" placeholder="Describe task..." value={task.description} onChange={e => onUpdateTask(task.id, "description", e.target.value)} />
                    </td>

                    <td style={{ width: "120px" }}>
                      <input className="pro-input py-1 text-xs w-full" type="text" placeholder="Module" value={task.module} onChange={e => onUpdateTask(task.id, "module", e.target.value)} />
                    </td>

                    <td style={{ width: "150px" }}>
                      <select className="pro-select text-xs py-1 w-full" value={task.status} onChange={e => onUpdateTask(task.id, "status", e.target.value)}>
                        <option value="">--</option>
                        <option value="done">Done</option>
                        <option value="ip">In Progress</option>
                        <option value="blocked">Blocked</option>
                        <option value="todo">To Do</option>
                      </select>
                    </td>

                    <td style={{ width: "120px", textAlign: "center" }}>
                      <button type="button"
                        onClick={() => onUpdateTask(task.id, "_expanded", !detailsOpen)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${detailsOpen ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"}`}>
                        Details {detailsOpen ? "▲" : "▼"}
                      </button>
                    </td>
                  </tr>

                  <tr className="bg-gray-50">
                    <td colSpan={9} className="border-b border-gray-100">
                      {detailsOpen && (
                        <div className="px-6 pb-5 space-y-4">
                          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                            {/* Metrics row */}
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs text-gray-500 flex items-center gap-1.5 mb-1.5 font-medium">
                                  <Percent className="w-3.5 h-3.5" /> Done
                                </label>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 px-2.5 py-1.5">
                                  <input
                                    type="range" min={0} max={100} step={5}
                                    value={task.percentDone || 0}
                                    onChange={e => onUpdateTask(task.id, "percentDone", e.target.value)}
                                    className="flex-1 accent-emerald-600 h-1 cursor-pointer"
                                  />
                                  <input
                                    type="number" min={0} max={100}
                                    value={task.percentDone}
                                    onChange={e => onUpdateTask(task.id, "percentDone", e.target.value)}
                                    className="w-10 text-xs text-center bg-white border border-gray-200 rounded-md py-0.5 outline-none font-semibold text-gray-700"
                                    placeholder="0"
                                  />
                                  <span className="text-[11px] text-gray-400 font-medium">%</span>
                                </div>
                              </div>

                              <div>
                                <label className="text-xs text-gray-500 flex items-center gap-1.5 mb-1.5 font-medium">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Est. Hrs
                                </label>
                                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 px-2.5 py-1.5">
                                  <input
                                    type="number" min={0} step={0.5}
                                    value={task.estHrs}
                                    onChange={e => onUpdateTask(task.id, "estHrs", e.target.value)}
                                    className="flex-1 text-xs text-center bg-transparent outline-none font-semibold text-gray-700 min-w-0"
                                    placeholder="0"
                                  />
                                  <span className="text-[11px] text-gray-400 font-medium pl-1">hrs</span>
                                </div>
                              </div>

                              <div>
                                <label className="text-xs text-gray-500 flex items-center gap-1.5 mb-1.5 font-medium">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Actual Hrs
                                </label>
                                <div className={`flex items-center border rounded-lg px-2.5 py-1.5 transition-colors ${
                                  diff !== null
                                    ? diff > 0 ? "bg-rose-50 border-rose-200"
                                    : diff < 0 ? "bg-emerald-50 border-emerald-200"
                                    : "bg-gray-50 border-gray-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}>
                                  <input
                                    type="number" min={0} step={0.5}
                                    value={task.actualHrs}
                                    onChange={e => onUpdateTask(task.id, "actualHrs", e.target.value)}
                                    className={`flex-1 text-xs text-center bg-transparent outline-none font-semibold min-w-0 ${
                                      diff !== null
                                        ? diff > 0 ? "text-rose-700" : diff < 0 ? "text-emerald-700" : "text-gray-700"
                                        : "text-gray-700"
                                    }`}
                                    placeholder="0"
                                  />
                                  <span className="text-[11px] text-gray-400 font-medium pl-1">hrs</span>
                                </div>
                              </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            {/* Output / Commit / Remarks row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs text-gray-500 flex items-center gap-1.5 mb-1.5 font-medium">
                                  <PackageCheck className="w-3.5 h-3.5 text-sky-500" /> Output / Deliverable
                                </label>
                                <textarea className="pro-input py-2 text-xs w-full resize-none" rows={3} placeholder="Output Description" value={task.output} onChange={e => onUpdateTask(task.id, "output", e.target.value)} />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 flex items-center gap-1.5 mb-1.5 font-medium">
                                  <GitCommit className="w-3.5 h-3.5 text-violet-500" /> Commit / PR Link
                                </label>
                                <textarea className="pro-input py-2 text-xs w-full resize-none" rows={3} placeholder="Commit / PR Link" value={task.commitLink} onChange={e => onUpdateTask(task.id, "commitLink", e.target.value)} />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 flex items-center gap-1.5 mb-1.5 font-medium">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Blocked By / Remarks
                                </label>
                                <textarea className={`pro-input py-2 text-xs w-full resize-none ${task.remarks ? "border-amber-200 bg-amber-50/40" : ""}`} rows={3} placeholder="Notes, blockers, or additional context..." value={task.remarks} onChange={e => onUpdateTask(task.id, "remarks", e.target.value)} />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end">
                            {/* <div className="flex items-center gap-2">
                              {diff !== null && (
                                <>
                                  <span className="text-xs text-gray-400">Hours:</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                                    diff > 0 ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : diff < 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-gray-100 text-gray-500 border-gray-200"
                                  }`}>
                                    {diff > 0
                                      ? `Over by ${diff.toFixed(1)} hr — ${actN} actual vs ${estN} estimated`
                                      : diff < 0
                                      ? `Under budget by ${Math.abs(diff).toFixed(1)} hr — ${actN} actual vs ${estN} estimated`
                                      : `On target — ${actN} hrs`}
                                  </span>
                                </>
                              )}
                            </div> */}
                            <button type="button" onClick={() => onDeleteRow(task.id)} className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg px-2.5 py-1.5 transition-all border border-transparent hover:border-rose-200">
                              <X className="w-3.5 h-3.5" /> Delete Task
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section 4: End-of-Day Summary ────────────────────────────────────────────

interface Section4Props {
  totalActual: number;
  totalEst: number;
  variance: number;
  tasksDone: number;
  tasksIP: number;
  tasksBlocked: number;
  tasksCarry: number;
  keyAccomp: string;
  setKeyAccomp: (v: string) => void;
  blockers: string;
  setBlockers: (v: string) => void;
  risks: string;
  setRisks: (v: string) => void;
  planTmr: string;
  setPlanTmr: (v: string) => void;
  escalation: string;
  setEscalation: (v: string) => void;
}

export function Section4Summary({
  totalActual, totalEst, variance, tasksDone, tasksIP, tasksBlocked, tasksCarry,
  keyAccomp, setKeyAccomp, blockers, setBlockers, risks, setRisks,
  planTmr, setPlanTmr, escalation, setEscalation,
}: Section4Props) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 mb-5">
        {[
          { val: totalActual.toFixed(1), lbl: "Total Actual Hours", hi: true },
          { val: totalEst.toFixed(1),    lbl: "Total Estimated Hours" },
          { val: (variance >= 0 ? "+" : "") + variance.toFixed(1), lbl: "Variance" },
          { val: tasksDone,    lbl: "Tasks Completed" },
          { val: tasksIP,      lbl: "In Progress" },
          { val: tasksBlocked, lbl: "Blocked" },
          { val: tasksCarry,   lbl: "Carry-Over" },
        ].map(({ val, lbl, hi }) => (
          <div key={lbl} className={`rounded-xl p-4 text-center border ${hi ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-100"}`}>
            <p className={`text-2xl font-bold ${hi ? "text-emerald-700" : "text-gray-800"}`}>{val}</p>
            <p className="text-xs text-gray-500 mt-1">{lbl}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Key Accomplishments</label>
            <textarea className="pro-input w-full resize-none" rows={3} placeholder="Summarize what was accomplished today…" value={keyAccomp} onChange={e => setKeyAccomp(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Blockers / Issues Encountered</label>
            <textarea className="pro-input w-full resize-none" rows={3} placeholder="Describe blockers, errors, or issues…" value={blockers} onChange={e => setBlockers(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Risks / Early Warnings</label>
            <textarea className="pro-input w-full resize-none" rows={3} placeholder="Upcoming issues, client delays, scope creep…" value={risks} onChange={e => setRisks(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Plan for Tomorrow</label>
            <textarea className="pro-input w-full resize-none" rows={3} placeholder="What will you focus on next working day…" value={planTmr} onChange={e => setPlanTmr(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Support / Escalation Needed</label>
          <textarea className="pro-input w-full resize-none" rows={2} placeholder="Any escalations or support required…" value={escalation} onChange={e => setEscalation(e.target.value)} />
        </div>
      </div>
    </>
  );
}

// ─── Section 5: End-of-Day Checklist ──────────────────────────────────────────

export const CHECKLIST_ITEMS = [
  "All code committed & pushed to repository",
  "Tickets / task board updated with current status",
  "Pull request(s) created or reviewed",
  "Documentation updated (if applicable)",
  "Tests passing / QA completed",
  "Daily report submitted on time",
];

interface Section5Props {
  checklist: boolean[];
  toggleCheck: (i: number) => void;
  checkCount: number;
  checkPct: number;
}

export function Section5Checklist({ checklist, toggleCheck, checkCount, checkPct }: Section5Props) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CHECKLIST_ITEMS.map((item, i) => (
          <label key={item} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checklist[i] ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-100 hover:border-emerald-200"}`}>
            <input type="checkbox" checked={checklist[i]} onChange={() => toggleCheck(i)} className="accent-emerald-600 w-4 h-4 flex-shrink-0" />
            <span className={`text-sm ${checklist[i] ? "text-emerald-700 font-medium" : "text-gray-600"}`}>{item}</span>
          </label>
        ))}
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{checkCount} / 6 items checked</span>
          <span>{checkPct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${checkPct}%` }} />
        </div>
      </div>
    </>
  );
}

// ─── Section 6: Tomorrow's Plan ────────────────────────────────────────────────

interface Section6Props {
  tmrArr: WorkArrangement;
  setTmrArr: (v: WorkArrangement) => void;
  tmrTimeIn: string;
  setTmrTimeIn: (v: string) => void;
  leaveNotice: string;
  setLeaveNotice: (v: string) => void;
}

export function Section6TomorrowPlan({ tmrArr, setTmrArr, tmrTimeIn, setTmrTimeIn, leaveNotice, setLeaveNotice }: Section6Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Work Arrangement Tomorrow</label>
        <RadioPills options={["On-site", "Remote", "Hybrid"] as WorkArrangement[]} value={tmrArr} onChange={setTmrArr} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Expected Time In</label>
        <input className="pro-input w-full" type="time" value={tmrTimeIn} onChange={e => setTmrTimeIn(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Leave / Absence Notice</label>
        <input className="pro-input w-full" type="text" placeholder="e.g. Half-day leave in afternoon" value={leaveNotice} onChange={e => setLeaveNotice(e.target.value)} />
      </div>
    </div>
  );
}

// ─── Section 8: Acknowledgment ────────────────────────────────────────────────

interface Section8Props {
  preparedBy: string;
  setPreparedBy: (v: string) => void;
  preparedSig: string;
  setPreparedSig: (v: string) => void;
  dateSubmitted: string;
  setDateSubmitted: (v: string) => void;
}

export function Section8Acknowledgment({ preparedBy, setPreparedBy, preparedSig, setPreparedSig, dateSubmitted, setDateSubmitted }: Section8Props) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Prepared by</label>
          <input className="pro-input w-full bg-gray-50 text-gray-400 cursor-not-allowed" type="text" value={preparedBy} readOnly />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Date Submitted</label>
          <input className="pro-input w-full" type="date" value={dateSubmitted} onChange={e => setDateSubmitted(e.target.value)} />
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Signature</label>
          <SignaturePad value={preparedSig} onChange={setPreparedSig} />
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-400 flex items-center gap-1.5 italic">
      <div>
        <strong className="font-bold not-italic text-black">Note:</strong> Submit this report to your immediate supervisor before end of work day. Late submissions must be justified. Submission timestamp is mandatory.
      </div>
    </div>
    </>
  );
}

// alisin nalang ang delete button sa subbmissionsTable ginagamit lng ito para maulit ang pag save ng report.
// at DeleteConfirmModalProps sa modaluser.