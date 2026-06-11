f = 'apps/web/src/pages/DAR/AdminDailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Move loadReports outside component — before AdminDailyAccomplishmentReport
content = content.replace(
    'const AdminDailyAccomplishmentReport = () => {\n  const loadReports = () => {',
    'const loadReports = () => {'
)

# Close loadReports before useState
content = content.replace(
    '      return [...fromStorage, ...MOCK_REPORTS];\n    } catch {\n      return MOCK_REPORTS;\n    }\n  };\n\n  const [reports, setReports] = useState<SubmittedReport[]>(loadReports);',
    '  return [...fromStorage, ...MOCK_REPORTS];\n  } catch {\n    return MOCK_REPORTS;\n  }\n};\n\nconst AdminDailyAccomplishmentReport = () => {\n  const [reports, setReports] = useState<SubmittedReport[]>(loadReports);'
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
