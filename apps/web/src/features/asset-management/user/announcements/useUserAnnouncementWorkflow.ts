import { useCallback, useEffect, useState } from 'react';
import {
    getPublishedAnnouncements,
    markAnnouncementAsRead,
} from '../../../../lib/announcement';
import type { AnnouncementDto } from '../../../../lib/announcement';

export const useUserAnnouncementWorkflow = () => {
    const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [announcementError, setAnnouncementError] = useState('');
    const [readingAnnouncementId, setReadingAnnouncementId] = useState<
        string | null
    >(null);

    const loadAnnouncements = useCallback(async () => {
        setLoadingAnnouncements(true);
        setAnnouncementError('');

        try {
            const data = await getPublishedAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            setAnnouncementError(
                error instanceof Error
                    ? error.message
                    : 'Unable to load company announcements.'
            );
        } finally {
            setLoadingAnnouncements(false);
        }
    }, []);

    useEffect(() => {
        void loadAnnouncements();
    }, [loadAnnouncements]);

    const handleMarkAnnouncementAsRead = useCallback(
        async (announcement: AnnouncementDto) => {
            if (announcement.isRead) return;

            setReadingAnnouncementId(announcement.id);

            try {
                const updatedAnnouncement = await markAnnouncementAsRead(
                    announcement.id
                );

                setAnnouncements((current) =>
                    current.map((item) =>
                        item.id === updatedAnnouncement.id
                            ? updatedAnnouncement
                            : item
                    )
                );
            } catch (error) {
                setAnnouncementError(
                    error instanceof Error
                        ? error.message
                        : 'Unable to mark announcement as read.'
                );
            } finally {
                setReadingAnnouncementId(null);
            }
        },
        []
    );

    return {
        announcements,
        loadingAnnouncements,
        announcementError,
        readingAnnouncementId,
        loadAnnouncements,
        handleMarkAnnouncementAsRead,
    };
};
