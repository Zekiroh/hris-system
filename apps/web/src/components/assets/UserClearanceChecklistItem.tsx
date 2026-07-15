import { CheckCircle, XCircle } from "lucide-react";
import type { ChecklistItem } from "./assetManagementTypes";

type UserClearanceChecklistItemProps = {
  item: ChecklistItem;
};

const UserClearanceChecklistItem = ({
  item,
}: UserClearanceChecklistItemProps) => {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
      style={{
        borderColor: item.done ? "#d1fae5" : "#fee2e2",
        background: item.done ? "#f0fdf4" : "#fff5f5",
      }}
    >
      {item.done ? (
        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      )}
      <span
        className={`text-sm font-medium ${item.done ? "text-gray-700" : "text-gray-400"}`}
      >
        {item.label}
      </span>
      <span
        className={`ml-auto text-xs font-semibold ${item.done ? "text-emerald-600" : "text-red-400"}`}
      >
        {item.done ? "Done" : "Pending"}
      </span>
    </div>
  );
};

export default UserClearanceChecklistItem;
