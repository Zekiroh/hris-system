import type { ActivityLogItemDto } from '../../services/api/activity-logs/activityLogs';
import type { AdminUserDto } from '../../services/api/iam/adminUsers';

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
  if (!date) return '�';

  return date.toLocaleDateString('en-US', {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateFilterPart(value: string) {
  const date = parseAsManilaDate(value);
  if (!date) return '�';

  return date.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Manila',
  });
}

export function formatTimePart(value: string) {
  const date = parseAsManilaDate(value);
  if (!date) return '�';

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

    case 'EMPLOYEE_CREATED':
      return 'Created Employee';

    case 'EMPLOYEE_UPDATED':
      return 'Updated Employee';

    case 'EMPLOYEE_STATUS_UPDATED':
      return 'Updated Status';

    case 'EMPLOYEE_DOCUMENT_UPLOADED':
    case 'DOCUMENT_UPLOADED':
      return 'Document Uploaded';

    case 'EMPLOYEE_DOCUMENT_DOWNLOADED':
    case 'DOCUMENT_DOWNLOADED':
      return 'Document Downloaded';

    case 'EMPLOYEE_DOCUMENT_DELETED':
    case 'DOCUMENT_DELETED':
      return 'Document Deleted';
      
    case 'PASSWORD_CHANGED':
      return 'Changed Password';

    case 'ATTENDANCE_TIME_IN':
      return 'Time In';

    case 'ATTENDANCE_TIME_OUT':
      return 'Time Out';

    case 'SHIFT_ASSIGNED':
      return 'Shift Assigned';

    case 'SHIFT_UNASSIGNED':
      return 'Shift Unassigned';

    case 'SHIFT_REASSIGNED':
      return 'Shift Reassigned';

    case 'OVERTIME_REQUEST_SUBMITTED':
      return 'OT Requested';

    case 'OVERTIME_ASSIGNED':
      return 'OT Assigned';

    case 'OVERTIME_REQUEST_APPROVED':
      return 'OT Approved';

    case 'OVERTIME_REQUEST_REJECTED':
      return 'OT Rejected';

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

    case 'EMPLOYEE_CREATED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';

    case 'EMPLOYEE_UPDATED':
      return 'bg-amber-50 text-amber-700 border border-amber-100';

    case 'EMPLOYEE_STATUS_UPDATED':
      return 'bg-violet-50 text-violet-700 border border-violet-100';

    case 'EMPLOYEE_DOCUMENT_UPLOADED':
    case 'DOCUMENT_UPLOADED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';

    case 'EMPLOYEE_DOCUMENT_DOWNLOADED':
    case 'DOCUMENT_DOWNLOADED':
      return 'bg-blue-50 text-blue-700 border border-blue-100';

    case 'EMPLOYEE_DOCUMENT_DELETED':
    case 'DOCUMENT_DELETED':
      return 'bg-red-50 text-red-700 border border-red-100';

    case 'ATTENDANCE_TIME_IN':
      return 'bg-blue-50 text-blue-700 border border-blue-100';

    case 'ATTENDANCE_TIME_OUT':
      return 'bg-red-50 text-red-700 border border-red-100';

    case 'SHIFT_ASSIGNED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';

    case 'SHIFT_UNASSIGNED':
      return 'bg-orange-50 text-orange-700 border border-orange-100';

    case 'SHIFT_REASSIGNED':
      return 'bg-violet-50 text-violet-700 border border-violet-100';

    case 'OVERTIME_REQUEST_SUBMITTED':
      return 'bg-blue-50 text-blue-700 border border-blue-100';

    case 'OVERTIME_ASSIGNED':
      return 'bg-cyan-50 text-cyan-700 border border-cyan-100';

    case 'OVERTIME_REQUEST_APPROVED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';

    case 'OVERTIME_REQUEST_REJECTED':
      return 'bg-red-50 text-red-700 border border-red-100';
    case 'PASSWORD_CHANGED':
      return 'bg-rose-50 text-rose-700 border border-rose-100';
      
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
    if (log.targetType && log.targetId) {
      return `${log.targetType} #${log.targetId}`;
    }

    if (log.targetType) {
      return log.targetType;
    }

    return '�';
  }

  if (log.action === 'LOGIN') {
    const actorName = getUserLabel(log, userNameByEmail);
    return `${actorName} signed in successfully`;
  }

  if (log.action === 'LOGIN_FAILED') {
    const emailMatch = summary.match(/Failed login attempt for (.+)/i);

    if (emailMatch?.[1]) {
      const rawEmail = emailMatch[1].trim().toLowerCase();
      const resolvedName =
        userNameByEmail.get(rawEmail) ?? emailMatch[1].trim();

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
      const resolvedName =
        userNameByEmail.get(rawEmail) ?? match[1].trim();

      return `Password was reset for ${resolvedName}`;
    }

    return 'Password was reset';
  }

  if (log.action === 'USER_STATUS_UPDATE') {
    const emailMatch = summary.match(
      /Set user (.+?) IsActive=(True|False)/i
    );

    if (emailMatch) {
      const rawEmail = emailMatch[1].trim().toLowerCase();
      const resolvedName =
        userNameByEmail.get(rawEmail) ?? emailMatch[1].trim();

      const isActive = emailMatch[2].toLowerCase() === 'true';

      return isActive
        ? `${resolvedName} was activated`
        : `${resolvedName} was deactivated`;
    }

    return 'User status was updated';
  }

  if (log.action === 'USER_UPDATE') {
    const emailMatch = summary.match(
      /Updated user (.+?) \(RoleId=(\d+)\)/i
    );

    if (emailMatch) {
      const rawEmail = emailMatch[1].trim().toLowerCase();
      const resolvedName =
        userNameByEmail.get(rawEmail) ?? emailMatch[1].trim();

      return `${resolvedName}'s account details were updated`;
    }

    return 'User account details were updated';
  }

  if (log.action === 'USER_CREATE') {
    const emailMatch = summary.match(
      /Created user (.+?) \(RoleId=(\d+)\)/i
    );

    if (emailMatch) {
      const rawEmail = emailMatch[1].trim().toLowerCase();
      const resolvedName =
        userNameByEmail.get(rawEmail) ?? emailMatch[1].trim();

      return `${resolvedName} account was created`;
    }

    return 'A new user account was created';
  }

  if (log.action === 'EMPLOYEE_CREATED') {
    const match = summary.match(/Created employee (.+?) \((.+?)\)/i);

    if (match) {
      const employeeNumber = match[1]?.trim();
      const fullName = match[2]?.trim();

      if (employeeNumber && fullName) {
        return `${fullName} was onboarded (${employeeNumber})`;
      }

      if (employeeNumber) {
        return `Employee ${employeeNumber} was created`;
      }
    }

    return 'A new employee was onboarded';
  }

  if (log.action === 'EMPLOYEE_UPDATED') {
    const match = summary.match(/Updated employee (.+?) \((.+?)\)/i);

    if (match) {
      const employeeNumber = match[1]?.trim();
      const fullName = match[2]?.trim();

      if (employeeNumber && fullName) {
        return `Employee record for ${fullName} was updated (${employeeNumber})`;
      }

      if (employeeNumber) {
        return `Employee ${employeeNumber} was updated`;
      }
    }

    return 'An employee record was updated';
  }

  if (log.action === 'EMPLOYEE_STATUS_UPDATED') {
    const match = summary.match(
      /Updated employee status (.+?) \((.+?)\) -> (Active|Inactive)/i
    );

    if (match) {
      const employeeNumber = match[1]?.trim();
      const fullName = match[2]?.trim();
      const status = match[3]?.trim();

      if (employeeNumber && fullName && status) {
        return `${fullName} was marked ${status.toLowerCase()} (${employeeNumber})`;
      }

      if (employeeNumber && status) {
        return `Employee ${employeeNumber} was marked ${status.toLowerCase()}`;
      }
    }

    return 'Employee status was updated';
  }

  if (log.action === 'EMPLOYEE_DOCUMENT_UPLOADED' || log.action === 'DOCUMENT_UPLOADED') {
    return summary
      .replace(/^Uploaded document\s+/i, '')
      .replace(/\s+for employee\s+/i, ' uploaded for ')
      .trim();
  }

  if (log.action === 'EMPLOYEE_DOCUMENT_DOWNLOADED' || log.action === 'DOCUMENT_DOWNLOADED') {
    return summary
      .replace(/^Downloaded document\s+/i, '')
      .replace(/\s+for employee\s+/i, ' downloaded for ')
      .trim();
  }

  if (log.action === 'EMPLOYEE_DOCUMENT_DELETED' || log.action === 'DOCUMENT_DELETED') {
    return summary
      .replace(/^Deleted document\s+/i, '')
      .replace(/\s+for employee\s+/i, ' deleted from ')
      .trim();
  }

  if (log.action === 'ATTENDANCE_TIME_IN') {
    return summary
      .replace(/^Employee\s+/i, '')
      .replace(/\s+timed in at\s+/i, ' timed in at ')
      .trim();
  }

  if (log.action === 'ATTENDANCE_TIME_OUT') {
    return summary
      .replace(/^Employee\s+/i, '')
      .replace(/\s+timed out at\s+/i, ' timed out at ')
      .trim();
  }

  if (log.action === 'SHIFT_ASSIGNED') {
    return summary
      .replace(/^Assigned shift\s+/i, '')
      .replace(/\s+to employee\s+/i, ' was assigned to ')
      .trim();
  }

  if (log.action === 'SHIFT_UNASSIGNED') {
    return summary
      .replace(/^Unassigned shift\s+/i, '')
      .replace(/\s+from employee\s+/i, ' was unassigned from ')
      .trim();
  }

  if (log.action === 'SHIFT_REASSIGNED') {
    return summary
      .replace(/^Reassigned shift\s+/i, '')
      .replace(/\s+to employee\s+/i, ' was reassigned to ')
      .trim();
  }

  if (log.action === 'OVERTIME_REQUEST_SUBMITTED') {
    return summary
      .replace(/^Employee\s+/i, '')
      .replace(/\s+submitted overtime request\s+/i, ' submitted overtime request ')
      .trim();
  }

  if (log.action === 'OVERTIME_ASSIGNED') {
    return summary
      .replace(/^Employee\s+/i, '')
      .replace(/\s+was assigned overtime\s+/i, ' was assigned overtime ')
      .trim();
  }

  if (log.action === 'OVERTIME_REQUEST_APPROVED') {
    return summary
      .replace(/^Employee\s+/i, '')
      .replace(/\s+overtime request was approved/i, ' overtime request was approved')
      .trim();
  }

  if (log.action === 'OVERTIME_REQUEST_REJECTED') {
    return summary
      .replace(/^Employee\s+/i, '')
      .replace(/\s+overtime request was rejected/i, ' overtime request was rejected')
      .trim();
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
