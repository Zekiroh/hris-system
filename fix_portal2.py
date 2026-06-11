f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Add createPortal import
if 'createPortal' not in content:
    content = content.replace(
        'import React, { useState, useCallback, useEffect } from "react";',
        'import React, { useState, useCallback, useEffect } from "react";\nimport { createPortal } from "react-dom";'
    )

# Wrap each modal - replace {condition && ( <div className="pro-modal-overlay"
# with {condition && createPortal( <div className="pro-modal-overlay"
# and replace closing        </div>\n      )} with </div>\n      , document.body)}

import re
content = re.sub(
    r'(\{[^&\n]+&&\s*\()\n(\s+<div className="pro-modal-overlay")',
    r'\1\n\2',
    content
)

# Manual replacements for each modal
modals = [
    ('setShowConfirm(false)', 'showConfirm'),
    ('setShowSuccess(false)', 'showSuccess'),
    ('setDeleteIdx(null)', 'deleteIdx'),
    ('setSelectedSub(null)', 'selectedSub'),
    ('setShowPreview(false)', 'showPreview'),
]

for close_fn, state in modals:
    content = content.replace(
        f'<div className="pro-modal-overlay" onClick={() => {close_fn}}>',
        f'<div className="pro-modal-overlay" onClick={{() => {close_fn}}}>'
    )

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
