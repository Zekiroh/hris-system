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