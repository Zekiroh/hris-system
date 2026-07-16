import { useMemo, useState } from "react";
import {
  Laptop,
  ClipboardCheck,
  Star,
  Bell,
} from "lucide-react";
import {
  userAssetTabs,
} from "../../components/assets/assetManagementConfig";
import type {
  ChecklistItem,
  EvaluationRecord,
  UserAssetTab,
} from "../../components/assets/assetManagementTypes";
import AssetStatCard from "../../components/assets/AssetStatCard";
import UserAnnouncementsTab from "../../components/assets/tabs/UserAnnouncementsTab";
import UserAssetsTab from "../../components/assets/tabs/UserAssetsTab";
import UserClearanceTab from "../../components/assets/tabs/UserClearanceTab";
import UserEvaluationTab from "../../components/assets/tabs/UserEvaluationTab";
import ReportAssetIssueModal from "../../components/assets/modals/ReportAssetIssueModal";
import RequestAssetReturnModal from "../../components/assets/modals/RequestAssetReturnModal";
import { useAssetReturnRequestWorkflow } from "../../components/assets/hooks/useAssetReturnRequestWorkflow";
import { useUserAssetData } from "../../components/assets/hooks/useUserAssetData";
import { useUserAnnouncementWorkflow } from "../../components/assets/hooks/useUserAnnouncementWorkflow";
import { useUserClearanceData } from "../../components/assets/hooks/useUserClearanceData";
import { useUserPerformanceData } from "../../components/assets/hooks/useUserPerformanceData";
import type { PerformanceEvaluationDto } from "../../lib/performance";

const MAX_EVALUATION_SCORE = 5.0;

const formatEvaluationDate = (dateValue: string) => {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toISOString().slice(0, 10);
};

const toEvaluationRecord = (
  evaluation: PerformanceEvaluationDto
): EvaluationRecord => ({
  period: evaluation.reviewPeriod,
  reviewer: evaluation.reviewerName ?? "Reviewer unavailable",
  score: evaluation.score,
  maxScore: MAX_EVALUATION_SCORE,
  rating: evaluation.rating,
  remarks: evaluation.remarks ?? "No remarks provided.",
  date: formatEvaluationDate(evaluation.createdAtUtc),
});

