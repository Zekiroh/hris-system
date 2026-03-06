import { Fragment } from 'react';

const AccessManagement = () => {
    // Simplified Matrix
    const roles = ['Administrator', 'HR Manager', 'Regional Director', 'Staff'];
    const modules = [
        { name: 'Dashboard', permissions: ['View'] },
        { name: 'Personal Records', permissions: ['View', 'Create', 'Update', 'Archive'] },
        { name: 'Attendance', permissions: ['View', 'Update', 'Approve'] },
        { name: 'Clearance', permissions: ['View', 'Create', 'Approve'] },
        { name: 'Regional Offices', permissions: ['View'] },
        { name: 'Admin Settings', permissions: ['View', 'Manage Users'] },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Access Management</h2>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                    Manage Roles
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[var(--color-primary)]">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-64">
                                Module / Permission
                            </th>
                            {roles.map(role => (
                                <th key={role} className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                                    {role}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {modules.map((module) => (
                            <Fragment key={module.name}>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-2 text-xs font-bold text-gray-700 uppercase" colSpan={roles.length + 1}>
                                        {module.name}
                                    </td>
                                </tr>
                                {module.permissions.map(perm => (
                                    <tr key={`${module.name}-${perm}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-sm text-gray-600 pl-10 border-r border-gray-100">
                                            {perm}
                                        </td>
                                        {roles.map(role => (
                                            <td key={`${role}-${module.name}-${perm}`} className="px-6 py-3 text-center border-r border-gray-100 last:border-0 relative">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)] cursor-pointer"
                                                    defaultChecked={role === 'Administrator' || (role === 'HR Manager' && perm !== 'Manage Users')}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-green-700 shadow-sm">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default AccessManagement;
