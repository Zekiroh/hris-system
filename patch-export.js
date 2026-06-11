// patch-export.js
// Ginagawang GUMAGANA ang Export buttons -> nagda-download ng CSV (bubukas sa Excel).
//   • Pending table  -> activeReports  (pending columns)
//   • History table  -> historyReports (+ Rating, Score, Supervisor, Output Quality, Remarks)
// Sumusunod sa kasalukuyang search/filter (kung ano nakikita, yun ang na-export).

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

if (src.includes("function exportReportsCSV")) {
  console.log("ℹ️  May export function na. Walang ginawa.");
  process.exit(0);
}

let hardFail = false;
function step(name, fn) {
  const before = src;
  src = fn(src);
  if (src === before) { console.error("⚠️  Hindi nahanap ang anchor: " + name); hardFail = true; }
  else console.log("✓  " + name);
}

// ── 1) I-insert ang CSV helper bago ang component (walang backticks/escape para ligtas) ──
const helper = `// CSV export helper — bubukas sa Excel (UTF-8 BOM)
function exportReportsCSV(rows, mode) {
  const isHistory = mode === "history";
  const NL = String.fromCharCode(10);
  const CRLF = String.fromCharCode(13, 10);
  const BOM = String.fromCharCode(65279);
  const headers = isHistory
    ? ["Reference No","Employee","Department","Project","Date","Submitted","Arrangement","Actual Hrs","Est Hrs","Tasks","Checklist","Status","Rating","Score","Supervisor","Output Quality","Remarks"]
    : ["Reference No","Employee","Department","Project","Date","Submitted","Arrangement","Actual Hrs","Est Hrs","Tasks","Checklist","Status"];
  const esc = (v) => {
    const s = (v === undefined || v === null) ? "" : String(v);
    const needQuote = s.indexOf(",") >= 0 || s.indexOf('"') >= 0 || s.indexOf(NL) >= 0;
    return needQuote ? '"' + s.split('"').join('""') + '"' : s;
  };
  const lines = [headers.map(esc).join(",")];
  rows.forEach((r) => {
    const base = [
      r.referenceNo, r.employeeName, r.department, r.project, r.date, r.submittedAt,
      r.workArrangement, r.totalActualHours, r.totalEstHours,
      r.tasksCompleted + "/" + r.tasksTotal, r.checklistDone + "/6", r.status,
    ];
    const extra = isHistory ? [
      r.rating || "", r.performanceScore || "", r.supervisorName || "",
      r.outputQuality || "", r.finalRemarks || r.supervisorComment || "",
    ] : [];
    lines.push(base.concat(extra).map(esc).join(","));
  });
  const csv = BOM + lines.join(CRLF);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = "DAR_" + (isHistory ? "History" : "Pending") + "_" + today + ".csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

`;

step("insert exportReportsCSV helper", s => s.replace(
  /(const AdminDailyAccomplishmentReport = \(\) => \{)/,
  helper + "$1"
));

// ── 2) I-wire ang dalawang top Export buttons -> activeReports (pending) ──
step("wire top Export buttons (Pending)", s => {
  let count = 0;
  const out = s.replace(
    /<button\s+className="btn btn-primary"\s+style=\{\{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap"(?:, flexShrink: 0)? \}\}\s*>\s*<Download className="w-3\.5 h-3\.5" \/> Export\s*<\/button>/g,
    (m) => { count++; return m.replace("<button", '<button onClick={() => exportReportsCSV(activeReports, "pending")}'); }
  );
  if (count > 0) console.log("   (na-wire: " + count + " na top Export button)");
  return out;
});

// ── 3) Dagdag na Export button sa History header ──
const historyExportBtn = `
            <button
              onClick={() => exportReportsCSV(historyReports, "history")}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0, marginLeft: "auto" }}
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>`;

if (src.includes("historyStatus")) {
  // May filter na ang History -> ilagay ang Export PAGKATAPOS ng status <select>
  step("add History Export (after filter)", s => s.replace(
    /(value=\{historyStatus\}[\s\S]*?<\/select>)/,
    "$1" + historyExportBtn
  ));
} else {
  // Walang filter pa -> ilagay sa tabi ng count badge
  step("add History Export (after count)", s => s.replace(
    /(\}\}>\s*\{historyReports\.length\} reviewed\s*<\/span>)/,
    "$1" + historyExportBtn
  ));
}

if (hardFail) {
  console.error("\n⚠️  May anchor na hindi tumugma — HINDI sinulat ang file.");
  process.exit(1);
}

fs.writeFileSync(target + ".bak4", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak4");
