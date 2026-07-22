import type { AnnouncementDto } from '../../../../lib/announcement';
import {
    announcementStatusBadge,
    priorityBadge,
} from '../../assetManagementConfig';
import { formatAnnouncementDate } from '../../assetManagementHelpers';

type AdminAnnouncementCardProps = {
    announcement: AnnouncementDto;
    publishingAnnouncementId: string | null;
    onPublishAnnouncement: (id: string) => void;
};

const AdminAnnouncementCard = ({ announcement: a, publishingAnnouncementId, onPublishAnnouncement }: AdminAnnouncementCardProps) => {
    return (
        <div className="pro-card !shadow-none border border-gray-100 !p-5 hover:border-emerald-200 transition-colors">
            <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-800">{a.title}</h4>
                <div className="flex gap-2">
                    <span className={`badge text-[10px] ${priorityBadge[a.priority] ?? 'badge-neutral'}`}><span className="badge-dot" />{a.priority}</span>
                    <span className={`badge text-[10px] ${announcementStatusBadge[a.status] ?? 'badge-neutral'}`}><span className="badge-dot" />{a.status}</span>
                </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{a.content}</p>
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400">{formatAnnouncementDate(a.publishedAtUtc ?? a.createdAtUtc)} • {a.createdByUserName ?? 'System'}</p>
                {a.status !== 'Published' && (
                    <button
                        type="button"
                        onClick={() => onPublishAnnouncement(a.id)}
                        disabled={publishingAnnouncementId === a.id}
                        className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {publishingAnnouncementId === a.id ? 'Publishing...' : 'Publish'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncementCard;
