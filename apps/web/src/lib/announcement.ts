import { apiRequest } from "./api";

export type AnnouncementStatus = "Draft" | "Published";

export type AnnouncementPriority = "Low" | "Normal" | "Important" | "Urgent";

export type AnnouncementDto = {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority | string;
  status: AnnouncementStatus | string;
  createdByUserId: string | null;
  createdByUserName: string | null;
  publishedAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  isRead: boolean;
};

export type CreateAnnouncementRequest = {
  title: string;
  content: string;
  priority: AnnouncementPriority | string;
  publishImmediately: boolean;
};

const ANNOUNCEMENTS_BASE_PATH = "/announcements";

export const getAnnouncements = async () => {
  return apiRequest<AnnouncementDto[]>(ANNOUNCEMENTS_BASE_PATH);
};

export const getPublishedAnnouncements = async () => {
  return apiRequest<AnnouncementDto[]>(`${ANNOUNCEMENTS_BASE_PATH}/published`);
};

export const getAnnouncementById = async (id: string) => {
  return apiRequest<AnnouncementDto>(`${ANNOUNCEMENTS_BASE_PATH}/${id}`);
};

export const createAnnouncement = async (
  request: CreateAnnouncementRequest
) => {
  return apiRequest<AnnouncementDto>(ANNOUNCEMENTS_BASE_PATH, {
    method: "POST",
    body: JSON.stringify(request),
  });
};

export const publishAnnouncement = async (id: string) => {
  return apiRequest<AnnouncementDto>(
    `${ANNOUNCEMENTS_BASE_PATH}/${id}/publish`,
    {
      method: "PATCH",
    }
  );
};

export const markAnnouncementAsRead = async (id: string) => {
  return apiRequest<AnnouncementDto>(`${ANNOUNCEMENTS_BASE_PATH}/${id}/read`, {
    method: "POST",
  });
};