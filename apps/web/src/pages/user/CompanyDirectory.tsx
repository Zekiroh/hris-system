import { useState } from 'react';
import { Search, Mail, Phone, MapPin } from 'lucide-react';

const employees = [
    { name: 'David Kim', initials: 'DK', role: 'UX Designer', dept: 'Design', email: 'rober.martinez@gmail.com', phone: '09568321751O', location: 'Denver, CO', color: '#8b5cf6' },
    { name: 'Emily Rodriguez', initials: 'ER', role: 'Product Manager', dept: 'Marketing', email: 'rober.martinez@gmail.com', phone: '09568321751O', location: 'Denver, CO', color: '#059669' },
    { name: 'Michael Chen', initials: 'MC', role: 'HR Manager', dept: 'Human Resources', email: 'rober.martinez@gmail.com', phone: '09568321751O', location: 'Denver, CO', color: '#1e3a5f' },
    { name: 'Robert Martinez', initials: 'RM', role: 'DevOps Engineer', dept: 'Engineer', email: 'rober.martinez@gmail.com', phone: '09568321751O', location: 'Denver, CO', color: '#dc2626' },
    { name: 'Jane Doe', initials: 'JD', role: 'Marketing Director', dept: 'Marketing', email: 'rober.martinez@gmail.com', phone: '09568321751O', location: 'Denver, CO', color: '#2563eb' },
    { name: 'Jessica Taylor', initials: 'JT', role: 'Sales Manager', dept: 'Sales', email: 'rober.martinez@gmail.com', phone: '09568321751O', location: 'Denver, CO', color: '#059669' },
];

const CompanyDirectory = () => {
    const [search, setSearch] = useState('');

    const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.role.toLowerCase().includes(search.toLowerCase()) ||
        emp.dept.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-6">
            <div className="page-header animate-fade-in-up">
                <h1>Employee Directory</h1>
                <p>Search for colleagues to find their role and contact information</p>
            </div>

            {/* Search */}
            <div className="pro-card p-5 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                <div className="relative max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                    />
                </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500 font-medium animate-fade-in-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
                {filtered.length} employees found
            </p>

            {/* Employee Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((emp, i) => (
                    <div
                        key={emp.name}
                        className="pro-card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all animate-fade-in-up cursor-pointer"
                        style={{ animationDelay: `${0.15 + i * 0.06}s`, opacity: 0 }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                style={{ backgroundColor: emp.color }}
                            >
                                {emp.initials}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{emp.name}</p>
                                <p className="text-xs text-gray-400">{emp.role}</p>
                                <p className="text-[11px] text-gray-400">{emp.dept}</p>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-2 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{emp.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span>{emp.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span>{emp.location}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="pro-card p-12 text-center">
                    <p className="text-gray-400 text-sm">No employees found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default CompanyDirectory;
