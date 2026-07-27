type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

type TablePlaceholderRowsProps = {
  actualRowCount: number;
  columnCount: number;
};

export const TablePlaceholderRows = ({
  actualRowCount,
  columnCount,
}: TablePlaceholderRowsProps) => (
  <>
    {Array.from({ length: Math.max(0, COMPLIANCE_TABLE_PAGE_SIZE - actualRowCount) }, (_, rowIndex) => (
      <tr key={`placeholder-${rowIndex}`} aria-hidden="true">
        {Array.from({ length: columnCount }, (_, columnIndex) => (
          <td key={columnIndex} className="text-gray-300">
            --
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const TablePagination = ({
  currentPage,
  totalPages,
  loading = false,
  onPrevious,
  onNext,
}: TablePaginationProps) => (
  <div className="flex items-center justify-between border-x border-b border-gray-100 px-5 py-4">
    <button
      type="button"
      onClick={onPrevious}
      disabled={loading || currentPage <= 1}
      className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
    >
      Previous
    </button>
    <span className="text-sm text-gray-500">
      Page {currentPage} of {totalPages}
    </span>
    <button
      type="button"
      onClick={onNext}
      disabled={loading || currentPage >= totalPages}
      className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
    >
      Next
    </button>
  </div>
);
import { COMPLIANCE_TABLE_PAGE_SIZE } from "../config/pagination";
