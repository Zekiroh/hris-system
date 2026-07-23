import { apiRequest } from '../client';

export type PermissionDto = {
  id: number;
  roleId: number;
  module: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canArchive: boolean;
  updatedAt: string;
};

export type UpdatePermissionRequest = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canArchive: boolean;
};

export function getPermissions() {
  return apiRequest<PermissionDto[]>('/admin/permissions');
}

export function updatePermission(id: number, data: UpdatePermissionRequest) {
  return apiRequest<PermissionDto>(`/admin/permissions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      canView: data.canView,
      canCreate: data.canCreate,
      canUpdate: data.canUpdate,
      canArchive: data.canArchive,
    }),
  });
}