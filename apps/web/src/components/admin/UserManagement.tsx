
import { Search, MoreHorizontal, UserPlus, Shield, Filter, Download, Edit, EyeOff, Ban, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const UserManagement = () => {
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const users = [
        { id: 1, name: 'Juan Dela Cruz', email: 'juan.delacruz@pdea.gov.ph', role: 'Administrator', status: 'Active', lastActive: '2 mins ago' },
        { id: 2, name: 'Maria Santos', email: 'maria.santos@pdea.gov.ph', role: 'HR Manager', status: 'Active', lastActive: '1 hour ago' },
        { id: 3, name: 'Jose Reyes', email: 'jose.reyes@pdea.gov.ph', role: 'Regional Director', status: 'Inactive', lastActive: '2 days ago' },
        { id: 4, name: 'Ana Garcia', email: 'ana.garcia@pdea.gov.ph', role: 'Staff', status: 'Active', lastActive: '5 mins ago' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = (id: number) => {
        setActiveMenu(activeMenu === id ? null : id);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <UserPlus size={18} /> Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                            <Filter size={18} />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                            <Download size={18} />
                            Export
                        </button>
                    </div>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#107d38]">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Last Active</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Shield size={14} className="text-gray-400" />
                                        {user.role}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.lastActive}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="relative flex justify-end">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleMenu(user.id); }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {activeMenu === user.id && (
                                            <div
                                                ref={menuRef}
                                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-100 py-1 text-left"
                                            >
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    onClick={() => setActiveMenu(null)}
                                                >
                                                    <Edit size={16} /> Edit
                                                </button>
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    onClick={() => setActiveMenu(null)}
                                                >
                                                    <EyeOff size={16} /> Hide
                                                </button>
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    onClick={() => setActiveMenu(null)}
                                                >
                                                    <Ban size={16} /> Block
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
