import { useMemo, useState } from "react";
import {
  Calendar,
  Plus,
  X,
  User,
  Clock,
  CheckCircle,
  Info,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLeave } from "../../context/LeaveContext";

const UserLeaveManagement = () => {
  const { user } = useAuth();
  const { leaveRequests, leaveBalances, submitLeaveRequest } = useLeave();

  const currentUserName = user?.fullName?.trim() || "Dela Cruz, Juan";

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: "Vacation Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [activeSection, setActiveSection] = useState<"requests" | "history">(
    "requests"
  );

  const myRequests = useMemo(
    () => leaveRequests.filter((r) => r.employee === currentUserName),
    [leaveRequests, currentUserName]
  );

  const myPendingRequests = useMemo(
    () => myRequests.filter((r) => r.status === "Pending"),
    [myRequests]
  );

  const myHistoryRequests = useMemo(
    () =>
      myRequests.filter(
        (r) => r.status === "Approved" || r.status === "Rejected"
      ),
    [myRequests]
  );

  const currentUserBalance = useMemo(() => {
    const exact = leaveBalances.find(
      (b) => b.name.toLowerCase() === currentUserName.toLowerCase()
    );

    return (
      exact ?? {
        name: currentUserName,
        id: "EMP-000",
        vacation: { total: 15, used: 5 },
        sick: { total: 15, used: 3 },
        emergency: { total: 5, used: 1 },
      }
    );
  }, [leaveBalances, currentUserName]);

  const myLeaveBalances = {
    vacation: {
      total: currentUserBalance.vacation.total,
      used: currentUserBalance.vacation.used,
      remaining:
        currentUserBalance.vacation.total - currentUserBalance.vacation.used,
    },
    sick: {
      total: currentUserBalance.sick.total,
      used: currentUserBalance.sick.used,
      remaining: currentUserBalance.sick.total - currentUserBalance.sick.used,
    },
    emergency: {
      total: currentUserBalance.emergency.total,
      used: currentUserBalance.emergency.used,
      remaining:
        currentUserBalance.emergency.total - currentUserBalance.emergency.used,
    },
  };

  const statusBadge: Record<string, string> = {
    Pending: "badge-warning",
    Approved: "badge-success",
    Rejected: "badge-danger",
  };

  const handleApplyLeave = () => {
    if (!applyForm.startDate || !applyForm.endDate) {
      alert("Please select start and end dates.");
      return;
    }

    const diffTime = Math.abs(
      new Date(applyForm.endDate).getTime() -
        new Date(applyForm.startDate).getTime()
    );
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    submitLeaveRequest({
      employee: currentUserName,
      leaveType: applyForm.leaveType,
      startDate: applyForm.startDate,
      endDate: applyForm.endDate,
      days: days > 0 ? days : 0,
      reason: applyForm.reason,
    });

    setShowApplyModal(false);
    setApplyForm({
      leaveType: "Vacation Leave",
      startDate: "",
      endDate: "",
      reason: "",
    });
    setActiveSection("requests");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-fade-in-up">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Leave Management</h1>
          <p>Manage your leave balances, view history, and submit new requests</p>
        </div>
      </div>

      <div
        className="space-y-8 animate-fade-in-up"
        style={{ animationDelay: "0.1s" }}
      >
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-800">
              My Leave Balances
            </h3>
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" /> Apply for Leave
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Vacation Leave",
                ...myLeaveBalances.vacation,
                gradient: "linear-gradient(135deg, #059669, #10b981)",
              },
              {
                label: "Sick Leave",
                ...myLeaveBalances.sick,
                gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
              },
              {
                label: "Emergency Leave",
                ...myLeaveBalances.emergency,
                gradient: "linear-gradient(135deg, #dc2626, #ef4444)",
              },
            ].map((l) => (
              <div
                key={l.label}
                className="rounded-xl p-5 border border-gray-100 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                    style={{ background: l.gradient }}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-gray-500 font-semibold">
                    {l.label}
                  </p>
                </div>

                <div className="flex items-end gap-2 mb-2">
                  <p className="text-2xl font-bold text-gray-800">
                    {l.remaining}
                  </p>
                  <p className="text-xs text-gray-400 mb-1">
                    / {l.total} remaining
                  </p>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(l.remaining / l.total) * 100}%`,
                      background: l.gradient,
                    }}
                  />
                </div>

                <p className="text-[10px] text-gray-400 mt-1.5">
                  {l.used} used
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pro-card">
          <div className="px-6 pt-4">
            <div className="pro-tabs">
              <button
                onClick={() => setActiveSection("requests")}
                className={`pro-tab flex items-center gap-2 ${
                  activeSection === "requests" ? "active" : ""
                }`}
              >
                <Clock className="w-4 h-4" />
                My Requests
                {myPendingRequests.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
                    {myPendingRequests.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSection("history")}
                className={`pro-tab flex items-center gap-2 ${
                  activeSection === "history" ? "active" : ""
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Leave History
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeSection === "requests" && (
              <div>
                <div className="flex items-start gap-2.5 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-600">
                    Only your own leave requests are shown here. Other
                    employees&apos; leave information is not visible for privacy
                    reasons.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="pro-table w-full">
                    <thead>
                      <tr>
                        {[
                          "Leave Type",
                          "Start Date",
                          "End Date",
                          "Days",
                          "Reason",
                          "Status",
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests.length > 0 ? (
                        myRequests.map((r) => (
                          <tr key={r.id}>
                            <td className="!font-medium">{r.leaveType}</td>
                            <td>{r.startDate}</td>
                            <td>{r.endDate}</td>
                            <td className="font-semibold">{r.days}</td>
                            <td
                              className="text-gray-500 text-xs max-w-[150px] truncate"
                              title={r.reason}
                            >
                              {r.reason || "-"}
                            </td>
                            <td>
                              <div className="flex items-center gap-1.5">
                                <span className={`badge ${statusBadge[r.status]}`}>
                                  <span className="badge-dot" />
                                  {r.status}
                                </span>
                                {r.status === "Pending" && (
                                  <span className="text-[10px] text-amber-600 font-medium whitespace-nowrap">
                                    Awaiting Approval
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-6 text-gray-400 italic"
                          >
                            No leave requests yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === "history" && (
              <div>
                <div className="flex items-start gap-2.5 mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-emerald-600">
                    Your leave history showing only finalized (approved or
                    rejected) requests.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="pro-table w-full">
                    <thead>
                      <tr>
                        {[
                          "Leave Type",
                          "Start Date",
                          "End Date",
                          "Days",
                          "Status",
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myHistoryRequests.length > 0 ? (
                        myHistoryRequests.map((r) => (
                          <tr key={r.id}>
                            <td className="!font-medium">{r.leaveType}</td>
                            <td>{r.startDate}</td>
                            <td>{r.endDate}</td>
                            <td className="font-semibold">{r.days}</td>
                            <td>
                              <span className={`badge ${statusBadge[r.status]}`}>
                                <span className="badge-dot" />
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-6 text-gray-400 italic"
                          >
                            No leave history yet.
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
      </div>

      {showApplyModal && (
        <div className="pro-modal-overlay">
          <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="pro-modal-header">
              <h3>Apply for Leave</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="btn-ghost btn-icon"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="pro-modal-body space-y-4">
              <div className="bg-emerald-50 text-emerald-800 text-sm px-4 py-3 rounded-lg flex items-center gap-2 border border-emerald-100">
                <User className="w-4 h-4" />
                Applying as: <strong>{currentUserName}</strong>
              </div>

              <div>
                <label className="pro-label">Leave Type</label>
                <select
                  className="pro-select"
                  value={applyForm.leaveType}
                  onChange={(e) =>
                    setApplyForm({ ...applyForm, leaveType: e.target.value })
                  }
                >
                  <option>Vacation Leave</option>
                  <option>Sick Leave</option>
                  <option>Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="pro-label">Start Date</label>
                  <input
                    type="date"
                    className="pro-input"
                    value={applyForm.startDate}
                    onChange={(e) =>
                      setApplyForm({ ...applyForm, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="pro-label">End Date</label>
                  <input
                    type="date"
                    className="pro-input"
                    value={applyForm.endDate}
                    onChange={(e) =>
                      setApplyForm({ ...applyForm, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="pro-label">Reason</label>
                <textarea
                  rows={3}
                  className="pro-input resize-none"
                  placeholder="Brief reason for leave..."
                  value={applyForm.reason}
                  onChange={(e) =>
                    setApplyForm({ ...applyForm, reason: e.target.value })
                  }
                />
              </div>

              <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-gray-400">
                  Your leave request will be sent to HR admin for review. It
                  will not be visible to other employees.
                </p>
              </div>
            </div>

            <div className="pro-modal-footer">
              <button
                onClick={() => setShowApplyModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleApplyLeave} className="btn btn-primary">
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLeaveManagement;