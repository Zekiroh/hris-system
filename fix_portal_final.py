f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Add createPortal import
if 'createPortal' not in content:
    content = content.replace(
        'import React, { useState, useCallback, useEffect } from "react";',
        'import React, { useState, useCallback, useEffect } from "react";\nimport { createPortal } from "react-dom";'
    )

# Wrap all 5 modals
pairs = [
    ('{showConfirm && (', '{showConfirm && createPortal(', ')}\n\n      {/* Success Modal */}', ', document.body)}\n\n      {/* Success Modal */}'),
    ('{showSuccess && (', '{showSuccess && createPortal(', ')}\n\n      {/* Delete Confirm Modal */}', ', document.body)}\n\n      {/* Delete Confirm Modal */}'),
    ('{deleteIdx !== null && (', '{deleteIdx !== null && createPortal(', ')}\n\n      {/* Submission View Modal */}', ', document.body)}\n\n      {/* Submission View Modal */}'),
    ('{selectedSub && (', '{selectedSub && createPortal(', ')}\n\n      {/* Preview Modal */}', ', document.body)}\n\n      {/* Preview Modal */}'),
    ('{showPreview && (', '{showPreview && createPortal(', ')}\n    </div>', ', document.body)}\n    </div>'),
]

for open_old, open_new, close_old, close_new in pairs:
    content = content.replace(open_old, open_new)
    content = content.replace(close_old, close_new)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
