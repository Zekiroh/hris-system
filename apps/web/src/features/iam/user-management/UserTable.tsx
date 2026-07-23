import { Shield, MoreVertical, Edit, Ban, CheckCircle, KeyRound } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { UserRow } from './userManagement.shared';
import { getStatusBadgeClass, DEFAULT_PAGE_SIZE } from './userManagement.shared';

type Props = {
  users: UserRow[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  activeMenu: number | null;
  onToggleMenu: (e: MouseEvent, id: number) => void;

  onEdit: (user: UserRow) => void;
  onResetPassword: (user: UserRow) => void;
  onToggleStatus: (user: UserRow) => void;
};

const UserTable = ({
  users,
  isLoading,
  page,
  totalPages,
  onPageChange,
  activeMenu,
  onToggleMenu,
  onEdit,
  onResetPassword,
  onToggleStatus,
}: Props) => {
  const paddedUsers: Array<UserRow | null> = [
    ...users,
    ...Array.from({ length: Math.max(0, DEFAULT_PAGE_SIZE - users.length) }, () => null),
  ];

  const canPrev = page > 1 && !isLoading;
  const canNext = page < totalPages && !isLoading;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <table className="pro-table min-w-full">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Active</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-500 italic">
                Loading users...
              </td>
            </tr>
          ) : users.length > 0 ? (
            paddedUsers.map((user, index) => {
              if (!user) {
                return (
                  <tr key={`blank-${index}`} className="opacity-60">
                    <td colSpan={5} className="text-gray-300 text-center">
                      --
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{user.fullName}</p>
                        <p className="text-[10px] text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-1 text-sm">
                      <Shield className="w-3 h-3 text-gray-400" />
                      {user.roleLabel}
                    </div>
                  </td>

                  <td>
                    <span className={`badge ${getStatusBadgeClass(user.isActive)}`}>
                      {user.statusLabel}
                    </span>
                  </td>

                  <td>{user.lastActiveLabel}</td>

                  <td className="text-right">
                    <div className="relative">
                      <button onClick={(e) => onToggleMenu(e, user.id)}>
                        <MoreVertical />
                      </button>

                      {activeMenu === user.id && (
                        <div className="absolute right-0 bg-white shadow-lg z-50">
                          <button onClick={() => onEdit(user)}>
                            <Edit /> Edit
                          </button>

                          <button onClick={() => onResetPassword(user)}>
                            <KeyRound /> Reset Password
                          </button>

                          <button onClick={() => onToggleStatus(user)}>
                            {user.isActive ? <Ban /> : <CheckCircle />}
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-6">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!isLoading && users.length > 0 && (
        <div className="flex justify-between px-6 py-4 border-t">
          <button disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
            Prev
          </button>

          <span>
            Page {page} / {totalPages}
          </span>

          <button disabled={!canNext} onClick={() => onPageChange(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserTable;