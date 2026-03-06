import type { FC } from 'react';
import { X, Clock } from 'lucide-react';

interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeName: string;
}

const AttendanceModal: FC<AttendanceModalProps> = ({ isOpen, onClose, employeeName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] font-bold">
                        {employeeName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{employeeName}</h2>
                        <p className="text-sm text-gray-500">Attendance Details - September 2024</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-1">Time In</p>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-[var(--color-primary)]" />
                            <span className="text-lg font-bold">07:55 AM</span>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-1">Time Out</p>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-red-500" />
                            <span className="text-lg font-bold">05:01 PM</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <input type="checkbox" id="hazardPay" className="w-4 h-4 text-[var(--color-primary)] rounded" />
                        <label htmlFor="hazardPay" className="text-sm font-medium text-gray-700">Eligible for Hazard Pay</label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Remarks / Notes</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-2.5 h-24 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                            placeholder="Enter any remarks regarding this attendance record..."
                        ></textarea>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                    <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-green-700">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceModal;
