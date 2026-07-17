import { apiRequest } from "./api";

const DAILY_REPORTS_BASE_PATH = "/api/daily-reports";

export type DailyReportDto = {
  id: number;
  employeeId: string;
  employeeName: string;
  reportDate: string;
  workArrangement: string;
  submissionTime: string;
  project: string;
  sprintIteration: string | null;
  teamUnit: string | null;
  submittedToUserId: number | null;
  timeIn: string | null;
  timeOut: string | null;
  breakDurationMinutes: number;
  attendedStandup: boolean;
  reachableViaComms: boolean;
  avgResponseTime: string | null;
  connectivityIssues: string | null;
  collaborationLog: string | null;
  keyAccomplishments: string | null;
  blockersIssues: string | null;
  risksEarlyWarnings: string | null;
  planForTomorrow: string | null;
  supportEscalationNeeded: string | null;
  codeCommitted: boolean;
  ticketsUpdated: boolean;
  pullRequestCreated: boolean;
  documentationUpdated: boolean;
  testsPassing: boolean;
  reportSubmittedOnTime: boolean;
  checklistCompletedCount: number;
  workArrangementTomorrow: string | null;
  expectedTimeIn: string | null;
  leaveAbsenceNotice: string | null;
  supervisorNotes: string | null;
  performanceRating: string | null;
  followUpRequired: boolean;
  reviewDate: string | null;
  managerActionItems: string | null;
  reviewedBy: string | null;
  dateReviewed: string | null;
  tasks: DailyReportTaskDto[];
};

export type DailyReportTaskDto = {
  id: number;
  taskNumber: number;
  isCarryOver: boolean;
  priority: string;
  taskType: string;
  ticketRefNo: string | null;
  description: string;
  module: string | null;
  status: string;
  percentDone: number;
  estimatedHours: number;
  actualHours: number;
  outputDeliverable: string | null;
  commitPrLink: string | null;
  blockedByRemarks: string | null;
};

export type CreateDailyReportRequest = {
  reportDate: string;
  workArrangement: string;
  project: string;
  sprintIteration?: string | null;
  teamUnit?: string | null;
  submittedToUserId?: number | null;
  timeIn?: string | null;
  timeOut?: string | null;
  breakDurationMinutes: number;
  attendedStandup: boolean;
  reachableViaComms: boolean;
  avgResponseTime?: string | null;
  connectivityIssues?: string | null;
  collaborationLog?: string | null;
  tasks: CreateDailyReportTaskRequest[];
};

export type CreateDailyReportTaskRequest = {
  taskNumber: number;
  isCarryOver: boolean;
  priority: string;
  taskType: string;
  ticketRefNo?: string | null;
  description: string;
  module?: string | null;
  status: string;
  percentDone: number;
  estimatedHours: number;
  actualHours: number;
  outputDeliverable?: string | null;
  commitPrLink?: string | null;
  blockedByRemarks?: string | null;
};

export type UpdateDailyReportRequest = {
  keyAccomplishments?: string | null;
  blockersIssues?: string | null;
  risksEarlyWarnings?: string | null;
  planForTomorrow?: string | null;
  supportEscalationNeeded?: string | null;
  codeCommitted?: boolean | null;
  ticketsUpdated?: boolean | null;
  pullRequestCreated?: boolean | null;
  documentationUpdated?: boolean | null;
  testsPassing?: boolean | null;
  reportSubmittedOnTime?: boolean | null;
  workArrangementTomorrow?: string | null;
  expectedTimeIn?: string | null;
  leaveAbsenceNotice?: string | null;
};

export type SupervisorRemarksRequest = {
  supervisorNotes?: string | null;
  performanceRating?: string | null;
  followUpRequired?: boolean | null;
  reviewDate?: string | null;
  managerActionItems?: string | null;
};

export type GetDailyReportsQuery = {
  employeeId?: string;
  date?: string;
  page?: number;
  pageSize?: number;
};

function toDailyReportsSearchParams(query?: GetDailyReportsQuery) {
  const params = new URLSearchParams();

  if (!query) return params;

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  return params;
}

function withDailyReportsQuery(
  path: string,
  query?: GetDailyReportsQuery
) {
  const params = toDailyReportsSearchParams(query);
  const search = params.toString();

  return search ? `${path}?${search}` : path;
}

export function getDailyReports(query?: GetDailyReportsQuery) {
  return apiRequest<DailyReportDto[]>(
    withDailyReportsQuery(DAILY_REPORTS_BASE_PATH, query)
  );
}

export function getDailyReportById(id: number) {
  return apiRequest<DailyReportDto>(`${DAILY_REPORTS_BASE_PATH}/${id}`);
}

export function getMyDailyReports(
  query?: Omit<GetDailyReportsQuery, "employeeId">
) {
  return apiRequest<DailyReportDto[]>(
    withDailyReportsQuery(`${DAILY_REPORTS_BASE_PATH}/me`, query)
  );
}

export function createDailyReport(request: CreateDailyReportRequest) {
  return apiRequest<DailyReportDto>(DAILY_REPORTS_BASE_PATH, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateDailyReport(
  id: number,
  request: UpdateDailyReportRequest
) {
  return apiRequest<DailyReportDto>(`${DAILY_REPORTS_BASE_PATH}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function updateDailyReportSupervisorRemarks(
  id: number,
  request: SupervisorRemarksRequest
) {
  return apiRequest<DailyReportDto>(
    `${DAILY_REPORTS_BASE_PATH}/${id}/supervisor-remarks`,
    {
      method: "PATCH",
      body: JSON.stringify(request),
    }
  );
}
