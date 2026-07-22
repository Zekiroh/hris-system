import type { FormEvent } from 'react';
import { Laptop, X } from 'lucide-react';
import type { AssetFormState } from '../../assetManagementTypes';

type AddAssetModalProps = {
    assetForm: AssetFormState;
    isSavingAsset: boolean;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onFormChange: (field: keyof AssetFormState, value: string) => void;
};

const AddAssetModal = ({ assetForm, isSavingAsset, onClose, onSubmit, onFormChange }: AddAssetModalProps) => {
    return (
        <div className="pro-modal-overlay" onClick={onClose}>
            <form className="pro-modal max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()} onSubmit={onSubmit}>
                <div className="pro-modal-header border-b border-gray-100">
                    <div>
                        <h3>Add New Asset</h3>
                        <p className="text-xs text-gray-400 mt-1">Create a company asset record. Assignment is handled separately.</p>
                    </div>
                    <button type="button" onClick={onClose} className="btn-ghost btn-icon">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="pro-modal-body space-y-5 max-h-[70vh] overflow-y-auto">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <Laptop className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Asset Information</p>
                                <p className="text-xs text-gray-500 mt-1">Use a unique asset ID and complete the device details for monitoring.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="pro-label">Asset ID <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. AST-001"
                                className="pro-input"
                                value={assetForm.assetCode}
                                onChange={e => onFormChange('assetCode', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="pro-label">Asset Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. Dell Laptop XPS 15"
                                className="pro-input"
                                value={assetForm.assetName}
                                onChange={e => onFormChange('assetName', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="pro-label">Category <span className="text-red-500">*</span></label>
                            <select
                                className="pro-select"
                                value={assetForm.category}
                                onChange={e => onFormChange('category', e.target.value)}
                            >
                                <option>IT Equipment</option>
                                <option>Office Equipment</option>
                                <option>Furniture</option>
                                <option>Vehicle</option>
                            </select>
                        </div>
                        <div>
                            <label className="pro-label">Status</label>
                            <select
                                className="pro-select"
                                value={assetForm.status}
                                onChange={e => onFormChange('status', e.target.value)}
                            >
                                <option>Available</option>
                                <option>Maintenance</option>
                                <option>Needs Replacement</option>
                                <option>Disposed</option>
                            </select>
                        </div>
                        <div>
                            <label className="pro-label">Brand</label>
                            <input
                                type="text"
                                placeholder="e.g. Dell"
                                className="pro-input"
                                value={assetForm.brand}
                                onChange={e => onFormChange('brand', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="pro-label">Model</label>
                            <input
                                type="text"
                                placeholder="e.g. XPS 15"
                                className="pro-input"
                                value={assetForm.model}
                                onChange={e => onFormChange('model', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="pro-label">Serial Number</label>
                            <input
                                type="text"
                                placeholder="e.g. SN-123456"
                                className="pro-input"
                                value={assetForm.serialNumber}
                                onChange={e => onFormChange('serialNumber', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="pro-label">Purchase Date</label>
                            <input
                                type="date"
                                className="pro-input"
                                value={assetForm.purchaseDate}
                                onChange={e => onFormChange('purchaseDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="pro-label">Notes</label>
                        <textarea
                            rows={3}
                            placeholder="Optional notes..."
                            className="pro-input resize-none"
                            value={assetForm.notes}
                            onChange={e => onFormChange('notes', e.target.value)}
                        />
                    </div>
                </div>
                <div className="pro-modal-footer border-t border-gray-100">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={isSavingAsset} className="btn btn-primary">
                        {isSavingAsset ? 'Saving...' : 'Save Asset'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddAssetModal;
