import { Laptop, ClipboardCheck, Star, Megaphone } from 'lucide-react';
import type {
    AdminAssetTab,
    AssetFormState,
    AssignAssetFormState,
    AnnouncementFormState,
    ClearanceFormState,
    EvaluationForm,
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
    Satisfactory: 'badge-info',
    'Needs Improvement': 'badge-warning',
    Poor: 'badge-danger',
};

export const priorityBadge: Record<string, string> = {
    Normal: 'badge-neutral',
    Important: 'badge-warning',
    Urgent: 'badge-danger',
};

export type KpiCriterion = {
    key: string;
    label: string;
    description: string;
    weight: number; // percentage weight, should sum to 100 across all criteria
};

export const kpiCriteria: KpiCriterion[] = [
    { key: 'jobKnowledge', label: 'Job Knowledge', description: 'Understanding of role responsibilities and required skills', weight: 20 },
    { key: 'qualityOfWork', label: 'Quality of Work', description: 'Accuracy, thoroughness, and consistency of output', weight: 20 },
    { key: 'productivity', label: 'Productivity', description: 'Volume of work completed within expected timeframes', weight: 15 },
    { key: 'communication', label: 'Communication', description: 'Clarity and effectiveness in verbal and written communication', weight: 15 },
    { key: 'teamwork', label: 'Teamwork & Collaboration', description: 'Ability to work well with others and support team goals', weight: 15 },
    { key: 'initiative', label: 'Initiative & Problem Solving', description: 'Proactiveness in identifying and resolving issues', weight: 10 },
    { key: 'attendance', label: 'Attendance & Punctuality', description: 'Reliability in attendance and adherence to schedule', weight: 5 },
];

export const initialEvaluationForm: EvaluationForm = {
    employeeId: '',
    reviewPeriod: '',
    reviewerName: '',
    kpiScores: kpiCriteria.reduce(
        (acc, criterion) => ({ ...acc, [criterion.key]: 3 }),
        {} as Record<string, number>
    ),
    remarks: '',
};

export const getRatingFromScore = (score: number): string => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Satisfactory';
    if (score >= 1.5) return 'Needs Improvement';
    return 'Poor';
};