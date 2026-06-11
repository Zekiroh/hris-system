f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Make sure createPortal is imported
if 'createPortal' not in content:
    content = content.replace(
        'import React, { useState, useCallback, useEffect } from "react";',
        'import React, { useState, useCallback, useEffect } from "react";\nimport { createPortal } from "react-dom";'
    )

# Wrap all 5 modals with portal - find each {( ... )} pattern around pro-modal-overlay
import re

# Pattern: {someCondition && (\n        <div className="pro-modal-overlay"...closing div\n      )}
# Replace opening
content = re.sub(
    r'(\{[^}]+&&\s*\()\n(\s*<div className="pro-modal-overlay")',
    r'\1\n        createPortal(\2',
    content
)

# Replace closing - find ", document.body)}" pattern already done for deleteIdx, do others
# Find all "      )}\n\n      {/*" and replace with portal closing if not already done
lines = content.split('\n')
result = []
i = 0
while i < len(lines):
    result.append(lines[i])
    i += 1

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
