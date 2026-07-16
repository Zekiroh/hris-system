import { useState } from "react";
import {
  Laptop,
  ClipboardCheck,
  Star,
  Bell,
} from "lucide-react";
import {
  userAssetTabs,
  userClearanceChecklist,
  userEvaluations,
} from "../../components/assets/assetManagementConfig";
import type {
  ChecklistItem,
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

  const [checklist] = useState<ChecklistItem[]>(userClearanceChecklist);

  const completedCount = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((completedCount / checklist.length) * 100);
  const clearanceStatus = progressPct === 100 ? "Completed" : "In Progress";

  const evaluations = userEvaluations;

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
            value: progressPct + "%",
            gradient:
              progressPct === 100
                ? "linear-gradient(135deg, #059669, #10b981)"
                : "linear-gradient(135deg, #d97706, #f59e0b)",
            icon: ClipboardCheck,
          },
          {
            label: "Latest Score",
            value: evaluations[0].score + "/5.0",
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
            />
          )}

          {/* ── MY EVALUATION ── */}
          {activeTab === "evaluation" && (
            <UserEvaluationTab
              evaluations={evaluations}
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
