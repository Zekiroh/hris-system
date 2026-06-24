import { apiRequest } from "./api";

export type AssetDto = {
  id: number;
  assetCode: string;
  assetName: string;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  status: string;
  notes: string | null;
  activeAssignmentId: number | null;
  assignedEmployeeId: string | null;
  assignedEmployeeNumber: string | null;
  assignedEmployeeName: string | null;
  assignedDate: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type AssetAssignmentDto = {
  id: number;
  assetId: number;
  assetCode: string;
  assetName: string;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  assignedDate: string;
  assignedByUserId: number | null;
  assignedByUserName: string | null;
  remarks: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type AssetReturnDto = {
  id: number;
  assetAssignmentId: number;
  assetId: number;
  assetCode: string;
  assetName: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  returnedDate: string;
  receivedByUserId: number | null;
  receivedByUserName: string | null;
  condition: string;
  remarks: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type AssetReturnRequestDto = {
  id: number;
  assetAssignmentId: number;
  assetId: number;
  assetCode: string;
  assetName: string;
  requestedByEmployeeId: string;
  requestedByEmployeeNumber: string;
  requestedByEmployeeName: string;
  requestedDate: string;
  reason: string;
  status: string;
  reviewedByUserId: number | null;
  reviewedByUserName: string | null;
  reviewedAtUtc: string | null;
  reviewRemarks: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type CreateAssetRequest = {
  assetCode: string;
  assetName: string;
  category: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  status?: string | null;
  notes?: string | null;
};

export type UpdateAssetRequest = {
  assetName: string;
  category: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  status: string;
  notes?: string | null;
};

export type AssignAssetRequest = {
  employeeId: string;
  assignedDate?: string | null;
  remarks?: string | null;
};

export type ReturnAssetRequest = {
  returnedDate?: string | null;
  condition: "Good" | "Needs Repair" | "Damaged";
  remarks?: string | null;
};

export type CreateAssetReturnRequest = {
  reason: string;
};

export type ReviewAssetReturnRequest = {
  remarks?: string | null;
};

export async function getAssets() {
  return apiRequest<AssetDto[]>("/api/assets");
}

export async function getAsset(id: number) {
  return apiRequest<AssetDto>(`/api/assets/${id}`);
}

export async function getEmployeeAssets(employeeId: string) {
  return apiRequest<AssetAssignmentDto[]>(
    `/api/assets/employee/${employeeId}`
  );
}

export async function getMyAssets() {
  return apiRequest<AssetAssignmentDto[]>("/api/assets/my-assets");
}

export async function getMyReturnRequests() {
  return apiRequest<AssetReturnRequestDto[]>("/api/assets/my-return-requests");
}

export async function getReturnRequests() {
  return apiRequest<AssetReturnRequestDto[]>("/api/assets/return-requests");
}

export async function createAsset(payload: CreateAssetRequest) {
  return apiRequest<AssetDto>("/api/assets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAsset(id: number, payload: UpdateAssetRequest) {
  return apiRequest<AssetDto>(`/api/assets/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function assignAsset(id: number, payload: AssignAssetRequest) {
  return apiRequest<AssetAssignmentDto>(`/api/assets/${id}/assign`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function returnAsset(id: number, payload: ReturnAssetRequest) {
  return apiRequest<AssetReturnDto>(`/api/assets/${id}/return`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createReturnRequest(
  assignmentId: number,
  payload: CreateAssetReturnRequest
) {
  return apiRequest<AssetReturnRequestDto>(
    `/api/assets/my-assets/${assignmentId}/return-request`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function approveReturnRequest(
  id: number,
  payload: ReviewAssetReturnRequest
) {
  return apiRequest<AssetReturnRequestDto>(
    `/api/assets/return-requests/${id}/approve`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function rejectReturnRequest(
  id: number,
  payload: ReviewAssetReturnRequest
) {
  return apiRequest<AssetReturnRequestDto>(
    `/api/assets/return-requests/${id}/reject`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}