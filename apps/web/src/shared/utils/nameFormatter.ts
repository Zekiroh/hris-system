export function normalizeSuffix(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return '';

  const normalized = raw.replace(/\./g, '').trim().toLowerCase();

  switch (normalized) {
    case 'jr':
      return 'Jr.';
    case 'sr':
      return 'Sr.';
    case 'ii':
      return 'II';
    case 'iii':
      return 'III';
    case 'iv':
      return 'IV';
    default:
      return raw;
  }
}

export function getMiddleInitial(middleName?: string | null) {
  if (!middleName?.trim()) return '';
  return `${middleName.trim().charAt(0)}.`;
}

export function formatPersonName(
  user: {
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    suffix?: string | null;
    displayName?: string | null;
  },
  format: 'FN_FIRST' | 'LN_FIRST' = 'LN_FIRST'
) {
  const firstName = user.firstName?.trim() ?? '';
  const middleInitial = getMiddleInitial(user.middleName);
  const lastName = user.lastName?.trim() ?? '';
  const suffix = normalizeSuffix(user.suffix);

  const fnBase = [firstName, middleInitial, lastName].filter(Boolean).join(' ');
  const fn = [fnBase, suffix].filter(Boolean).join(', ');

  const lnBase = [lastName, [firstName, middleInitial].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
  const ln = [lnBase, suffix].filter(Boolean).join(', ');

  const result = format === 'FN_FIRST' ? fn : ln;

  return result || user.displayName?.trim() || '—';
}

export function getAvatarInitial(user: {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
}) {
  return (
    user.firstName?.trim().charAt(0) ||
    user.lastName?.trim().charAt(0) ||
    user.displayName?.trim().charAt(0) ||
    '?'
  ).toUpperCase();
}