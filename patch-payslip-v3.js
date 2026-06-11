const fs = require("fs");

const target = "C:\\Users\\Stars\\hris-system\\apps\\web\\src\\pages\\user\\MyPaySlips.tsx";
let code = fs.readFileSync(target, "utf8");

// Normalize line endings to LF for processing
const hasCRLF = code.includes("\r\n");
if (hasCRLF) code = code.replace(/\r\n/g, "\n");

const lines = code.split("\n");
const original = lines.join(hasCRLF ? "\r\n" : "\n");

// Find the drawer start line
const drawerStartIdx = lines.findIndex(l => l.includes("{/* Payslip Detail Drawer */}"));
if (drawerStartIdx === -1) {
  console.log("❌ Hindi mahanap ang drawer comment");
  process.exit(1);
}
console.log(`✓ Found drawer at line ${drawerStartIdx + 1}`);

// Find the closing </> after the drawer (search forward from drawer start)
let drawerEndIdx = -1;
for (let i = drawerStartIdx + 1; i < lines.length; i++) {
  if (lines[i].trim() === "</>") {
    drawerEndIdx = i;
    break;
  }
}
if (drawerEndIdx === -1) {
  console.log("❌ Hindi mahanap ang closing </>");
  process.exit(1);
}
console.log(`✓ Found drawer end (</>) at line ${drawerEndIdx + 1}`);

// Find the )} that closes the {selectedPayslip && (
let drawerParenIdx = -1;
for (let i = drawerEndIdx + 1; i < lines.length; i++) {
  if (lines[i].trim() === ")}") {
    drawerParenIdx = i;
    break;
  }
}
if (drawerParenIdx === -1) {
  console.log("❌ Hindi mahanap ang closing )}");
  process.exit(1);
}
console.log(`✓ Found )} at line ${drawerParenIdx + 1}`);

// Build the replacement — centered modal with createPortal
// Indent: 12 spaces (matching the drawer's indentation)
const indent = "            ";
const newLines = [
  `${indent}{/* Payslip Detail Modal */}`,
  `${indent}{selectedPayslip && createPortal(`,
  `${indent}    <div className="pro-modal-overlay" onClick={() => setSelectedPayslip(null)}>`,
  `${indent}        <div className="pro-modal" style={{ maxWidth: "520px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>`,
  `${indent}            <div className="pro-modal-header">`,
  `${indent}                <h3 className="text-lg font-bold text-gray-800">Payslip Details</h3>`,
  `${indent}                <div className="flex items-center gap-2">`,
  `${indent}                    <button onClick={() => handlePrint(selectedPayslip)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Print"><Printer className="w-5 h-5" /></button>`,
  `${indent}                    <button onClick={() => setSelectedPayslip(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>`,
  `${indent}                </div>`,
  `${indent}            </div>`,
  `${indent}            <div className="pro-modal-body" style={{ overflowY: "auto", flex: 1 }}>`,
  `${indent}            <div className="p-6">`,
];

// Copy all lines from inside the old drawer's <div className="p-6"> content
// That starts after the header div (we skip the old header lines)
// Old structure: line drawerStartIdx = comment, drawerStartIdx+1 = {selectedPayslip && (, 
// drawerStartIdx+2 = <>, drawerStartIdx+3 = overlay div, drawerStartIdx+4 = drawer div
// drawerStartIdx+5 = <div className="p-6">, drawerStartIdx+6 = old flex header, ...
// We want content starting after the old header block ends (after the closing </div> of the flex header)

// Find the line with <div className="p-6">
const p6Idx = lines.findIndex((l, i) => i > drawerStartIdx && l.includes('<div className="p-6">'));
console.log(`✓ Found p-6 div at line ${p6Idx + 1}`);

// Find the end of the old header block: look for the closing </div> of the flex justify-between
// It's the </div> that closes the flex header (after the two buttons)
// We'll find it by looking for the line after the X button's </button> that is just spaces+</div>
const xButtonIdx = lines.findIndex((l, i) => i > p6Idx && l.includes('setSelectedPayslip(null)') && l.includes('X className'));
console.log(`✓ Found X button at line ${xButtonIdx + 1}`);

// The header ends 3 lines after the X button: </div>(buttons), </div>(flex header)
// Then the actual content starts
// Let's find: after xButtonIdx, find 2 closing </div> lines
let closingCount = 0;
let contentStartIdx = -1;
for (let i = xButtonIdx + 1; i < lines.length; i++) {
  if (lines[i].trim() === "</div>") {
    closingCount++;
    if (closingCount === 2) {
      contentStartIdx = i + 1;
      break;
    }
  }
}
console.log(`✓ Content starts at line ${contentStartIdx + 1}`);

// Collect content lines up to (but not including) the Download button's closing </div>
// The drawer content ends with: </button>\n        </div>\n    </div>\n</>\n)}
// We want up to and including the Download button
// Find the Download/Print button line
const downloadIdx = lines.findIndex((l, i) => i > contentStartIdx && l.includes('Download / Print PDF'));
console.log(`✓ Download button at line ${downloadIdx + 1}`);

// Content lines: from contentStartIdx to downloadIdx (inclusive)
const contentLines = lines.slice(contentStartIdx, downloadIdx + 1);

// Re-indent content lines: old indent was 28 spaces (12 + 16 for inside the drawer)
// New indent should be 28 spaces too (12 indent + 16 inside modal)
// Actually let's just keep them as-is since indentation is same depth

const closingLines = [
  `${indent}            </div>`,  // close p-6
  `${indent}            </div>`,  // close pro-modal-body
  `${indent}            <div className="pro-modal-footer">`,
  `${indent}                <button type="button" className="btn btn-secondary" onClick={() => setSelectedPayslip(null)}>Close</button>`,
  `${indent}            </div>`,
  `${indent}        </div>`,      // close pro-modal
  `${indent}    </div>`,          // close pro-modal-overlay
  `${indent}, document.body)}`,
];

// Replace lines from drawerStartIdx to drawerParenIdx (inclusive)
const newSection = [...newLines, ...contentLines, ...closingLines];
lines.splice(drawerStartIdx, drawerParenIdx - drawerStartIdx + 1, ...newSection);

console.log(`✓ Replaced ${drawerParenIdx - drawerStartIdx + 1} lines with ${newSection.length} lines`);

// Write back
const output = lines.join(hasCRLF ? "\r\n" : "\n");
fs.writeFileSync(target + ".v3bak", original.replace(/\n/g, hasCRLF ? "\r\n" : "\n"), "utf8");
fs.writeFileSync(target, output, "utf8");
console.log(`\n✅ Done! Updated: ${target}`);
console.log(`   Backup: ${target}.v3bak`);
