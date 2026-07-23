import { useState, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import type { EmployeeDocumentDto, EmployeeDocumentType } from '../../../services/api/employees/employees';
import { useMyDocuments } from '../../../features/employees/hooks/useMyDocuments';
import { EmployeeDocumentsPanel, DocumentTypeDropdown } from '../../../features/employees/components/EmployeeDocumentsPanel';

type ConfirmModalComponent = (props: {
    title:    string;
    message:  ReactNode;
    onConfirm: () => void;
    onCancel:  () => void;
}) => ReactElement;

type DocumentsTabProps = {
    onSaved?: () => void;
    ConfirmModal: ConfirmModalComponent;
};

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
            value={value as EmployeeDocumentType}
            options={allOptions as readonly EmployeeDocumentType[]}
            onSelect={onSelect as (value: EmployeeDocumentType) => void}
            disabled={disabled}
        />
    );
}

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

const DocumentsTab = ({ onSaved, ConfirmModal }: DocumentsTabProps) => {
    const [uploadConfirmOpen, setUploadConfirmOpen] = useState(false);
    const [drawerPreview, setDrawerPreview] = useState<DocumentPreviewState>(null);
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
        if (uploaderFilter !== 'All' && (doc as EmployeeDocumentDto & { uploadedByRole?: UploaderFilter }).uploadedByRole !== uploaderFilter) return false;
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

    const handlePreviewSelect = async (doc: EmployeeDocumentDto) => {
    try {
        const payload = await getPreviewPayload(doc);
        if (!payload?.url) { toast.error('Preview could not be loaded.'); return; }
        setDrawerPreview({
            url: payload.url,
            fileName: payload.fileName ?? doc.fileName ?? 'Document',
            contentType: payload.contentType ?? doc.contentType ?? '',
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
                                {drawerPreview ? drawerPreview.fileName : (pendingFile?.name ?? '')}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {drawerPreview
                                    ? (drawerPreview.contentType || 'Unknown type')
                                    : `${pendingFile?.type || 'Unknown type'} • ${formatPendingFileSize(pendingFile?.size ?? 0)}${selectedDocumentType ? ` • ${selectedDocumentType}` : ''}`}
                            </p>
                        </div>

                        <div className="flex-1 overflow-auto p-5">
                            {(() => {
                                const url  = drawerPreview ? drawerPreview.url  : pendingFileUrl;
                                const type = drawerPreview ? (drawerPreview.contentType ?? '') : (pendingFile?.type ?? '');
                                const name = drawerPreview ? (drawerPreview.fileName ?? '') : (pendingFile?.name ?? '');
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

export default DocumentsTab;