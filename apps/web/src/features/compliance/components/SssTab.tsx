import { getSssMonitoring } from "../../../services/api/government-compliance/governmentCompliance";
import { ContributionMonitoringTab } from "./ContributionMonitoringTab";

export const SssTab = () => (
  <ContributionMonitoringTab
    title="SSS Contributions Monitor"
    governmentNumberLabel="SSS Number"
    loadMonitoring={getSssMonitoring}
    summaryKeys={{
      employeeTotal: "sssEmployeeTotal",
      employerTotal: "sssEmployerTotal",
      contributionTotal: "sssContributionTotal",
      missingNumberCount: "missingSssNumberCount",
    }}
  />
);
