import type {
  PagIbigContributionRuleDto,
  PhilHealthContributionRuleDto,
  SssContributionBracketDto,
  WithholdingTaxBracketDto,
} from "../../../lib/governmentCompliance";

export type Tab =
  | "configuration"
  | "sss"
  | "philhealth"
  | "pagibig"
  | "bir"
  | "history";

export type ComplianceConfigurationState = {
  sss: SssContributionBracketDto[];
  philhealth: PhilHealthContributionRuleDto[];
  pagibig: PagIbigContributionRuleDto[];
  tax: WithholdingTaxBracketDto[];
};

export type ConfigurationSection = "sss" | "philhealth" | "pagibig" | "tax";

export type ConfigurationFormState = Record<string, string | boolean>;

export type ConfigurationModalState = {
  section: ConfigurationSection;
  mode: "create" | "edit";
  id?: number;
  values: ConfigurationFormState;
} | null;
