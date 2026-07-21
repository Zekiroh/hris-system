
import { Plus, Trash2 } from 'lucide-react';

export const VoluntaryC2 = () => {
    return (
        <div className="space-y-6">
            {/* Voluntary Work */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">Voluntary Work</h3>
                    <button className="flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium hover:underline">
                        <Plus size={16} /> Add Record
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-4 py-3 text-center rounded-tl-lg">Organization</th>
                                <th className="px-4 py-3 text-center">Position</th>
                                <th className="px-4 py-3 text-center">From</th>
                                <th className="px-4 py-3 text-center">To</th>
                                <th className="px-4 py-3 text-center">Hours</th>
                                <th className="px-4 py-3 text-center rounded-tr-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="px-4 py-3">Red Cross Philippines</td>
                                <td className="px-4 py-3">Volunteer Nurse</td>
                                <td className="px-4 py-3">2018-01-01</td>
                                <td className="px-4 py-3">2019-01-01</td>
                                <td className="px-4 py-3">100</td>
                                <td className="px-4 py-3">
                                    <button className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Learning and Development */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">Learning and Development (L&D)</h3>
                    <button className="flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium hover:underline">
                        <Plus size={16} /> Add Training
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-4 py-3 text-center rounded-tl-lg">Title of Learning</th>
                                <th className="px-4 py-3 text-center">Type</th>
                                <th className="px-4 py-3 text-center">From</th>
                                <th className="px-4 py-3 text-center">To</th>
                                <th className="px-4 py-3 text-center">Hours</th>
                                <th className="px-4 py-3 text-center">Conducted By</th>
                                <th className="px-4 py-3 text-center rounded-tr-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="px-4 py-3">Advanced Project Management</td>
                                <td className="px-4 py-3">Technical</td>
                                <td className="px-4 py-3">2023-05-10</td>
                                <td className="px-4 py-3">2023-05-12</td>
                                <td className="px-4 py-3">24</td>
                                <td className="px-4 py-3">Civil Service Commission</td>
                                <td className="px-4 py-3">
                                    <button className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
