import { apiRequest } from "./api";

export type OvertimeRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export type OvertimeReviewAction = "Approve" | "Reject";

export type OvertimeRequestItemDto = {
  id: number;
  overtimeRequestId: number;
  attendanceLogId?: number | null;
  date: string;
  requestedMinutes: number;
  approvedMinutes?: number | null;
  createdAtUtc?: string;
  updatedAtUtc?: string | null;
};

export type OvertimeRequestDto = {
  id: number;
  employeeId: string;
  employeeNumber?: string | null;
  employeeName?: string | null;

  // 🔥 FIXED (match backend)
  attendanceDate: string;

  requestedMinutes: number;
  approvedMinutes?: number | null;
  reason: string;
  status: OvertimeRequestStatus;

  reviewRemarks?: string | null;
  reviewedByUserId?: number | null;
  reviewedByName?: string | null;
  reviewedAtUtc?: string | null;

  createdAtUtc?: string;
  updatedAtUtc?: string | null;

  items?: OvertimeRequestItemDto[];
};

export type PagedOvertimeResponse = {
  items: OvertimeRequestDto[];
  page: number;
  pageSize: number;
  totalCount: number;
};

export type SubmitOvertimeRequestPayload = {
  dateFrom: string;
  dateTo: string;
  requestedMinutes: number;
  reason: string;
};

export type AdminAssignOvertimeRequestPayload = {
  employeeId: string;
  dateFrom: string;
  dateTo: string;
  requestedMinutes: number;
  reason: string;
};

export type ReviewOvertimeRequestPayload = {
  action: OvertimeReviewAction;
  remarks?: string;
};

export type GetOvertimeRequestsQuery = {
  status?: OvertimeRequestStatus | "";
  employeeId?: string;
};

function buildQuery(params?: Record<string, string | undefined | null>): string {
  if (!params) return "";

  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getOvertimeRequests(
  query?: GetOvertimeRequestsQuery
): Promise<PagedOvertimeResponse> {
  const qs = buildQuery({
    status: query?.status || undefined,
    employeeId: query?.employeeId || undefined,
  });

  return apiRequest<PagedOvertimeResponse>(
    `/api/attendance/overtime-requests${qs}`
  );
}

export async function getMyOvertimeRequests(
  status?: OvertimeRequestStatus | ""
): Promise<PagedOvertimeResponse> {
  const qs = buildQuery({
    status: status || undefined,
  });

  return apiRequest<PagedOvertimeResponse>(
    `/api/attendance/overtime-requests/me${qs}`
  );
}

export async function submitOvertimeRequest(
  payload: SubmitOvertimeRequestPayload
): Promise<OvertimeRequestDto> {
  return apiRequest<OvertimeRequestDto>(
    "/api/attendance/overtime-requests",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function adminAssignOvertimeRequest(
  payload: AdminAssignOvertimeRequestPayload
): Promise<OvertimeRequestDto> {
  return apiRequest<OvertimeRequestDto>(
    "/api/attendance/overtime-requests/admin-assign",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function reviewOvertimeRequest(
  overtimeRequestId: number,
  payload: ReviewOvertimeRequestPayload
): Promise<void> {
  await apiRequest<void>(
    `/api/attendance/overtime-requests/${overtimeRequestId}/review`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}