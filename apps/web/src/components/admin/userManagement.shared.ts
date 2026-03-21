import type { AdminUserDto } from '../../lib/adminUsers';

export type BackendUser = AdminUserDto;

export type UserRow = BackendUser & {
  roleLabel: string;
  statusLabel: 'Active' | 'Inactive';
  lastActiveLabel: string;
};

export type UserFormState = {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
  isActive: boolean;
};

export type PasswordResetState = {
  id: number;
  fullName: string;
  newPassword: string;
};

export type StatusConfirmState = {
  id: number;
  fullName: string;
  isActive: boolean;
};

export const ROLE_OPTIONS = [
  { id: 1, label: 'Super Admin' },
  { id: 2, label: 'Admin' },
  { id: 3, label: 'User' },
] as const;

export const DEFAULT_FORM: UserFormState = {
  id: 0,
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  password: '',
  roleId: 3,
  isActive: true,
};

export const DEFAULT_PASSWORD_RESET: PasswordResetState = {
  id: 0,
  fullName: '',
  newPassword: '',
};

export const DEFAULT_STATUS_CONFIRM: StatusConfirmState = {
  id: 0,
  fullName: '',
  isActive: true,
};

export const DEFAULT_PAGE_SIZE = 10;

export function getRoleLabel(roleId: number) {
  return ROLE_OPTIONS.find((role) => role.id === roleId)?.label ?? `Role #${roleId}`;
}

export function formatRelativeDate(value: string | null) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 60_000) return 'Just now';

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;

  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(diffMs / 86_400_000);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;

  return date.toLocaleString();
}

export function validateStrongPassword(password: string) {
  const trimmed = password.trim();

  if (!trimmed) return 'Password is required.';
  if (trimmed.length < 8) return 'Password must be at least 8 characters.';

  const strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

  if (!strongPassword.test(trimmed)) {
    return 'Password must include uppercase, lowercase, and number.';
  }

  return null;
}

function hasInvalidNameCharacters(value: string) {
  return !/^[A-Za-zÀ-ÿ' -]+$/.test(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateUserForm(form: UserFormState) {
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const email = form.email.trim();

  if (!firstName) return 'First name is required.';
  if (firstName.length < 2) return 'First name must be at least 2 characters.';
  if (hasInvalidNameCharacters(firstName)) {
    return 'First name contains invalid characters.';
  }

  if (!lastName) return 'Last name is required.';
  if (lastName.length < 2) return 'Last name must be at least 2 characters.';
  if (hasInvalidNameCharacters(lastName)) {
    return 'Last name contains invalid characters.';
  }

  if (!email) return 'Email address is required.';
  if (!isValidEmail(email)) return 'Enter a valid email address.';

  if (!ROLE_OPTIONS.some((role) => role.id === form.roleId)) {
    return 'Please select a valid role.';
  }

  return null;
}

export function buildFullName(first: string, middle: string, last: string) {
  return [first, middle, last]
    .filter((x) => x && x.trim())
    .join(' ');
}

export function mapAdminUsers(
  items: BackendUser[],
  currentUserId?: number
): UserRow[] {
  return items.map((user) => ({
    ...user,
    roleLabel: getRoleLabel(user.roleId),
    statusLabel: user.isActive ? 'Active' : 'Inactive',
    lastActiveLabel:
      user.id === currentUserId
        ? 'Just now'
        : formatRelativeDate(user.lastActive),
  }));
}

export function getStatusBadgeClass(isActive: boolean) {
  return isActive ? 'badge-success' : 'badge-neutral';
}