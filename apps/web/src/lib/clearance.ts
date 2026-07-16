import { apiRequest } from "./api";

const CLEARANCES_BASE_PATH = "/api/clearances";

export type ClearanceDto = {
  id: number;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  department: string;
  position: string;
  lastWorkingDay: string;
  assetRequirementCompleted: boolean;
  departmentApproved: boolean;
  hrApproved: boolean;
  status: string;
  remarks: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  completedAtUtc: string | null;
};

export type ClearanceActivityDto = {
  id: number;
  action: string;
  remarks: string | null;
  actorUserId: number | null;
  actorUserName: string | null;
  createdAtUtc: string;
};

export type CreateClearanceRequest = {
  employeeId: string;
  lastWorkingDay: string;
  remarks?: string | null;
};

export type UpdateDepartmentApprovalRequest = {
  approved: boolean;
  remarks?: string | null;
};

export type UpdateHrApprovalRequest = {
  approved: boolean;
  remarks?: string | null;
};

export type CompleteClearanceRequest = {
  remarks?: string | null;
};

export function getClearances() {
  return apiRequest<ClearanceDto[]>(CLEARANCES_BASE_PATH);
}

export function getClearanceById(id: number) {
  return apiRequest<ClearanceDto>(`${CLEARANCES_BASE_PATH}/${id}`);
}

export function getMyClearance() {
  return apiRequest<ClearanceDto | null>(`${CLEARANCES_BASE_PATH}/my`);
}

export function getClearanceActivities(id: number) {
  return apiRequest<ClearanceActivityDto[]>(
    `${CLEARANCES_BASE_PATH}/${id}/activities`
  );
}

export function createClearance(request: CreateClearanceRequest) {
  return apiRequest<ClearanceDto>(CLEARANCES_BASE_PATH, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateDepartmentApproval(
  id: number,
  request: UpdateDepartmentApprovalRequest
) {
  return apiRequest<ClearanceDto>(
    `${CLEARANCES_BASE_PATH}/${id}/department-approval`,
    {
      method: "PATCH",
      body: JSON.stringify(request),
    }
  );
}

export function updateHrApproval(id: number, request: UpdateHrApprovalRequest) {
  return apiRequest<ClearanceDto>(`${CLEARANCES_BASE_PATH}/${id}/hr-approval`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function completeClearance(id: number, request: CompleteClearanceRequest) {
  return apiRequest<ClearanceDto>(`${CLEARANCES_BASE_PATH}/${id}/complete`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}