const UserAssetManagement = () => {
  const [activeTab, setActiveTab] = useState<UserAssetTab["id"]>("assets");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportIssue, setReportIssue] = useState("");
  const [expandedEval, setExpandedEval] = useState<number | null>(null);
  const {
    myAssets,
    myReturnRequests,
    loadingAssets,
    assetError,
    insertReturnRequest,
    replaceReturnRequests,
  } = useUserAssetData();
  const {
    returnOpen,
    selectedReturnAsset,
    returnReason,
    setReturnReason,
    returnSubmitting,
    returnError,
    openReturnModal,
    closeReturnModal,
    handleSubmitReturnRequest,
  } = useAssetReturnRequestWorkflow({
    insertReturnRequest,
    replaceReturnRequests,
  });
  const {
    announcements,
    loadingAnnouncements,
    announcementError,
    readingAnnouncementId,
    handleMarkAnnouncementAsRead,
  } = useUserAnnouncementWorkflow();
  const {
    clearance,
    isLoadingClearance,
    clearanceError,
  } = useUserClearanceData();
  const {
    evaluations: performanceEvaluations,
    isLoadingEvaluations,
    evaluationError,
  } = useUserPerformanceData();

  const checklist: ChecklistItem[] = clearance
    ? [
        {
          key: "assetRequirementCompleted",
          label: "Asset requirements completed",
          done: clearance.assetRequirementCompleted,
        },
        {
          key: "departmentApproved",
          label: "Department clearance approved",
          done: clearance.departmentApproved,
        },
        {
          key: "hrApproved",
          label: "HR clearance approved",
          done: clearance.hrApproved,
        },
      ]
    : [];
  const completedCount = checklist.filter((c) => c.done).length;
  const progressPct =
    checklist.length > 0
      ? Math.round((completedCount / checklist.length) * 100)
      : 0;
  const canShowClearanceProgress =
    Boolean(clearance) && !isLoadingClearance && !clearanceError;
  const clearanceProgressValue = canShowClearanceProgress
    ? progressPct + "%"
    : "—";
  const clearanceStatus = clearance?.status ?? "";

  const evaluations = useMemo(
    () =>
      [...performanceEvaluations]
        .sort(
          (a, b) =>
            new Date(b.createdAtUtc).getTime() -
            new Date(a.createdAtUtc).getTime()
        )
        .map(toEvaluationRecord),
    [performanceEvaluations]
  );
  const latestEvaluation = evaluations[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header animate-fade-in-up">
        <h1>Asset Management</h1>
        <p>
          View your assigned assets, clearance progress, evaluations, and
          company announcements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Assigned Assets",
            value: myAssets.length,
            gradient: "linear-gradient(135deg, #059669, #10b981)",
            icon: Laptop,
          },
          {
            label: "Clearance Progress",
            value: clearanceProgressValue,
            gradient:
              progressPct === 100
                ? "linear-gradient(135deg, #059669, #10b981)"
                : "linear-gradient(135deg, #d97706, #f59e0b)",
            icon: ClipboardCheck,
          },
          {
            label: "Latest Score",
            value: isLoadingEvaluations
              ? "Loading"
              : evaluationError || !latestEvaluation
                ? "N/A"
                : latestEvaluation.score + "/5.0",
            gradient: "linear-gradient(135deg, #2563eb, #3b82f6)",
            icon: Star,
          },
          {
            label: "Unread Alerts",
            value: announcements.filter((announcement) => !announcement.isRead)
              .length,
            gradient: "linear-gradient(135deg, #dc2626, #ef4444)",
            icon: Bell,
          },
        ].map((card, i) => (
          <AssetStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            gradient={card.gradient}
            icon={card.icon}
            index={i}
          />
        ))}
      </div>

      {/* Main Card */}
      <div
        className="pro-card animate-fade-in-up"
        style={{ animationDelay: "0.4s", opacity: 0 }}
      >
        <div className="px-6 pt-4">
          <div className="pro-tabs">
            {userAssetTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pro-tab flex items-center gap-2 ${activeTab === tab.id ? "active" : ""}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* ── MY ASSETS ── */}
          {activeTab === "assets" && (
            <UserAssetsTab
              myAssets={myAssets}
              myReturnRequests={myReturnRequests}
              loadingAssets={loadingAssets}
              assetError={assetError}
              onReportIssue={() => setReportOpen(true)}
              onRequestReturn={openReturnModal}
            />
          )}

          {/* ── MY CLEARANCE ── */}
          {activeTab === "clearance" && (
            <UserClearanceTab
              checklist={checklist}
              completedCount={completedCount}
              progressPct={progressPct}
              clearanceStatus={clearanceStatus}
              loading={isLoadingClearance}
              error={clearanceError}
              hasRecord={Boolean(clearance)}
            />
          )}

          {/* ── MY EVALUATION ── */}
          {activeTab === "evaluation" && (
            <UserEvaluationTab
              evaluations={evaluations}
              loading={isLoadingEvaluations}
              error={evaluationError}
              expandedEval={expandedEval}
              onToggleEvaluation={(index) =>
                setExpandedEval(expandedEval === index ? null : index)
              }
            />
          )}

          {/* ── ANNOUNCEMENTS ── */}
          {activeTab === "announcements" && (
            <UserAnnouncementsTab
              announcements={announcements}
              loadingAnnouncements={loadingAnnouncements}
              announcementError={announcementError}
              readingAnnouncementId={readingAnnouncementId}
              onMarkAsRead={handleMarkAnnouncementAsRead}
            />
          )}
        </div>
      </div>

      {/* Report Issue Modal */}
      {reportOpen && (
        <ReportAssetIssueModal
          myAssets={myAssets}
          reportIssue={reportIssue}
          onClose={() => setReportOpen(false)}
          onSubmit={() => {
            setReportOpen(false);
            setReportIssue("");
          }}
          onIssueChange={setReportIssue}
        />
      )}

      {/* Return Request Modal */}
      {returnOpen && selectedReturnAsset && (
        <RequestAssetReturnModal
          selectedReturnAsset={selectedReturnAsset}
          returnReason={returnReason}
          returnSubmitting={returnSubmitting}
          returnError={returnError}
          onClose={closeReturnModal}
          onSubmit={handleSubmitReturnRequest}
          onReasonChange={setReturnReason}
        />
      )}
    </div>
  );
};

export default UserAssetManagement;
