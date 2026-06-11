const fs = require("fs");
const path = require("path");

const target = "C:\\Users\\Stars\\hris-system\\apps\\web\\src\\pages\\user\\MyPaySlips.tsx";

let code = fs.readFileSync(target, "utf8");
const original = code;

// Fix 1: createPortal import
if (!code.includes("createPortal")) {
  code = code.replace(
    `import { useState, useMemo } from 'react';`,
    `import { useState, useMemo } from 'react';\nimport { createPortal } from 'react-dom';`
  );
  console.log("✓  Fix 1: Added createPortal import");
} else {
  console.log("✓  Fix 1: createPortal already imported");
}

// Fix 2: Replace drawer opening — exact strings from Get-Content output
const oldOpen = `            {/* Payslip Detail Drawer */}
            {selectedPayslip && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-20 backdrop-blur-sm" onClick={() => setSelectedPayslip(null)} />
                    <div className="fixed right-0 w-full max-w-md bg-white shadow-2xl z-30 overflow-y-auto" style={{ top: '64px', height: 'calc(100vh - 64px)', borderTop: '1px solid #e5e7eb' }}>`;

const newOpen = `            {/* Payslip Detail Modal */}
            {selectedPayslip && createPortal(
                <div className="pro-modal-overlay" onClick={() => setSelectedPayslip(null)}>
                    <div className="pro-modal" style={{ maxWidth: "520px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>`;

const before2 = code;
code = code.replace(oldOpen, newOpen);
if (code !== before2) console.log("✓  Fix 2: Replaced drawer opening");
else console.log("❌ Fix 2: Not found");

// Fix 3: Replace the <> closing and )} with portal closing
const oldClose = `                    </div>
                </>
            )}`;

const newClose = `                    </div>
                </div>
            , document.body)}`;

const before3 = code;
code = code.replace(oldClose, newClose);
if (code !== before3) console.log("✓  Fix 3: Replaced drawer closing");
else console.log("❌ Fix 3: Not found");

// Fix 4: Wrap content in pro-modal-header + pro-modal-body
const oldHeader = `                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Payslip Details</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handlePrint(selectedPayslip)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Print"><Printer className="w-5 h-5" /></button>
                                    <button onClick={() => setSelectedPayslip(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                                </div>
                            </div>`;

const newHeader = `                        <div className="pro-modal-header">
                            <h3 className="text-lg font-bold text-gray-800">Payslip Details</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handlePrint(selectedPayslip)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Print"><Printer className="w-5 h-5" /></button>
                                <button onClick={() => setSelectedPayslip(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                        </div>
                        <div className="pro-modal-body" style={{ overflowY: "auto", flex: 1 }}>
                        <div className="p-6">`;

const before4 = code;
code = code.replace(oldHeader, newHeader);
if (code !== before4) console.log("✓  Fix 4: Added pro-modal-header + pro-modal-body");
else console.log("❌ Fix 4: Not found");

// Fix 5: Close pro-modal-body and add footer before portal close
// Find the Download/Print button section near the end of the drawer
const oldFooter = `                            </button>
                        </div>
                    </div>
                </div>
            , document.body)}`;

const newFooter = `                            </button>
                        </div>
                        </div>{/* end pro-modal-body inner */}
                        </div>{/* end pro-modal-body */}
                        <div className="pro-modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setSelectedPayslip(null)}>Close</button>
                        </div>
                    </div>
                </div>
            , document.body)}`;

const before5 = code;
code = code.replace(oldFooter, newFooter);
if (code !== before5) console.log("✓  Fix 5: Added pro-modal-footer");
else console.log("❌ Fix 5: Footer not found — searching alternate...");

if (code === original) {
  console.log("\nℹ️  Walang nabago.");
  process.exit(0);
}

fs.writeFileSync(target + ".bak2", original, "utf8");
fs.writeFileSync(target, code, "utf8");
console.log(`\n✅ Done! Updated: ${target}`);
console.log(`   Backup: ${target}.bak2`);
