import { useMemo, useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Calendar,
  Edit,
  Trash2,
  CheckSquare,
  Ban,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  useLeave,
  type LeaveRequest,
} from "../../context/LeaveContext";

type AdminTab = "request" | "balance" | "history";
type LeaveAction = "Used" | "Credited";

type BalanceHistoryRow = {
  id: number;
  date: string;
  leaveType: string;
  action: LeaveAction;
  days: number;
};

const AdminLeaveManagement = () => {
  const { user } = useAuth();
  const {
    leaveRequests,
    leaveHistory,
    leaveBalances,
    approveRequest,
    rejectRequest,
    deleteRequest,
  } = useLeave();

  const [activeTab, setActiveTab] = useState<AdminTab>("request");
  const [showBalanceHistory, setShowBalanceHistory] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [reviewRequest, setReviewRequest] = useState<LeaveRequest | null>(null);

  const balanceHistoryData: BalanceHistoryRow[] = [
    { id: 1, date: "2026-02-20", leaveType: "Sick Leave", action: "Used", days: 2 },
    { id: 2, date: "2026-01-15", leaveType: "Vacation Leave", action: "Used", days: 3 },
    { id: 3, date: "2026-01-01", leaveType: "All Types", action: "Credited", days: 35 },
  ];

  const statusBadge: Record<string, string> = {
    Pending: "badge-warning",
    Approved: "badge-success",
    Rejected: "badge-danger",
  };

  const tabs = [
    { id: "request" as const, label: "Leave Requests", icon: Calendar },
    { id: "balance" as const, label: "Leave Balance", icon: CheckCircle },
    { id: "history" as const, label: "Leave History", icon: Clock },
  ];

  const pendingCount = leaveRequests.filter((r) => r.status === "Pending").length;
  const approvedCount = leaveRequests.filter((r) => r.status === "Approved").length;
  const rejectedCount = leaveRequests.filter((r) => r.status === "Rejected").length;

  const statCards = [
    {
      label: "Pending",
      value: pendingCount,
      icon: Clock,
      gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: CheckCircle,
      gradient: "linear-gradient(135deg, #059669, #10b981)",
    },
    {
      label: "Rejected",
      value: rejectedCount,
      icon: XCircle,
      gradient: "linear-gradient(135deg, #dc2626, #ef4444)",
    },
    {
      label: "On Leave Today",
      value: 3,
      icon: AlertTriangle,
      gradient: "linear-gradient(135deg, #2563eb, #3b82f6)",
    },
  ];

  const finalizedHistory = useMemo(() => {
    return leaveHistory.filter(
      (r) => r.status === "Approved" || r.status === "Rejected"
    );
  }, [leaveHistory]);

  const selectedBalanceEmployee = useMemo(() => {
    if (!selectedEmployee) return null;
    return leaveBalances.find((emp) => emp.name === selectedEmployee) ?? null;
  }, [leaveBalances, selectedEmployee]);

  const handleOpenReview = (request: LeaveRequest) => {
    setReviewRequest(request);
    setShowReviewModal(true);
  };

  const handleApprove = () => {
    if (!reviewRequest) return;
    approveRequest(reviewRequest.id);
    setShowReviewModal(false);
    setReviewRequest(null);
  };

  const handleReject = () => {
    if (!reviewRequest) return;
    rejectRequest(reviewRequest.id);
    setShowReviewModal(false);
    setReviewRequest(null);
  };

  const handleDeleteRequest = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;
    deleteRequest(id);
  };

  const BalanceCard = ({
    label,
    total,
    used,
    color,
  }: {
    label: string;
    total: number;
    used: number;
    color: string;
  }) => {
    const remaining = total - used;
    const pct = total > 0 ? (remaining / total) * 100 : 0;

    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">
          {label}
        </p>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm"
            style={{ background: color }}
          >
            {remaining}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">
              {remaining}
              <span className="text-xs text-gray-400 font-medium ml-1">/ {total}</span>
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Remaining</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-bold text-gray-500">{used}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Used</p>
          </div>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Leave Management</h1>
          <p>Review and manage employee leave requests</p>
        </div>
      </div>

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
                {tab.id === "request" && pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "request" && (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="pro-table">
                <thead>
                  <tr>
                    {[
                      "Employee",
                      "Leave Type",
                      "Start Date",
                      "End Date",
                      "Days",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.length > 0 ? (
                    leaveRequests.map((r) => (
                      <tr key={r.id}>
                        <td className="!font-medium !text-gray-800">{r.employee}</td>
                        <td>{r.leaveType}</td>
                        <td>{r.startDate}</td>
                        <td>{r.endDate}</td>
                        <td className="!font-semibold">{r.days}</td>
                        <td>
                          <span className={`badge ${statusBadge[r.status]}`}>
                            <span className="badge-dot" />
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            {r.status === "Pending" ? (
                              <button
                                onClick={() => handleOpenReview(r)}
                                className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"
                                title="Review Request"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                disabled
                                className="btn-ghost btn-icon text-gray-300 cursor-not-allowed"
                                title="Already reviewed"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteRequest(r.id)}
                              className="btn-ghost btn-icon text-rose-500 hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-500 italic">
                        No leave requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "balance" && (
            <div className="space-y-5">
              {leaveBalances.map((emp) => (
                <div key={emp.id} className="pro-card !shadow-none border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{emp.id}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEmployee(emp.name);
                        setShowBalanceHistory(true);
                      }}
                      className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                    >
                      View History →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <BalanceCard
                      label="Vacation Leave"
                      total={emp.vacation.total}
                      used={emp.vacation.used}
                      color="#059669"
                    />
                    <BalanceCard
                      label="Sick Leave"
                      total={emp.sick.total}
                      used={emp.sick.used}
                      color="#d97706"
                    />
                    <BalanceCard
                      label="Emergency Leave"
                      total={emp.emergency.total}
                      used={emp.emergency.used}
                      color="#dc2626"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-5">
              <div className="flex items-end gap-3 flex-wrap">
                <div>
                  <label className="pro-label">Date From</label>
                  <input type="date" className="pro-input !w-auto" />
                </div>
                <div>
                  <label className="pro-label">Date To</label>
                  <input type="date" className="pro-input !w-auto" />
                </div>
                <button className="btn btn-primary h-fit">Generate Report</button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table">
                  <thead>
                    <tr>
                      {[
                        "Date Applied",
                        "Employee",
                        "Leave Type",
                        "Duration",
                        "Status",
                        "Approver",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {finalizedHistory.length > 0 ? (
                      finalizedHistory.map((r) => (
                        <tr key={r.id}>
                          <td>{r.dateApplied}</td>
                          <td className="!font-medium !text-gray-800">{r.employee}</td>
                          <td>{r.leaveType}</td>
                          <td>{r.duration}</td>
                          <td>
                            <span className={`badge ${statusBadge[r.status]}`}>
                              <span className="badge-dot" />
                              {r.status}
                            </span>
                          </td>
                          <td>{r.approver}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-gray-400 italic">
                          No finalized leave records yet. Approve or reject pending requests first.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showReviewModal && reviewRequest && (
        <div className="pro-modal-overlay">
          <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header border-b border-gray-100 pb-4">
              <h3>Review Leave Request</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewRequest(null);
                }}
                className="btn-ghost btn-icon"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="pro-modal-body space-y-4 pt-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-1">
                  {reviewRequest.employee}
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Leave Type:</span>
                    <span className="font-semibold text-gray-800">
                      {reviewRequest.leaveType}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Duration:</span>
                    <span className="font-semibold text-gray-800">
                      {reviewRequest.startDate} to {reviewRequest.endDate} ({reviewRequest.days} days)
                    </span>
                  </div>

                  <div className="flex justify-between flex-col mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-500 font-medium mb-1">Reason:</span>
                    <span className="text-gray-700 italic text-xs bg-white p-2 rounded border border-gray-100">
                      {reviewRequest.reason || "No reason provided."}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Choose an action below to finalize this leave request. The employee will be notified.
              </p>
            </div>

            <div className="pro-modal-footer">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewRequest(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                className="btn flex items-center gap-1.5 text-white font-semibold px-4 py-2 rounded-xl transition-all"
                style={{ background: "linear-gradient(135deg, #dc2626, #ef4444)" }}
              >
                <Ban className="w-4 h-4" /> Deny
              </button>

              <button
                onClick={handleApprove}
                className="btn flex items-center gap-1.5 text-white font-semibold px-4 py-2 rounded-xl transition-all"
                style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
              >
                <CheckSquare className="w-4 h-4" /> Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {showBalanceHistory && selectedEmployee && (
        <div className="pro-modal-overlay">
          <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <h3>Leave Balance History</h3>
              <button
                onClick={() => {
                  setShowBalanceHistory(false);
                  setSelectedEmployee(null);
                }}
                className="btn-ghost btn-icon"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="pro-modal-body">
              <p className="text-sm text-gray-500 mb-4 font-medium">
                {selectedBalanceEmployee?.name || selectedEmployee}
              </p>

              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="pro-table">
                  <thead>
                    <tr>
                      {["Date", "Leave Type", "Action", "Days"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {balanceHistoryData.map((r) => (
                      <tr key={r.id}>
                        <td>{r.date}</td>
                        <td>{r.leaveType}</td>
                        <td>
                          <span
                            className={`badge ${
                              r.action === "Used" ? "badge-danger" : "badge-success"
                            }`}
                          >
                            <span className="badge-dot" />
                            {r.action}
                          </span>
                        </td>
                        <td className="!font-semibold">{r.days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pro-modal-footer">
              <button
                onClick={() => {
                  setShowBalanceHistory(false);
                  setSelectedEmployee(null);
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveManagement;