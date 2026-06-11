f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
lines = open(f, encoding='utf-8').readlines()
lines[426] = lines[426].replace('width: "110px"', 'width: "120px"')
lines[436] = lines[436].replace('width: "130px"', 'width: "160px"')
lines[444] = lines[444].replace('width: "120px"', 'width: "150px"')
open(f, 'w', encoding='utf-8').writelines(lines)
print('Done!')
