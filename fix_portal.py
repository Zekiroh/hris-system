f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Add createPortal import
content = content.replace(
    'import React, { useState, useCallback, useEffect } from "react";',
    'import React, { useState, useCallback, useEffect } from "react";\nimport { createPortal } from "react-dom";'
)

# Wrap delete modal with portal
content = content.replace(
    '      {/* Delete Confirm Modal */}\n      {deleteIdx !== null && (\n        <div className="pro-modal-overlay"',
    '      {/* Delete Confirm Modal */}\n      {deleteIdx !== null && createPortal(\n        <div className="pro-modal-overlay"'
)

content = content.replace(
    '        </div>\n      )}\n\n      {/* Submission View Modal */}',
    '        </div>\n      , document.body)}\n\n      {/* Submission View Modal */}'
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
