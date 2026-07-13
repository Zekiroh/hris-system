import { useEffect, useMemo, useState } from "react";
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
import { SssTab } from "./components/SssTab";
import { PhilHealthTab } from "./components/PhilHealthTab";
import { PagIbigTab } from "./components/PagIbigTab";
import { BirTab } from "./components/BirTab";
import { HistoryTab } from "./components/HistoryTab";
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
            <SssTab
              data={sssData}
              remittanceSchedule={remittanceSchedule}
              statusBadge={statusBadge}
              onExportReports={() => setShowReportModal(true)}
            />
          )}

          {/* PhilHealth Tab */}
          {activeTab === "philhealth" && (
            <PhilHealthTab
              data={philhealthData}
              statusBadge={statusBadge}
              onExportReports={() => setShowReportModal(true)}
            />
          )}
          {/* Pag-IBIG Tab */}
          {activeTab === "pagibig" && (
            <PagIbigTab
              data={pagibigData}
              statusBadge={statusBadge}
              onExportReports={() => setShowReportModal(true)}
            />
          )}
          {/* BIR 2316 Tab */}
          {activeTab === "bir" && (
            <BirTab
              data={birData}
              statusBadge={statusBadge}
              onExport={() => setShowReportModal(true)}
              onAlphalist={() => setShowAlphalistModal(true)}
            />
          )}
          {/* Employment History Tab */}
          {activeTab === "history" && (
            <HistoryTab
              data={historyData}
              statusBadge={statusBadge}
              onGenerateReports={() => setShowHistoryReportModal(true)}
            />
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
