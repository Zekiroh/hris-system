import { apiRequest } from "./api";

export type UserOption = {
  id: string;
  fullName: string;
};

type Envelope<T> = { data?: T } | T;

type AdminUserListItem = {
  id: string | number;
  fullName: string;
};

function unwrap<T>(payload: Envelope<T>): T {
  return (payload as { data?: T }).data ?? (payload as T);
}

export async function getUserOptionsForEmployeeDropdown(args?: {
  path?: string;
}): Promise<UserOption[]> {
  const path = args?.path ?? "/admin/users";

  const json = await apiRequest<Envelope<AdminUserListItem[]>>(path);
  const payload = unwrap(json);

  const items: AdminUserListItem[] = Array.isArray(payload) ? payload : [];

  return items
    .map((u) => ({
      id: String(u.id),
      fullName: String(u.fullName ?? "").trim(),
    }))
    .filter((u) => u.fullName.length > 0);
}