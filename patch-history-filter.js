// patch-history-filter.js
// Nagdadagdag ng SARILING search box + status dropdown sa "Review History" table
// para mabilis maghanap ng na-review na reports (independent sa taas na filter).

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
if (!target || !fs.existsSync(target)) {
  console.error("❌ Hindi mahanap ang DAR component.");
  process.exit(1);
}

let src = fs.readFileSync(target, "utf8");
const original = src;

if (!src.includes("Review History")) {
  console.error("❌ Wala pang Review History table. Patakbuhin muna ang patch-dar.js.");
  process.exit(1);
}
if (src.includes("historySearch")) {
  console.log("ℹ️  May filter na ang History table. Walang ginawa.");
  process.exit(0);
}

let hardFail = false;
function step(name, fn) {
  const before = src;
  src = fn(src);
  if (src === before) { console.error("⚠️  Hindi nahanap ang anchor: " + name); hardFail = true; }
  else console.log("✓  " + name);
}

// 1) Dagdag na state: historySearch + historyStatus (kasunod ng historyPage)
step("add historySearch/historyStatus state", s => s.replace(
  /(const \[historyPage, setHistoryPage\]\s*=\s*useState\(1\);)/,
  `$1
  const [historySearch, setHistorySearch]   = useState("");
  const [historyStatus, setHistoryStatus]   = useState("All");`
));

// 2) Palitan ang historyReports — independent na filter (galing sa lahat ng reports)
step("rewire historyReports with own filters", s => s.replace(
  /const historyReports = filtered\.filter\(r => r\.status !== "Pending Review"\);/,
`const historyReports = reports.filter(r => {
    if (r.status === "Pending Review") return false;
    const hq = historySearch.toLowerCase();
    const matchSearch =
      r.employeeName.toLowerCase().includes(hq) ||
      r.project.toLowerCase().includes(hq) ||
      r.id.toLowerCase().includes(hq);
    return matchSearch && (historyStatus === "All" || r.status === historyStatus);
  });`
));

// 3) Palitan ang History card header para may search + status filter
const newHeader = `$1
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", whiteSpace: "nowrap" }}>
                Review History
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: "#047857",
                background: "#d1fae5", borderRadius: 20, padding: "2px 8px",
              }}>
                {historyReports.length} reviewed
              </span>
            </div>

            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <Search style={{
                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                width: 14, height: 14, color: "#9ca3af", pointerEvents: "none",
              }} />
              <input
                className="pro-input"
                style={{ paddingLeft: 32, width: "100%", boxSizing: "border-box" }}
                placeholder="Search reviewed employee, project..."
                value={historySearch}
                onChange={e => { setHistorySearch(e.target.value); setHistoryPage(1); }}
              />
            </div>

            <select
              className="pro-select"
              style={{ width: 180, flexShrink: 0, boxSizing: "border-box" }}
              value={historyStatus}
              onChange={e => { setHistoryStatus(e.target.value); setHistoryPage(1); }}
            >
              <option value="All">All Reviewed</option>
              {["Approved", "Revision Requested", "Rejected"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>`;

step("inject filter UI into History header", s => s.replace(
  /(<div className="pro-card animate-fade-in-up" style=\{\{ animationDelay: "0\.55s", opacity: 0 \}\}>)\s*<div className="px-6 py-4 border-b border-gray-100">[\s\S]*?\{historyReports\.length\} reviewed\s*<\/span>\s*<\/div>\s*<\/div>/,
  newHeader
));

if (hardFail) {
  console.error("\n⚠️  May anchor na hindi tumugma — HINDI sinulat ang file.");
  console.error("    I-paste mo sa chat ang current na History Table Card block para i-adjust ko.");
  process.exit(1);
}

fs.writeFileSync(target + ".bak3", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak3");
