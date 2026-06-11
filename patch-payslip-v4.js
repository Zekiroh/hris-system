const fs = require("fs");

const target = "C:\\Users\\Stars\\hris-system\\apps\\web\\src\\pages\\user\\MyPaySlips.tsx";
const backup = target + ".v3bak";

// Restore from backup first
if (fs.existsSync(backup)) {
  fs.copyFileSync(backup, target);
  console.log("✓ Restored from backup");
} else {
  console.log("⚠️  No v3bak found, working with current file");
}

let code = fs.readFileSync(target, "utf8");
const hasCRLF = code.includes("\r\n");
if (hasCRLF) code = code.replace(/\r\n/g, "\n");

// Find start: {/* Payslip Detail Drawer */}
const startMarker = "            {/* Payslip Detail Drawer */}";
const startIdx = code.indexOf(startMarker);
if (startIdx === -1) { console.log("❌ Start marker not found"); process.exit(1); }

// Find end: the closing )} after the drawer
// The drawer ends with: </div>\n                </>\n            )}
const endMarker = "\n            )}";
// We need the LAST )} in the file (after the drawer)
// Find it by looking for the pattern after startIdx
let searchFrom = startIdx;
let endIdx = -1;
while (true) {
  const found = code.indexOf(endMarker, searchFrom + 1);
  if (found === -1) break;
  // Check this is the one after the drawer (should be close to end of file)
  endIdx = found;
  searchFrom = found;
}
// endIdx points to \n            )} — we want to include all of that
const replaceEnd = endIdx + endMarker.length;

console.log(`✓ Drawer section: chars ${startIdx} to ${replaceEnd}`);

const newDrawer = `            {/* Payslip Detail Modal */}
            {selectedPayslip && createPortal(
                <div className="pro-modal-overlay" onClick={() => setSelectedPayslip(null)}>
                    <div
                        className="pro-modal"
                        style={{ maxWidth: "520px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="pro-modal-header">
                            <h3 className="text-lg font-bold text-gray-800">Payslip Details</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handlePrint(selectedPayslip)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Print"><Printer className="w-5 h-5" /></button>
                                <button onClick={() => setSelectedPayslip(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                        </div>
                        <div className="pro-modal-body" style={{ overflowY: "auto", flex: 1, padding: "24px" }}>
                            <div className="text-center mb-6 pb-6 border-b border-gray-100">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                                    <span className="text-emerald-600 font-bold text-sm">SV</span>
                                </div>
                                <p className="text-sm font-bold text-gray-800">SIMPLEVIA Technologies, Inc.</p>
                                <p className="text-xs text-gray-400">Employee Payslip</p>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                                    {[
                                        ['Employee', selectedPayslip.employee],
                                        ['Employee ID', selectedPayslip.empId],
                                        ['Department', selectedPayslip.department],
                                        ['Position', selectedPayslip.position],
                                        ['Pay Period', selectedPayslip.period],
                                        ['Release Date', selectedPayslip.releaseDate],
                                    ].map(([label, val]) => (
                                        <div key={label}>
                                            <p className="text-[10px] text-gray-400 uppercase">{label}</p>
                                            <p className="text-xs font-semibold text-gray-700">{val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {((selectedPayslip.overtimeHours ?? 0) > 0 || (selectedPayslip.lateAbsentDays ?? 0) > 0) && (
                                <div className="mb-4 p-3 rounded-xl bg-gray-50 flex items-center gap-4">
                                    {(selectedPayslip.overtimeHours ?? 0) > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase">Overtime</p>
                                                <p className="text-xs font-bold text-blue-600">{selectedPayslip.overtimeHours} hrs</p>
                                            </div>
                                        </div>
                                    )}
                                    {(selectedPayslip.lateAbsentDays ?? 0) > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                                                <Clock className="w-3.5 h-3.5 text-red-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase">Absent / Late</p>
                                                <p className="text-xs font-bold text-red-500">{selectedPayslip.lateAbsentDays} day(s)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="mb-4">
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">EARNINGS</h4>
                                <div className="space-y-2">
                                    {selectedPayslip.earnings.map((e, i) => (
                                        <div key={i} className="flex justify-between text-xs">
                                            <span className="text-gray-500">{e.label}</span>
                                            <span className={\`font-semibold \${e.amount.startsWith('-') ? 'text-red-400' : 'text-gray-700'}\`}>{e.amount}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                                        <span className="font-bold text-gray-700">Total Gross Pay</span>
                                        <span className="font-bold text-gray-700">{selectedPayslip.totalGross}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-6">
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">DEDUCTIONS</h4>
                                <div className="space-y-2">
                                    {selectedPayslip.deductionItems.map((d, i) => (
                                        <div key={i} className="flex justify-between text-xs">
                                            <span className="text-gray-500">{d.label}</span>
                                            <span className="font-semibold text-red-500">-{d.amount}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                                        <span className="font-bold text-red-500">Total Deductions</span>
                                        <span className="font-bold text-red-500">-{selectedPayslip.totalDeductions}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 text-white text-center mb-4">
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-200">NET TAKE HOME PAY</p>
                                <p className="text-3xl font-bold mt-1">{selectedPayslip.netTakeHome}</p>
                            </div>
                            <button
                                onClick={() => handlePrint(selectedPayslip)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors"
                            >
                                <Download className="w-4 h-4" /> Download / Print PDF
                            </button>
                        </div>
                        <div className="pro-modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setSelectedPayslip(null)}>Close</button>
                        </div>
                    </div>
                </div>
            , document.body)}`;

const newCode = code.slice(0, startIdx) + newDrawer + code.slice(replaceEnd);

const output = newCode.replace(/\n/g, hasCRLF ? "\r\n" : "\n");
fs.writeFileSync(target, output, "utf8");
console.log("✅ Done! Drawer replaced with centered modal.");
