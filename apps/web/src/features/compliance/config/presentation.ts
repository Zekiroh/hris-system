import {
  AlertTriangle,
  CheckCircle,
  Mail,
  Settings,
  Shield,
  XCircle,
} from "lucide-react";

import type { Tab } from "./types";

export const tabs = [
  { id: "configuration" as Tab, label: "Configuration", icon: Settings },
  { id: "sss" as Tab, label: "SSS", icon: Shield },
  { id: "philhealth" as Tab, label: "PhilHealth", icon: CheckCircle },
  { id: "pagibig" as Tab, label: "Pag-IBIG", icon: Shield },
  { id: "bir" as Tab, label: "BIR 2316", icon: AlertTriangle },
  { id: "history" as Tab, label: "Employment History", icon: Mail },
];

export const statCards = [
  {
    label: "SSS Compliant",
    value: 245,
    icon: CheckCircle,
    gradient: "linear-gradient(135deg, #059669, #10b981)",
  },
  {
    label: "PhilHealth Current",
    value: 245,
    icon: CheckCircle,
    gradient: "linear-gradient(135deg, #2563eb, #3b82f6)",
  },
  {
    label: "Pag-IBIG",
    value: 245,
    icon: AlertTriangle,
    gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
  },
  {
    label: "Pending 2316",
    value: 12,
    icon: XCircle,
    gradient: "linear-gradient(135deg, #dc2626, #ef4444)",
  },
];

export const statusBadge: Record<string, string> = {
  Current: "badge-success",
  Pending: "badge-warning",
  Remitted: "badge-success",
  Signed: "badge-success",
  "Pending Signature": "badge-warning",
  Due: "badge-danger",
  Paid: "badge-success",
  Submitted: "badge-success",
  Cleared: "badge-info",
  Completed: "badge-success",
};

export const sssData = [
  {
    empId: "EMP-001",
    name: "Dela Cruz, Juan",
    sssNo: "34-1234567-8",
    monthly: "₱1,560",
    empShare: "₱630",
    erShare: "₱930",
    status: "Current",
  },
  {
    empId: "EMP-002",
    name: "Santos, Maria",
    sssNo: "34-2345678-9",
    monthly: "₱2,080",
    empShare: "₱840",
    erShare: "₱1,240",
    status: "Current",
  },
  {
    empId: "EMP-003",
    name: "Reyes, Jose",
    sssNo: "34-3456789-0",
    monthly: "₱1,200",
    empShare: "₱480",
    erShare: "₱720",
    status: "Pending",
  },
];

export const philhealthData = [
  {
    empId: "EMP-001",
    name: "Dela Cruz, Juan",
    phNo: "12-123456789-0",
    rate: "5.0%",
    monthly: "₱1,000",
    empShare: "₱500",
    erShare: "₱500",
    status: "Current",
  },
  {
    empId: "EMP-002",
    name: "Santos, Maria",
    phNo: "12-234567890-1",
    rate: "5.0%",
    monthly: "₱1,250",
    empShare: "₱625",
    erShare: "₱625",
    status: "Current",
  },
];

export const pagibigData = [
  {
    name: "Dela Cruz, Juan",
    midNo: "1234-5678-9012",
    mandatory: "₱200",
    mp2: "₱500",
    total: "₱700",
    status: "Remitted",
  },
  {
    name: "Santos, Maria",
    midNo: "2345-6789-0123",
    mandatory: "₱200",
    mp2: "-",
    total: "₱200",
    status: "Remitted",
  },
  {
    name: "Reyes, Jose",
    midNo: "3456-7890-1234",
    mandatory: "₱200",
    mp2: "₱300",
    total: "₱500",
    status: "Remitted",
  },
];

export const birData = [
  {
    name: "Dela Cruz, Juan",
    tin: "123-456-789-000",
    taxableIncome: "₱480,000",
    taxWithheld: "₱48,000",
    formStatus: "Signed",
  },
  {
    name: "Santos, Maria",
    tin: "234-567-890-001",
    taxableIncome: "₱540,000",
    taxWithheld: "₱62,000",
    formStatus: "Signed",
  },
  {
    name: "Reyes, Jose",
    tin: "345-678-901-002",
    taxableIncome: "₱360,000",
    taxWithheld: "₱28,000",
    formStatus: "Pending Signature",
  },
];

export const historyData = [
  {
    date: "2026-02-20",
    employee: "Fernandez, Rosa",
    event: "Enrollment",
    reportedTo: "SSS",
    status: "Submitted",
  },
  {
    date: "2026-02-15",
    employee: "Bautista, Pedro",
    event: "Separation",
    reportedTo: "SSS / PhilHealth / Pag-IBIG",
    status: "Completed",
  },
  {
    date: "2026-01-10",
    employee: "Garcia, Ana",
    event: "Status Update",
    reportedTo: "PhilHealth",
    status: "Cleared",
  },
];

export const remittanceSchedule = [
  { month: "January 2026", dueDate: "Feb 10, 2026", status: "Paid" },
  { month: "February 2026", dueDate: "Mar 10, 2026", status: "Due" },
];
