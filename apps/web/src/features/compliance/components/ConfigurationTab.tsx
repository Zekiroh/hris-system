import { Ban, Pencil, Plus, RefreshCw } from "lucide-react";

import type {
  PagIbigContributionRuleDto,
  PhilHealthContributionRuleDto,
  SssContributionBracketDto,
  WithholdingTaxBracketDto,
} from "../../../services/api/government-compliance/governmentCompliance";
import { sectionLabels } from "../config/configuration";
import {
  formatCurrency,
  formatDate,
  formatPercent,
} from "../config/helpers";
import type {
  ComplianceConfigurationState,
  ConfigurationSection,
} from "../config/types";
import { useComplianceTablePagination } from "../config/pagination";
import { ConfigurationStatusBadge } from "./ConfigurationStatusBadge";
import { TablePagination, TablePlaceholderRows } from "./TablePagination";

type ConfigurationRule =
  | SssContributionBracketDto
  | PhilHealthContributionRuleDto
  | PagIbigContributionRuleDto
  | WithholdingTaxBracketDto;

type ConfigurationTabProps = {
  configuration: ComplianceConfigurationState;
  configurationSummary: { label: string; value: number }[];
  configurationError: string | null;
  configurationSuccess: string | null;
  isLoadingConfiguration: boolean;
  loadConfiguration: () => void | Promise<void>;
  openCreateConfigurationModal: (section: ConfigurationSection) => void;
  openEditConfigurationModal: (
    section: ConfigurationSection,
    rule: ConfigurationRule,
  ) => void;
  deactivateConfigurationRule: (
    section: ConfigurationSection,
    rule: ConfigurationRule,
  ) => void | Promise<void>;
};

