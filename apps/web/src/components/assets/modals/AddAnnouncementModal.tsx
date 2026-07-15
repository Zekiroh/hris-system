import { X } from 'lucide-react';
import type { AnnouncementFormState } from '../assetManagementTypes';

type AddAnnouncementModalProps = {
    announcementForm: AnnouncementFormState;
    isSavingAnnouncement: boolean;
    onClose: () => void;
    onSaveDraft: () => void;
    onPublish: () => void;
    onFormChange: (field: keyof AnnouncementFormState, value: string) => void;
};

const AddAnnouncementModal = ({
    announcementForm,
    isSavingAnnouncement,
    onClose,
    onSaveDraft,
    onPublish,
    onFormChange,
}: AddAnnouncementModalProps) => {
    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                <div className="pro-modal-header"><h3>New Announcement</h3><button onClick={onClose} disabled={isSavingAnnouncement} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="pro-modal-body space-y-4">
                    <div><label className="pro-label">Title</label><input type="text" placeholder="Announcement title" className="pro-input" value={announcementForm.title} onChange={e => onFormChange('title', e.target.value)} disabled={isSavingAnnouncement} /></div>
                    <div><label className="pro-label">Priority</label><select className="pro-select" value={announcementForm.priority} onChange={e => onFormChange('priority', e.target.value)} disabled={isSavingAnnouncement}><option>Normal</option><option>Important</option><option>Urgent</option></select></div>
                    <div><label className="pro-label">Content</label><textarea rows={4} placeholder="Write your announcement..." className="pro-input resize-none" value={announcementForm.content} onChange={e => onFormChange('content', e.target.value)} disabled={isSavingAnnouncement} /></div>
                </div>
                <div className="pro-modal-footer"><button type="button" onClick={onSaveDraft} disabled={isSavingAnnouncement} className="btn btn-secondary">{isSavingAnnouncement ? 'Saving...' : 'Save Draft'}</button><button type="button" onClick={onPublish} disabled={isSavingAnnouncement} className="btn btn-primary">{isSavingAnnouncement ? 'Publishing...' : 'Publish'}</button></div>
            </div>
        </div>
    );
};

export default AddAnnouncementModal;
