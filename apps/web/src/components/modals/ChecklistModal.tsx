import type { FC } from 'react';
import { X } from 'lucide-react';

interface ChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChecklistModal: FC<ChecklistModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative animate-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-gray-900 mb-2">Checklist Requirement</h2>
                <p className="text-sm text-gray-500 mb-6">Settlement of Financial Obligations</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg flex-1 has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-green-50 transition-colors">
                                <input type="radio" name="status" className="w-4 h-4 text-[var(--color-primary)]" defaultChecked />
                                <span className="text-sm font-medium">Cleared / Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg flex-1 has-[:checked]:border-red-500 has-[:checked]:bg-red-50 transition-colors">
                                <input type="radio" name="status" className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium">Pending / No</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg flex-1 has-[:checked]:border-gray-500 has-[:checked]:bg-gray-50 transition-colors">
                                <input type="radio" name="status" className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium">N/A</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Remarks</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-2.5 h-24 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                            placeholder="Enter details about this requirement..."
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Attachments</label>
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
                            <p>Click to upload proof of clearance</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-green-700">
                        Save Status
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChecklistModal;