export const ConfigurationTab = ({
  configuration,
  configurationSummary,
  configurationError,
  configurationSuccess,
  isLoadingConfiguration,
  loadConfiguration,
  openCreateConfigurationModal,
  openEditConfigurationModal,
  deactivateConfigurationRule,
}: ConfigurationTabProps) => {
  const sssPagination = useComplianceTablePagination(configuration.sss);
  const philHealthPagination = useComplianceTablePagination(
    configuration.philhealth,
  );
  const pagIbigPagination = useComplianceTablePagination(configuration.pagibig);
  const taxPagination = useComplianceTablePagination(configuration.tax);

  return (
  <div className="space-y-5">
    <div className="flex justify-between items-center gap-3 flex-wrap">
      <div>
        <h3 className="text-base font-bold text-gray-800">
          Government Compliance Configuration
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          These backend-owned rules apply to future payroll processing only. Processed payroll is not recalculated.
        </p>
      </div>
      <button
        onClick={loadConfiguration}
        disabled={isLoadingConfiguration}
        className="btn btn-secondary"
      >
        <RefreshCw
          className={`w-4 h-4 ${isLoadingConfiguration ? "animate-spin" : ""}`}
        />
        Refresh
      </button>
    </div>

    {configurationError && (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        {configurationError}
      </div>
    )}

    {configurationSuccess && (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
        {configurationSuccess}
      </div>
    )}

    {isLoadingConfiguration && (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
        Loading current government compliance configuration...
      </div>
    )}

    {!isLoadingConfiguration &&
      configuration.sss.length === 0 &&
      configuration.philhealth.length === 0 &&
      configuration.pagibig.length === 0 &&
      configuration.tax.length === 0 && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          No government compliance configuration exists yet. Use the supported Add actions below to create future-effective rules; no historical payroll will be changed.
        </div>
      )}

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {configurationSummary.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-gray-100 bg-gray-50 p-4"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {item.label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {item.value}
          </p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {(["sss", "philhealth", "pagibig", "tax"] as ConfigurationSection[]).map(
        (section) => (
          <button
            key={section}
            onClick={() => openCreateConfigurationModal(section)}
            disabled={isLoadingConfiguration}
            className="btn btn-secondary justify-center disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add {sectionLabels[section]}
          </button>
        ),
      )}
    </div>

    <div className="space-y-4">
      {!isLoadingConfiguration && configuration.sss.length === 0 && (
        <p className="text-sm text-gray-500">No SSS brackets configured.</p>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table">
          <thead>
            <tr>
              {[
                "SSS Salary From",
                "Salary To",
                "EE Share",
                "ER Share",
                "Effective From",
                "Effective To",
                "Status",
                "Action",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoadingConfiguration && (
              sssPagination.pageItems.map((rule) => (
                <tr key={rule.id}>
                  <td>{formatCurrency(rule.salaryFrom)}</td>
                  <td>{formatCurrency(rule.salaryTo)}</td>
                  <td>{formatCurrency(rule.employeeShare)}</td>
                  <td>{formatCurrency(rule.employerShare)}</td>
                  <td>{formatDate(rule.effectiveFrom)}</td>
                  <td>{formatDate(rule.effectiveTo)}</td>
                  <td>
                    <ConfigurationStatusBadge isActive={rule.isActive} />
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditConfigurationModal("sss", rule)}
                        className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"
                        title="Edit SSS bracket"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {rule.isActive && (
                        <button
                          onClick={() => deactivateConfigurationRule("sss", rule)}
                          className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"
                          title="Deactivate SSS bracket"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            <TablePlaceholderRows
              actualRowCount={
                isLoadingConfiguration ? 0 : sssPagination.pageItems.length
              }
              columnCount={8}
            />
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={sssPagination.currentPage}
        totalPages={sssPagination.totalPages}
        loading={isLoadingConfiguration}
        onPrevious={sssPagination.goToPreviousPage}
        onNext={sssPagination.goToNextPage}
      />

      {!isLoadingConfiguration && configuration.philhealth.length === 0 && (
        <p className="text-sm text-gray-500">No PhilHealth rules configured.</p>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table">
          <thead>
            <tr>
              {[
                "PhilHealth Rate",
                "Minimum",
                "Maximum",
                "EE %",
                "ER %",
                "Effective From",
                "Effective To",
                "Status",
                "Action",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoadingConfiguration && (
              philHealthPagination.pageItems.map((rule) => (
                <tr key={rule.id}>
                  <td>{formatPercent(rule.contributionRate)}</td>
                  <td>{formatCurrency(rule.minimumContribution)}</td>
                  <td>{formatCurrency(rule.maximumContribution)}</td>
                  <td>{formatPercent(rule.employeeSharePercent)}</td>
                  <td>{formatPercent(rule.employerSharePercent)}</td>
                  <td>{formatDate(rule.effectiveFrom)}</td>
                  <td>{formatDate(rule.effectiveTo)}</td>
                  <td>
                    <ConfigurationStatusBadge isActive={rule.isActive} />
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          openEditConfigurationModal("philhealth", rule)
                        }
                        className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"
                        title="Edit PhilHealth rule"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {rule.isActive && (
                        <button
                          onClick={() =>
                            deactivateConfigurationRule("philhealth", rule)
                          }
                          className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"
                          title="Deactivate PhilHealth rule"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            <TablePlaceholderRows
              actualRowCount={
                isLoadingConfiguration
                  ? 0
                  : philHealthPagination.pageItems.length
              }
              columnCount={9}
            />
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={philHealthPagination.currentPage}
        totalPages={philHealthPagination.totalPages}
        loading={isLoadingConfiguration}
        onPrevious={philHealthPagination.goToPreviousPage}
        onNext={philHealthPagination.goToNextPage}
      />

      {!isLoadingConfiguration && configuration.pagibig.length === 0 && (
        <p className="text-sm text-gray-500">No Pag-IBIG rules configured.</p>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table">
          <thead>
            <tr>
              {[
                "Pag-IBIG EE Rate",
                "ER Rate",
                "Minimum",
                "Maximum",
                "Effective From",
                "Effective To",
                "Status",
                "Action",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoadingConfiguration && (
              pagIbigPagination.pageItems.map((rule) => (
                <tr key={rule.id}>
                  <td>{formatPercent(rule.employeeRate)}</td>
                  <td>{formatPercent(rule.employerRate)}</td>
                  <td>{formatCurrency(rule.minimumContribution)}</td>
                  <td>{formatCurrency(rule.maximumContribution)}</td>
                  <td>{formatDate(rule.effectiveFrom)}</td>
                  <td>{formatDate(rule.effectiveTo)}</td>
                  <td>
                    <ConfigurationStatusBadge isActive={rule.isActive} />
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          openEditConfigurationModal("pagibig", rule)
                        }
                        className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"
                        title="Edit Pag-IBIG rule"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {rule.isActive && (
                        <button
                          onClick={() =>
                            deactivateConfigurationRule("pagibig", rule)
                          }
                          className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"
                          title="Deactivate Pag-IBIG rule"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            <TablePlaceholderRows
              actualRowCount={
                isLoadingConfiguration ? 0 : pagIbigPagination.pageItems.length
              }
              columnCount={8}
            />
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={pagIbigPagination.currentPage}
        totalPages={pagIbigPagination.totalPages}
        loading={isLoadingConfiguration}
        onPrevious={pagIbigPagination.goToPreviousPage}
        onNext={pagIbigPagination.goToNextPage}
      />

      {!isLoadingConfiguration && configuration.tax.length === 0 && (
        <p className="text-sm text-gray-500">
          No withholding tax brackets configured.
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table">
          <thead>
            <tr>
              {[
                "Tax From",
                "Tax To",
                "Base Tax",
                "Excess Over",
                "Tax Rate",
                "Effective From",
                "Effective To",
                "Status",
                "Action",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoadingConfiguration && (
              taxPagination.pageItems.map((rule) => (
                <tr key={rule.id}>
                  <td>{formatCurrency(rule.compensationFrom)}</td>
                  <td>{formatCurrency(rule.compensationTo)}</td>
                  <td>{formatCurrency(rule.baseTax)}</td>
                  <td>{formatCurrency(rule.excessOver)}</td>
                  <td>{formatPercent(rule.taxRate)}</td>
                  <td>{formatDate(rule.effectiveFrom)}</td>
                  <td>{formatDate(rule.effectiveTo)}</td>
                  <td>
                    <ConfigurationStatusBadge isActive={rule.isActive} />
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditConfigurationModal("tax", rule)}
                        className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"
                        title="Edit tax bracket"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {rule.isActive && (
                        <button
                          onClick={() => deactivateConfigurationRule("tax", rule)}
                          className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"
                          title="Deactivate tax bracket"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            <TablePlaceholderRows
              actualRowCount={
                isLoadingConfiguration ? 0 : taxPagination.pageItems.length
              }
              columnCount={9}
            />
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={taxPagination.currentPage}
        totalPages={taxPagination.totalPages}
        loading={isLoadingConfiguration}
        onPrevious={taxPagination.goToPreviousPage}
        onNext={taxPagination.goToNextPage}
      />
    </div>
  </div>
  );
};
