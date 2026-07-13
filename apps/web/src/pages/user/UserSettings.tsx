import { useState, useEffect } from 'react';
import {
    User, Lock, Activity, FileText,
    Eye, EyeOff, Check, AlertCircle,
    X
} from 'lucide-react';
import { useMyDocuments } from '../personal-records/hooks/useMyDocuments';
import { EmployeeDocumentsPanel, DocumentTypeDropdown } from '../../components/personal-records/EmployeeDocumentsPanel';
import { EMPLOYEE_DOCUMENT_TYPES, type EmployeeDocumentType } from '../../lib/employees';
import { useAuth } from '../../context/AuthContext';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Calendar, Search } from 'lucide-react';
import { getBadgeClassName, formatActionLabel, formatDatePart, formatTimePart, formatDateFilterPart } from '../../lib/activityLog.utils';
import { getUserActivityLogs, createActivityLog, type ActivityLogItemDto } from '../../lib/activityLogs';
import { apiRequest } from '../../lib/api';
import GovernmentInfoSection from '../../components/user/settings/GovernmentInfoSection';
import ProfileTab from '../../components/user/settings/ProfileTab';



type SettingsTab = 'profile' | 'security' | 'documents' | 'logs';

const tabs = [
    { id: 'profile'   as const, label: 'Profile',            icon: User     },
    { id: 'security'  as const, label: 'Account & Security', icon: Lock     },
    { id: 'documents' as const, label: 'Documents',          icon: FileText },
    { id: 'logs'      as const, label: 'Activity Log',       icon: Activity },
];

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
    title:    string;
    message:  React.ReactNode;
    onConfirm: () => void;
    onCancel:  () => void;
}

