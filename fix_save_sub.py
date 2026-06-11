f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()
content = content.replace(
    'setShowConfirm(false);\n    setShowSuccess(true);',
    '''const sub = {
      date,
      project,
      tasks: tasks.length,
      checklist: checklist.filter(Boolean).length,
      status: "Pending Review",
      submittedAt: timeStr,
    };
    const subs = JSON.parse(localStorage.getItem("dar_submissions") || "[]");
    localStorage.setItem("dar_submissions", JSON.stringify([sub, ...subs]));
    setShowConfirm(false);
    setShowSuccess(true);'''
)
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
