// patch-dar.js
// Hinahati ang "Submitted Reports" table sa DALAWA:
//   1) Pending Submissions  (may Review ⭐ button)
//   2) Review History       (lahat ng na-review na — Approved / Revision / Rejected, may Eye 👁 button)
//
// Usage:  node patch-dar.js  [optional\path\to\file.tsx]
// Kung walang path, auto-hahanapin niya sa loob ng project.

const fs = require("fs");
const path = require("path");

// ── 1. Hanapin ang component file ─────────────────────────────────────────────
function findFile(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".git" || e.name === "dist" || e.name === "build") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const found = findFile(full);
      if (found) return found;
    } else if (/\.(tsx|jsx)$/.test(e.name)) {
      try {
        const txt = fs.readFileSync(full, "utf8");
        if (txt.includes("const AdminDailyAccomplishmentReport")) return full;
      } catch {}
    }
  }
  return null;
}

const target = process.argv[2] || findFile(process.cwd());
if (!target || !fs.existsSync(target)) {
  console.error("❌ Hindi mahanap ang DAR component. I-pass ang path:");
  console.error("   node patch-dar.js apps\\web\\src\\...\\AdminDailyAccomplishmentReport.tsx");
  process.exit(1);
}

let src = fs.readFileSync(target, "utf8");
const original = src;

// Iwas double-patch
if (src.includes("Review History") && src.includes("historyPaginated")) {
  console.log("ℹ️  Mukhang na-patch na ito dati (may Review History na). Walang ginawa.");
  process.exit(0);
}

let hardFail = false;
function step(name, fn, { optional = false } = {}) {
  const before = src;
  src = fn(src);
  if (src === before) {
    if (optional) { console.warn("•  Laktaw (optional): " + name); }
    else { console.error("⚠️  HINDI nahanap ang anchor: " + name); hardFail = true; }
  } else {
    console.log("✓  " + name);
  }
}

// ── 2. History table JSX (i-insert bago ang Review Modal) ─────────────────────
const historyBlock = `      {/* History Table Card */}
      <div className="pro-card animate-fade-in-up" style={{ animationDelay: "0.55s", opacity: 0 }}>
        <div className="px-6 py-4 border-b border-gray-100">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
        </div>

        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="pro-table" style={{ tableLayout: "auto", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Employee</th>
                  <th className="hidden md:table-cell" style={{ whiteSpace: "nowrap" }}>Project</th>
                  <th className="hidden md:table-cell" style={{ whiteSpace: "nowrap" }}>Rating</th>
                  <th style={{ whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400 italic">
                      No reviewed reports yet.
                    </td>
                  </tr>
                ) : historyPaginated.map(r => (
                  <tr key={r.id} className="cursor-pointer">

                    {/* Employee */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "10px", flexShrink: 0,
                          background: "linear-gradient(135deg, #059669, #10b981)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 800, fontSize: 13,
                        }}>
                          {r.employeeName.trim().charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", lineHeight: 1.2 }}>{r.employeeName}</p>
                          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{r.department}</p>
                        </div>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="hidden md:table-cell" style={{ whiteSpace: "nowrap", color: "#374151", fontSize: 13 }}>
                      {r.project}
                    </td>

                    {/* Rating */}
                    <td className="hidden md:table-cell" style={{ whiteSpace: "nowrap" }}>
                      {r.rating
                        ? <StarRow rating={r.rating} />
                        : <span style={{ color: "#d1d5db", fontSize: 13 }}>—</span>
                      }
                    </td>

                    {/* Status */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Actions — View only */}
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedReport(r)}
                        title="View"
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          padding: "5px 8px", borderRadius: 8, cursor: "pointer",
                          border: "1.5px solid #bfdbfe", background: "#eff6ff", color: "#2563eb",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* History Pagination */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <span className="text-xs text-gray-400">
              Showing {Math.min((historyPage - 1) * PAGE_SIZE + 1, historyReports.length)}–{Math.min(historyPage * PAGE_SIZE, historyReports.length)} of {historyReports.length} reviewed
            </span>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                disabled={historyPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center transition-colors text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: historyTotalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setHistoryPage(p)}
                  className={p === historyPage
                    ? "px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center transition-colors text-white border-transparent"
                    : "px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center transition-colors text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100"}
                  style={p === historyPage ? { background: "linear-gradient(90deg,#059669,#047857)" } : {}}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))}
                disabled={historyPage === historyTotalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center transition-colors text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

`;

