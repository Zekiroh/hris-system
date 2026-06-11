import { apiRequest } from "./api";

export type LeaveType = "Vacation" | "Sick" | "Emergency";

export type LeaveRequestStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export type LeaveBalanceTransactionType = "Credit" | "Debit" | "Adjustment";

export type LeaveBalanceDto = {
  leaveType: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
};

export type LeaveRequestDto = {
  id: number;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason?: string | null;
  status: string;
  reviewedByUserId?: number | null;
  reviewedByName?: string | null;
  reviewRemarks?: string | null;
  createdAtUtc: string;
  reviewedAtUtc?: string | null;
};

export type LeaveBalanceTransactionDto = {
  id: number;
  leaveType: string;
  transactionType: string;
  days: number;
  remarks?: string | null;
  createdByName?: string | null;
  createdAtUtc: string;
};

export type CreateLeaveRequestDto = {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
};

export type ReviewLeaveRequestDto = {
  remarks?: string;
};

export type CreditLeaveBalanceDto = {
  employeeId: string;
  leaveType: LeaveType;
  days: number;
  remarks?: string;
};

export type AdjustLeaveBalanceDto = {
  employeeId: string;
  leaveType: LeaveType;
  days: number;
  remarks?: string;
};

export function getMyLeaveBalances() {
  return apiRequest<LeaveBalanceDto[]>("/api/leave/balances");
}

export function getMyLeaveRequests() {
  return apiRequest<LeaveRequestDto[]>("/api/leave/requests");
}

export function createLeaveRequest(dto: CreateLeaveRequestDto) {
  return apiRequest<LeaveRequestDto>("/api/leave/requests", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function cancelLeaveRequest(id: number) {
  return apiRequest<LeaveRequestDto>(`/api/leave/requests/${id}/cancel`, {
    method: "PUT",
  });
}

export function getMyLeaveHistory() {
  return apiRequest<LeaveBalanceTransactionDto[]>("/api/leave/history");
}

export function getAdminLeaveRequests() {
  return apiRequest<LeaveRequestDto[]>("/api/leave/admin/requests");
}

export function approveLeaveRequest(id: number, dto: ReviewLeaveRequestDto) {
  return apiRequest<LeaveRequestDto>(`/api/leave/admin/requests/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function rejectLeaveRequest(id: number, dto: ReviewLeaveRequestDto) {
  return apiRequest<LeaveRequestDto>(`/api/leave/admin/requests/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function getAdminLeaveBalances() {
  return apiRequest<LeaveBalanceDto[]>("/api/leave/admin/balances");
}

export function getEmployeeLeaveBalances(employeeId: string) {
  return apiRequest<LeaveBalanceDto[]>(`/api/leave/admin/employees/${employeeId}/balances`);
}

export function getEmployeeLeaveHistory(employeeId: string) {
  return apiRequest<LeaveBalanceTransactionDto[]>(
    `/api/leave/admin/employees/${employeeId}/history`
  );
}

export function creditLeaveBalance(dto: CreditLeaveBalanceDto) {
  return apiRequest<LeaveBalanceDto>("/api/leave/admin/balances/credit", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function adjustLeaveBalance(dto: AdjustLeaveBalanceDto) {
  return apiRequest<LeaveBalanceDto>("/api/leave/admin/balances/adjust", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}