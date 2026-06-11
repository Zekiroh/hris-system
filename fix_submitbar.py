f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()
content = content.replace(
    'className="pro-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up"',
    'className="pro-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up border-t-4 border-t-emerald-600"'
)
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
