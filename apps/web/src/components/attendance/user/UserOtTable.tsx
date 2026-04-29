type UserOvertimeRow = {
  id: number;
  date: string;
  duration: string;
  reason: string;
  status: string;
};

type Props = {
  loadingOt: boolean;
  myOvertime: UserOvertimeRow[];
};

const DEFAULT_PAGE_SIZE = 10;

const formatDate = (value: string) => {
  if (!value) return '--';

  if (value.startsWith('0001-01-01')) return '--';

  const d = new Date(value);
  if (isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
};

const formatDuration = (value: string) => {
  if (!value || value === '-' || value === '--' || value === '—') return '--';

  if (value.toLowerCase().includes('h') || value.toLowerCase().includes('m')) {
    return value;
  }

  const num = Number(value);
  if (!isFinite(num) || num <= 0) return '--';

  const minutes = Math.round(num * 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h === 0) return `m`;
  if (m === 0) return `h`;

  return `h m`;
};

const getStatusClass = (status: string) => {
  if (status === 'Approved') return 'badge-success';
  if (status === 'Rejected') return 'badge-danger';
  return 'badge-warning';
};

const createEmptyRow = (id: number): UserOvertimeRow => ({
  id,
  date: '--',
  duration: '--',
  reason: '--',
  status: '--',
});

const UserOtTable = ({ loadingOt, myOvertime }: Props) => {
  const hasData = myOvertime.length > 0;

  const rows = hasData
    ? [
        ...myOvertime,
        ...Array.from(
          { length: Math.max(0, DEFAULT_PAGE_SIZE - myOvertime.length) },
          (_, i) => createEmptyRow(-(i + 1))
        ),
      ]
    : Array.from({ length: DEFAULT_PAGE_SIZE - 1 }, (_, i) =>
        createEmptyRow(-(i + 1))
      );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100">
      <div className="overflow-x-auto">
        <table className="pro-table min-w-full">
          <thead>
            <tr>
              <th>DATE</th>
              <th>DURATION</th>
              <th>REASON</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {loadingOt ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                  Loading overtime requests...
                </td>
              </tr>
            ) : (
              <>
                {!hasData && (
                  <tr>
                    <td colSpan={4} className="text-center text-sm text-gray-500 h-[48px]">
                      No overtime requests yet.
                    </td>
                  </tr>
                )}

                {rows.map((row) => {
                  const isPlaceholder = row.id < 0;

                  return (
                    <tr key={row.id}>
                      <td className={`px-6 py-4 ${isPlaceholder ? 'text-gray-300' : ''}`}>
                        {formatDate(row.date)}
                      </td>

                      <td className={`px-6 py-4 font-mono ${isPlaceholder ? 'text-gray-300' : ''}`}>
                        {formatDuration(row.duration)}
                      </td>

                      <td className={`px-6 py-4 truncate ${isPlaceholder ? 'text-gray-300' : ''}`}>
                        {row.reason || '--'}
                      </td>

                      <td className="px-6 py-4">
                        {isPlaceholder ? (
                          <span className="text-gray-300">--</span>
                        ) : (
                          <span className={`badge ${getStatusClass(row.status)}`}>
                            <span className="badge-dot" />
                            {row.status || 'Pending'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
        <button className="btn btn-secondary" disabled>
          Prev
        </button>

        <div className="text-sm text-gray-500">Page 1 of 1</div>

        <button className="btn btn-secondary" disabled>
          Next
        </button>
      </div>
    </div>
  );
};

export default UserOtTable;