import { useState } from 'react';
import { ArrowLeft, CheckSquare, MessageSquare, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChecklistModal from '../../components/modals/ChecklistModal';

const ClearanceForm = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const checklistItems = [
        { requirement: 'Return of Office Equipment (Laptop, Phone)', status: 'Cleared', action: 'Edit' },
        { requirement: 'Settlement of Financial Obligations', status: 'Pending', action: 'Review' },
        { requirement: 'Submission of Turn-over Reports', status: 'N/A', action: 'Edit' },
    ];

    const statusBadge: Record<string, string> = {
        Cleared: 'badge-success',
        Pending: 'badge-warning',
        'N/A': 'badge-neutral',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 animate-fade-in-up">
                <button onClick={() => navigate(-1)} className="btn-ghost btn-icon text-gray-500 hover:bg-gray-100">
                    <ArrowLeft size={22} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-800">Clearance Details</h1>
                    <p className="text-sm text-gray-500">Processing clearance for Juan Dela Cruz</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary !border-red-200 !text-red-500 hover:!bg-red-50">Decline</button>
                    <button className="btn btn-primary"><Save size={16} /> Approve</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Checklist */}
                <div className="md:col-span-2 space-y-6">
                    <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                        <div className="p-6">
                            <h3 className="text-base font-bold text-gray-800 mb-4">Clearance Checklist</h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead>
                                        <tr>
                                            <th>Requirement</th>
                                            <th>Status</th>
                                            <th className="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {checklistItems.map((item, i) => (
                                            <tr key={i}>
                                                <td className="!text-gray-800">{item.requirement}</td>
                                                <td><span className={`badge ${statusBadge[item.status]}`}><span className="badge-dot" />{item.status}</span></td>
                                                <td className="text-right">
                                                    <button
                                                        onClick={item.action === 'Review' ? () => setIsModalOpen(true) : undefined}
                                                        className="text-emerald-600 font-medium text-sm hover:underline"
                                                    >{item.action}</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button className="mt-4 flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-600 transition-colors">
                                <CheckSquare size={16} /> Add Custom Requirement
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                        <div className="p-6">
                            <h3 className="text-base font-bold text-gray-800 mb-4">Request Info</h3>
                            <div className="space-y-4 text-sm">
                                {[
                                    ['Employee', 'Juan Dela Cruz'],
                                    ['ID Number', '2024001'],
                                    ['Date Filed', 'Sep 10, 2024'],
                                    ['Effective Date', 'Oct 01, 2024'],
                                    ['Purpose', 'Retirement'],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
                                        <p className="font-medium text-gray-800">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                        <div className="p-6">
                            <h3 className="text-base font-bold text-gray-800 mb-4">Comments</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-emerald-700">A</div>
                                    <div className="bg-gray-50 p-3 rounded-xl text-sm w-full border border-gray-100">
                                        <p className="font-bold text-gray-800 text-xs">Admin (You)</p>
                                        <p className="text-gray-600 mt-0.5">Please remind the employee to return the gate pass key.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 relative">
                                <input type="text" placeholder="Add a comment..." className="pro-input !pr-10" />
                                <button className="absolute right-2 top-2 text-emerald-600 hover:text-emerald-700">
                                    <MessageSquare size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ChecklistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default ClearanceForm;
