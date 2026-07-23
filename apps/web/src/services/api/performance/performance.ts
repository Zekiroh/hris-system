import { apiRequest } from "../client";

const PERFORMANCE_EVALUATIONS_BASE_PATH = "/api/performance-evaluations";

export type PerformanceEvaluationDto = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  reviewerUserId: number | null;
  reviewerName: string | null;
  reviewPeriod: string;
  score: number;
  rating: string;
  remarks: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type CreatePerformanceEvaluationRequest = {
  employeeId: string;
  reviewPeriod: string;
  score: number;
  rating: string;
  remarks: string | null;
};

export function getPerformanceEvaluations() {
  return apiRequest<PerformanceEvaluationDto[]>(
    PERFORMANCE_EVALUATIONS_BASE_PATH
  );
}

export function getPerformanceEvaluationById(id: string) {
  return apiRequest<PerformanceEvaluationDto>(
    `${PERFORMANCE_EVALUATIONS_BASE_PATH}/${id}`
  );
}

export function getMyPerformanceEvaluations() {
  return apiRequest<PerformanceEvaluationDto[]>(
    `${PERFORMANCE_EVALUATIONS_BASE_PATH}/my`
  );
}

export function createPerformanceEvaluation(
  request: CreatePerformanceEvaluationRequest
) {
  return apiRequest<PerformanceEvaluationDto>(PERFORMANCE_EVALUATIONS_BASE_PATH, {
    method: "POST",
    body: JSON.stringify(request),
  });
}