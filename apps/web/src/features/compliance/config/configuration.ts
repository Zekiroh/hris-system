import type {
  ComplianceConfigurationState,
  ConfigurationSection,
} from "./types";

export const emptyConfiguration: ComplianceConfigurationState = {
  sss: [],
  philhealth: [],
  pagibig: [],
  tax: [],
};

export const sectionLabels: Record<ConfigurationSection, string> = {
  sss: "SSS Bracket",
  philhealth: "PhilHealth Rule",
  pagibig: "Pag-IBIG Rule",
  tax: "Tax Bracket",
};

export const configurationFormFields: Record<
  ConfigurationSection,
  { key: string; label: string; type?: "number" | "date" | "checkbox" }[]
> = {
  sss: [
    { key: "salaryFrom", label: "Salary From", type: "number" },
    { key: "salaryTo", label: "Salary To", type: "number" },
    { key: "employeeShare", label: "Employee Share", type: "number" },
    { key: "employerShare", label: "Employer Share", type: "number" },
    { key: "effectiveFrom", label: "Effective From", type: "date" },
    { key: "effectiveTo", label: "Effective To", type: "date" },
    { key: "isActive", label: "Active", type: "checkbox" },
  ],
  philhealth: [
    { key: "contributionRate", label: "Contribution Rate", type: "number" },
    { key: "minimumContribution", label: "Minimum Contribution", type: "number" },
    { key: "maximumContribution", label: "Maximum Contribution", type: "number" },
    { key: "employeeSharePercent", label: "Employee Share Percent", type: "number" },
    { key: "employerSharePercent", label: "Employer Share Percent", type: "number" },
    { key: "effectiveFrom", label: "Effective From", type: "date" },
    { key: "effectiveTo", label: "Effective To", type: "date" },
    { key: "isActive", label: "Active", type: "checkbox" },
  ],
  pagibig: [
    { key: "employeeRate", label: "Employee Rate", type: "number" },
    { key: "employerRate", label: "Employer Rate", type: "number" },
    { key: "minimumContribution", label: "Minimum Contribution", type: "number" },
    { key: "maximumContribution", label: "Maximum Contribution", type: "number" },
    { key: "effectiveFrom", label: "Effective From", type: "date" },
    { key: "effectiveTo", label: "Effective To", type: "date" },
    { key: "isActive", label: "Active", type: "checkbox" },
  ],
  tax: [
    { key: "compensationFrom", label: "Compensation From", type: "number" },
    { key: "compensationTo", label: "Compensation To", type: "number" },
    { key: "baseTax", label: "Base Tax", type: "number" },
    { key: "excessOver", label: "Excess Over", type: "number" },
    { key: "taxRate", label: "Tax Rate", type: "number" },
    { key: "effectiveFrom", label: "Effective From", type: "date" },
    { key: "effectiveTo", label: "Effective To", type: "date" },
    { key: "isActive", label: "Active", type: "checkbox" },
  ],
};
