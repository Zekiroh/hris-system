import type { DarSubmission } from "../../user/components/UserReportModals";

export type ReportStatus = "Pending Review" | "Approved" | "Revision Requested" | "Rejected";
export type Rating = 1 | 2 | 3 | 4 | 5;

export interface SubmittedReport {
  id: string;
  employeeName: string;
  department: string;
  project: string;
  date: string;
  submittedAt: string;
  workArrangement: string;
  totalActualHours: number;
  totalEstHours: number;
  tasksCompleted: number;
  tasksTotal: number;
  checklistDone: number;
  status: ReportStatus;
  assignedSupervisor?: string;
  rating?: Rating;
  supervisorName?: string;
  supervisorComment?: string;
  performanceScore?: number;
  taskVerification?: string;
  attendanceVerified?: boolean;
  taskCompletion?: string;
  acknowledgedByEmployee?: boolean;
  acknowledgedByAdmin?: boolean;
  supervisorSignature?: string;
  finalRemarks?: string;
  followUpRequired?: boolean;
  managerActionItems?: string;
  revisionReason?: string;
  referenceNo: string;
  revisionCount?: number;
  lastRevisedAt?: string;
  _raw?: DarSubmission;
}

export const RATING_LABELS: Record<number, string> = {
  1: "Needs Improvement", 2: "Below Expectations", 3: "Meets Expectations",
  4: "Exceeds Expectations", 5: "Outstanding",
};

export const statusBadgeClass: Record<ReportStatus, string> = {
  "Pending Review":     "badge badge-warning",
  "Approved":           "badge badge-success",
  "Revision Requested": "badge badge-info",
  "Rejected":           "badge badge-danger",
};

export const SUPERVISOR_OPTIONS: string[] = [
  "Marivic R. Songalia-Magyaya",
  "Angela Reyes",
  "Michael Tan",
  "Roberto Cruz",
];

export const DEPARTMENT_OPTIONS: string[] = [
  "Backend Team",
  "Frontend Team",
  "QA Team",
  "Software Development",
  "Cybersecurity",
];
