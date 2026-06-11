f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
lines = open(f, encoding='utf-8').readlines()
result = []
i = 0
while i < len(lines):
    l = lines[i]
    # Skip priority badge block
    if 'task.priority === "High" ? "badge-danger"' in l and 'badge mt-1' in l:
        i += 1
        continue
    if '{task.priority && (' in l:
        # skip until closing )}
        depth = 0
        while i < len(lines):
            if '(' in lines[i]: depth += lines[i].count('(')
            if ')' in lines[i]: depth -= lines[i].count(')')
            i += 1
            if depth <= 0:
                break
        continue
    # Skip status badge block
    if '{task.status && (' in l:
        depth = 0
        while i < len(lines):
            if '(' in lines[i]: depth += lines[i].count('(')
            if ')' in lines[i]: depth -= lines[i].count(')')
            i += 1
            if depth <= 0:
                break
        continue
    result.append(l)
    i += 1
open(f, 'w', encoding='utf-8').writelines(result)
print('Done! Lines:', len(result))
