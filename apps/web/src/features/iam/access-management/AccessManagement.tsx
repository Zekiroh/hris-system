import { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Navigate } from 'react-router-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  getPermissions,
  updatePermission,
  type PermissionDto,
} from '../../../lib/permissions';

type AccessManagementProps = {
  showRoleModal: boolean;
  setShowRoleModal: React.Dispatch<React.SetStateAction<boolean>>;
  onSaveSuccess: () => void;
};

const ROLE_ID_MAP: Record<string, number> = {
  'Super Admin': 1,
  Admin: 2,
  User: 3,
};

const normalizeKey = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '');

const MODULE_ALIASES: Record<string, string[]> = {
  Dashboard: ['DASHBOARD'],
  'Employee Management': ['PERSONALRECORDS', 'EMPLOYEES'],
  'Attendance Log': ['ATTENDANCE', 'TIMEATTENDANCE', 'TIMEANDATTENDANCE'],
  'Leave Management': ['LEAVE', 'LEAVEMANAGEMENT'],
  Payroll: ['PAYROLL'],
  'Government Compliance': ['COMPLIANCE', 'GOVERNMENTCOMPLIANCE'],
  'Asset Management': ['ASSET', 'ASSETS', 'ASSETMANAGEMENT'],
  Settings: ['ADMINSETTINGS', 'IAM'],
  'Company News': ['NEWS'],
  'My Pay Slips': ['PAYSLIPS'],
  'My Performance': ['PERFORMANCE'],
};

const FLAG_BY_PERMISSION_LABEL = {
  View: 'canView',
  Create: 'canCreate',
  Update: 'canUpdate',
  Archive: 'canArchive',
} as const;

const modules = [
  // Super Admin & Admin modules
  { name: 'Dashboard', permissions: ['View'] },
  { name: 'Employee Management', permissions: ['View', 'Create', 'Update', 'Archive'] },
  { name: 'Attendance Log', permissions: ['View', 'Update'] },
  { name: 'Leave Management', permissions: ['View', 'Create', 'Update', 'Archive'] },
  { name: 'Payroll', permissions: ['View'] },
  { name: 'Government Compliance', permissions: ['View'] },
  { name: 'Asset Management', permissions: ['View', 'Create', 'Update', 'Archive'] },
  { name: 'Settings', permissions: ['View'] },
  // User-side modules
  { name: 'Company News', permissions: ['View'] },
  { name: 'My Pay Slips', permissions: ['View'] },
  { name: 'My Performance', permissions: ['View'] },
];

const buildInitialPermissionState = (roleList: string[]) => {
  const initialState: Record<string, boolean> = {};

  modules.forEach((mod) => {
    mod.permissions.forEach((perm) => {
      roleList.forEach((role) => {
        const key = `${mod.name}-${perm}-${role}`;
        initialState[key] =
          role === 'Super Admin' || (role === 'Admin' && perm !== 'Manage Users');
      });
    });
  });

  return initialState;
};

