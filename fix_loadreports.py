f = 'apps/web/src/pages/DAR/AdminDailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

content = content.replace(
    'const AdminDailyAccomplishmentReport = () => {\n  const [reports, setReports]               = useState<SubmittedReport[]>(MOCK_REPORTS);',
    '''const AdminDailyAccomplishmentReport = () => {
  const loadReports = () => {
    try {
      const subs = JSON.parse(localStorage.getItem("dar_submissions") || "[]");
      const fromStorage: SubmittedReport[] = subs.map((s: any, i: number) => ({
        id: `DAR-LS-${i}`,
        referenceNo: `DAR-LS-${String(i + 1).padStart(3, "0")}`,
        employeeName: s.devName || "Unknown",
        department: s.team || "—",
        project: s.project || "—",
        date: s.date || "—",
        submittedAt: s.submittedAt || "—",
        workArrangement: s.workArr || "On-site",
        totalActualHours: parseFloat(s.actualHrs) || 0,
        totalEstHours: parseFloat(s.estHrs) || 0,
        tasksCompleted: (s.taskDetails || []).filter((t: any) => t.status === "done").length,
        tasksTotal: (s.taskDetails || []).length,
        checklistDone: s.checklist ? s.checklist.filter(Boolean).length : 0,
        status: (s.status as ReportStatus) || "Pending Review",
      }));
      return [...fromStorage, ...MOCK_REPORTS];
    } catch {
      return MOCK_REPORTS;
    }
  };

  const [reports, setReports] = useState<SubmittedReport[]>(loadReports);'''
)

# Reload on storage event
content = content.replace(
    '  const [filterDept, setFilterDept]         = useState("All");\n  const [currentPage, setCurrentPage]       = useState(1);',
    '''  const [filterDept, setFilterDept]         = useState("All");
  const [currentPage, setCurrentPage]       = useState(1);

  // Listen for new DAR submissions
  React.useEffect(() => {
    const handler = () => setReports(loadReports());
    window.addEventListener("dar_submitted", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("dar_submitted", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);'''
)

# Add React import
content = content.replace(
    'import { useState } from "react";',
    'import React, { useState } from "react";'
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
