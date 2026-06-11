// patch-export-toast-en.js
// Pinapalitan ang dalawang Tagalog toast sa Export modal -> English (admin DAR file).

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
if (!target || !fs.existsSync(target)) { console.error("❌ Hindi mahanap ang admin DAR file."); process.exit(1); }

let src = fs.readFileSync(target, "utf8");
const original = src;

const edits = [
  ['Walang record na puwedeng i-export.',
   'No records available to export.'],
  ['(exportFormat === "excel" ? "Excel" : "PDF") + " report na-generate at na-download."',
   '(exportFormat === "excel" ? "Excel" : "PDF") + " report generated and downloaded."'],
];

let changed = 0;
for (const [from, to] of edits) {
  if (src.includes(from)) { src = src.split(from).join(to); changed++; console.log("✓  " + to); }
  else if (src.includes(to)) { console.log("•  English na: " + to); }
  else { console.warn("⚠️  Hindi nahanap: " + from); }
}

if (changed === 0) { console.log("\nℹ️  Walang Tagalog na napalitan (baka English na lahat)."); process.exit(0); }

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak");
