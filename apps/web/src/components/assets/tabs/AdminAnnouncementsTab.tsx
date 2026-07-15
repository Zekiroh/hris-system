import { Plus } from 'lucide-react';
import type { AnnouncementDto } from '../../../lib/announcement';
import AdminAnnouncementCard from '../AdminAnnouncementCard';

type AdminAnnouncementsTabProps = {
    announcements: AnnouncementDto[];
    isLoadingAnnouncements: boolean;
    announcementError: string;
    publishingAnnouncementId: string | null;
    onNewAnnouncement: () => void;
    onPublishAnnouncement: (id: string) => void;
};

const AdminAnnouncementsTab = ({
    announcements,
    isLoadingAnnouncements,
    announcementError,
    publishingAnnouncementId,
    onNewAnnouncement,
    onPublishAnnouncement,
}: AdminAnnouncementsTabProps) => {
    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-800">Announcements</h3>
                <button onClick={onNewAnnouncement} className="btn btn-primary"><Plus className="w-4 h-4" /> New Announcement</button>
            </div>
            <div className="space-y-4">
                {announcementError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {announcementError}
                    </div>
                )}
                {isLoadingAnnouncements && (
                    <div className="pro-card !shadow-none border border-gray-100 !p-5">
                        <p className="text-sm text-gray-500">Loading announcements...</p>
                    </div>
                )}
                {!isLoadingAnnouncements && announcements.map(a => (
                    <AdminAnnouncementCard
                        key={a.id}
                        announcement={a}
                        publishingAnnouncementId={publishingAnnouncementId}
                        onPublishAnnouncement={onPublishAnnouncement}
                    />
                ))}
                {!isLoadingAnnouncements && announcements.length === 0 && (
                    <div className="pro-card !shadow-none border border-gray-100 !p-5">
                        <p className="text-sm text-gray-500">No announcements yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncementsTab;
