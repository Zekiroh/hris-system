
import { Calendar, Clock, Download, Search } from 'lucide-react';

const ActivityLog = () => {
    const logs = [
        { id: 1, user: 'Juan Dela Cruz', action: 'Logged in', details: 'Successful login', time: '2024-09-14 08:00 AM' },
        { id: 2, user: 'Maria Santos', action: 'Approved Clearance', details: 'Clearance ID #1023', time: '2024-09-14 09:15 AM' },
        { id: 3, user: 'Juan Dela Cruz', action: 'Updated Profile', details: 'Changed address', time: '2024-09-14 10:30 AM' },
        { id: 4, user: 'System', action: 'Backup', details: 'Automated daily backup', time: '2024-09-14 12:00 PM' },
        { id: 5, user: 'Ana Garcia', action: 'Failed Login', details: 'Invalid password attempt', time: '2024-09-14 01:45 PM' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">Activity Logs</h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>Today</span>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-medium bg-white">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[var(--color-primary)]">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Action</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                                    <Clock size={14} />
                                    {log.time}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {log.user}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${log.action.includes('Login') ? 'bg-blue-100 text-blue-800' : ''}
                                        ${log.action.includes('Approved') ? 'bg-green-100 text-green-800' : ''}
                                        ${log.action.includes('Failed') ? 'bg-red-100 text-red-800' : ''}
                                        ${!log.action.match(/Login|Approved|Failed/) ? 'bg-gray-100 text-gray-800' : ''}
                                    `}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.details}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityLog;
