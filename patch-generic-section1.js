// patch-generic-section1.js
// Ginagawang ISANG generic check ang validation: kung kulang ang Section 1
// (Developer Name + Project), hindi makaka-submit — iisang mensahe, hindi field-specific.

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
      try { if (fs.readFileSync(full, "utf8").includes("handleTrySubmit")) return full; } catch {}
    }
  }
  return null;
}

const target = process.argv[2] || findFile(process.cwd());
if (!target || !fs.existsSync(target)) { console.error("❌ Hindi mahanap ang file na may handleTrySubmit (patakbuhin muna ang patch-require-devinfo.js)."); process.exit(1); }

let src = fs.readFileSync(target, "utf8");
const original = src;

if (src.includes("!devName.trim() || !project.trim()")) { console.log("ℹ️  Generic check na. Walang ginawa."); process.exit(0); }

const newBlock = `const handleTrySubmit = () => {
    if (!devName.trim() || !project.trim()) {
      toast.error("Please complete Section 1 (Developer Information) before submitting.");
      return;
    }
    setShowConfirm(true);
  };`;

const re = /const handleTrySubmit = \(\) => \{[\s\S]*?setShowConfirm\(true\);\s*\};/;
if (!re.test(src)) {
  console.error("⚠️  Hindi nahanap ang handleTrySubmit block. HINDI sinulat ang file.");
  process.exit(1);
}
src = src.replace(re, newBlock);

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("✓  Generic Section 1 check na lang ang ginamit.");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak");
