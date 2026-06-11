f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

content = content.replace(
    '        </div>\n      )}\n\n      {/* My DAR Submissions */}',
    '        </div>\n      , document.body)}\n\n      {/* My DAR Submissions */}'
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
