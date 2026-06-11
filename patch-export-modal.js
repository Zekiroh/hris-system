// patch-export-modal.js
// Pinapalitan ang diretsong export ng "Generate Report" MODAL (Excel / PDF),
// kagaya ng existing "Generate Reports" modal. Gumagamit ng totoong .xlsx at .pdf.
//
// KAILANGAN MUNA (sa loob ng apps\web):
//   npm install xlsx jspdf jspdf-autotable

const fs = require("fs");
const path = require("path");

function findFile(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    if (["node_modules", ".git", "dist", "build"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { const f = findFile(full); if (f) return f; }
    else if (/\.(tsx|jsx)$/.test(e.name)) {
      try { if (fs.readFileSync(full, "utf8").includes("const AdminDailyAccomplishmentReport")) return full; } catch {}
    }
  }
  return null;
}

const target = process.argv[2] || findFile(process.cwd());
if (!target || !fs.existsSync(target)) { console.error("❌ Hindi mahanap ang DAR component."); process.exit(1); }

let src = fs.readFileSync(target, "utf8");
const original = src;

if (src.includes("function generateExcel")) { console.log("ℹ️  May export modal na. Walang ginawa."); process.exit(0); }

let hardFail = false;
function step(name, fn, optional) {
  const before = src;
  src = fn(src);
  if (src === before) {
    if (optional) console.warn("•  Laktaw (optional): " + name);
    else { console.error("⚠️  Hindi nahanap ang anchor: " + name); hardFail = true; }
  } else console.log("✓  " + name);
}

// ── 1) Imports ────────────────────────────────────────────────────────────────
step("add xlsx/jspdf imports", s => s.replace(
  /(\}\s*from\s*"lucide-react";)/,
  `$1
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";`
));

