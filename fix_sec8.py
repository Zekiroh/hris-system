f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()
content = content.replace('num={7} title="Acknowledgment"', 'num={8} title="Acknowledgment"')
content = content.replace('{/* Section 7: Acknowledgment */}', '{/* Section 8: Acknowledgment */}')
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
