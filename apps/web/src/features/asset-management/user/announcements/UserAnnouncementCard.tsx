import { BookOpen, CheckCircle } from "lucide-react";
import type { AnnouncementDto } from "../../../../services/api/announcements/announcement";
import { priorityBadge } from "../../assetManagementConfig";
import { formatAnnouncementDate } from "../../assetManagementHelpers";

type UserAnnouncementCardProps = {
  announcement: AnnouncementDto;
  readingAnnouncementId: string | null;
  onMarkAsRead: (announcement: AnnouncementDto) => void;
};

const UserAnnouncementCard = ({
  announcement,
  readingAnnouncementId,
  onMarkAsRead,
}: UserAnnouncementCardProps) => {
  return (
    <div
      className="pro-card !shadow-none border !p-5 transition-colors"
      style={{
        borderColor: announcement.isRead ? "#d1fae5" : "#e5e7eb",
        background: announcement.isRead ? "#f0fdf4" : "#fff",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          {!announcement.isRead && (
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block flex-shrink-0" />
          )}
          {announcement.title}
        </h4>
        <div className="flex gap-2 flex-shrink-0 ml-2">
          <span
            className={`badge text-[10px] ${priorityBadge[announcement.priority] ?? "badge-neutral"}`}
          >
            <span className="badge-dot" />
            {announcement.priority}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2 leading-relaxed">
        {announcement.content}
      </p>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {formatAnnouncementDate(
            announcement.publishedAtUtc ?? announcement.createdAtUtc
          )}{" "}
          • {announcement.createdByUserName ?? "System"}
        </p>
        {announcement.isRead ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <CheckCircle className="w-3.5 h-3.5" /> Read
          </span>
        ) : (
          <button
            onClick={() => onMarkAsRead(announcement)}
            disabled={readingAnnouncementId === announcement.id}
            className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BookOpen className="w-3.5 h-3.5" />{" "}
            {readingAnnouncementId === announcement.id
              ? "Marking..."
              : "Mark as Read"}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserAnnouncementCard;