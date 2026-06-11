f = 'apps/web/src/components/layout/Sidebar.tsx'
content = open(f, encoding='utf-8').read()
content = content.replace(
    '"/dashboard/daily-accomplishment-admin"',
    '"/dashboard/daily-accomplishment-reports"'
)
open(f, 'w', encoding='utf-8').write(content)
print("Done!")
