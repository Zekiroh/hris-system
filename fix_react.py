f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
lines = open(f, encoding='utf-8').readlines()

# Fix 1: Add React import
lines[0] = '// apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx\nimport React, { useState, useCallback, useEffect } from "react";\n'

# Remove old import line
lines[1] = ''

# Fix 2: Fix updateTask to accept boolean too
for i, l in enumerate(lines):
    if 'id: number, field: keyof TaskRow, value: string' in l:
        lines[i] = l.replace('id: number, field: keyof TaskRow, value: string', 'id: number, field: keyof TaskRow, value: string | boolean')
        break

open(f, 'w', encoding='utf-8').writelines(lines)
print('Done!')
