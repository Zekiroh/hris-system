f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

content = content.replace(
    'onClick={() => setDeleteIdx(idx)}',
    'onClick={() => setDeleteIdx(i)}'
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
