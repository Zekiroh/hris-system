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
import { createPortal } from 'react-dom';

import { useAuth } from '../../../app/auth/useAuth';
import { useUserManagement } from './hooks/useUserManagement';
import { ROLE_OPTIONS } from './userManagement.shared';
import { formatPersonName, getAvatarInitial } from '../../../shared/utils/nameFormatter';

import AddUserModal from './modals/AddUserModal';
import EditUserModal from './modals/EditUserModal';
import ResetPasswordModal from './modals/ResetPasswordModal';
import UserStatusModal from './modals/UserStatusModal';

const SUPER_ADMIN_ROLE_ID = 1;

type FilterOption = {
  label: string;
  value: string;
};

type FilterDropdownKey = 'role' | 'status' | 'sort' | 'nameFormat' | null;

function FilterDropdown({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <button
        type="button"
        onClick={onToggle}
        className="pro-input flex w-full items-center justify-between text-left"
      >
        <span className={selected ? 'text-gray-700' : 'text-gray-500'}>
          {selected?.label ?? 'Select'}
        </span>
        <span className="ml-3 shrink-0 text-gray-400">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[70] mt-2 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1 shadow-xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm transition ${
                option.value === value
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => onSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const UserManagement = () => {
  const { user: authUser } = useAuth();
  const isAdminCaller = authUser?.role === 'ADMIN';
  const isSuperAdminCaller = authUser?.role === 'SUPER_ADMIN';

  const {
    searchTerm,
    selectedRole,
    selectedStatus,
    sortOrder,
    nameFormat,
    isLoading,
    isSubmitting,
    bannerMessage,
    bannerType,
    highlightedUserId,
    modalError,
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
    setSortOrder,
    setNameFormat,
    setPage,
    setFormData,
    setPasswordResetData,

    clearModalError,
    dismissBanner,
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
  const [openFilterDropdown, setOpenFilterDropdown] =
    useState<FilterDropdownKey>(null);

  const filterMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
        setOpenFilterDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const roleOptions = useMemo(() => {
    if (!isAdminCaller) return ROLE_OPTIONS;
    return ROLE_OPTIONS.filter((role) => role.id !== SUPER_ADMIN_ROLE_ID);
  }, [isAdminCaller]);

  const filterRoleOptions = useMemo<FilterOption[]>(
    () => [
      { label: 'All', value: 'ALL' },
      { label: 'Super Admin', value: 'Super Admin' },
      { label: 'Admin', value: 'Admin' },
      { label: 'User', value: 'User' },
    ],
    []
  );

  const filterStatusOptions = useMemo<FilterOption[]>(
    () => [
      { label: 'All', value: 'ALL' },
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
    ],
    []
  );

  const sortOptions = useMemo<FilterOption[]>(
    () => [
      { label: 'Latest', value: 'LATEST' },
      { label: 'Oldest', value: 'OLDEST' },
    ],
    []
  );

  const nameFormatOptions = useMemo<FilterOption[]>(
    () => [
      { label: 'First Name First', value: 'FN_FIRST' },
      { label: 'Last Name First', value: 'LN_FIRST' },
    ],
    []
  );

  const hasActiveFilters =
    selectedRole !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    sortOrder !== 'LATEST' ||
    nameFormat !== 'LN_FIRST';

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

  const toggleFilterDropdown = (key: Exclude<FilterDropdownKey, null>) => {
    setOpenFilterDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative hidden w-full max-w-sm sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
              onClick={() => {
                setShowFilterMenu((prev) => !prev);
                if (showFilterMenu) {
                  setOpenFilterDropdown(null);
                }
              }}
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>

            {showFilterMenu && (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-4">
                  <FilterDropdown
                    label="Role"
                    value={selectedRole}
                    options={filterRoleOptions}
                    isOpen={openFilterDropdown === 'role'}
                    onToggle={() => toggleFilterDropdown('role')}
                    onSelect={(value) => {
                      setSelectedRole(value);
                      setOpenFilterDropdown(null);
                    }}
                  />

                  <FilterDropdown
                    label="Status"
                    value={selectedStatus}
                    options={filterStatusOptions}
                    isOpen={openFilterDropdown === 'status'}
                    onToggle={() => toggleFilterDropdown('status')}
                    onSelect={(value) => {
                      setSelectedStatus(value);
                      setOpenFilterDropdown(null);
                    }}
                  />

                  <FilterDropdown
                    label="Sort"
                    value={sortOrder}
                    options={sortOptions}
                    isOpen={openFilterDropdown === 'sort'}
                    onToggle={() => toggleFilterDropdown('sort')}
                    onSelect={(value) => {
                      setSortOrder(value as 'LATEST' | 'OLDEST');
                      setOpenFilterDropdown(null);
                    }}
                  />

                  <FilterDropdown
                    label="Name Format"
                    value={nameFormat}
                    options={nameFormatOptions}
                    isOpen={openFilterDropdown === 'nameFormat'}
                    onToggle={() => toggleFilterDropdown('nameFormat')}
                    onSelect={(value) => {
                      setNameFormat(value as 'FN_FIRST' | 'LN_FIRST');
                      setOpenFilterDropdown(null);
                    }}
                  />

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedRole('ALL');
                        setSelectedStatus('ALL');
                        setSortOrder('LATEST');
                        setNameFormat('LN_FIRST');
                        setOpenFilterDropdown(null);
                      }}
                      disabled={!hasActiveFilters}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setShowFilterMenu(false);
                        setOpenFilterDropdown(null);
                      }}
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
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            onClick={openAddModal}
            className="btn btn-primary flex items-center gap-2"
            type="button"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {bannerMessage && bannerType
        ? createPortal(
            <div
              className="fixed right-6 top-6 z-[10000]"
              role={bannerType === 'error' ? 'alert' : 'status'}
              aria-live={bannerType === 'error' ? 'assertive' : 'polite'}
            >
              <div
                className={`relative w-[340px] overflow-hidden rounded-2xl border bg-white shadow-[0_18px_40px_rgba(5,150,105,0.14)] ${
                  bannerType === 'success'
                    ? 'border-emerald-100'
                    : 'border-rose-100'
                }`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 ${
                    bannerType === 'success' ? 'bg-emerald-500/5' : 'bg-rose-500/5'
                  }`}
                />

                <div className="relative flex items-start gap-3 p-4">
                  <div
                    className={`success-toast-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      bannerType === 'success'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {bannerType === 'success' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Ban className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {bannerMessage}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rounded-md px-1 text-lg leading-none text-slate-400 transition hover:bg-white/70 hover:text-slate-600"
                    onClick={dismissBanner}
                    aria-label="Close notification"
                  >
                    ×
                  </button>
                </div>

                {bannerType === 'success' ? (
                  <div className="success-toast-progress absolute bottom-0 left-0 h-[3px] bg-emerald-500" />
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}

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
                <td colSpan={5} className="py-8 text-center italic text-gray-500">
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

                const statusActionLabel = user.isActive
                  ? 'Deactivate User'
                  : 'Activate User';

                const isProtectedSuperAdminRow =
                  isAdminCaller && user.roleId === SUPER_ADMIN_ROLE_ID;

                const canToggleStatus =
                  isSuperAdminCaller ||
                  (isAdminCaller && user.roleId !== SUPER_ADMIN_ROLE_ID);

                const fullName = formatPersonName(user, nameFormat);
                const avatarInitial = getAvatarInitial(user);
                const isHighlighted =
                  highlightedUserId !== null &&
                  String(highlightedUserId) === String(user.id);

                return (
                  <tr
                    key={user.id}
                    className="transition-all duration-500"
                    style={
                      isHighlighted
                        ? {
                            animation: 'pulseRow 3.2s ease-out',
                            boxShadow: 'inset 4px 0 0 #10b981',
                          }
                        : undefined
                    }
                  >
                    <td className="!font-medium !text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600 shadow-sm">
                          {avatarInitial}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-tight text-gray-900">
                            {fullName}
                          </p>
                          <p className="text-[10px] leading-tight text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Shield className="h-3.5 w-3.5 text-gray-400" />
                        {user.roleLabel}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.isActive ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        {user.statusLabel}
                      </span>
                    </td>

                    <td>{user.lastActiveLabel}</td>

                    <td className="text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(user)}
                          className={`rounded-md p-1.5 transition ${
                            isProtectedSuperAdminRow
                              ? 'cursor-not-allowed text-gray-300'
                              : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                          type="button"
                          title={
                            isProtectedSuperAdminRow
                              ? 'Only Super Admin can edit this user'
                              : 'Edit User'
                          }
                          aria-label="Edit User"
                          disabled={isProtectedSuperAdminRow}
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => openResetPasswordModal(user)}
                          className={`rounded-md p-1.5 transition ${
                            isProtectedSuperAdminRow
                              ? 'cursor-not-allowed text-gray-300'
                              : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                          type="button"
                          title={
                            isProtectedSuperAdminRow
                              ? 'Only Super Admin can reset this password'
                              : 'Reset Password'
                          }
                          aria-label="Reset Password"
                          disabled={isProtectedSuperAdminRow}
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => openStatusConfirmModal(user)}
                          className={`rounded-md p-1.5 transition ${
                            !canToggleStatus
                              ? 'cursor-not-allowed text-gray-300'
                              : user.isActive
                                ? 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                                : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                          type="button"
                          title={
                            !canToggleStatus
                              ? 'You do not have permission to change this user status'
                              : statusActionLabel
                          }
                          aria-label={statusActionLabel}
                          disabled={!canToggleStatus}
                        >
                          {user.isActive ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
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
                  <td colSpan={5} className="py-8 text-center italic text-gray-500">
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
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
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
        error={modalError}
        onClose={closeAddModal}
        onClearError={clearModalError}
        onChange={setFormData}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        isOpen={showEditModal}
        isSubmitting={isSubmitting}
        formData={formData}
        roleOptions={roleOptions}
        error={modalError}
        onClose={closeEditModal}
        onClearError={clearModalError}
        onChange={setFormData}
        onSubmit={handleSaveEdit}
      />

      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        isSubmitting={isSubmitting}
        data={passwordResetData}
        error={modalError}
        onClose={closeResetPasswordModal}
        onClearError={clearModalError}
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
