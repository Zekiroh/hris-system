f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
lines = open(f, encoding='utf-8').readlines()
lines[436] = lines[436].replace('width: "160px"', 'width: "200px"')
open(f, 'w', encoding='utf-8').writelines(lines)
print('Done!')
