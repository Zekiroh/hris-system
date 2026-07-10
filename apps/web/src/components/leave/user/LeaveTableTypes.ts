import type { LeaveRequest, LeaveStatus } from "../../../context/LeaveContext";

// Re-exported so the table components depend on the real domain types
export type LeaveRequestRow = LeaveRequest;

export type StatusBadgeMap = Record<LeaveStatus, string>;