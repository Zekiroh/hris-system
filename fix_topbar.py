f = 'apps/web/src/components/layout/TopBar.tsx'
content = open(f, encoding='utf-8').read()
content = content.replace(
    'if (unread.length > 0 && isAdminRef.current) {',
    'if (unread.length > 0 && isAdmin) {'
)
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
