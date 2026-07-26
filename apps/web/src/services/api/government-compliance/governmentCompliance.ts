import { apiRequest } from "../client";

export type SssContributionBracketDto = {
  id: number;
  salaryFrom: number;
  salaryTo?: number | null;
  employeeShare: number;
  employerShare: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

export type CreateSssContributionBracketRequestDto = {
  salaryFrom: number;
  salaryTo?: number | null;
  employeeShare: number;
  employerShare: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

export type UpdateSssContributionBracketRequestDto =
  CreateSssContributionBracketRequestDto;

export type PhilHealthContributionRuleDto = {
  id: number;
  contributionRate: number;
  minimumContribution: number;
  maximumContribution: number;
  employeeSharePercent: number;
  employerSharePercent: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

export type CreatePhilHealthContributionRuleRequestDto = Omit<
  PhilHealthContributionRuleDto,
  "id"
>;

export type UpdatePhilHealthContributionRuleRequestDto =
  CreatePhilHealthContributionRuleRequestDto;

export type PagIbigContributionRuleDto = {
  id: number;
  employeeRate: number;
  employerRate: number;
  minimumContribution: number;
  maximumContribution: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

export type CreatePagIbigContributionRuleRequestDto = Omit<
  PagIbigContributionRuleDto,
  "id"
>;

export type UpdatePagIbigContributionRuleRequestDto =
  CreatePagIbigContributionRuleRequestDto;

export type WithholdingTaxBracketDto = {
  id: number;
  compensationFrom: number;
  compensationTo?: number | null;
  baseTax: number;
  excessOver: number;
  taxRate: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

export type CreateWithholdingTaxBracketRequestDto = Omit<
  WithholdingTaxBracketDto,
  "id"
>;

export type UpdateWithholdingTaxBracketRequestDto =
  CreateWithholdingTaxBracketRequestDto;

export type CompliancePeriodSummaryDto = {
  payrollPeriodId: number;
  payrollPeriodStartDate: string;
  payrollPeriodEndDate: string;
  payrollPeriodStatus: string;
  payrollRecordCount: number;
  grossPayTotal: number;
  sssEmployeeTotal: number;
  sssEmployerTotal?: number | null;
  sssContributionTotal?: number | null;
  missingSssNumberCount: number;
  philHealthEmployeeTotal: number;
  philHealthEmployerTotal?: number | null;
  philHealthContributionTotal?: number | null;
  missingPhilHealthNumberCount: number;
  pagIbigEmployeeTotal: number;
  pagIbigEmployerTotal?: number | null;
  pagIbigContributionTotal?: number | null;
  missingPagIbigNumberCount: number;
};

export type ComplianceMonitoringRowDto = {
  payrollRecordId: number;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  department: string;
  position: string;
  governmentNumber?: string | null;
  grossPay: number;
  employeeContribution: number;
  employerContribution?: number | null;
  totalContribution?: number | null;
  payrollStatus: string;
};

export type ComplianceMonitoringResponseDto = {
  summary?: CompliancePeriodSummaryDto | null;
  items: ComplianceMonitoringRowDto[];
};

export type Bir2316TrackingStatus =
  | "Pending"
  | "Prepared"
  | "Released"
  | "Acknowledged";

export type Bir2316TrackingDto = {
  id: number;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  department: string;
  position: string;
  tinNumber?: string | null;
  taxYear: number;
  annualTaxableCompensation: number;
  annualWithholdingTax: number;
  status: Bir2316TrackingStatus;
  employeeDocumentId?: string | null;
  employeeDocumentName?: string | null;
  preparedAtUtc?: string | null;
  releasedAtUtc?: string | null;
  acknowledgedAtUtc?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
};

export type UpdateBir2316TrackingRequestDto = {
  status: Bir2316TrackingStatus;
  employeeDocumentId?: string | null;
};

export type EmploymentStatusHistoryDto = {
  id: number;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  department: string;
  position: string;
  previousEmploymentStatus?: string | null;
  newEmploymentStatus: string;
  previousIsActive?: boolean | null;
  newIsActive: boolean;
  changedAtUtc: string;
  changedByUserId?: number | null;
  changedByUserName?: string | null;
  changedByUserEmail?: string | null;
};

type QueryValue = string | number | boolean | null | undefined;

function withQuery(path: string, params: Record<string, QueryValue>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    query.set(key, String(value));
  });

  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export function getSssBrackets() {
  return apiRequest<SssContributionBracketDto[]>("/government-compliance/sss");
}

export function createSssBracket(dto: CreateSssContributionBracketRequestDto) {
  return apiRequest<SssContributionBracketDto>("/government-compliance/sss", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateSssBracket(
  id: number,
  dto: UpdateSssContributionBracketRequestDto
) {
  return apiRequest<SssContributionBracketDto>(
    `/government-compliance/sss/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(dto),
    }
  );
}

export function getPhilHealthRules() {
  return apiRequest<PhilHealthContributionRuleDto[]>(
    "/government-compliance/philhealth"
  );
}

export function createPhilHealthRule(
  dto: CreatePhilHealthContributionRuleRequestDto
) {
  return apiRequest<PhilHealthContributionRuleDto>(
    "/government-compliance/philhealth",
    {
      method: "POST",
      body: JSON.stringify(dto),
    }
  );
}

export function updatePhilHealthRule(
  id: number,
  dto: UpdatePhilHealthContributionRuleRequestDto
) {
  return apiRequest<PhilHealthContributionRuleDto>(
    `/government-compliance/philhealth/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(dto),
    }
  );
}

export function getPagIbigRules() {
  return apiRequest<PagIbigContributionRuleDto[]>(
    "/government-compliance/pagibig"
  );
}

export function createPagIbigRule(dto: CreatePagIbigContributionRuleRequestDto) {
  return apiRequest<PagIbigContributionRuleDto>(
    "/government-compliance/pagibig",
    {
      method: "POST",
      body: JSON.stringify(dto),
    }
  );
}

export function updatePagIbigRule(
  id: number,
  dto: UpdatePagIbigContributionRuleRequestDto
) {
  return apiRequest<PagIbigContributionRuleDto>(
    `/government-compliance/pagibig/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(dto),
    }
  );
}

export function getWithholdingTaxBrackets() {
  return apiRequest<WithholdingTaxBracketDto[]>(
    "/government-compliance/tax"
  );
}

export function createWithholdingTaxBracket(
  dto: CreateWithholdingTaxBracketRequestDto
) {
  return apiRequest<WithholdingTaxBracketDto>(
    "/government-compliance/tax",
    {
      method: "POST",
      body: JSON.stringify(dto),
    }
  );
}

export function updateWithholdingTaxBracket(
  id: number,
  dto: UpdateWithholdingTaxBracketRequestDto
) {
  return apiRequest<WithholdingTaxBracketDto>(
    `/government-compliance/tax/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(dto),
    }
  );
}

export function getComplianceSummary(params: {
  payrollPeriodId?: number | null;
  search?: string;
}) {
  return apiRequest<CompliancePeriodSummaryDto | null>(
    withQuery("/government-compliance/summary", params)
  );
}

export function getSssMonitoring(params: {
  payrollPeriodId?: number | null;
  search?: string;
}) {
  return apiRequest<ComplianceMonitoringResponseDto>(
    withQuery("/government-compliance/sss/monitoring", params)
  );
}

export function getPhilHealthMonitoring(params: {
  payrollPeriodId?: number | null;
  search?: string;
}) {
  return apiRequest<ComplianceMonitoringResponseDto>(
    withQuery("/government-compliance/philhealth/monitoring", params)
  );
}

export function getPagIbigMonitoring(params: {
  payrollPeriodId?: number | null;
  search?: string;
}) {
  return apiRequest<ComplianceMonitoringResponseDto>(
    withQuery("/government-compliance/pagibig/monitoring", params)
  );
}

export function getBir2316Trackings(params: {
  taxYear: number;
  search?: string;
}) {
  return apiRequest<Bir2316TrackingDto[]>(
    withQuery("/government-compliance/bir-2316", params)
  );
}

export function updateBir2316Tracking(
  id: number,
  dto: UpdateBir2316TrackingRequestDto
) {
  return apiRequest<Bir2316TrackingDto>(
    `/government-compliance/bir-2316/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(dto),
    }
  );
}

export function getEmploymentStatusHistory(params: {
  employeeId?: string | null;
  search?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
}) {
  return apiRequest<EmploymentStatusHistoryDto[]>(
    withQuery("/government-compliance/employment-history", params)
  );
}
