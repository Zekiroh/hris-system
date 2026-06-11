f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
lines = open(f, encoding='utf-8').readlines()
for i, l in enumerate(lines):
    if 'width: "120px"' in l and i < 450:
        lines[i] = l.replace('width: "120px"', 'width: "140px"')
        print(f"Fixed line {i+1}")
        break
open(f, 'w', encoding='utf-8').writelines(lines)
print('Done!')