// ── 3. Mga edits ──────────────────────────────────────────────────────────────

// R0: dagdag na state para sa history pagination
step("add historyPage state", s => s.replace(
  /(const \[currentPage, setCurrentPage\]\s*=\s*useState\(1\);)/,
  "$1\n  const [historyPage, setHistoryPage]       = useState(1);"
));

// R1: hatiin ang data sa active (pending) at history (reviewed) + history pagination vars
step("split active/history data", s => s.replace(
  /const totalPages = Math\.max\(1, Math\.ceil\(filtered\.length \/ PAGE_SIZE\)\);\s*\n\s*const paginated = filtered\.slice\(\(currentPage - 1\) \* PAGE_SIZE, currentPage \* PAGE_SIZE\);/,
`const activeReports  = filtered.filter(r => r.status === "Pending Review");
  const historyReports = filtered.filter(r => r.status !== "Pending Review");

  const totalPages = Math.max(1, Math.ceil(activeReports.length / PAGE_SIZE));
  const paginated  = activeReports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const historyTotalPages = Math.max(1, Math.ceil(historyReports.length / PAGE_SIZE));
  const historyPaginated  = historyReports.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);`
));

// R2: empty-check ng active table -> activeReports
step("active table empty-check", s => s.replace(
  "{filtered.length === 0 ? (",
  "{activeReports.length === 0 ? ("
));

// R3: active pagination counts -> activeReports
step("active pagination counts", s => s.replace(
  /Showing \{Math\.min\(\(currentPage - 1\) \* PAGE_SIZE \+ 1, filtered\.length\)\}[–-]\{Math\.min\(currentPage \* PAGE_SIZE, filtered\.length\)\} of \{filtered\.length\} submissions/,
  "Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, activeReports.length)}–{Math.min(currentPage * PAGE_SIZE, activeReports.length)} of {activeReports.length} pending"
));

// R4 (optional): palitan ang header ng unang table
step("rename first table header", s => s.split("Submitted Reports").join("Pending Submissions"), { optional: true });

// R5 (optional): i-reset ang history page tuwing nagfi-filter
step("reset historyPage on filter", s => s.replace(
  /(const handleSearch = \(v: string\) => \{ setSearch\(v\); setCurrentPage\(1\); \};\s*\n\s*const handleFilterStatus = \(v: string\) => \{ setFilterStatus\(v\); setCurrentPage\(1\); \};\s*\n\s*const handleFilterDept = \(v: string\) => \{ setFilterDept\(v\); setCurrentPage\(1\); \};)/,
  `const handleSearch = (v: string) => { setSearch(v); setCurrentPage(1); setHistoryPage(1); };
  const handleFilterStatus = (v: string) => { setFilterStatus(v); setCurrentPage(1); setHistoryPage(1); };
  const handleFilterDept = (v: string) => { setFilterDept(v); setCurrentPage(1); setHistoryPage(1); };`
), { optional: true });

// R6: i-insert ang History table card bago ang Review Modal
step("insert History table", s => s.replace(
  "{/* Review Modal */}",
  historyBlock + "      {/* Review Modal */}"
));

// ── 4. Sulat ──────────────────────────────────────────────────────────────────
if (hardFail) {
  console.error("\n⚠️  May anchor na hindi tugma — HINDI sinulat ang file.");
  console.error("    Baka iba na ang format ng file mo. I-paste mo sa chat ang current version para i-adjust ko.");
  process.exit(1);
}

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak  (rename pabalik kung gusto mo i-undo)");
