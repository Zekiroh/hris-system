import type { LucideIcon } from 'lucide-react';

export type AdminAssetTab = {
    id: 'inventory' | 'clearance' | 'evaluation' | 'announcements';
    label: string;
    icon: LucideIcon;
};

export type ReturnReviewAction = 'approve' | 'reject';

export type ClearanceFormState = {
    employeeId: string;
    lastWorkingDay: string;
    remarks: string;
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

export type EvaluationForm = {
    employeeId: string;
    reviewPeriod: string;
    reviewerName: string;
    kpiScores: Record<string, number>;
    remarks: string;
};