const ConfirmModal = ({ title, message, onConfirm, onCancel }: ConfirmModalProps) => {
    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onConfirm();
        if (e.key === 'Escape') onCancel();
    };

    return createPortal(
        <div
            className="pro-modal-overlay"
            onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
            onKeyDown={handleKey}
        >
            <div className="pro-modal w-full max-w-sm p-6 space-y-5">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{title}</p>
                        <p className="text-xs text-gray-400">{message}</p>
                    </div>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={onCancel} className="btn btn-secondary text-sm">Cancel</button>
                    <button type="button" onClick={onConfirm} className="btn btn-primary flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4" /> Yes, save
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const SecurityTab = ({ user, onSaved }: { user: any; onSaved?: () => void }) => {
    const [showCurrent,    setShowCurrent]    = useState(false);
    const [showNew,        setShowNew]        = useState(false);
    const [showConfirm,    setShowConfirm]    = useState(false);
    const [passwords,      setPasswords]      = useState({ current: '', newPass: '', confirm: '' });
    const [error,          setError]          = useState('');
    const [employeeNumber, setEmployeeNumber] = useState<string | null>(null);
    const [hiredDate,      setHiredDate]      = useState<string | null>(null);
    const [confirmOpen,    setConfirmOpen]    = useState(false);

    useEffect(() => {
        const fetchEmployeeNumber = async () => {
            try {
                const data = await apiRequest<any>('/employees/me');
                setEmployeeNumber(data.employeeNumber ?? null);
setHiredDate(data.dateHired ? new Date(data.dateHired).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : null);
            } catch {
                setEmployeeNumber(null);
            }
        };
        void fetchEmployeeNumber();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSave = () => {
        if (!passwords.current)                      { setError('Please enter your current password.'); return; }
        if (passwords.newPass !== passwords.confirm) { setError('New passwords do not match.'); return; }
        if (passwords.newPass.length < 8)            { setError('Password must be at least 8 characters.'); return; }
        setConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        setConfirmOpen(false);
        try {
            await apiRequest('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword:     passwords.newPass,
                }),
            });

            setPasswords({ current: '', newPass: '', confirm: '' });
            setError('');
            toast.success('Password updated successfully.');
            void createActivityLog({
                action: 'PASSWORD_CHANGED',
                module: 'SECURITY',
                summary: 'User changed their password.',
            });
            onSaved?.();
        } catch (err: any) {
            const message = err?.message ?? '';
            if (message.toLowerCase().includes('incorrect')) {
                setError('Current password is incorrect.');
            } else {
                setError('Failed to update password. Please try again.');
            }
        }
    };

    return (
        <div className="space-y-6">
            {confirmOpen && (
                <ConfirmModal
                    title="Update password?"
                    message="Are you sure you want to change your password?"
                    onConfirm={handleConfirmSave}
                    onCancel={() => setConfirmOpen(false)}
                />
            )}

            {/* ── Government Information (secure) ── */}
            <GovernmentInfoSection onSaved={onSaved} />

            <div className="border-t border-gray-100" />

            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Account information</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Employee ID</label>
                        <input value={employeeNumber ?? '—'} readOnly
                            className="w-full px-0 py-1.5 bg-transparent text-green-500 font-semibold text-sm border-0 outline-none cursor-default select-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Hired date</label>
                        <input value={hiredDate ?? '—'} readOnly
                            className="w-full px-0 py-1.5 bg-transparent text-green-500 font-semibold text-sm border-0 outline-none cursor-default select-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                        <input value={user?.role ?? '—'} readOnly
                            className="w-full px-0 py-1.5 bg-transparent text-green-500 font-semibold text-sm border-0 outline-none cursor-default select-none" />
                    </div>
                    <div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100" />

            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Change password</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Current password</label>
                        <div className="relative">
                            <input name="current" type={showCurrent ? 'text' : 'password'}
                                value={passwords.current} onChange={handleChange}
                                className="pro-input w-full pr-10" placeholder="Enter current password" />
                            <button type="button" onClick={() => setShowCurrent(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">New password</label>
                        <div className="relative">
                            <input name="newPass" type={showNew ? 'text' : 'password'}
                                value={passwords.newPass} onChange={handleChange}
                                className="pro-input w-full pr-10" placeholder="Min. 8 characters" />
                            <button type="button" onClick={() => setShowNew(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Confirm new password</label>
                        <div className="relative">
                            <input name="confirm" type={showConfirm ? 'text' : 'password'}
                                value={passwords.confirm} onChange={handleChange}
                                className="pro-input w-full pr-10" placeholder="Repeat new password" />
                            <button type="button" onClick={() => setShowConfirm(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="mt-3 text-sm text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </p>
                )}

                <div className="flex items-center gap-3 mt-4">
                    <button onClick={handleSave} className="btn btn-primary flex items-center gap-2" type="button">
                        <Check className="w-4 h-4" /> Update password
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

type FilterDropdownProps = {
    value: string;
    options: readonly string[];
    onSelect: (value: string) => void;
    disabled?: boolean;
};

function FilterDropdown({ value, options, onSelect, disabled }: FilterDropdownProps) {
    const allOptions = ['All', ...options] as const;
    return (
        <DocumentTypeDropdown
            value={value as any}
            options={allOptions as any}
            onSelect={onSelect as any}
            disabled={disabled}
        />
    );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

type DocumentPreviewState = {
    url: string;
    contentType?: string | null;
    fileName?: string | null;
} | null;

function formatPendingFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
}

const DOCUMENTS_PAGE_SIZE = 5;

type UploaderFilter = 'All' | 'Admin' | 'Employee';

const DocumentsTab = ({ onSaved }: { onSaved?: () => void }) => {
    const [uploadConfirmOpen, setUploadConfirmOpen] = useState(false);
    const [drawerPreview, setDrawerPreview] = useState<{ url: string; name: string; type: string } | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [typeSearch, setTypeSearch] = useState('');
    const [uploaderFilter, setUploaderFilter] = useState<UploaderFilter>('All');
    const [docPage, setDocPage] = useState(1);
    const [pendingFileUrl, setPendingFileUrl] = useState<string | null>(null);
    const [showFilePreview, setShowFilePreview] = useState(false);

    const {
        documents,
        documentsLoading,
        documentsError,
        uploading,
        downloadingDocumentId,
        deletingDocumentId,
        selectedDocumentType,
        setSelectedDocumentType,
        upload,
        download,
        remove,
        getPreviewPayload,
    } = useMyDocuments(true, {
        onUploadSuccess: (msg) => {
            toast.success(msg);
            onSaved?.();
        },
        onUploadError:   (msg) => toast.error(msg),
        onDownloadSuccess: (msg) => toast.success(msg),
        onDownloadError:   (msg) => toast.error(msg),
        onDeleteSuccess: (msg) => toast.success(msg),
        onDeleteError:   (msg) => toast.error(msg),
    });

    const handleUploadRequest = (file: File) => {
        setPendingFile(file);
        setPendingFileUrl(URL.createObjectURL(file));
        setShowFilePreview(false);
        setUploadConfirmOpen(true);
    };

    const handleConfirmUpload = () => {
        setUploadConfirmOpen(false);
        if (pendingFile) {
            void upload(pendingFile);
        }
        if (pendingFileUrl) URL.revokeObjectURL(pendingFileUrl);
        setPendingFile(null);
        setPendingFileUrl(null);
        setShowFilePreview(false);
    };

    const handleCancelUpload = () => {
        setUploadConfirmOpen(false);
        if (pendingFileUrl) URL.revokeObjectURL(pendingFileUrl);
        setPendingFile(null);
        setPendingFileUrl(null);
        setShowFilePreview(false);
    };

    const filteredDocuments = documents.filter(doc => {
        if (typeSearch.trim()) {
            const query = typeSearch.trim().toLowerCase();
            const docType = (doc.documentType ?? '').toLowerCase();
            if (!docType.includes(query)) return false;
        }
        if (uploaderFilter !== 'All' && (doc as any).uploadedByRole !== uploaderFilter) return false;
        return true;
    });

    const totalDocPages = Math.max(1, Math.ceil(filteredDocuments.length / DOCUMENTS_PAGE_SIZE));
    const currentDocPage = Math.min(docPage, totalDocPages);
    const paginatedDocuments = filteredDocuments.slice(
        (currentDocPage - 1) * DOCUMENTS_PAGE_SIZE,
        currentDocPage * DOCUMENTS_PAGE_SIZE
    );
    const canGoPrevDoc = currentDocPage > 1;
    const canGoNextDoc = currentDocPage < totalDocPages;

    const handleTypeSearchChange = (value: string) => {
        setTypeSearch(value);
        setDocPage(1);
    };

    const handleUploaderFilterChange = (value: UploaderFilter) => {
        setUploaderFilter(value);
        setDocPage(1);
    };

    const handlePreviewSelect = async (doc: import('../../lib/employees').EmployeeDocumentDto) => {
    try {
        const payload = await getPreviewPayload(doc);
        if (!payload?.url) { toast.error('Preview could not be loaded.'); return; }
        setDrawerPreview({
            url: payload.url,
            name: payload.fileName ?? doc.fileName ?? 'Document',
            type: payload.contentType ?? doc.contentType ?? '',
        });
        setShowFilePreview(true);
    } catch {
        toast.error('Preview could not be loaded.');
    }
};

    return (
        <div className="space-y-5">
            

            <EmployeeDocumentsPanel
                employeeId={null}
                documents={paginatedDocuments}
                documentsLoading={documentsLoading}
                documentsError={documentsError}
                uploading={uploading}
                downloadingDocumentId={downloadingDocumentId}
                deletingDocumentId={deletingDocumentId}
                selectedDocumentType={selectedDocumentType}
                onSelectedDocumentTypeChange={setSelectedDocumentType}
                onUpload={handleUploadRequest}
                onDownload={download}
                onDelete={remove}
                readOnly={false}
                onPreviewSelect={handlePreviewSelect}
                activeDocumentId={null}
                renderBetween={
                    <div className="flex items-center justify-between gap-3">
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search by type..."
                                className="pro-input !pl-9 !h-12 !py-0 w-full"
                                value={typeSearch}
                                onChange={e => handleTypeSearchChange(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>

                        <div className="w-40">
                            <FilterDropdown
                                value={uploaderFilter}
                                options={['Admin', 'Employee']}
                                onSelect={(value) => handleUploaderFilterChange(value as UploaderFilter)}
                            />
                        </div>
                    </div>
                }
            />

            {!documentsLoading && filteredDocuments.length > 0 && totalDocPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <button
                        type="button"
                        onClick={() => canGoPrevDoc && setDocPage(p => p - 1)}
                        disabled={!canGoPrevDoc}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Prev
                    </button>
                    <span className="text-gray-500 text-sm font-medium">
                        Page {currentDocPage} / {totalDocPages}
                    </span>
                    <button
                        type="button"
                        onClick={() => canGoNextDoc && setDocPage(p => p + 1)}
                        disabled={!canGoNextDoc}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}

            {uploadConfirmOpen && pendingFile && (
                <ConfirmModal
                    title="Submit this file?"
                    message={
                        <div className="space-y-2">
                            <p>Are you sure you want to submit this file?</p>
                            <div className="mt-2 w-full rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-700 truncate">{pendingFile.name}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            {pendingFile.type || 'Unknown type'} • {formatPendingFileSize(pendingFile.size)}{selectedDocumentType ? ` • ${selectedDocumentType}` : ''}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowFilePreview(true)}
                                        title="View file"
                                        className="shrink-0 text-gray-400 hover:text-emerald-600 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                    onConfirm={handleConfirmUpload}
                    onCancel={handleCancelUpload}
                />
            )}

            {showFilePreview && (pendingFile || drawerPreview) && createPortal(
                <div className="fixed inset-0 z-[10001] flex justify-end">
                    <div
                        className="absolute inset-0 bg-slate-900/50"
                        onClick={() => {
                            if (drawerPreview?.url) URL.revokeObjectURL(drawerPreview.url);
                            setDrawerPreview(null);
                            setShowFilePreview(false);
                        }}
                    />
                    <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">File Preview</h2>
                            <button
                                type="button"
                                onClick={() => {
                            if (drawerPreview?.url) URL.revokeObjectURL(drawerPreview.url);
                            setDrawerPreview(null);
                            setShowFilePreview(false);
                        }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-5 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                                {drawerPreview ? drawerPreview.name : (pendingFile?.name ?? '')}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {drawerPreview
                                    ? (drawerPreview.type || 'Unknown type')
                                    : `${pendingFile?.type || 'Unknown type'} • ${formatPendingFileSize(pendingFile?.size ?? 0)}${selectedDocumentType ? ` • ${selectedDocumentType}` : ''}`}
                            </p>
                        </div>

                        <div className="flex-1 overflow-auto p-5">
                            {(() => {
                                const url  = drawerPreview ? drawerPreview.url  : pendingFileUrl;
                                const type = drawerPreview ? drawerPreview.type : (pendingFile?.type ?? '');
                                const name = drawerPreview ? drawerPreview.name : (pendingFile?.name ?? '');
                                if (!url) return null;
                                if (type === 'application/pdf' || name.endsWith('.pdf'))
                                    return <iframe src={url} title={name} className="w-full h-full rounded-lg border border-gray-200" />;
                                if (type.startsWith('image/'))
                                    return <img src={url} alt={name} className="max-w-full h-auto object-contain rounded-lg border border-gray-200" />;
                                return <div className="flex h-full items-center justify-center text-sm text-gray-400">Preview not available for this file type.</div>;
                            })()}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// ─── Activity Log Tab ─────────────────────────────────────────────────────────

const ActivityLogTab = ({ refreshKey }: { refreshKey: number }) => {
    const [searchTerm,          setSearchTerm]          = useState('');
    const [debouncedSearch,     setDebouncedSearch]     = useState('');
    const [isTodayFilterActive, setIsTodayFilterActive] = useState(false);
    const [logs,                setLogs]                = useState<ActivityLogItemDto[]>([]);
    const [page,                setPage]                = useState(1);
    const [totalCount,          setTotalCount]          = useState(0);
    const [isLoading,           setIsLoading]           = useState(true);
    const [error,               setError]               = useState<string | null>(null);

    const PAGE_SIZE = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [isTodayFilterActive]);

    useEffect(() => {
        let isMounted = true;

        const loadLogs = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getUserActivityLogs({
                    page,
                    pageSize: PAGE_SIZE,
                    search: debouncedSearch || undefined,
                });

                if (!isMounted) return;

                let data = Array.isArray(response.data) ? response.data : [];

                if (isTodayFilterActive) {
                    const todayStr = new Date().toLocaleDateString('en-CA', {
                        timeZone: 'Asia/Manila',
                    });
                    data = data.filter(
                        log => formatDateFilterPart(log.createdAt) === todayStr
                    );
                }

                setLogs(data);
                setTotalCount(isTodayFilterActive ? data.length : response.totalCount);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load activity logs.');
                setLogs([]);
                setTotalCount(0);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        void loadLogs();
        return () => { isMounted = false; };
    }, [page, debouncedSearch, isTodayFilterActive, refreshKey]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const canGoPrev = page > 1;
    const canGoNext = page < totalPages;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="pro-input !pl-9 !py-1.5 w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                <button
                    onClick={() => setIsTodayFilterActive(prev => !prev)}
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm shadow-sm transition-colors ${
                        isTodayFilterActive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Calendar size={16} className={isTodayFilterActive ? 'text-emerald-500' : 'text-gray-400'} />
                    <span className="font-medium">{isTodayFilterActive ? 'Today Only' : 'All Time'}</span>
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100 min-h-[520px]">
                <table className="pro-table min-w-full">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Action</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500 italic">
                                    Loading activity logs...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-red-500 italic">
                                    {error}
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-6 text-gray-400 italic">
                                    No logs match your search.
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id}>
                                    <td className="whitespace-nowrap !font-medium !text-gray-900">
                                        {formatDatePart(log.createdAt)}
                                    </td>
                                    <td className="whitespace-nowrap !font-medium !text-gray-900">
                                        {formatTimePart(log.createdAt)}
                                    </td>
                                    <td>
                                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getBadgeClassName(log.action)}`}>
                                            {formatActionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td className="text-gray-500">
                                        {log.summary ?? '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {!isLoading && !error && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => canGoPrev && setPage(prev => prev - 1)}
                            disabled={!canGoPrev}
                            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <span className="text-gray-500 font-medium">
                            Page {page} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => canGoNext && setPage(prev => prev + 1)}
                            disabled={!canGoNext}
                            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UserSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
        const saved = localStorage.getItem(`settings.activeTab.${user?.id}`);
        return (saved as SettingsTab) ?? 'profile';
    });
    const [logRefreshKey,  setLogRefreshKey]  = useState(0);

    const triggerLogRefresh = () => setLogRefreshKey(k => k + 1);

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Settings</h1>
                <p>Manage your profile, account security, and activity</p>
            </div>

            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                <div className="px-6 pt-4 flex">
                    <div className="overflow-x-auto scrollbar-none">
                        <div className="pro-tabs">
                            {tabs.map(tab => (
                                <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); localStorage.setItem(`settings.activeTab.${user?.id}`, tab.id); }}
                                    className={`pro-tab flex items-center gap-2 whitespace-nowrap shrink-0 w-auto !flex-none` + (activeTab === tab.id ? ' active' : '')}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className={activeTab === 'profile'   ? '' : 'hidden'}><ProfileTab  user={user} onSaved={triggerLogRefresh} ConfirmModal={ConfirmModal} /></div>
                    <div className={activeTab === 'security'  ? '' : 'hidden'}><SecurityTab user={user} onSaved={triggerLogRefresh} /></div>
                    <div className={activeTab === 'documents' ? '' : 'hidden'}><DocumentsTab onSaved={triggerLogRefresh} /></div>
                    <div className={activeTab === 'logs'      ? '' : 'hidden'}><ActivityLogTab refreshKey={logRefreshKey} /></div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
