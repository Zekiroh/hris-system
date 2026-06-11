// patch-center-project.js
// Sini-center ang PROJECT column (header + cells) sa "My DAR Submissions" table
// ng employee-side na DailyAccomplishmentReport.tsx.

const fs = require("fs");
const path = require("path");

// Hanapin ang file na may "My DAR Submissions"
function findFile(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    if (["node_modules", ".git", "dist", "build"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { const f = findFile(full); if (f) return f; }
    else if (/\.(tsx|jsx)$/.test(e.name)) {
      try { if (fs.readFileSync(full, "utf8").includes("My DAR Submissions")) return full; } catch {}
    }
  }
  return null;
}

const target = process.argv[2] || findFile(process.cwd());
if (!target || !fs.existsSync(target)) {
  console.error("❌ Hindi mahanap ang file na may 'My DAR Submissions'.");
  process.exit(1);
}

let src = fs.readFileSync(target, "utf8");
const original = src;

if (src.includes('h === "Project"')) { console.log("ℹ️  Naka-center na ang Project column. Walang ginawa."); process.exit(0); }

let hardFail = false;
function step(name, find, repl) {
  if (!src.includes(find)) { console.error("⚠️  Hindi nahanap: " + name); hardFail = true; return; }
  src = src.replace(find, repl);
  console.log("✓  " + name);
}

// 1) Header: i-center lang ang "Project" th
step(
  "center Project header",
  '<th key={h} style={{ whiteSpace: "nowrap" }}>{h}</th>',
  '<th key={h} style={{ whiteSpace: "nowrap", textAlign: h === "Project" ? "center" : undefined }}>{h}</th>'
);

// 2) Body: i-center ang project cell
step(
  "center Project cell",
  '<td className="text-xs text-gray-600" style={{ minWidth: "120px" }}>{s.project || "—"}</td>',
  '<td className="text-xs text-gray-600 text-center" style={{ minWidth: "120px" }}>{s.project || "—"}</td>'
);

if (hardFail) {
  console.error("\n⚠️  May anchor na hindi tumugma — HINDI sinulat ang file.");
  process.exit(1);
}

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak");
