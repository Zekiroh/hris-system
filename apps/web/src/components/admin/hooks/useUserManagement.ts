import { useEffect, useMemo, useState, type MouseEvent } from 'react';
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

    window.setTimeout(() => {
      setBannerMessage(null);
      setBannerType(null);
    }, 3500);
  };

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
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setFormData(DEFAULT_FORM);
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setPasswordResetData(DEFAULT_PASSWORD_RESET);
  };

  const closeStatusConfirmModal = () => {
    setShowStatusConfirmModal(false);
    setStatusConfirmData(DEFAULT_STATUS_CONFIRM);
  };

  const openAddModal = () => {
    setActiveMenu(null);
    setFormData(DEFAULT_FORM);
    setShowAddModal(true);
  };

  const openEditModal = (user: UserRow) => {
    setFormData({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      password: '',
      roleId: user.roleId,
      isActive: user.isActive,
    });
    setShowEditModal(true);
    setActiveMenu(null);
  };

  const openResetPasswordModal = (user: UserRow) => {
    setPasswordResetData({
      id: user.id,
      fullName: user.fullName,
      newPassword: '',
    });
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
    if (!formData.fullName.trim() || !formData.email.trim()) {
      showBanner('error', 'Full name and email are required.');
      return;
    }

    const error = validateStrongPassword(formData.password);
    if (error) {
      showBanner('error', error);
      return;
    }

    setIsSubmitting(true);
    try {
      await createAdminUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        roleId: formData.roleId,
      });

      if (!formData.isActive) {
        const refreshed = await getAdminUsers({ page: 1, pageSize: 100 });
        const refreshedItems = Array.isArray(refreshed) ? refreshed : refreshed.items;
        const createdUser = refreshedItems.find(
          (user) => user.email.toLowerCase() === formData.email.trim().toLowerCase()
        );

        if (createdUser) {
          await updateAdminUserStatus(createdUser.id, { isActive: false });
        }
      }

      closeAddModal();
      await fetchUsers();
      showBanner('success', 'User created successfully.');
    } catch {
      showBanner('error', 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      showBanner('error', 'Full name and email are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateAdminUser(formData.id, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        roleId: formData.roleId,
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
      showBanner('error', 'Failed to update user.');
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
      showBanner('error', error);
      return;
    }

    setIsSubmitting(true);
    try {
      await resetAdminUserPassword(passwordResetData.id, {
        newPassword: passwordResetData.newPassword.trim(),
      });

      closeResetPasswordModal();
      await fetchUsers();
      showBanner('success', 'Password reset successful.');
    } catch {
      showBanner('error', 'Failed to reset password.');
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
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
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