// ── 2) Module helpers: buildExportData + generateExcel + generatePDF ───────────
const helpers = `// ── Export helpers (Excel + PDF) ──
function buildExportData(rows, mode) {
  const isHistory = mode === "history";
  const headers = isHistory
    ? ["Reference No","Employee","Department","Project","Date","Submitted","Arrangement","Actual Hrs","Est Hrs","Tasks","Checklist","Status","Rating","Score","Supervisor","Output Quality","Remarks"]
    : ["Reference No","Employee","Department","Project","Date","Submitted","Arrangement","Actual Hrs","Est Hrs","Tasks","Checklist","Status"];
  const body = rows.map((r) => {
    const base = [
      r.referenceNo, r.employeeName, r.department, r.project, r.date, r.submittedAt,
      r.workArrangement, r.totalActualHours, r.totalEstHours,
      r.tasksCompleted + "/" + r.tasksTotal, r.checklistDone + "/6", r.status,
    ];
    const extra = isHistory ? [
      r.rating || "", r.performanceScore || "", r.supervisorName || "",
      r.outputQuality || "", r.finalRemarks || r.supervisorComment || "",
    ] : [];
    return base.concat(extra);
  });
  return { headers, body, isHistory };
}

function generateExcel(rows, mode) {
  const data = buildExportData(rows, mode);
  const ws = XLSX.utils.aoa_to_sheet([data.headers].concat(data.body));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, data.isHistory ? "Review History" : "Pending");
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, "DAR_" + (data.isHistory ? "History" : "Pending") + "_" + today + ".xlsx");
}

function generatePDF(rows, mode) {
  const data = buildExportData(rows, mode);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Daily Accomplishment Report", 14, 15);
  doc.setFontSize(10);
  doc.text((data.isHistory ? "Review History" : "Pending Submissions") + " — " + data.body.length + " record(s)", 14, 21);
  doc.setFontSize(8);
  doc.text("Generated: " + new Date().toLocaleString(), 14, 26);
  autoTable(doc, {
    head: [data.headers],
    body: data.body,
    startY: 30,
    styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [5, 150, 105], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
  });
  const today = new Date().toISOString().slice(0, 10);
  doc.save("DAR_" + (data.isHistory ? "History" : "Pending") + "_" + today + ".pdf");
}

`;
step("insert Excel/PDF generators", s => s.replace(
  /(const AdminDailyAccomplishmentReport = \(\) => \{)/,
  helpers + "$1"
));

// ── 3) Component state + openExport ───────────────────────────────────────────
step("add export modal state", s => s.replace(
  /(const PAGE_SIZE = 10;)/,
  `$1

  const [exportOpen, setExportOpen]     = useState(false);
  const [exportRows, setExportRows]     = useState<SubmittedReport[]>([]);
  const [exportMode, setExportMode]     = useState<"pending" | "history">("pending");
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel");
  const openExport = (rows: SubmittedReport[], mode: "pending" | "history") => {
    setExportRows(rows); setExportMode(mode); setExportFormat("excel"); setExportOpen(true);
  };`
));

// ── 4) I-wire ang buttons -> openExport ───────────────────────────────────────
// 4a: kung naka-CSV na (patch-export ran) -> palitan
step("rewire top Export -> modal", s => s.split('exportReportsCSV(activeReports, "pending")').join('openExport(activeReports, "pending")'), true);
step("rewire History Export -> modal", s => s.split('exportReportsCSV(historyReports, "history")').join('openExport(historyReports, "history")'), true);

// 4b: kung RAW pa (walang onClick) ang top buttons -> dagdagan ng openExport
step("wire raw top Export buttons", s => {
  let count = 0;
  const out = s.replace(
    /<button\s+className="btn btn-primary"\s+style=\{\{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap"(?:, flexShrink: 0)? \}\}\s*>\s*<Download className="w-3\.5 h-3\.5" \/> Export\s*<\/button>/g,
    (m) => { count++; return m.replace("<button", '<button onClick={() => openExport(activeReports, "pending")}'); }
  );
  return out;
}, true);

// 4c: kung WALA pang History Export button -> dagdag (open modal)
if (!src.includes("openExport(historyReports") && !src.includes('exportReportsCSV(historyReports')) {
  const historyBtn = `
            <button
              onClick={() => openExport(historyReports, "history")}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0, marginLeft: "auto" }}
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>`;
  if (src.includes("historyStatus")) {
    step("add History Export button (after filter)", s => s.replace(/(value=\{historyStatus\}[\s\S]*?<\/select>)/, "$1" + historyBtn), true);
  } else {
    step("add History Export button (after count)", s => s.replace(/(\}\}>\s*\{historyReports\.length\} reviewed\s*<\/span>)/, "$1" + historyBtn), true);
  }
}

// ── 5) I-inject ang Export Modal (bago ang Review Modal) ──────────────────────
const modal = `      {/* Export Modal */}
      {exportOpen && createPortal(
        <div className="pro-modal-overlay" onClick={() => setExportOpen(false)}>
          <div className="pro-modal w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-gray-800">Generate Report</p>
              <button onClick={() => setExportOpen(false)} className="btn-ghost btn-icon">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="pro-label" style={{ marginBottom: 6 }}>
                {exportMode === "history" ? "Review History" : "Pending Submissions"} · {exportRows.length} record(s)
              </p>
            </div>

            <div>
              <p className="pro-label" style={{ marginBottom: 8 }}>Format</p>
              <div style={{ display: "flex", gap: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                  <input type="radio" name="exportfmt" checked={exportFormat === "excel"}
                    onChange={() => setExportFormat("excel")} style={{ accentColor: "#059669", width: 16, height: 16 }} />
                  Excel
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                  <input type="radio" name="exportfmt" checked={exportFormat === "pdf"}
                    onChange={() => setExportFormat("pdf")} style={{ accentColor: "#059669", width: 16, height: 16 }} />
                  PDF
                </label>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div className="flex gap-2 justify-end">
              <button onClick={() => setExportOpen(false)} className="btn btn-secondary text-sm">Cancel</button>
              <button
                onClick={() => {
                  if (exportRows.length === 0) { toast.error("Walang record na puwedeng i-export."); return; }
                  if (exportFormat === "excel") generateExcel(exportRows, exportMode);
                  else generatePDF(exportRows, exportMode);
                  toast.success((exportFormat === "excel" ? "Excel" : "PDF") + " report na-generate at na-download.");
                  setExportOpen(false);
                }}
                className="btn btn-primary flex items-center gap-2 text-sm text-white"
                style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
              >
                <Download className="w-4 h-4" /> Generate & Download
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

`;
step("inject Export Modal", s => s.replace(/(\{\/\* Review Modal \*\/\})/, modal + "$1"));

if (hardFail) {
  console.error("\n⚠️  May anchor na hindi tumugma — HINDI sinulat ang file.");
  process.exit(1);
}

fs.writeFileSync(target + ".bak5", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak5");
console.log("\nPAALALA: i-run muna sa apps\\web -> npm install xlsx jspdf jspdf-autotable");
