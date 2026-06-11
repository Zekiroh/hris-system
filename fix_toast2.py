f = 'apps/web/src/main.tsx'
content = open(f, encoding='utf-8').read()
content = content.replace(
    'position="bottom-right"',
    'position="top-right"'
)
content = content.replace(
    'toastOptions={{ duration: 3000 }}',
    'toastOptions={{ duration: 3000, style: { marginTop: "60px" } }}'
)
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
