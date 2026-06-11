f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Add submissions state near the top states
content = content.replace(
    '  const [subSearch, setSubSearch] = React.useState("");',
    '  const [subSearch, setSubSearch] = React.useState("");\n  const [submissions, setSubmissions] = React.useState<any[]>(() => JSON.parse(localStorage.getItem("dar_submissions") || "[]"));'
)

# Replace localStorage read inside IIFE with state
content = content.replace(
    '''          const submissions: Array<{ date: string; project: string; tasks: number; checklist: number; status: string; submittedAt: string; workArr?: string }> =
            JSON.parse(localStorage.getItem("dar_submissions") || "[]");''',
    '          // submissions loaded from state'
)

# Fix delete to use setSubmissions properly
content = content.replace(
    '''                  subs.splice(deleteIdx, 1);
                  localStorage.setItem("dar_submissions", JSON.stringify(subs));
                  setSubSearch(v => v);''',
    '''                  subs.splice(deleteIdx, 1);
                  localStorage.setItem("dar_submissions", JSON.stringify(subs));
                  setSubmissions([...subs]);'''
)

# Also update handleSubmit to refresh submissions state after submit
content = content.replace(
    "    localStorage.setItem(\"dar_submissions\", JSON.stringify([sub, ...subs]));\n    setShowConfirm(false);",
    "    const newSubs = [sub, ...subs];\n    localStorage.setItem(\"dar_submissions\", JSON.stringify(newSubs));\n    setSubmissions(newSubs);\n    setShowConfirm(false);"
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
