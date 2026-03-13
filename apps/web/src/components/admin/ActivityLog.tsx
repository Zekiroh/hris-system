import { Calendar, Clock, Download, Search } from 'lucide-react';
import { useState } from 'react';

const ActivityLog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isTodayFilterActive, setIsTodayFilterActive] = useState(false);

    // Get today's date formatted as YYYY-MM-DD
    const getTodayString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const todayStr = getTodayString();

    // Mock logs (first two are set to 'today' so the filter has data to show)
    const logs = [
        { id: 1, user: 'Juan Dela Cruz', action: 'Logged in', details: 'Successful login', time: `${todayStr} 08:00 AM` },
        { id: 2, user: 'Maria Santos', action: 'Approved Clearance', details: 'Clearance ID #1023', time: `${todayStr} 09:15 AM` },
        { id: 3, user: 'Juan Dela Cruz', action: 'Updated Profile', details: 'Changed address', time: '2024-09-14 10:30 AM' },
        { id: 4, user: 'System', action: 'Backup', details: 'Automated daily backup', time: '2024-09-14 12:00 PM' },
        { id: 5, user: 'Ana Garcia', action: 'Failed Login', details: 'Invalid password attempt', time: '2024-09-14 01:45 PM' },
    ];

    const getBadgeStyle = (action: string) => {
        if (action.includes('Failed')) return 'badge-danger';
        if (action.includes('Approved')) return 'badge-success';
        if (action.includes('Login')) return 'bg-blue-50 text-blue-700 border border-blue-100'; 
        return 'badge-neutral';
    };

    // --- Filter Logic ---
    const filteredLogs = logs.filter(log => {
        // 1. Search Filter
        const searchMatch = 
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 2. Date Filter
        const dateMatch = isTodayFilterActive ? log.time.startsWith(todayStr) : true;

        return searchMatch && dateMatch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">Activity Logs</h2>
                <div className="flex items-center gap-2">
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="pro-input !pl-9 !py-1.5 w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    
                    {/* Today Filter Toggle */}
                    <button 
                        onClick={() => setIsTodayFilterActive(!isTodayFilterActive)}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm shadow-sm transition-colors ${
                            isTodayFilterActive 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Calendar size={16} className={isTodayFilterActive ? 'text-emerald-500' : 'text-gray-400'} />
                        <span className="font-medium">{isTodayFilterActive ? 'Today Only' : 'All Time'}</span>
                    </button>
                    
                    {/* Export Button (Reverted to visual only) */}
                    <button className="btn btn-secondary py-1.5 flex items-center gap-2">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table min-w-full">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Clock size={14} className="text-gray-400" />
                                            {log.time}
                                        </div>
                                    </td>
                                    <td className="!font-medium !text-gray-900">
                                        {log.user}
                                    </td>
                                    <td>
                                        <span className={`badge ${getBadgeStyle(log.action)}`}>
                                            <span className="badge-dot" />{log.action}
                                        </span>
                                    </td>
                                    <td className="text-gray-500">
                                        {log.details}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500 italic">
                                    No activity logs match your search criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityLog;