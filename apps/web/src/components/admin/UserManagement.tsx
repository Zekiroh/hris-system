import {
  Search,
  UserPlus,
  Shield,
  Filter,
  Download,
  Edit,
  Ban,
  CheckCircle,
  KeyRound,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useUserManagement } from './hooks/useUserManagement';
import { ROLE_OPTIONS } from './userManagement.shared';

import AddUserModal from './modals/AddUserModal';
import EditUserModal from './modals/EditUserModal';
import ResetPasswordModal from './modals/ResetPasswordModal';
import UserStatusModal from './modals/UserStatusModal';

const SUPER_ADMIN_ROLE_ID = 1;

const UserManagement = () => {
  const { user: authUser } = useAuth();
  const isAdminCaller = authUser?.role === 'ADMIN';
  const isSuperAdminCaller = authUser?.role === 'SUPER_ADMIN';

  const {
    searchTerm,
    selectedRole,
    selectedStatus,
    isLoading,
    isSubmitting,
    bannerMessage,
    bannerType,
    showAddModal,
    showEditModal,
    showResetPasswordModal,
    showStatusConfirmModal,
    formData,
    passwordResetData,
    statusConfirmData,
    filteredUsers,
    totalPages,
    safePage,
    pagedUsers,

    setSearchTerm,
    setSelectedRole,
    setSelectedStatus,
    setPage,
    setFormData,
    setPasswordResetData,

    closeAddModal,
    closeEditModal,
    closeResetPasswordModal,
    closeStatusConfirmModal,
    openAddModal,
    openEditModal,
    openResetPasswordModal,
    openStatusConfirmModal,

    handleCreateUser,
    handleSaveEdit,
    handleToggleStatus,
    handleResetPassword,
    handleExportCsv,
  } = useUserManagement();

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleOptions = useMemo(() => {
    if (!isAdminCaller) return ROLE_OPTIONS;
    return ROLE_OPTIONS.filter((role) => role.id !== SUPER_ADMIN_ROLE_ID);
  }, [isAdminCaller]);

  const filterRoleOptions = useMemo(() => {
    return ['ALL', 'Super Admin', 'Admin', 'User'];
  }, []);

  const filterStatusOptions = useMemo(() => {
    return ['ALL', 'Active', 'Inactive'];
  }, []);

  const hasActiveFilters =
    selectedRole !== 'ALL' || selectedStatus !== 'ALL';

  const paddedUsers = useMemo(() => {
    const missing = Math.max(0, 10 - pagedUsers.length);
    return [...pagedUsers, ...Array.from({ length: missing }, () => null)];
  }, [pagedUsers]);

  const emptyPlaceholderRows = useMemo(() => {
    return Array.from({ length: 9 }, (_, index) => index);
  }, []);

  const emptyMessage = useMemo(() => {
    if (searchTerm.trim() || hasActiveFilters) {
      return 'No users match your filters.';
    }

    return 'No users available.';
  }, [searchTerm, hasActiveFilters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            autoComplete="off"
            placeholder="Search users by name, email, or role..."
            className="pro-input !pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative" ref={filterMenuRef}>
            <button
              className="btn btn-secondary flex items-center gap-2"
              type="button"
              onClick={() => setShowFilterMenu((prev) => !prev)}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Role
                    </label>
                    <select
                      className="pro-input"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      {filterRoleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role === 'ALL' ? 'All Roles' : role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </label>
                    <select
                      className="pro-input"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      {filterStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status === 'ALL' ? 'All Statuses' : status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedRole('ALL');
                        setSelectedStatus('ALL');
                      }}
                      disabled={!hasActiveFilters}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setShowFilterMenu(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="btn btn-secondary flex items-center gap-2"
            type="button"
            onClick={handleExportCsv}
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <button
            onClick={openAddModal}
            className="btn btn-primary flex items-center gap-2"
            type="button"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {bannerMessage && bannerType && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            bannerType === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {bannerMessage}
        </div>
      )}

      <div className="overflow-visible rounded-xl border border-gray-100">
        <table className="pro-table min-w-full">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 italic">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              paddedUsers.map((user, index) => {
                if (!user) {
                  return (
                    <tr key={`blank-${index}`} className="opacity-60">
                      <td className="!text-gray-300">--</td>
                      <td className="text-gray-300">--</td>
                      <td className="text-gray-300">--</td>
                      <td className="text-gray-300">--</td>
                      <td className="text-center text-gray-300">--</td>
                    </tr>
                  );
                }

                const statusActionLabel = user.isActive ? 'Deactivate User' : 'Activate User';
                const isProtectedSuperAdminRow =
                  isAdminCaller && user.roleId === SUPER_ADMIN_ROLE_ID;
                const canToggleStatus = isSuperAdminCaller;

                return (
                  <tr key={user.id}>
                    <td className="!font-medium !text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shadow-sm">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">
                            {user.fullName}
                          </p>
                          <p className="text-[10px] text-gray-500 leading-tight">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Shield className="w-3.5 h-3.5 text-gray-400" />
                        {user.roleLabel}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        <span className="badge-dot" />
                        {user.statusLabel}
                      </span>
                    </td>

                    <td>{user.lastActiveLabel}</td>

                    <td className="text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(user)}
                          className={`p-1.5 rounded-md transition ${
                            isProtectedSuperAdminRow
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          type="button"
                          title={isProtectedSuperAdminRow ? 'Only Super Admin can edit this user' : 'Edit User'}
                          aria-label="Edit User"
                          disabled={isProtectedSuperAdminRow}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openResetPasswordModal(user)}
                          className={`p-1.5 rounded-md transition ${
                            isProtectedSuperAdminRow
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          type="button"
                          title={isProtectedSuperAdminRow ? 'Only Super Admin can reset this password' : 'Reset Password'}
                          aria-label="Reset Password"
                          disabled={isProtectedSuperAdminRow}
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openStatusConfirmModal(user)}
                          className={`p-1.5 rounded-md transition ${
                            !canToggleStatus || isProtectedSuperAdminRow
                              ? 'text-gray-300 cursor-not-allowed'
                              : user.isActive
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          type="button"
                          title={
                            !canToggleStatus
                              ? 'Only Super Admin can change user status'
                              : isProtectedSuperAdminRow
                                ? 'Only Super Admin can change this user status'
                                : statusActionLabel
                          }
                          aria-label={statusActionLabel}
                          disabled={!canToggleStatus || isProtectedSuperAdminRow}
                        >
                          {user.isActive ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <>
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 italic">
                    {emptyMessage}
                  </td>
                </tr>

                {emptyPlaceholderRows.map((index) => (
                  <tr key={`empty-placeholder-${index}`} className="opacity-60">
                    <td className="!text-gray-300">--</td>
                    <td className="text-gray-300">--</td>
                    <td className="text-gray-300">--</td>
                    <td className="text-gray-300">--</td>
                    <td className="text-center text-gray-300">--</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>

        {!isLoading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button
              className="btn btn-secondary"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={safePage === 1}
            >
              Prev
            </button>

            <div className="text-sm text-gray-500">
              Page {safePage} / {totalPages}
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={safePage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AddUserModal
        isOpen={showAddModal}
        isSubmitting={isSubmitting}
        formData={formData}
        roleOptions={roleOptions}
        onClose={closeAddModal}
        onChange={setFormData}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        isOpen={showEditModal}
        isSubmitting={isSubmitting}
        formData={formData}
        roleOptions={roleOptions}
        onClose={closeEditModal}
        onChange={setFormData}
        onSubmit={handleSaveEdit}
      />

      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        isSubmitting={isSubmitting}
        data={passwordResetData}
        onClose={closeResetPasswordModal}
        onChange={setPasswordResetData}
        onSubmit={handleResetPassword}
      />

      <UserStatusModal
        isOpen={showStatusConfirmModal}
        isSubmitting={isSubmitting}
        data={statusConfirmData}
        onClose={closeStatusConfirmModal}
        onSubmit={handleToggleStatus}
      />
    </div>
  );
};

export default UserManagement;