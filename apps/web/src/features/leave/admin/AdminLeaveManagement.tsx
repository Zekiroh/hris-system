import { useMemo, useState } from "react";
import { Clock, CheckCircle, XCircle, AlertTriangle, Calendar, Search } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useLeave, type LeaveRequest } from "../../../context/LeaveContext";
import type { AdminTab, BalanceHistoryRow, StatusBadgeMap } from "./LeaveTableTypes";
import LeaveRequestTable from "./leave-requests/LeaveRequestTable";
import LeaveHistoryTab from "./leave-history/LeaveHistoryTab";
import LeaveBalanceList from "./leave-balance/LeaveBalanceList";
import ReviewRequestModal from "./leave-requests/ReviewRequestModal";
import BalanceHistoryModal from "./leave-balance/BalanceHistoryModal";

const PAGE_SIZE = 10;

const AdminLeaveManagement = () => {
  useAuth();
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

  const [requestsPage, setRequestsPage] = useState(1);
  const [balancePage, setBalancePage] = useState(1);

  const [requestSearch, setRequestSearch] = useState("");
  const [balanceSearch, setBalanceSearch] = useState("");

  const balanceHistoryData = useMemo<BalanceHistoryRow[]>(
    () => [
      { id: 1, date: "2026-02-20", leaveType: "Sick Leave", action: "Used", days: 2 },
      { id: 2, date: "2026-01-15", leaveType: "Vacation Leave", action: "Used", days: 3 },
      { id: 3, date: "2026-01-01", leaveType: "All Types", action: "Credited", days: 35 },
    ],
    []
  );

  const statusBadge: StatusBadgeMap = {
    Pending: "badge-warning",
    Approved: "badge-success",
    Rejected: "badge-danger",
    Cancelled: "badge-secondary",
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

  const filteredRequests = useMemo(() => {
    const query = requestSearch.trim().toLowerCase();
    if (!query) return leaveRequests;

    return leaveRequests.filter(
      (r) =>
        r.employee.toLowerCase().includes(query) ||
        r.leaveType.toLowerCase().includes(query)
    );
  }, [leaveRequests, requestSearch]);

  const filteredBalances = useMemo(() => {
    const query = balanceSearch.trim().toLowerCase();
    if (!query) return leaveBalances;

    return leaveBalances.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.id.toLowerCase().includes(query)
    );
  }, [leaveBalances, balanceSearch]);

  const requestsTotalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const balanceTotalPages = Math.max(1, Math.ceil(filteredBalances.length / PAGE_SIZE));

  const safeRequestsPage = Math.min(requestsPage, requestsTotalPages);
  const safeBalancePage = Math.min(balancePage, balanceTotalPages);

  const paginatedRequests = useMemo(() => {
    const start = (safeRequestsPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, safeRequestsPage]);

  const paginatedBalances = useMemo(() => {
    const start = (safeBalancePage - 1) * PAGE_SIZE;
    return filteredBalances.slice(start, start + PAGE_SIZE);
  }, [filteredBalances, safeBalancePage]);

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

  const handleRequestSearchChange = (value: string) => {
    setRequestSearch(value);
    setRequestsPage(1);
  };

  const handleBalanceSearchChange = (value: string) => {
    setBalanceSearch(value);
    setBalancePage(1);
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
            <div className="space-y-4">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={requestSearch}
                  onChange={(e) => handleRequestSearchChange(e.target.value)}
                  placeholder="Search by employee or leave type..."
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <LeaveRequestTable
                requests={paginatedRequests}
                statusBadge={statusBadge}
                page={safeRequestsPage}
                totalPages={requestsTotalPages}
                onPrev={() =>
                  setRequestsPage((p) =>
                    Math.max(1, Math.min(p, requestsTotalPages) - 1)
                  )
                }
                onNext={() =>
                  setRequestsPage((p) =>
                    Math.min(requestsTotalPages, Math.min(p, requestsTotalPages) + 1)
                  )
                }
                onReview={handleOpenReview}
                onDelete={handleDeleteRequest}
              />
            </div>
          )}

          {activeTab === "balance" && (
            <div className="space-y-4">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={balanceSearch}
                  onChange={(e) => handleBalanceSearchChange(e.target.value)}
                  placeholder="Search by employee name or ID..."
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <LeaveBalanceList
                balances={paginatedBalances}
                page={safeBalancePage}
                totalPages={balanceTotalPages}
                onPrev={() =>
                  setBalancePage((p) =>
                    Math.max(1, Math.min(p, balanceTotalPages) - 1)
                  )
                }
                onNext={() =>
                  setBalancePage((p) =>
                    Math.min(balanceTotalPages, Math.min(p, balanceTotalPages) + 1)
                  )
                }
                onViewHistory={(employeeName) => {
                  setSelectedEmployee(employeeName);
                  setShowBalanceHistory(true);
                }}
              />
            </div>
          )}

          {activeTab === "history" && (
            <LeaveHistoryTab history={finalizedHistory} statusBadge={statusBadge} />
          )}
        </div>
      </div>

      <ReviewRequestModal
        show={showReviewModal}
        request={reviewRequest}
        onClose={() => {
          setShowReviewModal(false);
          setReviewRequest(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <BalanceHistoryModal
        key={selectedEmployee ?? "balance-history"}
        show={showBalanceHistory}
        employeeName={selectedEmployee}
        rows={balanceHistoryData}
        onClose={() => {
          setShowBalanceHistory(false);
          setSelectedEmployee(null);
        }}
      />
    </div>
  );
};

export default AdminLeaveManagement;
