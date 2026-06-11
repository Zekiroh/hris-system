f = 'apps/web/src/main.tsx'
content = open(f, encoding='utf-8').read()
content = content.replace(
    'position="top-right"',
    'position="bottom-right"'
)
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
