import { getPhilHealthMonitoring } from "../../../services/api/government-compliance/governmentCompliance";
import { ContributionMonitoringTab } from "./ContributionMonitoringTab";

export const PhilHealthTab = () => (
  <ContributionMonitoringTab
    title="PhilHealth Contributions Monitor"
    governmentNumberLabel="PhilHealth Number"
    loadMonitoring={getPhilHealthMonitoring}
    summaryKeys={{
      employeeTotal: "philHealthEmployeeTotal",
      employerTotal: "philHealthEmployerTotal",
      contributionTotal: "philHealthContributionTotal",
      missingNumberCount: "missingPhilHealthNumberCount",
    }}
  />
);
