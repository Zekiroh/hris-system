import { apiRequest } from './api';

export type ActivityLogItemDto = {
  id: number;
  actorUserId: number;
  actorEmail: string;
  actorRole: string;
  action: string;
  module: string;
  targetType: string | null;
  targetId: string | null;
  summary: string | null;
  createdAt: string;
};

export type GetActivityLogsParams = {
  module?: string;
  action?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type GetActivityLogsResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  data: ActivityLogItemDto[];
};

function toQueryString(query: GetActivityLogsParams) {
  const params = new URLSearchParams();

  if (query.module?.trim()) params.set('module', query.module.trim());
  if (query.action?.trim()) params.set('action', query.action.trim());
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (typeof query.page === 'number') params.set('page', String(query.page));
  if (typeof query.pageSize === 'number') params.set('pageSize', String(query.pageSize));

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function getActivityLogs(query: GetActivityLogsParams = {}) {
  return apiRequest<GetActivityLogsResponse>(
    `/admin/activity-logs${toQueryString(query)}`
  );
}

function getAuthToken(): string | null {
  const directLocalToken = localStorage.getItem('auth.token');
  if (directLocalToken) return directLocalToken;

  const directSessionToken = sessionStorage.getItem('auth.token');
  if (directSessionToken) return directSessionToken;

  const localAuthRaw = localStorage.getItem('auth');
  if (localAuthRaw) {
    try {
      const parsed = JSON.parse(localAuthRaw) as { token?: string };
      if (parsed?.token) return parsed.token;
    } catch {
      // ignore malformed local auth payload
    }
  }

  const sessionAuthRaw = sessionStorage.getItem('auth');
  if (sessionAuthRaw) {
    try {
      const parsed = JSON.parse(sessionAuthRaw) as { token?: string };
      if (parsed?.token) return parsed.token;
    } catch {
      // ignore malformed session auth payload
    }
  }

  return null;
}

export async function exportActivityLogs(
  query: Pick<GetActivityLogsParams, 'module' | 'action' | 'search'> = {}
): Promise<Blob> {
  const params = new URLSearchParams();

  if (query.module?.trim()) params.set('module', query.module.trim());
  if (query.action?.trim()) params.set('action', query.action.trim());
  if (query.search?.trim()) params.set('search', query.search.trim());

  const qs = params.toString();
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
  const token = getAuthToken();

  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(
    `${baseUrl}/admin/activity-logs/export${qs ? `?${qs}` : ''}`,
    {
      method: 'GET',
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed (${response.status})${text ? `: ${text}` : ''}`);
  }

  return await response.blob();
}