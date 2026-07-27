import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Settings,
  Shield,
} from "lucide-react";

import type { Tab } from "./types";

export const tabs = [
  { id: "configuration" as Tab, label: "Configuration", icon: Settings },
  { id: "summary" as Tab, label: "Compliance Summary", icon: CheckCircle },
  { id: "sss" as Tab, label: "SSS", icon: Shield },
  { id: "philhealth" as Tab, label: "PhilHealth", icon: CheckCircle },
  { id: "pagibig" as Tab, label: "Pag-IBIG", icon: Shield },
  { id: "bir" as Tab, label: "BIR 2316", icon: AlertTriangle },
  { id: "history" as Tab, label: "Employment History", icon: FileText },
];
