f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()
content = content.replace(
    'className="pro-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up border-t-4 border-t-emerald-600"',
    'className="pro-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in-up border-t-4 border-t-emerald-600"'
)
# Bigger text
content = content.replace(
    '<p className="text-sm text-gray-500">\n          <strong className="text-gray-700">Reminder:</strong> Submit before end of work day. Late submissions must include justification.\n        </p>',
    '<p className="text-base text-gray-500">\n          <strong className="text-gray-800 text-base">Reminder:</strong> Submit before end of work day. Late submissions must include justification.\n        </p>'
)
# Bigger buttons
content = content.replace(
    '<button type="button" className="btn btn-secondary" onClick={() => setShowPreview(true)}><Eye className="w-4 h-4" /> Preview</button>',
    '<button type="button" className="btn btn-secondary" style={{ padding: "10px 24px", fontSize: "14px" }} onClick={() => setShowPreview(true)}><Eye className="w-5 h-5" /> Preview</button>'
)
content = content.replace(
    '<button type="button" className="btn btn-primary" onClick={() => setShowConfirm(true)}><Send className="w-4 h-4" /> Submit Report</button>',
    '<button type="button" className="btn btn-primary" style={{ padding: "10px 24px", fontSize: "14px" }} onClick={() => setShowConfirm(true)}><Send className="w-5 h-5" /> Submit Report</button>'
)
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
