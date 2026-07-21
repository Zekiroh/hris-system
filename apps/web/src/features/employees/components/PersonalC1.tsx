export const PersonalC1 = () => (
    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50" defaultValue="Juan" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50" defaultValue="Rizal" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Surname</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50" defaultValue="Dela Cruz" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50" defaultValue="1990-01-01" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50" defaultValue="Manila" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Civil Status</label>
                <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50">
                    <option>Single</option>
                    <option>Married</option>
                    <option>Widowed</option>
                    <option>Separated</option>
                </select>
            </div>
        </div>
    </div>
);
