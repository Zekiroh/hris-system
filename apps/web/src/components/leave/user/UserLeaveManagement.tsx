import { useMemo, useState } from "react";
import { Calendar, Plus, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useLeave } from "../../../context/LeaveContext";
import ApplyLeaveModal, {
  type ApplyLeaveFormState,
} from "./ApplyLeaveModal";
import LeaveRequestTable from "./LeaveRequestTable";
import LeaveHistoryTable from "./LeaveHistoryTable";
import type { StatusBadgeMap } from "./LeaveTableTypes";

const PAGE_SIZE = 10;

const UserLeaveManagement = () => {
  const { user } = useAuth();
  const { leaveRequests, leaveBalances, submitLeaveRequest } = useLeave();

  const currentUserName = user?.fullName?.trim() || "Dela Cruz, Juan";

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState<ApplyLeaveFormState>({
    leaveType: "Vacation Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [activeSection, setActiveSection] = useState<"requests" | "history">(
    "requests"
  );

  const [requestsPage, setRequestsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

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
        (r) =>
          r.status === "Approved" ||
          r.status === "Rejected" ||
          r.status === "Cancelled"
      ),
    [myRequests]
  );

  const requestsTotalPages = Math.max(
    1,
    Math.ceil(myRequests.length / PAGE_SIZE)
  );
  const historyTotalPages = Math.max(
    1,
    Math.ceil(myHistoryRequests.length / PAGE_SIZE)
  );

  const paginatedRequests = useMemo(() => {
    const start = (requestsPage - 1) * PAGE_SIZE;
    return myRequests.slice(start, start + PAGE_SIZE);
  }, [myRequests, requestsPage]);

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * PAGE_SIZE;
    return myHistoryRequests.slice(start, start + PAGE_SIZE);
  }, [myHistoryRequests, historyPage]);

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

  const statusBadge: StatusBadgeMap = {
    Pending: "badge-warning",
    Approved: "badge-success",
    Rejected: "badge-danger",
    Cancelled: "badge-secondary",
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
    setRequestsPage(1);
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
              <LeaveRequestTable
                requests={paginatedRequests}
                statusBadge={statusBadge}
                page={requestsPage}
                totalPages={requestsTotalPages}
                onPrev={() => setRequestsPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setRequestsPage((p) => Math.min(requestsTotalPages, p + 1))
                }
              />
            )}

            {activeSection === "history" && (
              <LeaveHistoryTable
                requests={paginatedHistory}
                statusBadge={statusBadge}
                page={historyPage}
                totalPages={historyTotalPages}
                onPrev={() => setHistoryPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setHistoryPage((p) => Math.min(historyTotalPages, p + 1))
                }
              />
            )}
          </div>
        </div>
      </div>

      <ApplyLeaveModal
        show={showApplyModal}
        currentUserName={currentUserName}
        form={applyForm}
        onChange={setApplyForm}
        onClose={() => setShowApplyModal(false)}
        onSubmit={handleApplyLeave}
      />
    </div>
  );
};

export default UserLeaveManagement;
