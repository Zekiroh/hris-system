f = 'apps/web/src/pages/DAR/AdminDailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Fix loadReports to use correct field names
old = '''const loadReports = () => {
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
};'''

new = '''const loadReports = (): SubmittedReport[] => {
  try {
    const subs = JSON.parse(localStorage.getItem("dar_submissions") || "[]");
    const fromStorage: SubmittedReport[] = subs.map((s: any, i: number) => ({
      id: `DAR-LS-${i}-${s.date}-${s.devName}`,
      referenceNo: `DAR-${s.date?.replace(/-/g,"")}-${String(i + 1).padStart(3, "0")}`,
      employeeName: s.devName || "Unknown",
      department: s.team || "—",
      project: s.project || "—",
      date: s.date || "—",
      submittedAt: s.submittedAt || "—",
      workArrangement: s.workArr || "On-site",
      totalActualHours: (s.taskDetails || []).reduce((acc: number, t: any) => acc + (parseFloat(t.actualHrs) || 0), 0),
      totalEstHours: (s.taskDetails || []).reduce((acc: number, t: any) => acc + (parseFloat(t.estHrs) || 0), 0),
      tasksCompleted: (s.taskDetails || []).filter((t: any) => t.status === "done").length,
      tasksTotal: (s.taskDetails || []).length || 1,
      checklistDone: Array.isArray(s.checklistDone) ? s.checklistDone.filter(Boolean).length : 0,
      status: (s.status as ReportStatus) || "Pending Review",
    }));
    return [...fromStorage, ...MOCK_REPORTS];
  } catch {
    return MOCK_REPORTS;
  }
};'''

content = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(content)
print("Done!")
