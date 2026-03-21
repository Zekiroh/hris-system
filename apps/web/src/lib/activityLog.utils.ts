import type { ActivityLogItemDto } from './activityLogs';
import type { AdminUserDto } from './adminUsers';

export function buildUserNameByEmail(users: AdminUserDto[]) {
  const map = new Map<string, string>();

  users.forEach((user) => {
    const email = user.email?.trim().toLowerCase();
    const fullName = user.fullName?.trim();

    if (email && fullName) {
      map.set(email, fullName);
    }
  });

  return map;
}

export function parseAsManilaDate(value: string) {
  if (!value?.trim()) return null;

  const normalizedValue =
    /z$/i.test(value) || /[+-]\d{2}:\d{2}$/.test(value)
      ? value
      : `${value}Z`;

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatDatePart(value: string) {
  const date = parseAsManilaDate(value);
  if (!date) return '—';

  return date.toLocaleDateString('en-US', {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateFilterPart(value: string) {
  const date = parseAsManilaDate(value);
  if (!date) return '—';

  return date.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Manila',
  });
}

export function formatTimePart(value: string) {
  const date = parseAsManilaDate(value);
  if (!date) return '—';

  return date.toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatActionLabel(action: string) {
  switch (action) {
    case 'LOGIN':
      return 'Logged in';
    case 'LOGIN_FAILED':
      return 'Login Failed';
    case 'LOGOUT':
      return 'Logged out';
    case 'USER_CREATE':
      return 'Created User';
    case 'USER_UPDATE':
      return 'Updated User';
    case 'USER_STATUS_UPDATE':
      return 'Updated Status';
    case 'USER_PASSWORD_RESET':
      return 'Reset Password';
    case 'PERMISSION_UPDATE':
      return 'Updated Permission';
    default:
      return action
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
}

export function getBadgeClassName(action: string) {
  switch (action) {
    case 'LOGIN':
      return 'bg-blue-50 text-blue-700 border border-blue-100';
    case 'LOGIN_FAILED':
      return 'bg-red-50 text-red-700 border border-red-100';
    case 'LOGOUT':
      return 'bg-red-50 text-red-700 border border-red-100';
    case 'USER_CREATE':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    case 'USER_UPDATE':
      return 'bg-amber-50 text-amber-700 border border-amber-100';
    case 'USER_STATUS_UPDATE':
      return 'bg-violet-50 text-violet-700 border border-violet-100';
    case 'USER_PASSWORD_RESET':
      return 'bg-rose-50 text-rose-700 border border-rose-100';
    case 'PERMISSION_UPDATE':
      return 'bg-cyan-50 text-cyan-700 border border-cyan-100';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-100';
  }
}

export function getUserLabel(
  log: ActivityLogItemDto,
  userNameByEmail: Map<string, string>
) {
  const email = log.actorEmail?.trim().toLowerCase();

  if (email) {
    const fullName = userNameByEmail.get(email);
    if (fullName) return fullName;
  }

  if (log.actorEmail?.trim()) return log.actorEmail.trim();

  return `User #${log.actorUserId}`;
}

export function prettifyDetails(
  log: ActivityLogItemDto,
  userNameByEmail: Map<string, string>
) {
  const summary = log.summary?.trim();

  if (!summary) {
    if (log.targetType && log.targetId) return `${log.targetType} #${log.targetId}`;
    if (log.targetType) return log.targetType;
    return '—';
  }

  if (log.action === 'LOGIN') {
    const actorName = getUserLabel(log, userNameByEmail);
    return `${actorName} signed in successfully`;
  }

  if (log.action === 'LOGIN_FAILED') {
    const emailMatch = summary.match(/Failed login attempt for (.+)/i);
    if (emailMatch?.[1]) {
      const rawEmail = emailMatch[1].trim().toLowerCase();
      const resolvedName = userNameByEmail.get(rawEmail) ?? emailMatch[1].trim();
      return `Failed login attempt for ${resolvedName}`;
    }

    return 'Failed login attempt';
  }

  if (log.action === 'LOGOUT') {
    const actorName = getUserLabel(log, userNameByEmail);
    return `${actorName} logged out`;
  }

  if (log.action === 'USER_PASSWORD_RESET') {
    const match = summary.match(/Reset password for user (.+)/i);
    if (match?.[1]) {
      const rawEmail = match[1].trim().toLowerCase();
      const resolvedName = userNameByEmail.get(rawEmail) ?? match[1].trim();
      return `Password was reset for ${resolvedName}`;
    }

    return 'Password was reset';
  }

  if (log.action === 'USER_STATUS_UPDATE') {
    const emailMatch = summary.match(/Set user (.+?) IsActive=(True|False)/i);
    if (emailMatch) {
      const rawEmail = emailMatch[1].trim().toLowerCase();
      const resolvedName = userNameByEmail.get(rawEmail) ?? emailMatch[1].trim();
      const isActive = emailMatch[2].toLowerCase() === 'true';

      return isActive
        ? `${resolvedName} was activated`
        : `${resolvedName} was deactivated`;
    }

    return 'User status was updated';
  }

  if (log.action === 'USER_UPDATE') {
    const emailMatch = summary.match(/Updated user (.+?) \(RoleId=(\d+)\)/i);
    if (emailMatch) {
      const rawEmail = emailMatch[1].trim().toLowerCase();
      const resolvedName = userNameByEmail.get(rawEmail) ?? emailMatch[1].trim();
      return `${resolvedName}'s account details were updated`;
    }

    return 'User account details were updated';
  }

  if (log.action === 'USER_CREATE') {
    const emailMatch = summary.match(/Created user (.+?) \(RoleId=(\d+)\)/i);
    if (emailMatch) {
      const rawEmail = emailMatch[1].trim().toLowerCase();
      const resolvedName = userNameByEmail.get(rawEmail) ?? emailMatch[1].trim();
      return `${resolvedName} account was created`;
    }

    return 'A new user account was created';
  }

  if (log.action === 'PERMISSION_UPDATE') {
    return 'Access permissions were updated';
  }

  return summary
    .replace(/RoleId=\d+/gi, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}