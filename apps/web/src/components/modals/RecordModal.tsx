import type { FC } from 'react';
import { X, Upload, File } from 'lucide-react';

interface RecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
}

const RecordModal: FC<RecordModalProps> = ({ isOpen, onClose, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>

                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-green-50 transition-colors">
                        <Upload size={32} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700">Uploaded Files</h3>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="p-2 bg-red-100 rounded text-red-600">
                                <File size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">Diploma.pdf</p>
                                <p className="text-xs text-gray-500">2.4 MB</p>
                            </div>
                            <button className="text-gray-400 hover:text-red-500">
                                <X size={16} />
                            </button>
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
                        Save Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecordModal;
