const fs = require("fs");
const path = require("path");

function findTarget(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    if (["node_modules", ".git", "dist", "build"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { const f = findTarget(full); if (f) return f; }
    else if (e.name === "MyPaySlips.tsx") return full;
  }
  return null;
}

const target = process.argv[2] || findTarget(process.cwd());
if (!target || !fs.existsSync(target)) {
  console.error("❌ Hindi mahanap ang MyPaySlips.tsx"); process.exit(1);
}

let code = fs.readFileSync(target, "utf8");
const original = code;

// 1. Add createPortal import
const before1 = code;
code = code.replace(
  `import { useState, useMemo } from 'react';`,
  `import { useState, useMemo } from 'react';\nimport { createPortal } from 'react-dom';`
);
if (code !== before1) console.log("✓  Fix 1: Added createPortal import");
else console.log("ℹ️  Fix 1: createPortal already imported or not found");

// 2. Replace the entire drawer section (from {selectedPayslip && ( down to closing )})
const drawerStart = `            {/* Payslip Detail Drawer */}
            {selectedPayslip && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-20 backdrop-blur-sm" onClick={() => setSelectedPayslip(null)} />
                    <div className="fixed right-0 w-full max-w-md bg-white shadow-2xl z-30 overflow-y-auto" style={{ top: '64px', height: 'calc(100vh - 64px)', borderTop: '1px solid #e5e7eb' }}>`;

const drawerEnd = `                    </div>
                </>
            )}`;

const newDrawer = `            {/* Payslip Detail Modal */}
            {selectedPayslip && createPortal(
                <div className="pro-modal-overlay" style={{ zIndex: 9999, position: "fixed", inset: 0 }} onClick={() => setSelectedPayslip(null)}>
                    <div className="pro-modal" style={{ maxWidth: "480px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>`;

const closingReplacement = `                    </div>
                </div>
            , document.body)}`;

// Find and replace drawer start
const before2 = code;
code = code.replace(drawerStart, newDrawer);
if (code !== before2) console.log("✓  Fix 2: Replaced drawer opening with centered modal + createPortal");
else console.log("ℹ️  Fix 2: Drawer opening not found — checking alternate...");

// Find and replace drawer end
const before3 = code;
code = code.replace(drawerEnd, closingReplacement);
if (code !== before3) console.log("✓  Fix 3: Replaced drawer closing");
else console.log("ℹ️  Fix 3: Drawer closing not found");

// 3. Fix inner content — the <div className="p-6"> needs scroll wrapper
// The drawer had its own scroll via overflow-y-auto on the container
// Now we need the inner content to scroll within the modal
const before4 = code;
code = code.replace(
  `                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Payslip Details</h3>`,
  `                        <div className="pro-modal-header">
                            <h3 className="text-lg font-bold text-gray-800">Payslip Details</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handlePrint(selectedPayslip)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Print"><Printer className="w-5 h-5" /></button>
                                <button onClick={() => setSelectedPayslip(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                        </div>
                        <div className="pro-modal-body overflow-y-auto" style={{ flex: 1 }}>
                        <div className="p-2">
                            <div className="flex items-center justify-between mb-6" style={{display:"none"}}>
                                <h3 className="text-lg font-bold text-gray-800">Payslip Details</h3>`
);
if (code !== before4) console.log("✓  Fix 4: Replaced inner header with pro-modal-header + pro-modal-body");
else console.log("ℹ️  Fix 4: Inner header not found");

// 4. Remove the old print/close buttons inside the content (they're now in header)
const before5 = code;
code = code.replace(
  `                                <div className="flex items-center gap-2">
                                    <button onClick={() => handlePrint(selectedPayslip)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Print"><Printer className="w-5 h-5" /></button>
                                    <button onClick={() => setSelectedPayslip(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                                </div>
                            </div>`,
  `                            </div>`
);
if (code !== before5) console.log("✓  Fix 5: Removed duplicate print/close buttons");

// 5. Close the pro-modal-body and add footer before closing modal
const before6 = code;
code = code.replace(
  `                            <button
                                onClick={() => handlePrint(selectedPayslip)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors"
                            >
                                <Download className="w-4 h-4" /> Download / Print PDF
                            </button>
                        </div>
                    </div>
                </div>
            , document.body)}`,
  `                            <button
                                onClick={() => handlePrint(selectedPayslip)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors"
                            >
                                <Download className="w-4 h-4" /> Download / Print PDF
                            </button>
                        </div>
                        </div>
                        <div className="pro-modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setSelectedPayslip(null)}>Close</button>
                        </div>
                    </div>
                </div>
            , document.body)}`
);
if (code !== before6) console.log("✓  Fix 5: Added pro-modal-footer with Close button");
else console.log("ℹ️  Fix 5: Footer replacement not found");

if (code === original) {
  console.log("\nℹ️  Walang nabago — baka nag-iba na ang code structure.");
  process.exit(0);
}

fs.writeFileSync(target + ".payslipbak", original, "utf8");
fs.writeFileSync(target, code, "utf8");
console.log(`\n✅ Done! Payslip modal updated sa: ${target}`);
console.log(`   Backup: ${target}.payslipbak`);
