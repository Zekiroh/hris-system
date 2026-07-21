
import { Plus, Trash2 } from 'lucide-react';

export const OtherC3 = () => {
    return (
        <div className="space-y-6">
            {/* Special Skills */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">Special Skills & Hobbies</h3>
                    <button className="flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium hover:underline">
                        <Plus size={16} /> Add Skill
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span>Computer Proficient (MS Office, Adobe Photoshop)</span>
                        <button className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span>Public Speaking</span>
                        <button className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Recognition */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">Non-Academic Distinctions / Recognition</h3>
                    <button className="flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium hover:underline">
                        <Plus size={16} /> Add Recognition
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span>Employee of the Year 2023</span>
                        <button className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Membership */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">Membership in Association/Organization</h3>
                    <button className="flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium hover:underline">
                        <Plus size={16} /> Add Membership
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span>PDEA Employees Association - Member</span>
                        <button className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};
