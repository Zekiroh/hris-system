import { apiRequest } from "../client";

export type UserOption = {
  id: string;
  fullName: string;
  email?: string;
  contactNumber?: string;
};

type Envelope<T> = { data?: T } | T;

type AvailableUserDto = {
  id: number | string;
  fullName: string;
  email?: string;
  contactNumber?: string;
};

function unwrap<T>(payload: Envelope<T>): T {
  return (payload as { data?: T }).data ?? (payload as T);
}

export async function getUserOptionsForEmployeeDropdown(): Promise<UserOption[]> {
  const json = await apiRequest<Envelope<AvailableUserDto[]>>(
    "/admin/users/available-for-employee"
  );

  const payload = unwrap(json);
  const items: AvailableUserDto[] = Array.isArray(payload) ? payload : [];

  return items
    .map((u) => ({
      id: String(u.id),
      fullName: String(u.fullName ?? "").trim(),
      email: u.email ?? "",
      contactNumber: u.contactNumber ?? "",
    }))
    .filter((u) => u.fullName.length > 0);
}