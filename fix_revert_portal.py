f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Replace all createPortal( ... , document.body) with safe version
content = content.replace(
    'createPortal(',
    'createPortal('
)

# Remove all portal wrapping - revert to simple conditional render
content = content.replace(' && createPortal(', ' && (')
content = content.replace(', document.body)}', ')}')

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
