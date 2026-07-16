import { Laptop, ClipboardCheck, Star, Megaphone } from 'lucide-react';
import type {
    AdminAssetTab,
    AdminEvaluationRecord,
    AssetFormState,
    AssignAssetFormState,
    AnnouncementFormState,
    ChecklistItem,
    ClearanceFormState,
    EvaluationRecord,
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

export const evaluations: AdminEvaluationRecord[] = [
    { employee: 'Dela Cruz, Juan', period: 'Q4 2025', reviewer: 'Admin Manager', score: '4.5/5.0', rating: 'Excellent', status: 'Excellent' },
    { employee: 'Santos, Maria', period: 'Q4 2025', reviewer: 'Admin Manager', score: '4.0/5.0', rating: 'Good', status: 'Good' },
    { employee: 'Reyes, Jose', period: 'Q4 2025', reviewer: 'Admin Manager', score: '3.2/5.0', rating: 'Needs Improvement', status: 'Needs Improvement' },
];

export const userEvaluations: EvaluationRecord[] = [
    {
        period: 'Q4 2025',
        reviewer: 'Admin Manager',
        score: 4.5,
        maxScore: 5.0,
        rating: 'Excellent',
        remarks:
            'Dosan consistently delivers high-quality work and demonstrates excellent teamwork. Proactive in problem-solving and a reliable asset to the department.',
        date: '2026-01-10',
    },
    {
        period: 'Q3 2025',
        reviewer: 'Admin Manager',
        score: 4.2,
        maxScore: 5.0,
        rating: 'Good',
        remarks:
            'Strong performance this quarter with consistent output. Minor areas for improvement in documentation practices.',
        date: '2025-10-08',
    },
    {
        period: 'Q2 2025',
        reviewer: 'Admin Manager',
        score: 3.9,
        maxScore: 5.0,
        rating: 'Good',
        remarks:
            'Met expectations across most KPIs. Showed improvement in communication and collaborative tasks.',
        date: '2025-07-12',
    },
];

export const userClearanceChecklist: ChecklistItem[] = [
    { key: 'laptop', label: 'Laptop Returned', done: true },
    { key: 'idCard', label: 'ID Card Returned', done: true },
    { key: 'keys', label: 'Keys Returned', done: false },
    { key: 'documents', label: 'Documents Submitted', done: true },
    {
        key: 'deptClearance',
        label: 'Department Clearance Approved',
        done: false,
    },
];
