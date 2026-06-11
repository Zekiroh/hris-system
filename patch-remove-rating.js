// patch-remove-rating.js
// Inaalis ang RATING column sa PENDING (active) table lang.
// Pinapanatili ang Rating sa History table (reviewed na doon).

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

// Guard: dapat 2 ang Rating <th> (active + history). Kung mas kakaunti, tapos na.
const thCount = (src.match(/>Rating<\/th>/g) || []).length;
if (thCount < 2) {
  console.log("ℹ️  Mukhang naalis na ang Rating sa Pending table (o wala pang History table). Walang ginawa.");
  process.exit(0);
}

let hardFail = false;
function step(name, fn) {
  const before = src;
  src = fn(src);
  if (src === before) { console.error("⚠️  Hindi nahanap ang anchor: " + name); hardFail = true; }
  else console.log("✓  " + name);
}

// 1) Tanggalin ang Rating <th> — UNANG occurrence = active table
step("remove Rating header (active)", s => s.replace(
  /\n[ \t]*<th className="hidden md:table-cell" style=\{\{ whiteSpace: "nowrap" \}\}>Rating<\/th>/,
  ""
));

// 2) Tanggalin ang Rating <td> cell — UNANG occurrence = active table
step("remove Rating cell (active)", s => s.replace(
  /\n[ \t]*\{\/\* Rating \*\/\}\s*<td className="hidden md:table-cell" style=\{\{ whiteSpace: "nowrap" \}\}>\s*\{r\.rating[\s\S]*?<\/td>/,
  ""
));

// 3) Ayusin ang empty-state colSpan ng active table (6 -> 5)
step("fix empty-state colSpan (6 -> 5)", s => s.replace(
  "colSpan={6}",
  "colSpan={5}"
));

if (hardFail) {
  console.error("\n⚠️  May anchor na hindi tumugma — HINDI sinulat ang file.");
  process.exit(1);
}

fs.writeFileSync(target + ".bak7", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak7");
