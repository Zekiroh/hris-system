import type { LucideIcon } from 'lucide-react';

export type AdminAssetTab = {
    id: 'inventory' | 'clearance' | 'evaluation' | 'announcements';
    label: string;
    icon: LucideIcon;
};

export type ClearanceStatus = 'In Progress' | 'Completed';

export type ReturnReviewAction = 'approve' | 'reject';

export type ClearanceChecklist = {
    laptop: boolean;
    idCard: boolean;
    keys: boolean;
    documents: boolean;
    deptClearance: boolean;
};

export type ClearanceRecord = {
    id: string;
    employee: string;
    empId: string;
    department: string;
    lastDay: string;
    status: ClearanceStatus;
    checklist: ClearanceChecklist;
};

export type ClearanceFormState = {
    employee: string;
    department: string;
    lastDay: string;
    notes: string;
};

export type AssetFormState = {
    assetCode: string;
    assetName: string;
    category: string;
    brand: string;
    model: string;
    serialNumber: string;
    purchaseDate: string;
    status: string;
    notes: string;
};

export type AssignAssetFormState = {
    employeeId: string;
    assignedDate: string;
    remarks: string;
};

export type AnnouncementFormState = {
    title: string;
    priority: string;
    content: string;
};

export type UserAssetTab = {
    id: 'assets' | 'clearance' | 'evaluation' | 'announcements';
    label: string;
    icon: LucideIcon;
};

export type ChecklistItem = {
    key: string;
    label: string;
    done: boolean;
};

export type EvaluationRecord = {
    period: string;
    reviewer: string;
    score: number;
    maxScore: number;
    rating: string;
    remarks: string;
    date: string;
};
