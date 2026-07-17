import { Laptop, ClipboardCheck, Star, Megaphone } from 'lucide-react';
import type {
    AdminAssetTab,
    AssetFormState,
    AssignAssetFormState,
    AnnouncementFormState,
    ClearanceFormState,
    UserAssetTab,
} from './assetManagementTypes';

export const initialAssetForm: AssetFormState = {
    assetCode: '',
    assetName: '',
    category: 'IT Equipment',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    status: 'Available',
    notes: '',
};

export const createInitialAssignForm = (): AssignAssetFormState => ({
    employeeId: '',
    assignedDate: new Date().toISOString().slice(0, 10),
    remarks: '',
});

export const initialAnnouncementForm: AnnouncementFormState = {
    title: '',
    priority: 'Normal',
    content: '',
};

export const initialClearanceForm: ClearanceFormState = {
    employeeId: '',
    lastWorkingDay: '',
    remarks: '',
};

export const adminAssetTabs: AdminAssetTab[] = [
    { id: 'inventory', label: 'Laptop Monitoring', icon: Laptop },
    { id: 'clearance', label: 'Clearance & Exit', icon: ClipboardCheck },
    { id: 'evaluation', label: 'Performance Evaluation', icon: Star },
    { id: 'announcements', label: 'Announcement Board', icon: Megaphone },
];

export const userAssetTabs: UserAssetTab[] = [
    { id: 'assets', label: 'My Assets', icon: Laptop },
    { id: 'clearance', label: 'My Clearance', icon: ClipboardCheck },
    { id: 'evaluation', label: 'My Evaluation', icon: Star },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
];

export const assetStatusBadge: Record<string, string> = {
    'In Use': 'badge-success',
    Available: 'badge-info',
    Maintenance: 'badge-warning',
    'Under Maintenance': 'badge-warning',
    'Needs Replacement': 'badge-danger',
    Disposed: 'badge-neutral',
};

export const clearanceStatusBadge: Record<string, string> = {
    Pending: 'badge-warning',
    InProgress: 'badge-warning',
    Completed: 'badge-success',
};

export const announcementStatusBadge: Record<string, string> = {
    Published: 'badge-success',
    Draft: 'badge-neutral',
};

export const returnRequestStatusBadge: Record<string, string> = {
    Pending: 'badge-warning',
    Approved: 'badge-success',
    Rejected: 'badge-danger',
};

export const ratingBadge: Record<string, string> = {
    Excellent: 'badge-success',
    Good: 'badge-info',
    'Needs Improvement': 'badge-warning',
};

export const priorityBadge: Record<string, string> = {
    Normal: 'badge-neutral',
    Important: 'badge-warning',
    Urgent: 'badge-danger',
};
