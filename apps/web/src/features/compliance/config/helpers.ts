import type {
  ConfigurationFormState,
  ConfigurationSection,
} from "./types";

export const getTodayInputDate = () => new Date().toISOString().slice(0, 10);

export const defaultFormValues = (
  section: ConfigurationSection,
): ConfigurationFormState => {
  const today = getTodayInputDate();

  if (section === "sss") {
    return {
      salaryFrom: "0",
      salaryTo: "",
      employeeShare: "0",
      employerShare: "0",
      effectiveFrom: today,
      effectiveTo: "",
      isActive: true,
    };
  }

  if (section === "philhealth") {
    return {
      contributionRate: "0",
      minimumContribution: "0",
      maximumContribution: "0",
      employeeSharePercent: "0",
      employerSharePercent: "0",
      effectiveFrom: today,
      effectiveTo: "",
      isActive: true,
    };
  }

  if (section === "pagibig") {
    return {
      employeeRate: "0",
      employerRate: "0",
      minimumContribution: "0",
      maximumContribution: "0",
      effectiveFrom: today,
      effectiveTo: "",
      isActive: true,
    };
  }

  return {
    compensationFrom: "0",
    compensationTo: "",
    baseTax: "0",
    excessOver: "0",
    taxRate: "0",
    effectiveFrom: today,
    effectiveTo: "",
    isActive: true,
  };
};

export const toNumber = (value: string | boolean | undefined) =>
  Number(value === "" || value === undefined ? 0 : value);

export const toOptionalNumber = (value: string | boolean | undefined) =>
  value === "" || value === undefined ? null : Number(value);

export const toOptionalDate = (value: string | boolean | undefined) =>
  value === "" || value === undefined ? null : String(value);

export const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return "No limit";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value: number) => `${value}%`;

export const formatDate = (value?: string | null) => {
  if (!value) return "Open-ended";

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};
