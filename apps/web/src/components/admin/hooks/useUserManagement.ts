import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  updateAdminUserStatus,
  resetAdminUserPassword,
} from '../../../lib/adminUsers';
import { useAuth } from '../../../context/AuthContext';
import {
  DEFAULT_FORM,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PASSWORD_RESET,
  DEFAULT_STATUS_CONFIRM,
  mapAdminUsers,
  validateStrongPassword,
  validateUserForm,
  type PasswordResetState,
  type StatusConfirmState,
  type UserFormState,
  type UserRow,
} from '../userManagement.shared';

export const useUserManagement = () => {
  const { user: authUser } = useAuth();

  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [bannerType, setBannerType] = useState<'success' | 'error' | null>(null);
  const bannerTimeoutRef = useRef<number | null>(null);

  const [modalError, setModalError] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);

  const [formData, setFormData] = useState<UserFormState>(DEFAULT_FORM);
  const [passwordResetData, setPasswordResetData] =
    useState<PasswordResetState>(DEFAULT_PASSWORD_RESET);
  const [statusConfirmData, setStatusConfirmData] =
    useState<StatusConfirmState>(DEFAULT_STATUS_CONFIRM);

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBannerType(type);
    setBannerMessage(message);

    if (bannerTimeoutRef.current !== null) {
      window.clearTimeout(bannerTimeoutRef.current);
    }

    bannerTimeoutRef.current = window.setTimeout(() => {
      setBannerMessage(null);
      setBannerType(null);
      bannerTimeoutRef.current = null;
    }, 3500);
  };

  const clearModalError = () => setModalError(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminUsers({ page: 1, pageSize: 100 });
      const items = Array.isArray(data) ? data : data.items;
      setUsers(mapAdminUsers(items, authUser?.id));
    } catch {
      showBanner('error', 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, [authUser?.id]);

  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  useEffect(() => {
    return () => {
      if (bannerTimeoutRef.current !== null) {
        window.clearTimeout(bannerTimeoutRef.current);
      }
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    return users.filter((u) => {
      const matchesSearch =
        !searchTerm.trim() ||
        u.fullName.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.roleLabel.toLowerCase().includes(lower) ||
        u.statusLabel.toLowerCase().includes(lower);

      const matchesRole = selectedRole === 'ALL' || u.roleLabel === selectedRole;
      const matchesStatus =
        selectedStatus === 'ALL' || u.statusLabel === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchTerm, users, selectedRole, selectedStatus]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, users, selectedRole, selectedStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / DEFAULT_PAGE_SIZE)
  );

  const safePage = Math.min(Math.max(1, page), totalPages);

  const pagedUsers = useMemo(() => {
    const start = (safePage - 1) * DEFAULT_PAGE_SIZE;
    return filteredUsers.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [filteredUsers, safePage]);

  const toggleMenu = (e: MouseEvent, id: number) => {
    e.stopPropagation();
    setActiveMenu((prev) => (prev === id ? null : id));
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData(DEFAULT_FORM);
    clearModalError();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setFormData(DEFAULT_FORM);
    clearModalError();
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setPasswordResetData(DEFAULT_PASSWORD_RESET);
    clearModalError();
  };

  const closeStatusConfirmModal = () => {
    setShowStatusConfirmModal(false);
    setStatusConfirmData(DEFAULT_STATUS_CONFIRM);
  };

  const openAddModal = () => {
    setActiveMenu(null);
    setFormData(DEFAULT_FORM);
    clearModalError();
    setShowAddModal(true);
  };

  const openEditModal = (user: UserRow) => {
    const parts = user.fullName.trim().split(/\s+/);

    setFormData({
      id: user.id,
      firstName: parts[0] || '',
      middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
      lastName: parts.length > 1 ? parts[parts.length - 1] : '',
      email: user.email,
      password: '',
      roleId: user.roleId,
      isActive: user.isActive,
    });

    clearModalError();
    setShowEditModal(true);
    setActiveMenu(null);
  };

  const openResetPasswordModal = (user: UserRow) => {
    setPasswordResetData({
      id: user.id,
      fullName: user.fullName,
      newPassword: '',
    });
    clearModalError();
    setShowResetPasswordModal(true);
    setActiveMenu(null);
  };

  const openStatusConfirmModal = (user: UserRow) => {
    setStatusConfirmData({
      id: user.id,
      fullName: user.fullName,
      isActive: user.isActive,
    });
    setShowStatusConfirmModal(true);
    setActiveMenu(null);
  };

  const handleCreateUser = async () => {
    const formError = validateUserForm(formData);
    if (formError) {
      setModalError(formError);
      return;
    }

    const passwordError = validateStrongPassword(formData.password);
    if (passwordError) {
      setModalError(passwordError);
      return;
    }

    setIsSubmitting(true);
    clearModalError();

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();

      await createAdminUser({
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim() || null,
        lastName: formData.lastName.trim(),
        email: normalizedEmail,
        password: formData.password.trim(),
        roleId: formData.roleId,
        isActive: formData.isActive,
      });

      let postCreateIssue: string | null = null;

      if (!formData.isActive) {
        try {
          const refreshed = await getAdminUsers({ page: 1, pageSize: 100 });
          const refreshedItems = Array.isArray(refreshed) ? refreshed : refreshed.items;
          const createdUser = refreshedItems.find(
            (user) => user.email.toLowerCase() === normalizedEmail
          );

          if (createdUser) {
            await updateAdminUserStatus(createdUser.id, { isActive: false });
          } else {
            postCreateIssue = 'User created, but inactive status could not be applied.';
          }
        } catch {
          postCreateIssue = 'User created, but inactive status could not be applied.';
        }
      }

      closeAddModal();

      try {
        await fetchUsers();
      } catch {
        postCreateIssue =
          postCreateIssue ?? 'User created, but the table could not be refreshed.';
      }

      showBanner(
        postCreateIssue ? 'error' : 'success',
        postCreateIssue ?? 'User created successfully.'
      );
    } catch {
      setModalError('Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    const formError = validateUserForm(formData);
    if (formError) {
      setModalError(formError);
      return;
    }

    setIsSubmitting(true);
    clearModalError();

    try {
      const updated = await updateAdminUser(formData.id, {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim() || null,
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        roleId: formData.roleId,
        isActive: formData.isActive,
      });

      if (updated.isActive !== formData.isActive) {
        await updateAdminUserStatus(formData.id, {
          isActive: formData.isActive,
        });
      }

      closeEditModal();
      await fetchUsers();
      showBanner('success', 'User updated successfully.');
    } catch {
      setModalError('Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextIsActive = !statusConfirmData.isActive;

    setIsSubmitting(true);
    try {
      await updateAdminUserStatus(statusConfirmData.id, { isActive: nextIsActive });
      closeStatusConfirmModal();
      await fetchUsers();
      showBanner(
        'success',
        `User ${nextIsActive ? 'activated' : 'deactivated'} successfully.`
      );
    } catch {
      showBanner('error', 'Failed to update user status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const error = validateStrongPassword(passwordResetData.newPassword);
    if (error) {
      setModalError(error);
      return;
    }

    setIsSubmitting(true);
    clearModalError();

    try {
      await resetAdminUserPassword(passwordResetData.id, {
        newPassword: passwordResetData.newPassword.trim(),
      });

      closeResetPasswordModal();
      await fetchUsers();
      showBanner('success', 'Password reset successful.');
    } catch {
      setModalError('Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Full Name', 'Email', 'Role', 'Status', 'Last Active'];
    const rows = filteredUsers.map((user) => [
      user.fullName,
      user.email,
      user.roleLabel,
      user.statusLabel,
      user.lastActiveLabel,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    activeMenu,
    searchTerm,
    selectedRole,
    selectedStatus,
    users,
    isLoading,
    isSubmitting,
    bannerMessage,
    bannerType,
    modalError,
    page,
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

    clearModalError,
    toggleMenu,
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
  };
};