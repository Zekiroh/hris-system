import { useState } from "react";
import {
  Laptop,
  ClipboardCheck,
  Star,
  Megaphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Bell,
  BookOpen,
} from "lucide-react";

type Tab = "assets" | "clearance" | "evaluation" | "announcements";

interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
}

const UserAssetManagement = () => {
  const [activeTab, setActiveTab] = useState<Tab>("assets");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportIssue, setReportIssue] = useState("");
  const [acknowledged, setAcknowledged] = useState<Record<number, boolean>>({});
  const [expandedEval, setExpandedEval] = useState<number | null>(null);

  const tabs = [
    { id: "assets" as Tab, label: "My Assets", icon: Laptop },
    { id: "clearance" as Tab, label: "My Clearance", icon: ClipboardCheck },
    { id: "evaluation" as Tab, label: "My Evaluation", icon: Star },
    { id: "announcements" as Tab, label: "Announcements", icon: Megaphone },
  ];

  const myAssets = [
    {
      id: "AST-001",
      name: "Dell Laptop XPS 15",
      category: "IT Equipment",
      serial: "SN-9823-DXPS",
      dateAssigned: "2024-06-15",
      status: "In Use",
      specs: "Intel Core i7, 16GB RAM, 512GB SSD",
    },
    {
      id: "AST-007",
      name: 'Samsung Monitor 24"',
      category: "IT Equipment",
      serial: "SN-4421-SM24",
      dateAssigned: "2024-06-15",
      status: "In Use",
      specs: "1080p FHD, 75Hz, HDMI",
    },
  ];

  const statusBadge: Record<string, string> = {
    "In Use": "badge-success",
    Available: "badge-info",
    Maintenance: "badge-warning",
  };

  const [checklist] = useState<ChecklistItem[]>([
    { key: "laptop", label: "Laptop Returned", done: true },
    { key: "idCard", label: "ID Card Returned", done: true },
    { key: "keys", label: "Keys Returned", done: false },
    { key: "documents", label: "Documents Submitted", done: true },
    {
      key: "deptClearance",
      label: "Department Clearance Approved",
      done: false,
    },
  ]);

  const completedCount = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((completedCount / checklist.length) * 100);
  const clearanceStatus = progressPct === 100 ? "Completed" : "In Progress";

  const evaluations = [
    {
      period: "Q4 2025",
      reviewer: "Admin Manager",
      score: 4.5,
      maxScore: 5.0,
      rating: "Excellent",
      remarks:
        "Dosan consistently delivers high-quality work and demonstrates excellent teamwork. Proactive in problem-solving and a reliable asset to the department.",
      date: "2026-01-10",
    },
    {
      period: "Q3 2025",
      reviewer: "Admin Manager",
      score: 4.2,
      maxScore: 5.0,
      rating: "Good",
      remarks:
        "Strong performance this quarter with consistent output. Minor areas for improvement in documentation practices.",
      date: "2025-10-08",
    },
    {
      period: "Q2 2025",
      reviewer: "Admin Manager",
      score: 3.9,
      maxScore: 5.0,
      rating: "Good",
      remarks:
        "Met expectations across most KPIs. Showed improvement in communication and collaborative tasks.",
      date: "2025-07-12",
    },
  ];

  const ratingBadge: Record<string, string> = {
    Excellent: "badge-success",
    Good: "badge-info",
    "Needs Improvement": "badge-warning",
  };

  const priorityBadge: Record<string, string> = {
    Normal: "badge-neutral",
    Important: "badge-warning",
    Urgent: "badge-danger",
  };

  const announcements = [
    {
      title: "Company Outing 2026",
      date: "2026-02-20",
      author: "HR Department",
      priority: "Normal",
      excerpt:
        "Annual company outing scheduled for March 15–16, 2026 at Batangas Beach Resort. Please register by March 5.",
    },
    {
      title: "Policy Update: Remote Work",
      date: "2026-02-15",
      author: "Admin Department",
      priority: "Important",
      excerpt:
        "Updated remote work policy effective March 1, 2026. All employees must read and acknowledge this policy to remain compliant.",
    },
    {
      title: "System Maintenance Notice",
      date: "2026-02-10",
      author: "IT Department",
      priority: "Urgent",
      excerpt:
        "Scheduled system maintenance on February 28, 2026 from 10 PM to 2 AM. Please save all work beforehand.",
    },
  ];

  const scoreColor = (score: number, max: number) => {
    const pct = score / max;
    if (pct >= 0.85) return "#10b981";
    if (pct >= 0.7) return "#3b82f6";
    return "#f59e0b";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header animate-fade-in-up">
        <h1>Asset Management</h1>
        <p>
          View your assigned assets, clearance progress, evaluations, and
          company announcements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Assigned Assets",
            value: myAssets.length,
            gradient: "linear-gradient(135deg, #059669, #10b981)",
            icon: Laptop,
          },
          {
            label: "Clearance Progress",
            value: progressPct + "%",
            gradient:
              progressPct === 100
                ? "linear-gradient(135deg, #059669, #10b981)"
                : "linear-gradient(135deg, #d97706, #f59e0b)",
            icon: ClipboardCheck,
          },
          {
            label: "Latest Score",
            value: evaluations[0].score + "/5.0",
            gradient: "linear-gradient(135deg, #2563eb, #3b82f6)",
            icon: Star,
          },
          {
            label: "Unread Alerts",
            value: announcements.filter((_, i) => !acknowledged[i]).length,
            gradient: "linear-gradient(135deg, #dc2626, #ef4444)",
            icon: Bell,
          },
        ].map((card, i) => (
          <div
            key={card.label}
            className="stat-card animate-fade-in-up"
            style={{
              background: card.gradient,
              animationDelay: i * 0.1 + "s",
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

      {/* Main Card */}
      <div
        className="pro-card animate-fade-in-up"
        style={{ animationDelay: "0.4s", opacity: 0 }}
      >
        <div className="px-6 pt-4">
          <div className="pro-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pro-tab flex items-center gap-2 ${activeTab === tab.id ? "active" : ""}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* ── MY ASSETS ── */}
          {activeTab === "assets" && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-gray-800">
                Assigned Equipment
              </h3>
              <div className="space-y-4">
                {myAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="pro-card !shadow-none border border-gray-100 !p-5 hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Laptop className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">
                            {asset.name}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {asset.category} • {asset.id}
                          </p>
                        </div>
                      </div>
                      <span className={`badge ${statusBadge[asset.status]}`}>
                        <span className="badge-dot" />
                        {asset.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                          Serial No.
                        </p>
                        <p className="text-xs font-mono font-medium text-gray-700 mt-0.5">
                          {asset.serial}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                          Date Assigned
                        </p>
                        <p className="text-xs font-medium text-gray-700 mt-0.5">
                          {asset.dateAssigned}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg px-3 py-2 col-span-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                          Device Info
                        </p>
                        <p className="text-xs font-medium text-gray-700 mt-0.5">
                          {asset.specs}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setReportOpen(true)}
                        className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Report Issue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MY CLEARANCE ── */}
          {activeTab === "clearance" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">
                  My Clearance Status
                </h3>
                <span
                  className={`badge ${clearanceStatus === "Completed" ? "badge-success" : "badge-warning"}`}
                >
                  <span className="badge-dot" />
                  {clearanceStatus}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="pro-card !shadow-none border border-gray-100 !p-5">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Overall Progress
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {completedCount}/{checklist.length} completed
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: progressPct + "%",
                      background:
                        progressPct === 100
                          ? "linear-gradient(90deg, #059669, #10b981)"
                          : "linear-gradient(90deg, #d97706, #f59e0b)",
                    }}
                  />
                </div>
                <p
                  className="text-right text-xs font-bold mt-1"
                  style={{ color: progressPct === 100 ? "#059669" : "#d97706" }}
                >
                  {progressPct}%
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Clearance Checklist
                </p>
                {checklist.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                    style={{
                      borderColor: item.done ? "#d1fae5" : "#fee2e2",
                      background: item.done ? "#f0fdf4" : "#fff5f5",
                    }}
                  >
                    {item.done ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm font-medium ${item.done ? "text-gray-700" : "text-gray-400"}`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`ml-auto text-xs font-semibold ${item.done ? "text-emerald-600" : "text-red-400"}`}
                    >
                      {item.done ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MY EVALUATION ── */}
          {activeTab === "evaluation" && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-gray-800">
                Performance Evaluation
              </h3>

              {/* Latest evaluation */}
              <div
                className="pro-card !shadow-none border border-blue-100 !p-5"
                style={{
                  background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                }}
              >
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">
                  Latest Evaluation
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-black text-gray-800">
                      {evaluations[0].score}
                      <span className="text-sm font-medium text-gray-400">
                        /{evaluations[0].maxScore}
                      </span>
                    </p>
                    <span
                      className={`badge ${ratingBadge[evaluations[0].rating]} mt-1`}
                    >
                      <span className="badge-dot" />
                      {evaluations[0].rating}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {evaluations[0].period}
                    </p>
                    <p className="text-xs text-gray-400">
                      {evaluations[0].reviewer}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Supervisor Remarks
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {evaluations[0].remarks}
                  </p>
                </div>
              </div>

              {/* History */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Evaluation History
                </p>
                <div className="space-y-2">
                  {evaluations.map((ev, i) => (
                    <div
                      key={i}
                      className="pro-card !shadow-none border border-gray-100 !p-4"
                    >
                      <button
                        className="w-full flex items-center justify-between"
                        onClick={() =>
                          setExpandedEval(expandedEval === i ? null : i)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
                            style={{
                              background: scoreColor(ev.score, ev.maxScore),
                            }}
                          >
                            {ev.score}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-gray-800">
                              {ev.period}
                            </p>
                            <p className="text-xs text-gray-400">
                              {ev.date} • {ev.reviewer}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge ${ratingBadge[ev.rating]}`}>
                            <span className="badge-dot" />
                            {ev.rating}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 text-gray-400 transition-transform ${expandedEval === i ? "rotate-90" : ""}`}
                          />
                        </div>
                      </button>
                      {expandedEval === i && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Remarks
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {ev.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ANNOUNCEMENTS ── */}
          {activeTab === "announcements" && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-gray-800">
                Company Announcements
              </h3>
              <div className="space-y-4">
                {announcements.map((a, i) => (
                  <div
                    key={i}
                    className="pro-card !shadow-none border !p-5 transition-colors"
                    style={{
                      borderColor: acknowledged[i] ? "#d1fae5" : "#e5e7eb",
                      background: acknowledged[i] ? "#f0fdf4" : "#fff",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        {!acknowledged[i] && (
                          <span className="w-2 h-2 rounded-full bg-red-400 inline-block flex-shrink-0" />
                        )}
                        {a.title}
                      </h4>
                      <div className="flex gap-2 flex-shrink-0 ml-2">
                        <span
                          className={`badge text-[10px] ${priorityBadge[a.priority]}`}
                        >
                          <span className="badge-dot" />
                          {a.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                      {a.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        {a.date} • {a.author}
                      </p>
                      {acknowledged[i] ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle className="w-3.5 h-3.5" /> Read
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setAcknowledged((prev) => ({ ...prev, [i]: true }))
                          }
                          className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Issue Modal */}
      {reportOpen && (
        <div className="pro-modal-overlay">
          <div
            className="pro-modal max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pro-modal-header">
              <h3>Report Asset Issue</h3>
              <button
                onClick={() => setReportOpen(false)}
                className="btn-ghost btn-icon"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="pro-modal-body space-y-4">
              <div>
                <label className="pro-label">Asset</label>
                <select className="pro-select">
                  {myAssets.map((a) => (
                    <option key={a.id}>
                      {a.name} ({a.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="pro-label">Issue Type</label>
                <select className="pro-select">
                  <option>Hardware Damage</option>
                  <option>Software Problem</option>
                  <option>Connectivity Issue</option>
                  <option>Performance Issue</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="pro-label">Description</label>
                <textarea
                  rows={4}
                  className="pro-input resize-none"
                  placeholder="Describe the issue in detail..."
                  value={reportIssue}
                  onChange={(e) => setReportIssue(e.target.value)}
                />
              </div>
            </div>
            <div className="pro-modal-footer">
              <button
                onClick={() => setReportOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setReportOpen(false);
                  setReportIssue("");
                }}
                className="btn btn-primary"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAssetManagement;






