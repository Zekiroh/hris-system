import { apiRequest } from '../client';

export type AdminUserDto = {
  id: number;
  fullName: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;
  email: string;
  roleId: number;
  isActive: boolean;
  updatedAt: string | null;
  lastActive: string | null;
};

export type GetAdminUsersQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: number;
  isActive?: boolean;
  sortBy?: 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

export type PagedAdminUsersResponse = {
  items: AdminUserDto[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type CreateAdminUserRequest = {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  email: string;
  password: string;
  roleId: number;
  isActive: boolean;
};

export type UpdateAdminUserRequest = {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  email: string;
  roleId: number;
  isActive: boolean;
};

export type UpdateAdminUserStatusRequest = {
  isActive: boolean;
};

export type ResetAdminUserPasswordRequest = {
  newPassword: string;
};

function toQueryString(query: GetAdminUsersQuery) {
  const params = new URLSearchParams();

  if (typeof query.page === 'number') params.set('page', String(query.page));
  if (typeof query.pageSize === 'number') params.set('pageSize', String(query.pageSize));
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (typeof query.roleId === 'number') params.set('roleId', String(query.roleId));
  if (typeof query.isActive === 'boolean') params.set('isActive', String(query.isActive));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function getAdminUsers(query: GetAdminUsersQuery = {}) {
  return apiRequest<PagedAdminUsersResponse | AdminUserDto[]>(
    `/admin/users${toQueryString(query)}`
  );
}

export function createAdminUser(data: CreateAdminUserRequest) {
  return apiRequest<AdminUserDto>('/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      firstName: data.firstName.trim(),
      middleName: data.middleName?.trim() || null,
      lastName: data.lastName.trim(),
      suffix: data.suffix?.trim() || null,
      email: data.email.trim(),
      password: data.password,
      roleId: data.roleId,
      isActive: data.isActive,
    }),
  });
}

export function updateAdminUser(id: number, data: UpdateAdminUserRequest) {
  return apiRequest<AdminUserDto>(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      firstName: data.firstName.trim(),
      middleName: data.middleName?.trim() || null,
      lastName: data.lastName.trim(),
      suffix: data.suffix?.trim() || null,
      email: data.email.trim(),
      roleId: data.roleId,
      isActive: data.isActive,
    }),
  });
}

export function updateAdminUserStatus(id: number, data: UpdateAdminUserStatusRequest) {
  return apiRequest<AdminUserDto>(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      isActive: data.isActive,
    }),
  });
}

export function resetAdminUserPassword(id: number, data: ResetAdminUserPasswordRequest) {
  return apiRequest<{ id: number; email: string; message: string }>(
    `/admin/users/${id}/password`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        newPassword: data.newPassword,
      }),
    }
  );
}