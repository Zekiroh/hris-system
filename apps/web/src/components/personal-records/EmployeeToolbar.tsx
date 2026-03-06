import { Search, Filter } from "lucide-react";

export function EmployeeToolbar({
  searchTerm,
  onSearchTermChange,
  filterStatus,
  onFilterStatusChange,
  loading,
  apiError,
}: {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  filterStatus: string;
  onFilterStatusChange: (v: string) => void;
  loading: boolean;
  apiError: string | null;
}) {
  return (
    <div className="pro-card p-4 animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
      <div className="flex items-center gap-3">
        <div className="pro-search flex-1 max-w-md">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, ID, or position..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="pro-select !w-auto !py-2"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading && <div className="mt-3 text-sm text-gray-400">Loading...</div>}
      {apiError && <div className="mt-3 text-sm text-red-600">{apiError}</div>}
    </div>
  );
}