// patch-subtime-picker.js
// Ginagawang time picker (type="time") ang Submission Time (dating type="text").

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
      try { if (fs.readFileSync(full, "utf8").includes("My DAR Submissions")) return full; } catch {}
    }
  }
  return null;
}

const target = process.argv[2] || findFile(process.cwd());
if (!target || !fs.existsSync(target)) { console.error("❌ Hindi mahanap ang employee DAR file."); process.exit(1); }

let src = fs.readFileSync(target, "utf8");
const original = src;

const from = '<input className="pro-input" type="text" placeholder="e.g. 5:15 PM" value={subTime} onChange={e => setSubTime(e.target.value)} />';
const to   = '<input className="pro-input" type="time" value={subTime} onChange={e => setSubTime(e.target.value)} />';

if (src.includes(to)) { console.log("ℹ️  Time picker na ang Submission Time. Walang ginawa."); process.exit(0); }
if (!src.includes(from)) {
  console.error("⚠️  Hindi nahanap ang Submission Time input. HINDI sinulat ang file.");
  console.error("    I-paste mo ang Submission Time block para i-adjust ko.");
  process.exit(1);
}

src = src.replace(from, to);

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("✓  Submission Time -> time picker");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak");
