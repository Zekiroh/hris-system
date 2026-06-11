f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()
content = content.replace(
    '<div className="pro-modal-overlay"',
    '<div className="pro-modal-overlay" style={{ zIndex: 9999, position: "fixed", inset: 0 }}'
)
open(f, 'w', encoding='utf-8').write(content)
print("Done!")
