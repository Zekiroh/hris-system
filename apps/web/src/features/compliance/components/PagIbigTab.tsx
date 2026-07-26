import { getPagIbigMonitoring } from "../../../services/api/government-compliance/governmentCompliance";
import { ContributionMonitoringTab } from "./ContributionMonitoringTab";

export const PagIbigTab = () => (
  <ContributionMonitoringTab
    title="Pag-IBIG Contributions Monitor"
    governmentNumberLabel="Pag-IBIG Number"
    loadMonitoring={getPagIbigMonitoring}
    summaryKeys={{
      employeeTotal: "pagIbigEmployeeTotal",
      employerTotal: "pagIbigEmployerTotal",
      contributionTotal: "pagIbigContributionTotal",
      missingNumberCount: "missingPagIbigNumberCount",
    }}
  />
);
