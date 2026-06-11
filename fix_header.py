f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()
content = content.replace(
    '["#","C/O","Priority","Task Type","Ticket / Ref","Task Description","Module","Status","",""]',
    '["#","C/O","Priority","Task Type","Ticket / Ref","Task Description","Module","Status","Details",""]'
)
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
