import { useState } from 'react';
import { createAnnouncement, publishAnnouncement } from '../../../../services/api/announcements/announcement';
import { initialAnnouncementForm } from '../../assetManagementConfig';

type UseAdminAnnouncementWorkflowInput = {
    loadAnnouncements: () => Promise<void>;
    closeAnnouncementModal: () => void;
};

export const useAdminAnnouncementWorkflow = ({
    loadAnnouncements,
    closeAnnouncementModal,
}: UseAdminAnnouncementWorkflowInput) => {
    const [announcementForm, setAnnouncementForm] = useState(initialAnnouncementForm);
    const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
    const [publishingAnnouncementId, setPublishingAnnouncementId] = useState<string | null>(null);

    const closeAnnouncementWorkflowModal = () => {
        if (isSavingAnnouncement) return;

        closeAnnouncementModal();
    };

    const handleSaveAnnouncement = async (publishImmediately: boolean) => {
        if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
            alert('Please fill in the announcement title and content.');
            return;
        }

        setIsSavingAnnouncement(true);

        try {
            await createAnnouncement({
                title: announcementForm.title.trim(),
                content: announcementForm.content.trim(),
                priority: announcementForm.priority,
                publishImmediately,
            });

            setAnnouncementForm(initialAnnouncementForm);
            closeAnnouncementModal();
            await loadAnnouncements();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to save announcement.');
        } finally {
            setIsSavingAnnouncement(false);
        }
    };

    const handlePublishAnnouncement = async (id: string) => {
        if (publishingAnnouncementId !== null) return;

        setPublishingAnnouncementId(id);

        try {
            await publishAnnouncement(id);
            await loadAnnouncements();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to publish announcement.');
        } finally {
            setPublishingAnnouncementId(null);
        }
    };

    return {
        announcementForm,
        setAnnouncementForm,
        isSavingAnnouncement,
        publishingAnnouncementId,
        closeAnnouncementWorkflowModal,
        handleSaveAnnouncement,
        handlePublishAnnouncement,
    };
};