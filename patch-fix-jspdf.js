// patch-fix-jspdf.js
// Sa jspdf v4, named import ang tama: import { jsPDF } from "jspdf"
// (hindi gumagana ang default import na ginamit ng patch-export-modal).

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

if (src.includes('import { jsPDF } from "jspdf"')) { console.log("ℹ️  Tama na ang jsPDF import. Walang ginawa."); process.exit(0); }

if (!src.includes('import jsPDF from "jspdf"')) {
  console.error('⚠️  Walang nakitang `import jsPDF from "jspdf"`. Wala akong binago.');
  process.exit(1);
}

src = src.replace('import jsPDF from "jspdf";', 'import { jsPDF } from "jspdf";');

fs.writeFileSync(target + ".bak6", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log('✓  Pinalitan: import jsPDF from "jspdf"  ->  import { jsPDF } from "jspdf"');
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak6");
