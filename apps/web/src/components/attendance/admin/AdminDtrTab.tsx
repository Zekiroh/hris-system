import { useState } from "react";
import { Download, Filter, Search } from "lucide-react";
import type {
  AdminDtrRecord,
  DtrFilters,
  StatusBadgeMap,
} from "../../../types/attendance";
import AdminDtrTable from "./AdminDtrTable";

type AdminDtrTabProps = {
  loadingDtr: boolean;
  dtrFilters: DtrFilters;
  setDtrFilters: React.Dispatch<React.SetStateAction<DtrFilters>>;
  setDtrPage: React.Dispatch<React.SetStateAction<number>>;
  filteredDtrRecords: AdminDtrRecord[];
  statusBadge: StatusBadgeMap;
  onEditDtr: (record: AdminDtrRecord) => void;
  onViewDtr: (record: AdminDtrRecord) => void;
  onExportCsv: () => void;
  dtrPage: number;
  totalDtrPages: number;
  recentlyEditedRowId: number | null;
};

const AdminDtrTab = ({
  loadingDtr,
  dtrFilters,
  setDtrFilters,
  setDtrPage,
  filteredDtrRecords,
  statusBadge,
  onEditDtr,
  onViewDtr,
  onExportCsv,
  dtrPage,
  totalDtrPages,
  recentlyEditedRowId,
}: AdminDtrTabProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setDtrFilters((prev) => ({
      ...prev,
      search: value,
    }));
    setDtrPage(1);
  };

  const handleStatusChange = (value: DtrFilters["status"]) => {
    setDtrFilters((prev) => ({
      ...prev,
      status: value,
    }));
    setDtrPage(1);
    setShowFilters(false);
  };

  const clearStatusFilter = () => {
    setDtrFilters((prev) => ({
      ...prev,
      status: "",
    }));
    setDtrPage(1);
    setShowFilters(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={dtrFilters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or employee ID..."
            className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>

            {showFilters && (
              <div className="absolute right-0 z-30 mt-2 w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => handleStatusChange("Present")}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Present
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("Late")}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                >
                  Late
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("Undertime")}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-600 hover:bg-orange-50 hover:text-orange-700"
                >
                  Undertime
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("Overtime")}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Overtime
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("Absent")}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  Absent
                </button>

                {dtrFilters.status && (
                  <button
                    type="button"
                    onClick={clearStatusFilter}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Export */}
          <button
            type="button"
            onClick={onExportCsv}
            className="btn border-none bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <AdminDtrTable
        loading={loadingDtr}
        records={filteredDtrRecords}
        statusBadge={statusBadge}
        onEdit={onEditDtr}
        onView={onViewDtr}
        page={dtrPage}
        totalPages={totalDtrPages}
        onPrev={() => setDtrPage((prev) => Math.max(1, prev - 1))}
        onNext={() =>
          setDtrPage((prev) => Math.min(totalDtrPages, prev + 1))
        }
        recentlyEditedRowId={recentlyEditedRowId}
      />
    </div>
  );
};

export default AdminDtrTab;