const AccessManagement = ({
  showRoleModal,
  setShowRoleModal,
  onSaveSuccess,
}: AccessManagementProps) => {
  const { user } = useAuth();

  const [roles] = useState(['Super Admin', 'Admin', 'User']);
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() =>
    buildInitialPermissionState(['Super Admin', 'Admin', 'User'])
  );
  const [backendPermissions, setBackendPermissions] = useState<PermissionDto[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const newRole = '';

  const getRoleNameById = (roleId: number) =>
    Object.keys(ROLE_ID_MAP).find((roleName) => ROLE_ID_MAP[roleName] === roleId);

  const getUiModuleNameFromBackend = (backendModule: string) => {
    const normalizedBackendModule = normalizeKey(backendModule);

    return (
      modules.find((module) =>
        (MODULE_ALIASES[module.name] ?? [module.name]).some(
          (alias) => normalizeKey(alias) === normalizedBackendModule
        )
      )?.name ?? null
    );
  };

  useEffect(() => {
    const loadPermissions = async () => {
      setIsLoadingPermissions(true);

      try {
        const data = await getPermissions();
        setBackendPermissions(data);

        setPermissions((prev) => {
          const next = { ...prev };

          data.forEach((row) => {
            const roleName = getRoleNameById(row.roleId);
            const uiModuleName = getUiModuleNameFromBackend(row.module);

            if (!roleName || !uiModuleName) return;

            next[`${uiModuleName}-View-${roleName}`] = row.canView;
            next[`${uiModuleName}-Create-${roleName}`] = row.canCreate;
            next[`${uiModuleName}-Update-${roleName}`] = row.canUpdate;
            next[`${uiModuleName}-Archive-${roleName}`] = row.canArchive;
          });

          return next;
        });
      } catch (error) {
        console.error('Failed to load permissions.', error);
        setBackendPermissions([]);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    void loadPermissions();
  }, []);

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard/settings" replace />;
  }

  const handleTogglePermission = (
    moduleName: string,
    permName: string,
    roleName: string
  ) => {
    const key = `${moduleName}-${permName}-${roleName}`;
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveChanges = async () => {
    if (isLoadingPermissions || backendPermissions.length === 0) {
      alert('Permissions not ready yet.');
      return;
    }

    try {
      setIsSaving(true);

      const updates = backendPermissions.map((row) => {
        const roleName = getRoleNameById(row.roleId);
        const uiModuleName = getUiModuleNameFromBackend(row.module);

        if (!roleName || !uiModuleName) return null;

        const payload: Pick<
          PermissionDto,
          'canView' | 'canCreate' | 'canUpdate' | 'canArchive'
        > = {
          canView: row.canView,
          canCreate: row.canCreate,
          canUpdate: row.canUpdate,
          canArchive: row.canArchive,
        };

        Object.entries(FLAG_BY_PERMISSION_LABEL).forEach(([label, flag]) => {
          const key = `${uiModuleName}-${label}-${roleName}`;

          if (Object.prototype.hasOwnProperty.call(permissions, key)) {
            payload[flag] = !!permissions[key];
          }
        });

        return updatePermission(row.id, payload);
      });

      await Promise.all(updates.filter(Boolean) as Promise<PermissionDto>[]);
      onSaveSuccess();
    } catch (error) {
      console.error('Failed to update permissions.', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table min-w-full">
          <thead>
            <tr>
              <th className="text-left w-64">Module / Permission</th>
              {roles.map((role) => (
                <th key={role} className="text-center whitespace-nowrap px-4">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <Fragment key={module.name}>
                <tr className="bg-gray-50/80">
                  <td
                    className="!font-bold !text-gray-800 uppercase text-xs tracking-wider"
                    colSpan={roles.length + 1}
                  >
                    {module.name}
                  </td>
                </tr>
                {module.permissions.map((perm) => (
                  <tr key={`${module.name}-${perm}`}>
                    <td className="pl-10 text-gray-600">{perm}</td>
                    {roles.map((role) => {
                      const key = `${module.name}-${perm}-${role}`;
                      return (
                        <td key={key} className="text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                            checked={permissions[key] || false}
                            onChange={() => handleTogglePermission(module.name, perm, role)}
                            disabled={role === 'Super Admin' || isLoadingPermissions || isSaving}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSaveChanges}
          className="btn btn-primary shadow-sm flex items-center gap-2"
          type="button"
          disabled={isLoadingPermissions || backendPermissions.length === 0 || isSaving}
        >
          Save Changes
        </button>
      </div>

      {showRoleModal &&
        createPortal(
          <div className="pro-modal-overlay z-[200]">
            <div className="pro-modal max-w-md">
              <div className="pro-modal-header border-b border-gray-100 pb-4">
                <h3>Manage Roles</h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="btn-ghost btn-icon"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="pro-modal-body space-y-4 pt-4">
                <div>
                  <label className="pro-label">Add New Role</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="pro-input flex-1"
                      placeholder="Role management not available yet"
                      value={newRole}
                      disabled
                      readOnly
                    />
                    <button className="btn btn-primary px-3" disabled>
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="pro-label mb-2">Existing Roles</label>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {roles.map((role) => (
                      <div
                        key={role}
                        className="flex items-center justify-between px-4 py-3 bg-white"
                      >
                        <span className="text-sm font-medium text-gray-700">{role}</span>
                        {role !== 'Super Admin' && (
                          <button
                            className="p-1.5 text-rose-400 rounded-lg disabled:opacity-50"
                            disabled
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pro-modal-footer mt-2">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="btn btn-secondary w-full"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AccessManagement;
