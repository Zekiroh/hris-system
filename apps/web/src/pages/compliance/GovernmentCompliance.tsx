import { useEffect, useMemo, useState } from "react";
import { Download, Mail } from "lucide-react";
import {
  createPagIbigRule,
  createPhilHealthRule,
  createSssBracket,
  createWithholdingTaxBracket,
  getPagIbigRules,
  getPhilHealthRules,
  getSssBrackets,
  getWithholdingTaxBrackets,
  updatePagIbigRule,
  updatePhilHealthRule,
  updateSssBracket,
  updateWithholdingTaxBracket,
} from "../../lib/governmentCompliance";
import type {
  PagIbigContributionRuleDto,
  PhilHealthContributionRuleDto,
  SssContributionBracketDto,
  WithholdingTaxBracketDto,
} from "../../lib/governmentCompliance";
import { ConfigurationTab } from "./components/ConfigurationTab";
import { ConfigurationModal } from "./components/ConfigurationModal";
import { ReportModal } from "./components/ReportModal";
import { AlphalistModal } from "./components/AlphalistModal";
import {
  emptyConfiguration,
  sectionLabels,
} from "./config/configuration";
import {
  defaultFormValues,
  toNumber,
  toOptionalDate,
  toOptionalNumber,
} from "./config/helpers";
import {
  birData,
  historyData,
  pagibigData,
  philhealthData,
  remittanceSchedule,
  sssData,
  statCards,
  statusBadge,
  tabs,
} from "./config/presentation";
import type {
  ComplianceConfigurationState,
  ConfigurationModalState,
  ConfigurationSection,
  Tab,
} from "./config/types";

