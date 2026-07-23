import type { AnnouncementDto } from "../../../../services/api/announcements/announcement";
import UserAnnouncementCard from "./UserAnnouncementCard";

type UserAnnouncementsTabProps = {
  announcements: AnnouncementDto[];
  loadingAnnouncements: boolean;
  announcementError: string;
  readingAnnouncementId: string | null;
  onMarkAsRead: (announcement: AnnouncementDto) => void;
};

const UserAnnouncementsTab = ({
  announcements,
  loadingAnnouncements,
  announcementError,
  readingAnnouncementId,
  onMarkAsRead,
}: UserAnnouncementsTabProps) => {
  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-gray-800">
        Company Announcements
      </h3>

      {announcementError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {announcementError}
        </div>
      )}

      {loadingAnnouncements && (
        <div className="text-center py-8 text-gray-400 text-sm italic">
          Loading company announcements...
        </div>
      )}

      {!loadingAnnouncements && announcements.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm italic">
          No company announcements yet.
        </div>
      )}

      {!loadingAnnouncements && announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.map((a) => (
            <UserAnnouncementCard
              key={a.id}
              announcement={a}
              readingAnnouncementId={readingAnnouncementId}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAnnouncementsTab;