import type { LeaveStatus } from "../../../context/LeaveContext";

export type AdminTab = "request" | "balance" | "history";

export type LeaveAction = "Used" | "Credited";

export interface BalanceHistoryRow {
  id: number;
  date: string;
  leaveType: string;
  action: LeaveAction;
  days: number;
}

export type StatusBadgeMap = Record<LeaveStatus, string>;

export type HistorySortFilter = "latest" | "oldest";

export interface HistoryFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  sort: HistorySortFilter;
}