const GovernmentCompliance = () => {
  const [activeTab, setActiveTab] = useState<Tab>("configuration");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAlphalistModal, setShowAlphalistModal] = useState(false);
  const [showHistoryReportModal, setShowHistoryReportModal] = useState(false);
  const [configuration, setConfiguration] =
    useState<ComplianceConfigurationState>(emptyConfiguration);
  const [isLoadingConfiguration, setIsLoadingConfiguration] = useState(false);
  const [configurationError, setConfigurationError] = useState<string | null>(
    null,
  );
  const [configurationModal, setConfigurationModal] =
    useState<ConfigurationModalState>(null);
  const [configurationSaveError, setConfigurationSaveError] = useState<
    string | null
  >(null);
  const [isSavingConfiguration, setIsSavingConfiguration] = useState(false);

  const configurationSummary = useMemo(
    () => [
      { label: "SSS Brackets", value: configuration.sss.length },
      { label: "PhilHealth Rules", value: configuration.philhealth.length },
      { label: "Pag-IBIG Rules", value: configuration.pagibig.length },
      { label: "Tax Brackets", value: configuration.tax.length },
    ],
    [configuration],
  );

  const loadConfiguration = async () => {
    setIsLoadingConfiguration(true);
    setConfigurationError(null);

    try {
      const [sss, philhealth, pagibig, tax] = await Promise.all([
        getSssBrackets(),
        getPhilHealthRules(),
        getPagIbigRules(),
        getWithholdingTaxBrackets(),
      ]);

      setConfiguration({ sss, philhealth, pagibig, tax });
    } catch (error) {
      console.error(
        "Failed to load government compliance configuration.",
        error,
      );
      setConfigurationError(
        "Unable to load government compliance configuration. Please try again.",
      );
    } finally {
      setIsLoadingConfiguration(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);


  const openCreateConfigurationModal = (section: ConfigurationSection) => {
    setConfigurationSaveError(null);
    setConfigurationModal({
      section,
      mode: "create",
      values: defaultFormValues(section),
    });
  };

  const openEditConfigurationModal = (
    section: ConfigurationSection,
    rule:
      | SssContributionBracketDto
      | PhilHealthContributionRuleDto
      | PagIbigContributionRuleDto
      | WithholdingTaxBracketDto,
  ) => {
    setConfigurationSaveError(null);

    if (section === "sss") {
      const sssRule = rule as SssContributionBracketDto;
      setConfigurationModal({
        section,
        mode: "edit",
        id: sssRule.id,
        values: {
          salaryFrom: String(sssRule.salaryFrom),
          salaryTo: sssRule.salaryTo?.toString() ?? "",
          employeeShare: String(sssRule.employeeShare),
          employerShare: String(sssRule.employerShare),
          effectiveFrom: sssRule.effectiveFrom.slice(0, 10),
          effectiveTo: sssRule.effectiveTo?.slice(0, 10) ?? "",
          isActive: sssRule.isActive,
        },
      });
      return;
    }

    if (section === "philhealth") {
      const philHealthRule = rule as PhilHealthContributionRuleDto;
      setConfigurationModal({
        section,
        mode: "edit",
        id: philHealthRule.id,
        values: {
          contributionRate: String(philHealthRule.contributionRate),
          minimumContribution: String(philHealthRule.minimumContribution),
          maximumContribution: String(philHealthRule.maximumContribution),
          employeeSharePercent: String(philHealthRule.employeeSharePercent),
          employerSharePercent: String(philHealthRule.employerSharePercent),
          effectiveFrom: philHealthRule.effectiveFrom.slice(0, 10),
          effectiveTo: philHealthRule.effectiveTo?.slice(0, 10) ?? "",
          isActive: philHealthRule.isActive,
        },
      });
      return;
    }

    if (section === "pagibig") {
      const pagIbigRule = rule as PagIbigContributionRuleDto;
      setConfigurationModal({
        section,
        mode: "edit",
        id: pagIbigRule.id,
        values: {
          employeeRate: String(pagIbigRule.employeeRate),
          employerRate: String(pagIbigRule.employerRate),
          minimumContribution: String(pagIbigRule.minimumContribution),
          maximumContribution: String(pagIbigRule.maximumContribution),
          effectiveFrom: pagIbigRule.effectiveFrom.slice(0, 10),
          effectiveTo: pagIbigRule.effectiveTo?.slice(0, 10) ?? "",
          isActive: pagIbigRule.isActive,
        },
      });
      return;
    }

    const taxRule = rule as WithholdingTaxBracketDto;
    setConfigurationModal({
      section,
      mode: "edit",
      id: taxRule.id,
      values: {
        compensationFrom: String(taxRule.compensationFrom),
        compensationTo: taxRule.compensationTo?.toString() ?? "",
        baseTax: String(taxRule.baseTax),
        excessOver: String(taxRule.excessOver),
        taxRate: String(taxRule.taxRate),
        effectiveFrom: taxRule.effectiveFrom.slice(0, 10),
        effectiveTo: taxRule.effectiveTo?.slice(0, 10) ?? "",
        isActive: taxRule.isActive,
      },
    });
  };

  const closeConfigurationModal = () => {
    if (isSavingConfiguration) return;
    setConfigurationModal(null);
    setConfigurationSaveError(null);
  };

  const updateConfigurationFormValue = (key: string, value: string | boolean) => {
    setConfigurationModal((current) =>
      current
        ? { ...current, values: { ...current.values, [key]: value } }
        : current,
    );
  };

  const saveConfigurationRule = async () => {
    if (!configurationModal) return;

    setIsSavingConfiguration(true);
    setConfigurationSaveError(null);

    try {
      const { section, mode, id, values } = configurationModal;

      if (section === "sss") {
        const dto = {
          salaryFrom: toNumber(values.salaryFrom),
          salaryTo: toOptionalNumber(values.salaryTo),
          employeeShare: toNumber(values.employeeShare),
          employerShare: toNumber(values.employerShare),
          effectiveFrom: String(values.effectiveFrom),
          effectiveTo: toOptionalDate(values.effectiveTo),
          isActive: Boolean(values.isActive),
        };
        if (mode === "edit" && id) await updateSssBracket(id, dto);
        else await createSssBracket(dto);
      }

      if (section === "philhealth") {
        const dto = {
          contributionRate: toNumber(values.contributionRate),
          minimumContribution: toNumber(values.minimumContribution),
          maximumContribution: toNumber(values.maximumContribution),
          employeeSharePercent: toNumber(values.employeeSharePercent),
          employerSharePercent: toNumber(values.employerSharePercent),
          effectiveFrom: String(values.effectiveFrom),
          effectiveTo: toOptionalDate(values.effectiveTo),
          isActive: Boolean(values.isActive),
        };
        if (mode === "edit" && id) await updatePhilHealthRule(id, dto);
        else await createPhilHealthRule(dto);
      }

      if (section === "pagibig") {
        const dto = {
          employeeRate: toNumber(values.employeeRate),
          employerRate: toNumber(values.employerRate),
          minimumContribution: toNumber(values.minimumContribution),
          maximumContribution: toNumber(values.maximumContribution),
          effectiveFrom: String(values.effectiveFrom),
          effectiveTo: toOptionalDate(values.effectiveTo),
          isActive: Boolean(values.isActive),
        };
        if (mode === "edit" && id) await updatePagIbigRule(id, dto);
        else await createPagIbigRule(dto);
      }

      if (section === "tax") {
        const dto = {
          compensationFrom: toNumber(values.compensationFrom),
          compensationTo: toOptionalNumber(values.compensationTo),
          baseTax: toNumber(values.baseTax),
          excessOver: toNumber(values.excessOver),
          taxRate: toNumber(values.taxRate),
          effectiveFrom: String(values.effectiveFrom),
          effectiveTo: toOptionalDate(values.effectiveTo),
          isActive: Boolean(values.isActive),
        };
        if (mode === "edit" && id) await updateWithholdingTaxBracket(id, dto);
        else await createWithholdingTaxBracket(dto);
      }

      setConfigurationModal(null);
      await loadConfiguration();
    } catch (error) {
      console.error("Failed to save government compliance configuration.", error);
      setConfigurationSaveError(
        "Unable to save configuration. Please verify the values and try again.",
      );
    } finally {
      setIsSavingConfiguration(false);
    }
  };

  const deactivateConfigurationRule = async (
    section: ConfigurationSection,
    rule:
      | SssContributionBracketDto
      | PhilHealthContributionRuleDto
      | PagIbigContributionRuleDto
      | WithholdingTaxBracketDto,
  ) => {
    const confirmed = window.confirm(
      `Deactivate this ${sectionLabels[section].toLowerCase()}?`,
    );
    if (!confirmed) return;

    try {
      if (section === "sss") {
        const r = rule as SssContributionBracketDto;
        await updateSssBracket(r.id, { ...r, isActive: false });
      }

      if (section === "philhealth") {
        const r = rule as PhilHealthContributionRuleDto;
        await updatePhilHealthRule(r.id, { ...r, isActive: false });
      }

      if (section === "pagibig") {
        const r = rule as PagIbigContributionRuleDto;
        await updatePagIbigRule(r.id, { ...r, isActive: false });
      }

      if (section === "tax") {
        const r = rule as WithholdingTaxBracketDto;
        await updateWithholdingTaxBracket(r.id, { ...r, isActive: false });
      }

      await loadConfiguration();
    } catch (error) {
      console.error("Failed to deactivate government compliance configuration.", error);
      setConfigurationError(
        "Unable to deactivate configuration. Please try again.",
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header animate-fade-in-up">
        <h1>Government Compliance Tracker</h1>
        <p>Monitor and manage government agency contributions and compliance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="stat-card animate-fade-in-up"
            style={{
              background: card.gradient,
              animationDelay: `${i * 0.1}s`,
              opacity: 0,
            }}
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="stat-label">{card.label}</p>
                <p className="stat-value">{card.value}</p>
              </div>
              <div className="stat-icon">
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Card */}
      <div
        className="pro-card animate-fade-in-up"
        style={{ animationDelay: "0.4s", opacity: 0 }}
      >
        <div className="px-6 pt-4">
          <div className="pro-tabs" style={{ overflowX: "auto" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pro-tab flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? "active" : ""}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Configuration Tab */}
          {activeTab === "configuration" && (
            <ConfigurationTab
              configuration={configuration}
              configurationSummary={configurationSummary}
              configurationError={configurationError}
              isLoadingConfiguration={isLoadingConfiguration}
              loadConfiguration={loadConfiguration}
              openCreateConfigurationModal={openCreateConfigurationModal}
              openEditConfigurationModal={openEditConfigurationModal}
              deactivateConfigurationRule={deactivateConfigurationRule}
            />
          )}

          {/* SSS Tab */}
          {activeTab === "sss" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-800">
                  SSS Contributions Monitor
                </h3>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="btn btn-primary"
                >
                  <Download className="w-4 h-4" /> Export Reports
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table">
                  <thead>
                    <tr>
                      {[
                        "Employee ID",
                        "Employee Name",
                        "SSS Number",
                        "Monthly",
                        "EE Share",
                        "ER Share",
                        "Status",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sssData.map((r, i) => (
                      <tr key={i}>
                        <td className="font-mono text-xs">{r.empId}</td>
                        <td className="!font-medium !text-gray-800">
                          {r.name}
                        </td>
                        <td className="font-mono text-xs">{r.sssNo}</td>
                        <td>{r.monthly}</td>
                        <td>{r.empShare}</td>
                        <td>{r.erShare}</td>
                        <td>
                          <span className={`badge ${statusBadge[r.status]}`}>
                            <span className="badge-dot" />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">
                    Monthly Summary
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      ["Total SSS Contributions", "₱245,000"],
                      ["Employee Share", "₱98,000"],
                      ["Employer Share", "₱147,000"],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-sm">
                        <span className="text-gray-500">{l}</span>
                        <span className="font-bold text-gray-900">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">
                    Remittance Schedule
                  </h4>
                  <div className="space-y-2.5">
                    {remittanceSchedule.map((r, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">{r.month}</span>
                        <span className="text-gray-400 text-xs">
                          Due: {r.dueDate}
                        </span>
                        <span
                          className={`badge text-[10px] ${statusBadge[r.status]}`}
                        >
                          <span className="badge-dot" />
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PhilHealth Tab */}
          {activeTab === "philhealth" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-800">
                  PhilHealth Contributions Monitor
                </h3>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="btn btn-primary"
                >
                  <Download className="w-4 h-4" /> Export Reports
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table">
                  <thead>
                    <tr>
                      {[
                        "Employee ID",
                        "Employee Name",
                        "PhilHealth No.",
                        "Rate",
                        "Monthly",
                        "EE Share",
                        "ER Share",
                        "Status",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {philhealthData.map((r, i) => (
                      <tr key={i}>
                        <td className="font-mono text-xs">{r.empId}</td>
                        <td className="!font-medium !text-gray-800">
                          {r.name}
                        </td>
                        <td className="font-mono text-xs">{r.phNo}</td>
                        <td>
                          <span className="badge badge-info">
                            <span className="badge-dot" />
                            {r.rate}
                          </span>
                        </td>
                        <td>{r.monthly}</td>
                        <td>{r.empShare}</td>
                        <td>{r.erShare}</td>
                        <td>
                          <span className={`badge ${statusBadge[r.status]}`}>
                            <span className="badge-dot" />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <h4 className="text-sm font-bold text-gray-700 mb-3">
                  PhilHealth Contributions Summary
                </h4>
                <div className="space-y-2.5">
                  {[
                    ["Total Contributions", "₱128,000"],
                    ["Remittance Deadline", "March 10, 2026"],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-gray-500">{l}</span>
                      <span className="font-bold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pag-IBIG Tab */}
          {activeTab === "pagibig" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-800">
                  Pag-IBIG Fund (HDMF) Monitor
                </h3>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="btn btn-primary"
                >
                  <Download className="w-4 h-4" /> Export Reports
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <div className="pro-card !shadow-none border border-gray-100 p-5">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">
                    Contribution Rates
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-gray-600">
                      Employee Rate: <strong>2%</strong>
                    </p>
                    <p className="text-gray-600">
                      Employer Rate: <strong>2%</strong>
                    </p>
                    <span className="badge badge-info mt-2 inline-flex">
                      <span className="badge-dot" />
                      Max Limit Applied
                    </span>
                  </div>
                </div>
                <div className="pro-card !shadow-none border border-gray-100 p-5">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">
                    MP2 Savings Program
                  </h4>
                  <p className="text-3xl font-bold text-emerald-600">45</p>
                  <p className="text-xs text-gray-500">Employees Enrolled</p>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table">
                  <thead>
                    <tr>
                      {[
                        "Employee",
                        "MID Number",
                        "Mandatory",
                        "MP2 Savings",
                        "Total",
                        "Status",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagibigData.map((r, i) => (
                      <tr key={i}>
                        <td className="!font-medium !text-gray-800">
                          {r.name}
                        </td>
                        <td className="font-mono text-xs">{r.midNo}</td>
                        <td>{r.mandatory}</td>
                        <td>{r.mp2}</td>
                        <td className="!font-bold">{r.total}</td>
                        <td>
                          <span className={`badge ${statusBadge[r.status]}`}>
                            <span className="badge-dot" />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BIR 2316 Tab */}
          {activeTab === "bir" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-base font-bold text-gray-800">
                  BIR Form 2316
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="btn btn-primary"
                  >
                    <Download className="w-4 h-4" /> Export
                  </button>
                  <button className="btn btn-secondary">
                    <Mail className="w-4 h-4" /> Email All
                  </button>
                  <button
                    onClick={() => setShowAlphalistModal(true)}
                    className="btn btn-secondary"
                  >
                    Alphalist
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-2">
                <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                  <p className="text-xl font-bold text-emerald-700">233/245</p>
                  <p className="text-xs text-gray-500">Signed Forms</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
                  <p className="text-xl font-bold text-orange-600">12</p>
                  <p className="text-xs text-gray-500">Pending Signature</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <p className="text-xl font-bold text-blue-600">₱1.25M</p>
                  <p className="text-xs text-gray-500">
                    Total Tax Withheld YTD
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table">
                  <thead>
                    <tr>
                      {[
                        "Employee",
                        "TIN",
                        "Taxable Income",
                        "Tax Withheld",
                        "Form Status",
                        "Action",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {birData.map((r, i) => (
                      <tr key={i}>
                        <td className="!font-medium !text-gray-800">
                          {r.name}
                        </td>
                        <td className="font-mono text-xs">{r.tin}</td>
                        <td>{r.taxableIncome}</td>
                        <td>{r.taxWithheld}</td>
                        <td>
                          <span
                            className={`badge ${statusBadge[r.formStatus]}`}
                          >
                            <span className="badge-dot" />
                            {r.formStatus}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100">
                              <Mail className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Employment History Tab */}
          {activeTab === "history" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-800">
                  Employment Status History (Government Reporting)
                </h3>
                <button
                  onClick={() => setShowHistoryReportModal(true)}
                  className="btn btn-primary"
                >
                  <Download className="w-4 h-4" /> Generate Reports
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table">
                  <thead>
                    <tr>
                      {[
                        "Date",
                        "Employee",
                        "Event",
                        "Reported To",
                        "Status",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((r, i) => (
                      <tr key={i}>
                        <td>{r.date}</td>
                        <td className="!font-medium !text-gray-800">
                          {r.employee}
                        </td>
                        <td>{r.event}</td>
                        <td>{r.reportedTo}</td>
                        <td>
                          <span className={`badge ${statusBadge[r.status]}`}>
                            <span className="badge-dot" />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReportModal
        title="Generate Reports"
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
      />



      {configurationModal && (
        <ConfigurationModal
          configurationModal={configurationModal}
          configurationSaveError={configurationSaveError}
          isSavingConfiguration={isSavingConfiguration}
          onClose={closeConfigurationModal}
          onSave={saveConfigurationRule}
          onChange={updateConfigurationFormValue}
        />
      )}

      <AlphalistModal
        show={showAlphalistModal}
        onClose={() => setShowAlphalistModal(false)}
      />

      <ReportModal
        title="Employment History Report"
        show={showHistoryReportModal}
        onClose={() => setShowHistoryReportModal(false)}
      />
    </div>
  );
};

export default GovernmentCompliance;
