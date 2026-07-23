import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  updateAdminUserStatus,
  resetAdminUserPassword,
} from '../../../../services/api/iam/adminUsers';
import { useAuth } from '../../../../app/auth/useAuth';
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
  type UserNameFormat,
  type UserSortOrder,
} from '../userManagement.shared';

export const useUserManagement = () => {
  const { user: authUser } = useAuth();

  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<UserSortOrder>('LATEST');
  const [nameFormat, setNameFormat] = useState<UserNameFormat>('LN_FIRST');

  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [bannerType, setBannerType] = useState<'success' | 'error' | null>(
    null
  );
  const bannerTimeoutRef = useRef<number | null>(null);

  const [highlightedUserId, setHighlightedUserId] = useState<number | null>(
    null
  );
  const highlightTimeoutRef = useRef<number | null>(null);

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

  const clearModalError = () => setModalError(null);

  const dismissBanner = useCallback(() => {
    setBannerMessage(null);
    setBannerType(null);

    if (bannerTimeoutRef.current !== null) {
      window.clearTimeout(bannerTimeoutRef.current);
      bannerTimeoutRef.current = null;
    }
  }, []);

  const showBanner = useCallback(
    (type: 'success' | 'error', message: string) => {
      if (bannerTimeoutRef.current !== null) {
        window.clearTimeout(bannerTimeoutRef.current);
      }

      setBannerType(type);
      setBannerMessage(message);

      bannerTimeoutRef.current = window.setTimeout(() => {
        setBannerMessage(null);
        setBannerType(null);
        bannerTimeoutRef.current = null;
      }, 3500);
    },
    []
  );

  const setHighlightedUser = useCallback((userId: number | null) => {
    if (highlightTimeoutRef.current !== null) {
      window.clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    setHighlightedUserId(userId);

    if (userId === null) return;

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedUserId(null);
      highlightTimeoutRef.current = null;
    }, 3200);
  }, []);

  const mapSelectedRoleToRoleId = (role: string): number | undefined => {
    switch (role) {
      case 'Super Admin':
        return 1;
      case 'Admin':
        return 2;
      case 'User':
        return 3;
      default:
        return undefined;
    }
  };

  const mapSelectedStatusToIsActive = (status: string): boolean | undefined => {
    switch (status) {
      case 'Active':
        return true;
      case 'Inactive':
        return false;
      default:
        return undefined;
    }
  };

  const fetchUsers = useCallback(
    async (currentSortOrder: UserSortOrder = sortOrder) => {
      setIsLoading(true);

      try {
        const data = await getAdminUsers({
          page: 1,
          pageSize: 100,
          roleId: mapSelectedRoleToRoleId(selectedRole),
          isActive: mapSelectedStatusToIsActive(selectedStatus),
          sortBy: 'createdAt',
          sortOrder: currentSortOrder === 'LATEST' ? 'desc' : 'asc',
        });

        const items = Array.isArray(data) ? data : data.items;
        const mappedUsers = mapAdminUsers(items, authUser?.id, nameFormat);
        setUsers(mappedUsers);

        return mappedUsers;
      } catch {
        showBanner('error', 'Failed to load users.');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [
      authUser?.id,
      nameFormat,
      selectedRole,
      selectedStatus,
      showBanner,
      sortOrder,
    ]
  );

  useEffect(() => {
    void fetchUsers(sortOrder);
  }, [fetchUsers, sortOrder]);

  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);

    document.addEventListener('click', closeMenu);

    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (bannerTimeoutRef.current !== null) {
        window.clearTimeout(bannerTimeoutRef.current);
      }

      if (highlightTimeoutRef.current !== null) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    return users.filter((user) => {
      return (
        !searchTerm.trim() ||
        user.displayName.toLowerCase().includes(lower) ||
        user.fullName.toLowerCase().includes(lower) ||
        user.email.toLowerCase().includes(lower) ||
        user.roleLabel.toLowerCase().includes(lower) ||
        user.statusLabel.toLowerCase().includes(lower)
      );
    });
  }, [searchTerm, users]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, users, selectedRole, selectedStatus, sortOrder, nameFormat]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / DEFAULT_PAGE_SIZE)
  );

  const safePage = Math.min(Math.max(1, page), totalPages);

  const pagedUsers = useMemo(() => {
    const start = (safePage - 1) * DEFAULT_PAGE_SIZE;
    return filteredUsers.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [filteredUsers, safePage]);

  const toggleMenu = (event: MouseEvent, id: number) => {
    event.stopPropagation();
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
    setFormData({
      id: user.id,
      firstName: user.firstName ?? '',
      middleName: user.middleName ?? '',
      lastName: user.lastName ?? '',
      suffix: user.suffix ?? '',
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
      fullName: user.displayName,
      newPassword: '',
    });

    clearModalError();
    setShowResetPasswordModal(true);
    setActiveMenu(null);
  };

  const openStatusConfirmModal = (user: UserRow) => {
    setStatusConfirmData({
      id: user.id,
      fullName: user.displayName,
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
        suffix: formData.suffix.trim() || null,
        email: normalizedEmail,
        password: formData.password.trim(),
        roleId: formData.roleId,
        isActive: formData.isActive,
      });

      let postCreateIssue: string | null = null;

      if (!formData.isActive) {
        try {
          const refreshed = await getAdminUsers({
            page: 1,
            pageSize: 100,
            sortBy: 'createdAt',
            sortOrder: sortOrder === 'LATEST' ? 'desc' : 'asc',
          });

          const refreshedItems = Array.isArray(refreshed)
            ? refreshed
            : refreshed.items;

          const createdUser = refreshedItems.find(
            (user) => user.email.toLowerCase() === normalizedEmail
          );

          if (createdUser) {
            await updateAdminUserStatus(createdUser.id, { isActive: false });
          } else {
            postCreateIssue =
              'User created, but inactive status could not be applied.';
          }
        } catch {
          postCreateIssue =
            'User created, but inactive status could not be applied.';
        }
      }

      closeAddModal();

      const refreshedUsers = await fetchUsers(sortOrder);
      const createdUser = refreshedUsers.find(
        (user) => user.email.toLowerCase() === normalizedEmail
      );

      if (createdUser) {
        setHighlightedUser(createdUser.id);
      } else if (
        !postCreateIssue &&
        selectedRole === 'ALL' &&
        selectedStatus === 'ALL'
      ) {
        postCreateIssue = 'User created, but the table could not be refreshed.';
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
        suffix: formData.suffix.trim() || null,
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

      await fetchUsers(sortOrder);

      setHighlightedUser(formData.id);
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
      await updateAdminUserStatus(statusConfirmData.id, {
        isActive: nextIsActive,
      });

      closeStatusConfirmModal();

      await fetchUsers(sortOrder);

      setHighlightedUser(statusConfirmData.id);
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

      await fetchUsers(sortOrder);

      setHighlightedUser(passwordResetData.id);
      showBanner('success', 'Password reset successful.');
    } catch {
      setModalError('Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const data = await getAdminUsers({
        page: 1,
        pageSize: 100,
        roleId: mapSelectedRoleToRoleId(selectedRole),
        isActive: mapSelectedStatusToIsActive(selectedStatus),
        sortBy: 'createdAt',
        sortOrder: sortOrder === 'LATEST' ? 'desc' : 'asc',
      });

      const items = Array.isArray(data) ? data : data.items;
      const mapped = mapAdminUsers(items, authUser?.id, nameFormat);

      const exportUsers = !searchTerm.trim()
        ? mapped
        : mapped.filter((user) => {
            const lower = searchTerm.toLowerCase();

            return (
              user.displayName.toLowerCase().includes(lower) ||
              user.fullName.toLowerCase().includes(lower) ||
              user.email.toLowerCase().includes(lower) ||
              user.roleLabel.toLowerCase().includes(lower) ||
              user.statusLabel.toLowerCase().includes(lower)
            );
          });

      if (!exportUsers.length) {
        showBanner('error', 'No users available to export.');
        return;
      }

      const headers = ['Name', 'Email', 'Role', 'Status', 'Last Active'];

      const rows = exportUsers.map((user) => [
        user.displayName,
        user.email,
        user.roleLabel,
        user.statusLabel,
        user.lastActiveLabel,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const sortLabel = sortOrder === 'LATEST' ? 'latest' : 'oldest';
      const fileName = `users-export-${sortLabel}-${year}-${month}-${day}.csv`;

      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      showBanner('error', 'Failed to export users.');
    }
  };

  return {
    activeMenu,
    searchTerm,
    selectedRole,
    selectedStatus,
    sortOrder,
    nameFormat,
    users,
    isLoading,
    isSubmitting,
    bannerMessage,
    bannerType,
    highlightedUserId,
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
    setSortOrder,
    setNameFormat,
    setPage,
    setFormData,
    setPasswordResetData,

    clearModalError,
    dismissBanner,
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